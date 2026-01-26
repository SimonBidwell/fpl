"use client";

import { Match } from "../domain";
import { groupBy } from "../helpers";
import { useMemo } from "react";
import { DownloadCSV, MATCH_SERIALISER } from "./DownloadCSV";
import { GameWeekSelector } from "./GameweekSelector";
import { MatchList } from "./MatchList";
import { useParams, useRouter } from "next/navigation";

export interface Props {
  matches: Match[];
}

export const Fixtures = ({ matches }: Props) => {
  const params = useParams();
  const router = useRouter();
  const gameWeek = params.gameWeek as string | undefined;

  const byGameWeek = useMemo(
    () => groupBy(matches, (m) => m.gameWeek),
    [matches]
  );
  const gameWeeks = useMemo(
    () => [...new Set(byGameWeek.keys())],
    [byGameWeek]
  );

  const navigateToGameWeek = (gw: number) => {
    const season = params.season;
    const tab = params.tab;
    router.push(`/league/1/season/${season}/${tab}/${gw}`);
  };

  return (
    <>
      <div className="flex justify-between items-center p-4">
        <GameWeekSelector
          gameWeeks={gameWeeks}
          selectedGameWeek={Number(gameWeek)}
          setSelectedGameWeek={navigateToGameWeek}
        />
        <div>
          <DownloadCSV
            filename="fixtures"
            data={matches}
            serialiser={MATCH_SERIALISER}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <MatchList
          gameweek={Number(gameWeek)}
          matches={byGameWeek.get(Number(gameWeek)) ?? []}
        />
      </div>
    </>
  );
};
