"use client";

import { useQueries } from "react-query";
import { ReactNode, createContext, useContext } from "react";
import { LeagueDetails, SEASONS, Season } from "@/src/domain";
import { getLeagueDetails } from "@/src/requests";
import { indexBy } from "@/src/helpers";
import {
  BootstrapStatic,
  ChoicesResponse,
  ElementStatusResponse,
  TransactionResponse,
} from "@/src/api/domain";
import {
  getBootstrapStatic,
  getDraftChoices,
  getElementStatus,
  getTransactions,
} from "@/src/api/requests";

const getAllLeagueDetails = async (): Promise<Map<Season, LeagueDetails>> => {
  const seasons = await Promise.all(SEASONS.map(getLeagueDetails));
  return indexBy(seasons, (s) => s.league.season);
};

const getAllBootstraps = async (): Promise<Map<Season, BootstrapStatic>> => {
  const seasons = await Promise.all(
    SEASONS.map((s) => getBootstrapStatic(s).then((bs) => [s, bs] as const))
  );
  return seasons.reduce((acc, [season, bs]) => {
    acc.set(season, bs);
    return acc;
  }, new Map());
};

const getAllPlayerStatuses = async (): Promise<
  Map<Season, ElementStatusResponse>
> => {
  const seasons = await Promise.all(
    SEASONS.map((s) => getElementStatus(s).then((bs) => [s, bs] as const))
  );
  return seasons.reduce((acc, [season, bs]) => {
    acc.set(season, bs);
    return acc;
  }, new Map());
};

const getAllDraftChoices = async (): Promise<
  Map<Season, ChoicesResponse | undefined>
> => {
  const seasons = await Promise.all(
    SEASONS.map((s) => getDraftChoices(s).then((dc) => [s, dc] as const))
  );
  return seasons.reduce((acc, [season, bs]) => {
    acc.set(season, bs);
    return acc;
  }, new Map());
};

const getAllTransactions = async (): Promise<
  Map<Season, TransactionResponse | undefined>
> => {
  const seasons = await Promise.all(
    SEASONS.map((s) => getTransactions(s).then((t) => [s, t] as const))
  );
  return seasons.reduce((acc, [season, t]) => {
    acc.set(season, t);
    return acc;
  }, new Map());
};

export interface LeagueData {
  leagueDetails: Map<Season, LeagueDetails>;
  bootstrap: Map<Season, BootstrapStatic>;
  playerStatus: Map<Season, ElementStatusResponse>;
  draftChoices: Map<Season, ChoicesResponse | undefined>;
  transactions: Map<Season, TransactionResponse | undefined>;
}

const LeagueDataContext = createContext<LeagueData | null>(null);

export const useLeagueData = () => {
  const ctx = useContext(LeagueDataContext);
  if (ctx === null) {
    throw new Error("useLeagueData must be used within LeagueDataProvider");
  }
  return ctx;
};

export const LeagueDataProvider = ({ children }: { children: ReactNode }) => {
  const requests = useQueries([
    { queryKey: ["leagueDetails"], queryFn: getAllLeagueDetails },
    { queryKey: ["bootstrap"], queryFn: getAllBootstraps },
    { queryKey: ["element-status"], queryFn: getAllPlayerStatuses },
    { queryKey: ["draft-choices"], queryFn: getAllDraftChoices },
    { queryKey: ["transactions"], queryFn: getAllTransactions },
  ]);

  const isLoading = requests.some((request) => request.isLoading);
  const isError = requests.some((request) => request.isError);
  const leagueDetails = requests[0].data;
  const bootstrap = requests[1].data;
  const playerStatus = requests[2].data;
  const draftChoices = requests[3].data;
  const transactions = requests[4].data;

  if (isLoading) return <div>Loading...</div>;
  if (
    isError ||
    leagueDetails === undefined ||
    bootstrap === undefined ||
    playerStatus === undefined ||
    draftChoices === undefined ||
    transactions === undefined
  ) {
    return <div>Error</div>;
  }

  return (
    <LeagueDataContext.Provider
      value={{
        leagueDetails,
        bootstrap,
        playerStatus,
        draftChoices,
        transactions,
      }}
    >
      {children}
    </LeagueDataContext.Provider>
  );
};
