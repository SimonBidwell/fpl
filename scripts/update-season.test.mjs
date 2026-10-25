import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { updateSeason } from "./update-season.mjs";

const fixtures = new Map(await Promise.all([
  ["league/5944/details", "2026-27.json"],
  ["league/5944/element-status", "element-status-2026-27.json"],
  ["bootstrap-static", "bootstrap-static-2026-27.json"],
  ["draft/league/5944/transactions", "transactions-2026-27.json"],
  ["draft/5944/choices", "draft-choices-2026-27.json"],
].map(async ([endpoint, filename]) => [endpoint, {
  filename,
  data: JSON.parse(await readFile(new URL(`../public/${filename}`, import.meta.url), "utf8")),
}])));

// Two managers, two completed weeks, one live week, and one future week.
const league = fixtures.get("league/5944/details").data;
league.league_entries = league.league_entries.slice(0, 2);
const { events } = fixtures.get("bootstrap-static").data;
events.current = 3;
events.next = 4;
events.data = events.data.slice(0, 4).map(event => ({ ...event, finished: event.id < 3 }));
const lineup = JSON.parse(await readFile(
  new URL("../public/2024-25/lineups/145310/20.json", import.meta.url), "utf8"
));
const lineupEndpoints = [];
for (const { entry_id } of league.league_entries) {
  for (const gameweek of [1, 2, 3]) {
    const endpoint = `entry/${entry_id}/event/${gameweek}`;
    lineupEndpoints.push(endpoint);
    fixtures.set(endpoint, {
      filename: `2026-27/lineups/${entry_id}/${gameweek}.json`,
      data: { ...lineup, extra_api_field: "preserved" },
    });
  }
}

async function setup(t, override) {
  const outputDir = await mkdtemp(join(tmpdir(), "fpl-update-"));
  t.after(() => rm(outputDir, { recursive: true, force: true }));
  for (const { filename } of fixtures.values()) {
    await mkdir(dirname(join(outputDir, filename)), { recursive: true });
    await writeFile(join(outputDir, filename), "previous valid snapshot");
  }
  return {
    outputDir,
    season: "2026-27",
    leagueId: 5944,
    fetchImpl: async url => {
      const endpoint = new URL(url).pathname.replace("/api/", "");
      assert.ok(fixtures.has(endpoint), `Unexpected request: ${endpoint}`);
      const data = structuredClone(fixtures.get(endpoint).data);
      return override?.(endpoint, data) ?? Response.json(data);
    },
  };
}

test("updates only current and previous lineups, preserving older snapshots and extra API fields", async t => {
  const options = await setup(t);
  await updateSeason(options);
  assert.equal((await readdir(options.outputDir)).length, 6);
  for (const { filename, data } of fixtures.values()) {
    const saved = await readFile(join(options.outputDir, filename), "utf8");
    if (filename.endsWith("/1.json")) {
      assert.equal(saved, "previous valid snapshot");
    } else {
      assert.deepEqual(JSON.parse(saved), data);
    }
  }
});

test("explicit backfill downloads all completed and current weeks into a new season directory", async t => {
  const options = await setup(t);
  await rm(join(options.outputDir, "2026-27"), { recursive: true });
  await updateSeason({ ...options, backfillLineups: true });
  for (const { filename, data } of fixtures.values()) {
    assert.deepEqual(JSON.parse(await readFile(join(options.outputDir, filename), "utf8")), data);
  }
});

for (const [name, endpoint, response, error] of [
  ["HTTP error", "league/5944/details", () => new Response("Unavailable", { status: 503 }), /HTTP 503/],
  ["API error payload", "draft/league/5944/transactions", () => Response.json({ detail: "No League matches the given query." }), /transactions/],
  ["HTML maintenance page", "bootstrap-static", () => new Response("<html>Game Updating</html>"), /JSON|Unexpected token/],
  ["wrong league", "league/5944/details", data => {
    data.league.id = 65002;
    return Response.json(data);
  }, /league ID/],
  ["season rollover", "bootstrap-static", data => {
    data.events.data.find(event => event.id === 1).deadline_time = "2027-08-20T17:30:00Z";
    return Response.json(data);
  }, /season rollover/],
  ["lineup HTTP error", lineupEndpoints.at(-1), () => new Response("Unavailable", { status: 503 }), /HTTP 503/],
  ["missing pick history", lineupEndpoints.at(-1), () => Response.json("No pick history"), /object/],
  ["invalid lineup", lineupEndpoints.at(-1), () => Response.json({ picks: [] }), /picks/],
  ["lineup HTML maintenance page", lineupEndpoints.at(-1), () => new Response("<html>Game Updating</html>"), /JSON|Unexpected token/],
]) {
  test(`${name} leaves every saved file unchanged`, async t => {
    const options = await setup(t, (path, data) => path === endpoint ? response(data) : undefined);
    await assert.rejects(updateSeason(options), error);
    for (const { filename } of fixtures.values()) {
      assert.equal(await readFile(join(options.outputDir, filename), "utf8"), "previous valid snapshot");
    }
  });
}

test("before the season starts, updates the five datasets without requesting lineups", async t => {
  const options = await setup(t, (endpoint, data) => {
    assert.ok(!endpoint.startsWith("entry/"), "Must not request future lineups");
    if (endpoint === "bootstrap-static") {
      data.events.current = null;
      data.events.data.forEach(event => { event.finished = false; });
      return Response.json(data);
    }
  });
  await rm(join(options.outputDir, "2026-27"), { recursive: true });
  await updateSeason(options);
  assert.equal((await readdir(options.outputDir)).length, 5);
});

test("refreshes only the final two finished gameweeks when there is no current gameweek", async t => {
  const requested = [];
  const options = await setup(t, (endpoint, data) => {
    requested.push(endpoint);
    if (endpoint === "bootstrap-static") {
      data.events.current = null;
      data.events.data.find(event => event.id === 3).finished = true;
      return Response.json(data);
    }
  });
  await updateSeason(options);
  assert.deepEqual(requested.filter(endpoint => endpoint.startsWith("entry/")),
    lineupEndpoints.filter(endpoint => !endpoint.endsWith("/1")));
});

test("the first gameweek requests only week one", async t => {
  const requested = [];
  const options = await setup(t, (endpoint, data) => {
    requested.push(endpoint);
    if (endpoint === "bootstrap-static") {
      data.events.current = 1;
      data.events.data.forEach(event => { event.finished = false; });
      return Response.json(data);
    }
  });
  await updateSeason(options);
  assert.deepEqual(requested.filter(endpoint => endpoint.startsWith("entry/")),
    lineupEndpoints.filter(endpoint => endpoint.endsWith("/1")));
});
