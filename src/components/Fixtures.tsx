import { Match } from "../domain";
import { groupBy } from "../helpers";
import { useState, useMemo } from "react";
import { DownloadCSV, MATCH_SERIALISER } from "./DownloadCSV";
import { GameWeekSelector } from "./GameweekSelector";
import { MatchList } from "./MatchList";

export interface Props {
    matches: Match[];
}

export const Fixtures = ({ matches }: Props) => {
    const byGameWeek = useMemo(
        () => groupBy(matches, (m) => m.gameWeek),
        [matches]
    );
    const gameWeeks = useMemo(
        () => [...new Set(byGameWeek.keys())],
        [byGameWeek]
    );
    const [selectedGameWeek, setSelectedGameWeek] = useState<number>(
        gameWeeks[0]
    );
    const selectedGameWeeks = [selectedGameWeek];
    return (
        <>
            <div className="flex justify-between items-center p-4">
                <GameWeekSelector
                    gameWeeks={gameWeeks}
                    selectedGameWeek={selectedGameWeek}
                    setSelectedGameWeek={setSelectedGameWeek}
                />
                <div>
                    <DownloadCSV
                        filename="fixtures" //TODO get this from some context
                        data={matches}
                        serialiser={MATCH_SERIALISER}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-4">
                {selectedGameWeeks.map(gameweek => <MatchList gameweek={gameweek} matches={byGameWeek.get(gameweek) ?? []}/>)}
            </div>
        </>
    );
};
