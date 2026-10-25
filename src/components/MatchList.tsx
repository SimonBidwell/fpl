import { Match } from "../domain";
import { Manager } from "./Manager";
import { Card, CardBody } from "@nextui-org/react";
import { Link } from "wouter";

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
                                key={`${match.teamOne.id}-${match.teamTwo.id}`}
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
                                    <Link
                                        href={`~/fpl/league/1/season/${match.season}/manager/${match.teamOne.manager.id}/gameweek/${gameweek}`}
                                        className="rounded-sm hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                                        aria-label={`View lineups: ${match.teamOne.name} versus ${match.teamTwo.name}, gameweek ${gameweek}`}
                                    >
                                        {Match.isFinished(match) ? `${match.teamOne.points} - ${match.teamTwo.points}` : "v"}
                                    </Link>
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
