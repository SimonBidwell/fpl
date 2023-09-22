import { ReactNode } from "react";
import { Match } from "../../domain";
import { StandingsRow } from "./domain";
import { MovementIcon } from "./MovementIcon";
import { Manager } from "../Manager";
import { ResultsListHover } from "./ResultsListHover";
import { Result } from "./Result";
import { Tooltip } from "@nextui-org/react";

export interface Column {
    key: string;
    abbr?: string;
    description?: string;
    render: (row: StandingsRow) => ReactNode;
    sort?: (a: StandingsRow, b: StandingsRow) => number;
    isVisibleByDefault?: boolean;
    specificMode?: "single" | "multi"
}

export const COLUMNS: readonly Column[] = [
    {
        key: "Position",
        abbr: "Pos",
        render: ({ position, previousPosition }: StandingsRow): ReactNode => (
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
        sort: (a, b) => a.position - b.position,
        isVisibleByDefault: true,
    },
    {
        key: "Team & Manager",
        render: ({ entry }) => (
            <Manager manager={entry.manager} teamName={entry.name} />
        ),
        isVisibleByDefault: true,
    },
    {
        key: "Season",
        render: ({season}) => season,
        sort: (a, b) => a.season.localeCompare(b.season),
        specificMode: "multi"
    },
    {
        key: "Played",
        abbr: "P",
        render: ({ played }: StandingsRow) => played.length,
        sort: (a, b) => a.played.length - b.played.length,
    },
    {
        key: "Won",
        abbr: "W",
        render: ({ entry, wins }) => (
            <ResultsListHover
                entry={entry}
                matches={wins}
                result="won"
            />
        ),
        sort: (a, b) => a.wins.length - b.wins.length,
        isVisibleByDefault: true,
    },
    {
        key: "Drawn",
        abbr: "D",
        render: ({ entry, draws }) => (
            <ResultsListHover
                entry={entry}
                matches={draws}
                result="drawn"
            />
        ),
        sort: (a, b) => a.draws.length - b.draws.length,
        isVisibleByDefault: true,
    },
    {
        key: "Lost",
        abbr: "L",
        render: ({ entry, losses }) => (
            <ResultsListHover
                entry={entry}
                matches={losses}
                result="lost"
            />
        ),
        sort: (a, b) => a.losses.length - b.losses.length,
        isVisibleByDefault: true,
    },
    {
        key: "Points Scored",
        abbr: "+",
        render: ({ pointsScoreFor }) => pointsScoreFor,
        sort: (a, b) => a.pointsScoreFor - b.pointsScoreFor,
        isVisibleByDefault: true,
    },
    {
        key: "Points Against",
        abbr: "-",
        render: ({ pointsScoreAgainst }) => pointsScoreAgainst,
        sort: (a, b) => a.pointsScoreAgainst - b.pointsScoreAgainst,
        isVisibleByDefault: true,
    },
    {
        key: "Points Score Difference",
        abbr: "+/-",
        render: ({ pointsScoreFor, pointsScoreAgainst }) =>
            pointsScoreFor - pointsScoreAgainst,
        sort: (a, b) =>
            a.pointsScoreFor -
            a.pointsScoreAgainst -
            (b.pointsScoreFor - b.pointsScoreAgainst),
        isVisibleByDefault: true,
    },
    {
        key: "Points",
        abbr: "Pts",
        render: ({ points }) => points,
        sort: (a, b) => a.points - b.points,
        isVisibleByDefault: true,
    },
    {
        key: "Fair Points",
        abbr: "fPts",
        description: `The Fair Points for a gameweek are calculated by taking the average points a manager would have scored if they played every other manager for that week. 
        Fair Points can then be used to see how (un)lucky a manager has been due to their assigned matchups.`,
        render: ({ fairPoints }) => fairPoints.toFixed(3),
        sort: (a, b) => a.fairPoints - b.fairPoints,
        isVisibleByDefault: true,
    },
    {
        key: "Points - Fair Points",
        abbr: "Pts - fPts",
        description: `Shows how much a manager is over or underperforming their fair points. 
        A manager with a positive value is overperforming i.e their actual points are higher than their weekly points would imply. A negative value is the opposite.`,
        render: ({ points, fairPoints }) => {
            const diff = points - fairPoints;
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
        sort: (a, b) => a.points - a.fairPoints - (b.points - b.fairPoints),
        isVisibleByDefault: true,
    },
    {
        key: "Fair Position",
        abbr: "fPos",
        description: `Where the manager would be ranked if the table was ordered by fair points rather than actual points.`,
        render: ({ fairPosition }) => fairPosition,
        sort: (a, b) => a.fairPosition - b.fairPosition,
        isVisibleByDefault: true,
    },
    {
        key: "Position - Fair Position",
        abbr: "Pos - fPos",
        description: `Shows how much a manager is over or underperforming their fair position. 
        A manager with a positive value is overperforming i.e their actual position is higher than their fair points would imply. A negative value is the opposite.`,
        render: ({ position, fairPosition }) => {
            const diff = position - fairPosition;
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
        sort: (a, b) =>
            a.position - a.fairPosition - (b.position - b.fairPosition),
        isVisibleByDefault: true,
    },
    {
        key: "Form",
        //TODO tidy up duplication etc, can possibly add some weighting for more recent games?
        render: ({ entry, played }: StandingsRow) => {
            const mostRecent = played
                .sort(Match.sort)
                .slice(-4);
            return (
                <div className="flex gap-[0.1rem]">
                    {mostRecent.map((match, i) => {
                        const alignment = Match.getAlignment(match, entry.id);
                        if (alignment) {
                            const { team, opposition } = alignment;
                            return (
                                <Tooltip
                                    key={i}
                                    content={
                                        <div className="flex flex-col p-1">
                                            <div className="text-tiny uppercase font-medium text-foreground-400 pb-1">
                                                Gameweek {match.gameWeek}
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                {team.points}-
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
                                                entry.id
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
        sort: (a, b) => {
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
                formSum(
                    a.entry.id,
                    mostRecent([...a.wins, ...a.draws, ...a.losses])
                ) -
                formSum(
                    b.entry.id,
                    mostRecent([...b.wins, ...b.draws, ...b.losses])
                )
            );
        },
        isVisibleByDefault: true,
        specificMode: "single",
    },
    {
        key: "Up next",
        render: ({ entry, upcoming }) => {
            const nextMatch = upcoming.sort(Match.sort)[0];
            const opposition = nextMatch
                ? Match.getOpposition(nextMatch, entry.id)
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
        specificMode: "single"
    },
    {
        key: "Average Points Score For",
        abbr: "Avg. +",
        render: ({ pointsScoreFor, played }) => (pointsScoreFor / played.length).toFixed(3),
        sort: (a, b) =>
            a.pointsScoreFor / a.played.length -
            b.pointsScoreFor / b.played.length,
    },
    {
        key: "Average Score Against",
        abbr: "Avg. -",
        render: ({ pointsScoreAgainst, played }) =>
            (pointsScoreAgainst / played.length).toFixed(3),
        sort: (a, b) =>
            a.pointsScoreAgainst / a.played.length -
            b.pointsScoreAgainst / b.played.length,
    },
    {
        key: "Average Points",
        abbr: "Avg. Pts",
        render: ({ points, played }) => (points / played.length).toFixed(3),
        sort: (a, b) => a.points / a.played.length - b.points / b.played.length,
    },
    {
        key: "Average Fair Points",
        abbr: "Avg. fPts",
        render: ({ played, fairPoints }) =>
            (fairPoints / played.length).toFixed(3),
        sort: (a, b) =>
            a.fairPoints / a.played.length - b.fairPoints / b.played.length,
    },
    {
        key: "Waiver",
        render: ({waiverPick}) => waiverPick ?? "-",
        sort: (a, b) => (a.waiverPick ?? 0) - (b.waiverPick ?? 0),
        specificMode: "single"
    }
];

export const COLUMN_KEYS: readonly string[] = COLUMNS.map((col) => col.key);
export const INITIAL_COLUMNS: readonly string[] = COLUMNS.filter(
    (col) => col.isVisibleByDefault
).map((col) => col.key);
