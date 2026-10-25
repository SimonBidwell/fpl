import {
  bootstrapStaticSchema,
  choicesResponseSchema,
  elementStatusResponseSchema,
  leagueDetailsSchema,
  lineupResponseSchema,
  transactionsResponseSchema,
} from "./domain";

export const getLineup = async (season: string, entryId: number, gameweek: number) => {
  const response = await fetch(
    `${import.meta.env.BASE_URL}/${season}/lineups/${entryId}/${gameweek}.json`
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Could not load lineup (HTTP ${response.status})`);
  // GitHub Pages can serve the SPA fallback for a missing archived file.
  if (response.headers.get("content-type")?.includes("text/html")) return null;
  const data: unknown = await response.json();
  if (data === "No pick history") return null;
  return lineupResponseSchema.parse(data);
};

export const getLeagueDetails = async (seasonId: string) => {
  const res = await fetch(`${import.meta.env.BASE_URL}/${seasonId}.json`);
  return leagueDetailsSchema.parse(await res.json());
};

export const getBootstrapStatic = async (seasonId: string) => {
  const res = await fetch(
    `${import.meta.env.BASE_URL}/bootstrap-static-${seasonId}.json`
  );
  return bootstrapStaticSchema.parse(await res.json());
};

export const getElementStatus = async (seasonId: string) => {
  const res = await fetch(
    `${import.meta.env.BASE_URL}/element-status-${seasonId}.json`
  );
  return elementStatusResponseSchema.parse(await res.json());
};

export const getDraftChoices = async (seasonId: string) => {
  const res = await fetch(
    `${import.meta.env.BASE_URL}/draft-choices-${seasonId}.json`
  );
  if (res.ok && !res.headers.get("content-type")?.includes("text/html")) {
    return choicesResponseSchema.parse(await res.json());
  } else {
    return undefined;
  }
};

export const getTransactions = async (seasonId: string) => {
  const res = await fetch(
    `${import.meta.env.BASE_URL}/transactions-${seasonId}.json`
  );
  if (res.ok && !res.headers.get("content-type")?.includes("text/html")) {
    return transactionsResponseSchema.parse(await res.json());
  } else {
    return undefined;
  }
};
