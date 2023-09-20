import { ReactNode, Key } from "react";
import {
    TableRow as LeagueTableRow,
    Match,
    Manager as ManagerType,
} from "../../domain";
import { MovementIcon } from "./MovementIcon";
import { Manager } from "../Manager";
import { ResultsListHover } from "./ResultsListHover";
import { Result } from "./Result";
import { Card, Tooltip } from "@nextui-org/react";

const TOOLTIP_DELAY_MS = 600;
export const COLUMNS = [
    {
        key: "Position",
        renderLabel: () => (
            <Tooltip
                delay={TOOLTIP_DELAY_MS}
                placement="bottom"
                content={<span className="text-tiny">Position</span>}
            >
                <span>Pos</span>
            </Tooltip>
        ),
        render: ({ position, previousPosition }: LeagueTableRow): ReactNode => (
            <div className="flex items-center gap-1">
                {position}
                {previousPosition !== undefined ? (
                    <MovementIcon
                        currentPosition={position}
                        previousPosition={previousPosition}
                    />
                ) : null}
            </div>
        ),
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.position - b.position,
        selectedByDefault: true,
    },
    {
        key: "Team & Manager",
        renderLabel: () => "Team & Manager",
        render: ({ manager, team }: LeagueTableRow): ReactNode => (
            <Manager manager={manager} teamName={team} />
        ),
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.team.localeCompare(b.team),
        selectedByDefault: true,
    },
    {
        key: "Played",
        renderLabel: () => (
            <Tooltip
                delay={TOOLTIP_DELAY_MS}
                placement="bottom"
                content={<span className="text-tiny">Played</span>}
            >
                <span>P</span>
            </Tooltip>
        ),
        render: ({ matches }: LeagueTableRow) =>
            matches.filter((m) => m.status === "finished").length,
        sort: (a: LeagueTableRow, b: LeagueTableRow) =>
            a.matches.filter((m) => m.status === "finished").length -
            b.matches.filter((m) => m.status === "finished").length,
        selectedByDefault: false,
    },
    {
        key: "Won",
        renderLabel: () => (
            <Tooltip
                delay={TOOLTIP_DELAY_MS}
                placement="bottom"
                content={<span className="text-tiny">Won</span>}
            >
                <span>W</span>
            </Tooltip>
        ),
        render: ({ id, matches, manager, team }: LeagueTableRow): ReactNode => {
            const matchesWon = matches.filter((m) => Match.isWinner(m, id));
            return (
                <ResultsListHover
                    teamId={id}
                    managerId={manager.id}
                    teamName={team}
                    matches={matchesWon}
                    result="won"
                />
            );
        },
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => a.wins - b.wins,
        selectedByDefault: true,
    },
    {
        key: "Drawn",
        renderLabel: () => (
            <Tooltip
                delay={TOOLTIP_DELAY_MS}
                placement="bottom"
                content={<span className="text-tiny">Drawn</span>}
            >
                <span>D</span>
            </Tooltip>
        ),
        render: ({ id, matches, manager, team }: LeagueTableRow): ReactNode => {
            const matchesDrawn = matches.filter(Match.isDraw);
            return (
                <ResultsListHover
                    teamId={id}
                    managerId={manager.id}
                    teamName={team}
                    matches={matchesDrawn}
                    result="drawn"
                />
            );
        },
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.draws - b.draws,
        selectedByDefault: true,
    },
    {
        key: "Lost",
        renderLabel: () => (
            <Tooltip
                delay={TOOLTIP_DELAY_MS}
                placement="bottom"
                content={<span className="text-tiny">Lost</span>}
            >
                <span>L</span>
            </Tooltip>
        ),
        render: ({ id, matches, manager, team }: LeagueTableRow): ReactNode => {
            const matchesLost = matches.filter((m) => Match.isLoser(m, id));
            return (
                <ResultsListHover
                    teamId={id}
                    managerId={manager.id}
                    teamName={team}
                    matches={matchesLost}
                    result="lost"
                />
            );
        },
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.losses - b.losses,
        selectedByDefault: true,
    },
    {
        key: "Points Scored",
        renderLabel: () => (
            <Tooltip
                delay={TOOLTIP_DELAY_MS}
                placement="bottom"
                content={<span className="text-tiny">Points Scored</span>}
            >
                <span>+</span>
            </Tooltip>
        ),
        render: ({ id, matches }: LeagueTableRow): ReactNode =>
            matches
                .map((x) => Match.getTeam(x, id))
                .reduce((a, b) => a + (b?.points ?? 0), 0),
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.scoreFor - b.scoreFor,
        selectedByDefault: true,
    },
    {
        key: "Points Against",
        renderLabel: () => (
            <Tooltip
                delay={TOOLTIP_DELAY_MS}
                placement="bottom"
                content={<span className="text-tiny">Points Against</span>}
            >
                <span>-</span>
            </Tooltip>
        ),
        render: ({ scoreAgainst }: LeagueTableRow): ReactNode => scoreAgainst,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.scoreAgainst - b.scoreAgainst,
        selectedByDefault: true,
    },
    {
        key: "Points Score Difference",
        renderLabel: () => (
            <Tooltip
                delay={TOOLTIP_DELAY_MS}
                placement="bottom"
                content={
                    <span className="text-tiny">Points Score Difference</span>
                }
            >
                <span>+/-</span>
            </Tooltip>
        ),
        render: ({ scoreFor, scoreAgainst }: LeagueTableRow): ReactNode => (
            <>{scoreFor - scoreAgainst}</>
        ),
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.scoreFor - a.scoreAgainst - (b.scoreFor - b.scoreAgainst),
        selectedByDefault: true,
    },
    {
        key: "Points",
        renderLabel: () => (
            <Tooltip
                delay={TOOLTIP_DELAY_MS}
                placement="bottom"
                content={<span className="text-tiny">Points</span>}
            >
                <span>Pts</span>
            </Tooltip>
        ),
        render: ({ points }: LeagueTableRow): ReactNode => points,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.points - b.points,
        selectedByDefault: true,
    },
    {
        key: "Fair Points",
        renderLabel: () => (
            <Tooltip
                delay={TOOLTIP_DELAY_MS}
                placement="bottom"
                content={
                    <div className="w-52 py-2 text-tiny">
                        <Card
                            className="bg-default-100 p-2 text-tiny text-foreground-500 font-semibold"
                            radius="sm"
                            shadow="sm"
                        >
                            Fair Points (fPts)
                        </Card>
                        <p className="py-2">
                            The Fair Points for a gameweek are calculated by
                            taking the average points a manager would have
                            scored if they played every other manager for that
                            week.
                        </p>
                        <p>
                            Fair Points can then be used to see how (un)lucky a
                            manager has been due to their assigned matchups.
                        </p>
                    </div>
                }
            >
                <span className="underline underline-offset-2 decoration-dotted decoration-foreground-400">
                    fPts
                </span>
            </Tooltip>
        ),
        render: ({ fairPoints: expectedPoints }: LeagueTableRow): ReactNode =>
            expectedPoints.toFixed(3),
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => a.fairPoints,
        selectedByDefault: true,
    },
    {
        key: "Points - Fair Points",
        renderLabel: () => (
            <Tooltip
                delay={TOOLTIP_DELAY_MS}
                placement="bottom"
                content={
                    <span className="text-tiny">Points - Fair Points</span>
                }
            >
                <span>Pts - fPts</span>
            </Tooltip>
        ),
        render: ({
            points,
            fairPoints: expectedPoints,
        }: LeagueTableRow): ReactNode => {
            const diff = points - expectedPoints;
            return (
                <span
                    className={
                        diff > 0
                            ? "text-success-500"
                            : diff < 0
                            ? "text-danger-500"
                            : undefined
                    }
                >
                    {diff > 0 ? "+" : ""}
                    {diff.toFixed(3)}
                </span>
            );
        },
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.points - a.fairPoints - (b.points - b.fairPoints),
        selectedByDefault: true,
    },
    {
        key: "Fair Position",
        renderLabel: () => (
            <Tooltip
                delay={TOOLTIP_DELAY_MS}
                placement="bottom"
                content={<span className="text-tiny">Fair Position</span>}
            >
                <span>fPos</span>
            </Tooltip>
        ),
        render: ({
            fairPosition: expectedPosition,
        }: LeagueTableRow): ReactNode => expectedPosition,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.fairPosition - b.fairPosition,
        selectedByDefault: true,
    },
    {
        key: "Position - Fair Position",
        renderLabel: () => (
            <Tooltip
                delay={TOOLTIP_DELAY_MS}
                placement="bottom"
                content={
                    <span className="text-tiny">Position - Fair Position</span>
                }
            >
                <span>Pos - fPos</span>
            </Tooltip>
        ),
        render: ({
            position,
            fairPosition: expectedPosition,
        }: LeagueTableRow): ReactNode => {
            const diff = position - expectedPosition;
            return (
                <span
                    className={
                        diff > 0
                            ? "text-success-500"
                            : diff < 0
                            ? "text-danger-500"
                            : undefined
                    }
                >
                    {diff > 0 ? "+" : ""}
                    {diff}
                </span>
            );
        },
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.position - a.fairPosition - (b.position - b.fairPosition),
        selectedByDefault: true,
    },
    {
        key: "Form",
        renderLabel: () => "Form",
        //TODO tidy up duplication etc, can possibly add some weighting for more recent games?
        //TODO disable for all time table/when there are more than 2 leagues selected
        render: ({ id, matches }: LeagueTableRow) => {
            const mostRecent = matches
                .filter((m) => m.status === "finished")
                .sort(Match.sort)
                .slice(-4);
            return (
                <div className="flex gap-[0.1rem]">
                    {mostRecent.map((match, i) => {
                        const thisTeam = Match.getTeam(match, id);
                        const opposition = Match.getOpposition(match, id);
                        if (thisTeam && opposition) {
                            return (
                                <Tooltip
                                    content={
                                        <div className="flex flex-col p-1">
                                            <div className="text-tiny uppercase font-medium text-foreground-400 pb-1">
                                                Gameweek {match.gameWeek}
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                {thisTeam.points}-
                                                {opposition.points}
                                                <Manager
                                                    manager={opposition.manager}
                                                    teamName={opposition.name}
                                                />
                                            </div>
                                        </div>
                                    }
                                >
                                    <div>
                                        <Result
                                            result={Match.resultForTeam(
                                                match,
                                                id
                                            )}
                                        />
                                    </div>
                                </Tooltip>
                            );
                        } else {
                            return null;
                        }
                    })}
                </div>
            );
        },
        sort: (a: LeagueTableRow, b: LeagueTableRow) => {
            const formSum = (id: number, matches: Match[]): number => {
                return matches.reduce((a, b) => {
                    const resultForTeam = Match.resultForTeam(b, id);
                    const points =
                        resultForTeam === "win"
                            ? 3
                            : resultForTeam === "draw"
                            ? 1
                            : 0;
                    return a + points;
                }, 0);
            };
            const mostRecent = (matches: Match[]) =>
                matches
                    .filter((m) => m.status === "finished")
                    .sort(Match.sort)
                    .slice(-4);
            return (
                formSum(a.id, mostRecent(a.matches)) -
                formSum(b.id, mostRecent(b.matches))
            );
        },
        selectedByDefault: true,
    },
    {
        key: "Up next",
        renderLabel: () => "Up next",
        render: ({ id, matches }: LeagueTableRow) => {
            const nextMatch = matches
                .filter((m) => m.status !== "finished")
                .sort(Match.sort)[0];
            const opposition = nextMatch
                ? Match.getOpposition(nextMatch, id)
                : undefined;
            if (opposition === undefined) {
                return (
                    <span className="text-xs text-foreground-400">
                        No upcoming fixtures
                    </span>
                );
            } else {
                return (
                    <Manager
                        manager={opposition.manager}
                        teamName={opposition.name}
                    />
                );
            }
        },
        selectedByDefault: true,
        sort: undefined,
    },
    {
        key: "Average Points Score For",
        renderLabel: () => (
            <Tooltip
                delay={TOOLTIP_DELAY_MS}
                placement="bottom"
                content={<span className="text-tiny">Average Score For</span>}
            >
                <span>Avg +</span>
            </Tooltip>
        ),
        render: (row: LeagueTableRow) =>
            row.scoreFor /
            row.matches.filter((m) => m.status === "finished").length,
        sort: () => 0,
        selectedByDefault: false,
    },
    {
        key: "Average Score Against",
        renderLabel: () => (
            <Tooltip
                delay={TOOLTIP_DELAY_MS}
                placement="bottom"
                content={
                    <span className="text-tiny">Average Score Against</span>
                }
            >
                <span>Avg -</span>
            </Tooltip>
        ),
        render: (row: LeagueTableRow) =>
            row.scoreAgainst /
            row.matches.filter((m) => m.status === "finished").length,
        sort: () => 0,
        selectedByDefault: false,
    },
    {
        key: "Average Points",
        renderLabel: () => (
            <Tooltip
                delay={TOOLTIP_DELAY_MS}
                placement="bottom"
                content={<span className="text-tiny">Average Points</span>}
            >
                <span>Avg Pts</span>
            </Tooltip>
        ),
        render: (row: LeagueTableRow) =>
            row.points /
            row.matches.filter((m) => m.status === "finished").length,
        sort: () => 0,
        selectedByDefault: false,
    },
    {
        key: "Average Fair Points",
        renderLabel: () => (
            <Tooltip
                delay={TOOLTIP_DELAY_MS}
                placement="bottom"
                content={<span className="text-tiny">Average Fair Points</span>}
            >
                <span>Avg fPts</span>
            </Tooltip>
        ),
        render: (row: LeagueTableRow) =>
            (
                row.fairPoints /
                row.matches.filter((m) => m.status === "finished").length
            ).toFixed(3),
        sort: () => 0,
        selectedByDefault: false,
    },
    //TODO reinstate when I make things selectable
    // "Waiver": {
    // key: "",
    // renderLabel: () => <></>,
    //     render: ({waiverPick}: LeagueTableRow) => waiverPick,
    //     sort: (a: LeagueTableRow, b: LeagueTableRow) => (a.waiverPick ?? 0) - (b.waiverPick ?? 0)
    // }
] as const;

export type ColumnKey = (typeof COLUMNS)[number]["key"];
export const COLUMN_KEYS: ColumnKey[] = COLUMNS.map((col) => col.key);
export const INITIAL_COLUMNS: ColumnKey[] = COLUMNS.filter(
    (col) => col.selectedByDefault
).map((col) => col.key);
