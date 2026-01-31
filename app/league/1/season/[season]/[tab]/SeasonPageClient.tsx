"use client";

import { notFound } from "next/navigation";
import { useLeagueData } from "@/app/league/1/LeagueDataProvider";
import { SeasonContextProvider } from "@/src/SeasonContext";
import { SeasonContent } from "./SeasonContent";
import { SEASONS, Season } from "@/src/domain";

const isSeason = (s: unknown): s is Season => SEASONS.includes(s as Season);

interface Props {
  season: string;
  tab: string;
  gameWeek?: number;
}

export function SeasonPageClient({ season, tab, gameWeek }: Props) {
  const { leagueDetails, bootstrap, playerStatus, draftChoices, transactions } =
    useLeagueData();

  if (!isSeason(season)) {
    notFound();
  }

  return (
    <SeasonContextProvider
      leagueDetails={leagueDetails.get(season)}
      bootstrap={bootstrap.get(season)}
      playerStatus={playerStatus.get(season)}
      draft={draftChoices.get(season)}
      transactions={transactions.get(season)}
    >
      <SeasonContent season={season} tab={tab} gameWeek={gameWeek} />
    </SeasonContextProvider>
  );
}
