import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  bootstrapStaticSchema,
  choicesResponseSchema,
  elementStatusResponseSchema,
  leagueDetailsSchema,
  transactionsResponseSchema,
} from "../src/api/domain.ts";

export async function updateSeason({
  season,
  leagueId,
  outputDir = "public",
  fetchImpl = fetch,
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

  // Download and validate the whole batch before replacing any saved data.
  const downloads = await Promise.all(sources.map(async ([filename, endpoint, schema]) => {
    const response = await fetchImpl(`https://draft.premierleague.com/api/${endpoint}`, {
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new Error(`${endpoint}: HTTP ${response.status}`);
    }
    const data = await response.json();
    schema.parse(data);
    return { filename, data };
  }));

  if (downloads[0].data.league.id !== Number(leagueId)) {
    throw new Error("League response does not match the requested league ID");
  }
  const firstDeadline = downloads[2].data.events.data.find(event => event.id === 1)?.deadline_time;
  if (new Date(firstDeadline).getUTCFullYear() !== year) {
    throw new Error(`Bootstrap data does not belong to ${season}; check for a season rollover`);
  }

  await mkdir(outputDir, { recursive: true });
  for (const { filename, data } of downloads) {
    // Preserve API fields that the application schema does not currently use.
    await writeFile(resolve(outputDir, filename), JSON.stringify(data));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await updateSeason({ season: process.argv[2], leagueId: process.argv[3] });
  console.log(`Updated ${process.argv[2]} data for league ${process.argv[3]}`);
}
