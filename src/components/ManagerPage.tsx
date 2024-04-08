import { Redirect, useParams } from "wouter";
import { LeagueDetails, MANAGERS, Manager, Match } from "../domain";
import { buildStandings } from "./standings/domain";
import {
    User,
    Card,
    CardBody,
} from "@nextui-org/react";
import {
    PositionOnlyCol,
    SeasonCol,
    TeamCol,
    PlayedCol,
    WonCol,
    DrawnCol,
    LostCol,
    PointsForCol,
    PointsAgainstCol,
    PointsDifferenceCol,
    PointsCol,
    FairPointsCol,
    FairPointsDifferenceCol,
    FairPositionCol,
    FairPositionDifferenceCol,
} from "./standingstable/columns";
import { StandingsRow, StandingsTable } from "./standingstable/StandingsTable";
import { groupBy } from "../helpers";
import { RecordsRow, RecordsTable } from "./recordstable/RecordsTable";

export interface Props {
    leagueDetails: LeagueDetails[];
}

const COLUMNS = [
    SeasonCol,
    PositionOnlyCol,
    TeamCol,
    PlayedCol,
    WonCol,
    DrawnCol,
    LostCol,
    PointsForCol,
    PointsAgainstCol,
    PointsDifferenceCol,
    PointsCol,
    FairPointsCol,
    FairPointsDifferenceCol,
    FairPositionCol,
    FairPositionDifferenceCol,
];

const mergeStandingRows = (
    standingRows: StandingsRow[]
): {
    played: Match[];
    wins: Match[];
    draws: Match[];
    losses: Match[];
} =>
    standingRows.reduce(
        (acc, next) => {
            return {
                played: acc.played.concat(next.played),
                wins: acc.wins.concat(next.wins),
                draws: acc.draws.concat(next.draws),
                losses: acc.losses.concat(next.losses),
            };
        },
        {
            played: [] as Match[],
            wins: [] as Match[],
            draws: [] as Match[],
            losses: [] as Match[],
        }
    );

export const ManagerPage = ({ leagueDetails }: Props) => {
    const { id } = useParams();
    const manager = Manager.byId.get(Number(id));

    if (manager === undefined) {
        return <Redirect to="~/"/>
    }

    const allTimeStandings = leagueDetails.map((ld) => {
        const standings = buildStandings(ld, undefined);
        const seasonMostRecentStandings =
            standings.get(Math.max(...standings.keys())) ?? new Map();
        const managerTeamId = manager.teams[ld.league.season];
        return seasonMostRecentStandings.get(managerTeamId);
    });

    const { played, wins, draws, losses } = mergeStandingRows(allTimeStandings);

    const winsByOpposition = groupBy(
        wins,
        (m) => Match.getOpposition(m, manager.teams[m.season] ?? -1)?.manager
    );
    const drawsByOpposition = groupBy(
        draws,
        (m) => Match.getOpposition(m, manager.teams[m.season] ?? -1)?.manager
    );
    const lossesByOpposition = groupBy(
        losses,
        (m) => Match.getOpposition(m, manager.teams[m.season] ?? -1)?.manager
    );

    const recordRows: RecordsRow[] = MANAGERS.map((m) => {
        if (m === manager) {
            return undefined;
        }
        const wins = winsByOpposition.get(m) ?? [];
        const draws = drawsByOpposition.get(m) ?? [];
        const losses = lossesByOpposition.get(m) ?? [];
        const played = [...wins, ...draws, ...losses];
        return {
            key: m.name,
            manager: m,
            played,
            wins,
            draws,
            losses,
        } as RecordsRow;
    }).filter((x): x is RecordsRow => x !== undefined);

    return (
        <div className="flex flex-col gap-4">
            <Card shadow="sm">
                <CardBody className="flex flex-row justify-between">
                    <User
                        name={<div className="text-3xl font-semibold">{manager?.name}</div>}
                        avatarProps={{
                            size: "lg",
                            radius: "md",
                            src: `${import.meta.env.BASE_URL}/${id}.jpg`,
                        }}
                    />
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="text-xs">Played</div>
                            <div className="text-2xl text-bold">
                                {played.length}
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-xs">Wins</div>
                            <div className="text-2xl text-bold">
                                {wins.length}
                            </div>
                            <div className="text-tiny text-foreground-400">
                                {((wins.length / played.length) * 100).toFixed(
                                    1
                                )}
                                %
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-xs">Drawn</div>

                            <div className="text-2xl text-bold">
                                {draws.length}
                            </div>
                            <div className="text-tiny text-foreground-400">
                                {((draws.length / played.length) * 100).toFixed(
                                    1
                                )}
                                %
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-xs">Lost</div>
                            <div className="text-2xl text-bold">
                                {losses.length}
                            </div>

                            <div className="text-tiny text-foreground-400">
                                {(
                                    (losses.length / played.length) *
                                    100
                                ).toFixed(1)}
                                %
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
            <StandingsTable
                columns={COLUMNS}
                standings={allTimeStandings}
                topContent={<div className="text-xl font-semibold">Historical performance</div>}
                defaultSortDescriptor={{
                    column: "Season",
                    direction: "descending",
                }}
            />
            <RecordsTable records={recordRows} topContent={<div className="text-xl font-semibold">Head to head</div>} />
        </div>
    );
};
