import { Match } from "../domain";
import { groupBy } from "../helpers";
import { Manager } from "./Manager";
import { Card, CardBody } from "@nextui-org/react";

export interface Props {
    matches: Match[];
    reverse?: boolean;
}

export const MatchList = ({ matches, reverse }: Props) => {
    const byGameWeek = groupBy(matches, (m) => m.gameWeek);
    const gameWeeks = [...byGameWeek.keys()].sort(
        (a, b) => (a - b) * (reverse ? -1 : 1)
    );
    return (
        <Card className="flex flex-col" shadow="sm">
            <CardBody>
            {gameWeeks.map((gw) => {
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
                                            manager={match.teamOne.manager}
                                            teamName={match.teamOne.name}
                                            align="right"
                                        />
                                    </div>
                                    <div className="justify-self-center text-center col-start-3 text-sm">
                                        {match.teamOne.points} -{" "}
                                        {match.teamTwo.points}
                                    </div>
                                    <div className="justify-self-start col-span-2 items-center flex py-2">
                                        <Manager
                                            manager={match.teamTwo.manager}
                                            teamName={match.teamTwo.name}
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
    );
};
