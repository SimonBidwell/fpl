import { ReactNode } from "react";
import {
    TableRow as LeagueTableRow,
    Match,
} from "../../domain";
import { MovementIcon } from "./MovementIcon";
import { Manager } from "../Manager";
import { ResultsListHover } from "./ResultsListHover";
import { Result } from "./Result";
import { Tooltip } from "@nextui-org/react";

export interface Column {
    key: string;
    abbr?: string;
    description?: string;
    render: (row: LeagueTableRow) => ReactNode;
    sort?: (a: LeagueTableRow, b: LeagueTableRow) => number;
    isVisibleByDefault?: boolean;
}

export const COLUMNS: readonly Column[] = [
    {
        key: "Position",
        abbr: "Pos",
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
        isVisibleByDefault: true,
    },
    {
        key: "Team & Manager",
        render: ({ manager, team }: LeagueTableRow): ReactNode => (
            <Manager manager={manager} teamName={team} />
        ),
        isVisibleByDefault: true,
    },
    {
        key: "Played",
        abbr: "P",
        render: ({ matches }: LeagueTableRow) =>
            matches.filter((m) => m.status === "finished").length,
        sort: (a: LeagueTableRow, b: LeagueTableRow) =>
            a.matches.filter((m) => m.status === "finished").length -
            b.matches.filter((m) => m.status === "finished").length,
    },
    {
        key: "Won",
        abbr: "W",
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
        isVisibleByDefault: true,
    },
    {
        key: "Drawn",
        abbr: "D",
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
        isVisibleByDefault: true,
    },
    {
        key: "Lost",
        abbr: "L",
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
        isVisibleByDefault: true,
    },
    {
        key: "Points Scored",
        abbr: "+",
        render: ({ id, matches }: LeagueTableRow): ReactNode =>
            matches
                .map((x) => Match.getTeam(x, id))
                .reduce((a, b) => a + (b?.points ?? 0), 0),
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.scoreFor - b.scoreFor,
        isVisibleByDefault: true,
    },
    {
        key: "Points Against",
        abbr: "-",
        render: ({ scoreAgainst }: LeagueTableRow): ReactNode => scoreAgainst,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.scoreAgainst - b.scoreAgainst,
        isVisibleByDefault: true,
    },
    {
        key: "Points Score Difference",
        abbr: "+/-",
        render: ({ scoreFor, scoreAgainst }: LeagueTableRow): ReactNode => (
            <>{scoreFor - scoreAgainst}</>
        ),
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.scoreFor - a.scoreAgainst - (b.scoreFor - b.scoreAgainst),
        isVisibleByDefault: true,
    },
    {
        key: "Points",
        abbr: "Pts",
        render: ({ points }: LeagueTableRow): ReactNode => points,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.points - b.points,
        isVisibleByDefault: true,
    },
    {
        key: "Fair Points",
        abbr: "fPts",
        description: `The Fair Points for a gameweek are calculated by taking the average points a manager would have scored if they played every other manager for that week. 
        Fair Points can then be used to see how (un)lucky a manager has been due to their assigned matchups.`,
        render: ({ fairPoints: expectedPoints }: LeagueTableRow): ReactNode =>
            expectedPoints.toFixed(3),
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => a.fairPoints,
        isVisibleByDefault: true,
    },
    {
        key: "Points - Fair Points",
        abbr: "Pts - fPts",
        description: `Shows how much a manager is over or underperforming their fair points. 
        A manager with a positive value is overperforming i.e their actual points are higher than their weekly points would imply. A negative value is the opposite.`,
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
        isVisibleByDefault: true,
    },
    {
        key: "Fair Position",
        abbr: "fPos",
        description: `Where the manager would be ranked if the table was ordered by fair points rather than actual points.`,
        render: ({
            fairPosition: expectedPosition,
        }: LeagueTableRow): ReactNode => expectedPosition,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.fairPosition - b.fairPosition,
        isVisibleByDefault: true,
    },
    {
        key: "Position - Fair Position",
        abbr: "Pos - fPos",
        description: `Shows how much a manager is over or underperforming their fair position. 
        A manager with a positive value is overperforming i.e their actual position is higher than their fair points would imply. A negative value is the opposite.`,
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
        isVisibleByDefault: true,
    },
    {
        key: "Form",
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
                                    key={i}
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
        isVisibleByDefault: true,
    },
    {
        key: "Up next",
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
        isVisibleByDefault: true,
    },
    {
        key: "Average Points Score For",
        abbr: "Avg. +",
        render: (row: LeagueTableRow) =>
            row.scoreFor /
            row.matches.filter((m) => m.status === "finished").length,
        sort: () => 0,
    },
    {
        key: "Average Score Against",
        abbr: "Avg. -",
        render: (row: LeagueTableRow) =>
            row.scoreAgainst /
            row.matches.filter((m) => m.status === "finished").length,
        sort: () => 0,
    },
    {
        key: "Average Points",
        abbr: "Avg. Pts",
        render: (row: LeagueTableRow) =>
            row.points /
            row.matches.filter((m) => m.status === "finished").length,
        sort: () => 0,
    },
    {
        key: "Average Fair Points",
        abbr: "Avg. fPts",
        render: (row: LeagueTableRow) =>
            (
                row.fairPoints /
                row.matches.filter((m) => m.status === "finished").length
            ).toFixed(3),
        sort: () => 0,
    },
    //TODO reinstate when I make things selectable
    // "Waiver": {
    // key: "",
    // renderLabel: () => <></>,
    //     render: ({waiverPick}: LeagueTableRow) => waiverPick,
    //     sort: (a: LeagueTableRow, b: LeagueTableRow) => (a.waiverPick ?? 0) - (b.waiverPick ?? 0)
    // }
];

export const COLUMN_KEYS: readonly string[] = COLUMNS.map((col) => col.key);
export const INITIAL_COLUMNS: readonly string[] = COLUMNS.filter(
    (col) => col.isVisibleByDefault
).map((col) => col.key);
