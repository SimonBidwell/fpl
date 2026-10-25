import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

async function setup(t, override) {
  const outputDir = await mkdtemp(join(tmpdir(), "fpl-update-"));
  t.after(() => rm(outputDir, { recursive: true, force: true }));
  for (const { filename } of fixtures.values()) {
    await writeFile(join(outputDir, filename), "previous valid snapshot");
  }
  return {
    outputDir,
    season: "2026-27",
    leagueId: 5944,
    fetchImpl: async url => {
      const endpoint = new URL(url).pathname.replace("/api/", "");
      const data = structuredClone(fixtures.get(endpoint).data);
      return override?.(endpoint, data) ?? Response.json(data);
    },
  };
}

test("writes all five datasets and preserves fields outside the app schema", async t => {
  const options = await setup(t);
  await updateSeason(options);
  assert.equal((await readdir(options.outputDir)).length, 5);
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
]) {
  test(`${name} leaves every saved file unchanged`, async t => {
    const options = await setup(t, (path, data) => path === endpoint ? response(data) : undefined);
    await assert.rejects(updateSeason(options), error);
    for (const { filename } of fixtures.values()) {
      assert.equal(await readFile(join(options.outputDir, filename), "utf8"), "previous valid snapshot");
    }
  });
}
