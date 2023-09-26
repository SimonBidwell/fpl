import { Match } from "../domain";
import { groupBy } from "../helpers";
import { Manager } from "./Manager";
import {
    Card,
    CardBody,
} from "@nextui-org/react";
import { useState, useMemo } from "react";
import { DownloadCSV, MATCH_SERIALISER } from "./DownloadCSV";
import { GameWeekSelector } from "./GameweekSelector";

export interface Props {
    matches: Match[];
}

export const MatchList = ({ matches }: Props) => {
    const byGameWeek = useMemo(
        () => groupBy(matches, (m) => m.gameWeek),
        [matches]
    );
    const gameWeeks = useMemo(
        () => [...new Set(byGameWeek.keys())],
        [byGameWeek]
    );
    const [selectedGameWeek, setSelectedGameWeek] = useState<number>(gameWeeks[0]);
    const selectedGameWeeks = [selectedGameWeek]
    return (
        <>
            <div className="flex justify-between items-center p-4">
                <GameWeekSelector gameWeeks={gameWeeks} selectedGameWeek={selectedGameWeek} setSelectedGameWeek={setSelectedGameWeek}/>
                <div>
                    <DownloadCSV
                        filename="matches" //TODO get this from some context
                        data={matches}
                        serialiser={MATCH_SERIALISER}
                    />
                </div>
            </div>
            <Card className="flex flex-col" shadow="sm">
                <CardBody>
                    {selectedGameWeeks.map((gw) => {
                        return (
                            <div className="pb-6">
                                <div className="text-center text-tiny uppercase font-medium text-foreground-400 pb-1">
                                    Gameweek {gw}
                                </div>
                                {(byGameWeek.get(gw) ?? []).map((match, i) => {
                                    return (
                                        <div
                                            className={`grid grid-cols-5 items-center border-b ${
                                                i === 0 ? "border-t" : ""
                                            }`}
                                        >
                                            <div className="justify-self-end col-span-2 items-center flex py-2">
                                                <Manager
                                                    manager={
                                                        match.teamOne.manager
                                                    }
                                                    teamName={
                                                        match.teamOne.name
                                                    }
                                                    align="right"
                                                />
                                            </div>
                                            <div className="justify-self-center text-center col-start-3 text-sm">
                                                {match.teamOne.points} -{" "}
                                                {match.teamTwo.points}
                                            </div>
                                            <div className="justify-self-start col-span-2 items-center flex py-2">
                                                <Manager
                                                    manager={
                                                        match.teamTwo.manager
                                                    }
                                                    teamName={
                                                        match.teamTwo.name
                                                    }
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </CardBody>
            </Card>
        </>
    );
};
