import { ReactNode } from "react";
import { Match, Season } from "../../domain";
import { StandingsRow } from "./StandingsTable"; //TODO fix the circular dependency introduced here
import { MovementIcon } from "./MovementIcon";
import { Manager } from "../Manager";
import { ResultsListHover } from "./ResultsListHover";
import { Result } from "./Result";
import { Tooltip } from "@nextui-org/react";
import { Link } from "wouter";
import { Column as ColumnType } from "../table/column";

export type Column = ColumnType<StandingsRow> & {
    serialise: {
        header: string | string[];
        data: (row: StandingsRow) => string | number | (string | number)[];
    };
}

export const PositionCol: Column = {
    key: "Position",
    title: "Position",
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
    serialise: {
        header: "Position",
        data: ({ position }) => position,
    },
};

//TODO tidy up, this is a little bit of a work around for the manager profile page
// for now to hide the movement icon
export const PositionOnlyCol: Column = {
    key: "Position only",
    title: "Position only",
    abbr: "Pos",
    render: ({ position }) => position,
    sort: (a, b) => a.position - b.position,
    serialise: {
        header: "Position",
        data: ({ position }) => position,
    },
};

export const SeasonCol: Column = {
    key: "Season",
    title: "Season",
    render: ({ season }) => (
        <Link
            className="hover:text-foreground-400"
            //TODO work out why this doesn't work without the /standings
            to={`~/fpl/league/1/season/${season}/standings`}
        >
            {season}
        </Link>
    ),
    sort: (a, b) => Season.sort(a.season, b.season),
    serialise: {
        header: "Season",
        data: ({ season }) => season,
    },
};

export const TeamCol: Column = {
    key: "Team",
    title: "Team",
    render: ({ entry }) => entry.name,
    sort: (a, b) => a.entry.name.localeCompare(b.entry.name),
    serialise: {
        header: "Team",
        data: ({ entry }) => entry.name,
    },
};

export const TeamAndManagerCol: Column = {
    key: "Team & Manager",
    title: "Team & Manager",
    render: ({ entry }) => (
        <Link
            className="hover:opacity-60"
            to={`~/fpl/league/1/manager/${entry.manager.id}/`}
        >
            <Manager manager={entry.manager} teamName={entry.name} />
        </Link>
    ),
    serialise: {
        header: ["Entry id", "Team name", "Manager id", "Manager name"],
        data: ({ entry }) => [
            entry.id,
            entry.name,
            entry.manager.id,
            entry.manager.name,
        ],
    },
};

export const PlayedCol: Column = {
    key: "Played",
    title: "Played",
    abbr: "P",
    render: ({ played }: StandingsRow) => played.length,
    sort: (a, b) => a.played.length - b.played.length,
    serialise: {
        header: "Played",
        data: ({ played }) => played.length,
    },
};

export const WonCol: Column = {
    key: "Won",
    title: "Won",
    abbr: "W",
    render: ({ entry, wins }) => (
        <ResultsListHover entry={entry} matches={wins} result="won" />
    ),
    sort: (a, b) => a.wins.length - b.wins.length,
    serialise: {
        header: "Won",
        data: ({ wins }) => wins.length,
    },
};

export const DrawnCol: Column = {
    key: "Drawn",
    title: "Drawn",
    abbr: "D",
    render: ({ entry, draws }) => (
        <ResultsListHover entry={entry} matches={draws} result="drawn" />
    ),
    sort: (a, b) => a.draws.length - b.draws.length,
    serialise: {
        header: "Drawn",
        data: ({ draws }) => draws.length,
    },
};

export const LostCol: Column = {
    key: "Lost",
    title: "Lost",
    abbr: "L",
    render: ({ entry, losses }) => (
        <ResultsListHover entry={entry} matches={losses} result="lost" />
    ),
    sort: (a, b) => a.losses.length - b.losses.length,
    serialise: {
        header: "Lost",
        data: ({ losses }) => losses.length,
    },
};

export const PointsForCol: Column = {
    key: "Points Scored",
    title: "Points Scored",
    abbr: "+",
    render: ({ pointsScoreFor }) => pointsScoreFor,
    sort: (a, b) => a.pointsScoreFor - b.pointsScoreFor,
    serialise: {
        header: "Points Scored",
        data: ({ pointsScoreFor }) => pointsScoreFor,
    },
};

export const PointsAgainstCol: Column = {
    key: "Points Against",
    title: "Points Against",
    abbr: "-",
    render: ({ pointsScoreAgainst }) => pointsScoreAgainst,
    sort: (a, b) => a.pointsScoreAgainst - b.pointsScoreAgainst,
    serialise: {
        header: "Points Against",
        data: ({ pointsScoreAgainst }) => pointsScoreAgainst,
    },
};

export const PointsDifferenceCol: Column = {
    key: "Points Score Difference",
    title: "Points Score Difference",
    abbr: "+/-",
    render: ({ pointsScoreFor, pointsScoreAgainst }) =>
        pointsScoreFor - pointsScoreAgainst,
    sort: (a, b) =>
        a.pointsScoreFor -
        a.pointsScoreAgainst -
        (b.pointsScoreFor - b.pointsScoreAgainst),
    serialise: {
        header: "Points Score Difference",
        data: ({ pointsScoreFor, pointsScoreAgainst }) =>
            pointsScoreFor - pointsScoreAgainst,
    },
};

export const PointsCol: Column = {
    key: "Points",
    title: "Points",
    abbr: "Pts",
    render: ({ points }) => points,
    sort: (a, b) => a.points - b.points,
    serialise: {
        header: "Points",
        data: ({ points }) => points,
    },
};

export const FairPointsCol: Column = {
    key: "Fair Points",
    title: "Fair Points",
    abbr: "fPts",
    description: `The Fair Points for a gameweek are calculated by taking the average points a manager would have scored if they played every other manager for that week. 
    Fair Points can then be used to see how (un)lucky a manager has been due to their assigned matchups.`,
    render: ({ fairPoints }) => fairPoints.toFixed(3),
    sort: (a, b) => a.fairPoints - b.fairPoints,
    serialise: {
        header: "Fair Points",
        data: ({ fairPoints }) => fairPoints,
    },
};

export const FairPointsDifferenceCol: Column = {
    key: "Points - Fair Points",
    title: "Points - Fair Points",
    abbr: "Pts - fPts",
    description: `Shows how much a manager is over or underperforming their fair points. 
    A manager with a positive value is overperforming i.e their actual points are higher than their weekly points would imply. A negative value is the opposite.`,
    render: ({ points, fairPoints }) => {
        //TODO on small values e.g 0.001 we get +0 displaying
        //TODO extract toFixed out into a const and reuse. Maybe change to 2.
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
    serialise: {
        header: "Points - Fair Points",
        data: ({ points, fairPoints }) => points - fairPoints,
    },
};

export const FairPositionCol: Column = {
    key: "Fair Position",
    title: "Fair Position",
    abbr: "fPos",
    description: `Where the manager would be ranked if the table was ordered by fair points rather than actual points.`,
    render: ({ fairPosition }) => fairPosition,
    sort: (a, b) => a.fairPosition - b.fairPosition,
    serialise: {
        header: "Fair Position",
        data: ({ fairPosition }) => fairPosition,
    },
};

export const FairPositionDifferenceCol: Column = {
    key: "Position - Fair Position",
    title: "Position - Fair Position",
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
    sort: (a, b) => a.position - a.fairPosition - (b.position - b.fairPosition),
    serialise: {
        header: "Position - Fair Poisition",
        data: ({ position, fairPosition }) => position - fairPosition,
    },
};

export const FormCol: Column = {
    key: "Form",
    title: "Form",
    //TODO tidy up duplication etc, can possibly add some weighting for more recent games?
    render: ({ entry, played }: StandingsRow) => {
        const mostRecent = played.sort(Match.sort).slice(-4);
        return (
            <div className="flex gap-[0.1rem]">
                {mostRecent.map((match, i) => {
                    const alignment = Match.getAlignment(match, entry.id);
                    if (alignment) {
                        const { team, opposition } = alignment;
                        return (
                            <Tooltip
                                delay={600}
                                key={i}
                                content={
                                    <div className="flex flex-col p-1">
                                        <div className="text-tiny uppercase font-medium text-foreground-400 pb-1">
                                            Gameweek {match.gameWeek}
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            {team.points}-{opposition.points}
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
    serialise: {
        header: "Form",
        data: ({ entry, played }) => {
            const mostRecent = played.sort(Match.sort).slice(-4);
            return mostRecent
                .map((m) => Match.resultForTeam(m, entry.id))
                .map((r) => r?.charAt(0).toUpperCase() ?? "")
                .join("");
        },
    },
};

export const UpNextCol: Column = {
    key: "Up next",
    title: "Up next",
    render: ({ entry, upcoming }) => {
        const opposition = upcoming
            ? Match.getOpposition(upcoming, entry.id)
            : undefined;
        if (opposition === undefined) {
            return (
                <span className="text-xs text-foreground-400">
                    No upcoming fixtures
                </span>
            );
        } else {
            return (
                <Link
                    className="hover:opacity-60"
                    to={`~/fpl/league/1/manager/${opposition.manager.id}/`}
                >
                    <Manager
                        manager={opposition.manager}
                        teamName={opposition.name}
                    />
                </Link>
            );
        }
    },
    serialise: {
        header: [
            "Up next entry id",
            "Up next team name",
            "Up next manager id",
            "Up next manager name",
        ],
        data: ({ entry, upcoming }) => {
            const opposition = upcoming
                ? Match.getOpposition(upcoming, entry.id)
                : undefined;
            return [
                opposition?.id ?? "",
                opposition?.name ?? "",
                opposition?.manager.id ?? "",
                opposition?.manager.name ?? "",
            ];
        },
    },
};

export const AveragePointsForCol: Column = {
    key: "Average Points Score For",
    title: "Average Points Score For",
    abbr: "Avg. +",
    render: ({ pointsScoreFor, played }) =>
        (pointsScoreFor / played.length).toFixed(3),
    sort: (a, b) =>
        a.pointsScoreFor / a.played.length - b.pointsScoreFor / b.played.length,
    serialise: {
        header: "Average Points Score For",
        data: ({ pointsScoreFor, played }) => pointsScoreFor / played.length,
    },
};

export const AveragePointsAgainstCol: Column = {
    key: "Average Score Against",
    title: "Average Score Against",
    abbr: "Avg. -",
    render: ({ pointsScoreAgainst, played }) =>
        (pointsScoreAgainst / played.length).toFixed(3),
    sort: (a, b) =>
        a.pointsScoreAgainst / a.played.length -
        b.pointsScoreAgainst / b.played.length,
    serialise: {
        header: "Average Score Against",
        data: ({ pointsScoreAgainst, played }) =>
            pointsScoreAgainst / played.length,
    },
};

export const AveragePointsCol: Column = {
    key: "Average Points",
    title: "Average Points",
    abbr: "Avg. Pts",
    render: ({ points, played }) => (points / played.length).toFixed(3),
    sort: (a, b) => a.points / a.played.length - b.points / b.played.length,
    serialise: {
        header: "Average Points",
        data: ({ points, played }) => points / played.length,
    },
};

export const AverageFairPointsCol: Column = {
    key: "Average Fair Points",
    title: "Average Fair Points",
    abbr: "Avg. fPts",
    render: ({ played, fairPoints }) => (fairPoints / played.length).toFixed(3),
    sort: (a, b) =>
        a.fairPoints / a.played.length - b.fairPoints / b.played.length,
    serialise: {
        header: "Average Fair Points",
        data: ({ fairPoints, played }) => fairPoints / played.length,
    },
};

export const ELOCol: Column = {
    key: "ELO",
    title: "ELO",
    render: ({ elo }) => Math.round(elo),
    sort: (a, b) => a.elo - b.elo,
    serialise: {
        header: "ELO",
        data: ({ elo }) => elo,
    },
};
