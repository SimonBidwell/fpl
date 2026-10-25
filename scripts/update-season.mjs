import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  bootstrapStaticSchema,
  choicesResponseSchema,
  elementStatusResponseSchema,
  gameweekLiveSchema,
  leagueDetailsSchema,
  lineupResponseSchema,
  transactionsResponseSchema,
} from "../src/api/domain.ts";

export async function updateSeason({
  season,
  leagueId,
  outputDir = "public",
  fetchImpl = fetch,
  backfillLineups = false,
}) {
  const year = Number(season?.slice(0, 4));
  if (!/^\d{4}-\d{2}$/.test(season) || season !== `${year}-${String(year + 1).slice(-2)}`) {
    throw new Error("Expected a season such as 2026-27");
  }
  if (!Number.isSafeInteger(Number(leagueId)) || Number(leagueId) <= 0) {
    throw new Error("Expected a positive league ID");
  }

  const sources = [
    [`${season}.json`, `league/${leagueId}/details`, leagueDetailsSchema],
    [`element-status-${season}.json`, `league/${leagueId}/element-status`, elementStatusResponseSchema],
    [`bootstrap-static-${season}.json`, "bootstrap-static", bootstrapStaticSchema],
    [`transactions-${season}.json`, `draft/league/${leagueId}/transactions`, transactionsResponseSchema],
    [`draft-choices-${season}.json`, `draft/${leagueId}/choices`, choicesResponseSchema],
  ];

  const download = async ([filename, endpoint, schema]) => {
    const response = await fetchImpl(`https://draft.premierleague.com/api/${endpoint}`, {
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new Error(`${endpoint}: HTTP ${response.status}`);
    }
    const data = await response.json();
    schema.parse(data);
    return { filename, data };
  };

  // Download and validate the whole batch before replacing any saved data.
  const downloads = await Promise.all(sources.map(download));

  if (downloads[0].data.league.id !== Number(leagueId)) {
    throw new Error("League response does not match the requested league ID");
  }
  const firstDeadline = downloads[2].data.events.data.find(event => event.id === 1)?.deadline_time;
  if (new Date(firstDeadline).getUTCFullYear() !== year) {
    throw new Error(`Bootstrap data does not belong to ${season}; check for a season rollover`);
  }

  const { events } = downloads[2].data;
  // After the season ends, keep refreshing the final two completed gameweeks.
  const currentGameweek = events.current ?? Math.max(0, ...events.data
    .filter(event => event.finished).map(event => event.id));
  const gameweeks = events.data.filter(event =>
    (event.finished || event.id === events.current) &&
    (backfillLineups || event.id === currentGameweek || event.id === currentGameweek - 1)
  );
  // The bootstrap only contains points for its current week. Save each selected
  // week's individual player points with its picks for historical lineup views.
  const pointsByGameweek = new Map(await Promise.all(gameweeks.map(async ({ id }) => {
    const { data } = await download([undefined, `event/${id}/live`, gameweekLiveSchema]);
    return [id, data.elements];
  })));
  const lineupSources = downloads[0].data.league_entries.flatMap(({ entry_id }) =>
    gameweeks.map(({ id }) => [
      `${season}/lineups/${entry_id}/${id}.json`,
      `entry/${entry_id}/event/${id}`,
      lineupResponseSchema,
      id,
    ])
  );
  const downloadLineup = async source => {
    const result = await download(source);
    const elements = pointsByGameweek.get(source[3]);
    result.data.picks = result.data.picks.map(pick => {
      const points = elements[pick.element]?.stats.total_points;
      if (points === undefined) {
        throw new Error(`${source[1]}: missing gameweek points for player ${pick.element}`);
      }
      return { ...pick, points };
    });
    return result;
  };
  // Keep the request concurrency bounded when backfilling a whole season.
  for (let i = 0; i < lineupSources.length; i += 5) {
    downloads.push(...await Promise.all(lineupSources.slice(i, i + 5).map(downloadLineup)));
  }

  for (const { filename, data } of downloads) {
    const path = resolve(outputDir, filename);
    await mkdir(dirname(path), { recursive: true });
    // Preserve API fields that the application schema does not currently use.
    await writeFile(path, JSON.stringify(data));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await updateSeason({
    season: process.argv[2],
    leagueId: process.argv[3],
    backfillLineups: process.argv.includes("--backfill-lineups"),
  });
  console.log(`Updated ${process.argv[2]} data for league ${process.argv[3]}`);
}
