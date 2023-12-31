import { Match } from "../domain";
import { groupBy } from "../helpers";
import { useMemo } from "react";
import { DownloadCSV, MATCH_SERIALISER } from "./DownloadCSV";
import { GameWeekSelector } from "./GameweekSelector";
import { MatchList } from "./MatchList";
import { GameweekReport } from "./gameweekreport/GameweekReport";
import { useLocation, useParams } from "wouter";

export interface Props {
    matches: Match[];
}

export const Results = ({
    matches,
}: Props) => {
    const { gameWeek } = useParams();
    const [, navigate] = useLocation();
    const byGameWeek = useMemo(
        () => groupBy(matches, (m) => m.gameWeek),
        [matches]
    );
    const gameWeeks = useMemo(
        () => [...new Set(byGameWeek.keys())],
        [byGameWeek]
    );

    return (
        <>
            <div className="flex justify-between items-center p-4">
                <GameWeekSelector
                    gameWeeks={gameWeeks}
                    selectedGameWeek={Number(gameWeek)}
                    setSelectedGameWeek={(gameWeek) => navigate(`/${gameWeek}`)}
                />
                <div>
                    <DownloadCSV
                        filename="results" //TODO get this from some context
                        data={matches}
                        serialiser={MATCH_SERIALISER}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 md:h-[27rem] md:flex-row">
                    <MatchList
                        gameweek={Number(gameWeek)}
                        matches={byGameWeek.get(Number(gameWeek)) ?? []}
                    />
                    <GameweekReport
                        matches={byGameWeek.get(Number(gameWeek)) ?? []}
                    />
                </div>
            </div>
        </>
    );
};
