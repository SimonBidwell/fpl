import {
  bootstrapStaticSchema,
  choicesResponseSchema,
  elementStatusResponseSchema,
  leagueDetailsSchema,
  transactionsResponseSchema,
} from "./domain";

export const getLeagueDetails = async (seasonId: string) => {
  const res = await fetch(`/${seasonId}.json`);
  return leagueDetailsSchema.parse(await res.json());
};

export const getBootstrapStatic = async (seasonId: string) => {
  const res = await fetch(`/bootstrap-static-${seasonId}.json`);
  return bootstrapStaticSchema.parse(await res.json());
};

export const getElementStatus = async (seasonId: string) => {
  const res = await fetch(`/element-status-${seasonId}.json`);
  return elementStatusResponseSchema.parse(await res.json());
};

export const getDraftChoices = async (seasonId: string) => {
  const res = await fetch(`/draft-choices-${seasonId}.json`);
  if (res.ok && !res.headers.get("content-type")?.includes("text/html")) {
    return choicesResponseSchema.parse(await res.json());
  } else {
    return undefined;
  }
};

export const getTransactions = async (seasonId: string) => {
  const res = await fetch(`/transactions-${seasonId}.json`);
  if (res.ok && !res.headers.get("content-type")?.includes("text/html")) {
    return transactionsResponseSchema.parse(await res.json());
  } else {
    return undefined;
  }
};
