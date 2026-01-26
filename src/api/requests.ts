import {
  bootstrapStaticSchema,
  choicesResponseSchema,
  elementStatusResponseSchema,
  leagueDetailsSchema,
  transactionsResponseSchema,
} from "./domain";

const BASE_PATH = "/fpl";

export const getLeagueDetails = async (seasonId: string) => {
  const res = await fetch(`${BASE_PATH}/${seasonId}.json`);
  return leagueDetailsSchema.parse(await res.json());
};

export const getBootstrapStatic = async (seasonId: string) => {
  const res = await fetch(
    `${BASE_PATH}/bootstrap-static-${seasonId}.json`
  );
  return bootstrapStaticSchema.parse(await res.json());
};

export const getElementStatus = async (seasonId: string) => {
  const res = await fetch(
    `${BASE_PATH}/element-status-${seasonId}.json`
  );
  return elementStatusResponseSchema.parse(await res.json());
};

export const getDraftChoices = async (seasonId: string) => {
  const res = await fetch(
    `${BASE_PATH}/draft-choices-${seasonId}.json`
  );
  if (res.ok && !res.headers.get("content-type")?.includes("text/html")) {
    return choicesResponseSchema.parse(await res.json());
  } else {
    return undefined;
  }
};

export const getTransactions = async (seasonId: string) => {
  const res = await fetch(
    `${BASE_PATH}/transactions-${seasonId}.json`
  );
  if (res.ok && !res.headers.get("content-type")?.includes("text/html")) {
    return transactionsResponseSchema.parse(await res.json());
  } else {
    return undefined;
  }
};
