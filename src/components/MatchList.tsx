import { Match } from "../domain";
import { Manager } from "./Manager";
import { Card, CardBody } from "@nextui-org/react";

export interface Props {
    gameweek: number;
    matches: Match[];
}

export const MatchList = ({ gameweek, matches }: Props) => {
    return (
        <Card className="flex flex-col grow" shadow="sm">
            <CardBody>
                <div className="pb-6">
                    <div className="text-center text-tiny uppercase font-medium text-foreground-400 pb-1">
                        Gameweek {gameweek}
                    </div>
                    {matches.map((match, i) => {
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
                                    {Match.isFinished(match) ? `${match.teamOne.points} - ${match.teamTwo.points}` : `v`}
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
            </CardBody>
        </Card>
    );
};
