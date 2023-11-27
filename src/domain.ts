import { indexBy } from "./helpers";
import {
    LeagueDetails as FplLeagueDetails,
    Match as FplMatch,
} from "./api/domain";

export const SEASONS = ["2020/21", "2021/22", "2022/23", "2023/24"] as const;
export type Season = (typeof SEASONS)[number];
export const Season = {
    isSeason: (s: unknown): s is Season => SEASONS.includes(s as Season),
    sort: (a: Season, b: Season) => a.localeCompare(b),
};

export interface NotablePlacement {
    season: string;
    position: number;
}

export interface Manager {
    id: number;
    name: string;
    teams: Record<Season, number>;
    notablePlacements: NotablePlacement[];
    color: string;
}
export const MANAGERS = [
    {
        id: 1,
        name: "Ed Brett",
        teams: {
            "2020/21": 1,
            "2021/22": 154306,
            "2022/23": 1,
            "2023/24": 115199,
        },
        notablePlacements: [],
        color: "#ef4444"
    },
    {
        id: 2,
        name: "Alex Harrison",
        teams: {
            "2020/21": 3,
            "2021/22": 154519,
            "2022/23": 3,
            "2023/24": 115222,
        },
        notablePlacements: [{ season: "2021/22", position: 1 }],
        color: "#f59e0b"
    },
    {
        id: 3,
        name: "Ollie Craig",
        teams: {
            "2020/21": 4,
            "2021/22": 154677,
            "2022/23": 4,
            "2023/24": 116308,
        },
        notablePlacements: [],
        color: "#fde047"
    },
    {
        id: 4,
        name: "Charlie Schofield",
        teams: {
            "2020/21": 6,
            "2021/22": 201935,
            "2022/23": 6,
            "2023/24": 118328,
        },
        notablePlacements: [{ season: "2022/23", position: 1 }],
        color: "#22c55e"
    },
    {
        id: 5,
        name: "Simon Bidwell",
        teams: {
            "2020/21": 12,
            "2021/22": 208300,
            "2022/23": 12,
            "2023/24": 123888,
        },
        notablePlacements: [{ season: "2019/20", position: 1 }],
        color: "#670E36"
    },
    {
        id: 6,
        name: "Anjit Aulakh",
        teams: {
            "2020/21": 5,
            "2021/22": 154909,
            "2022/23": 5,
            "2023/24": 139985,
        },
        notablePlacements: [{ season: "2020/21", position: 1 }],
        color: "#059669"
    },
    {
        id: 7,
        name: "Aaron Veale",
        teams: {
            "2020/21": 2,
            "2021/22": 154352,
            "2022/23": 2,
            "2023/24": 140440,
        },
        notablePlacements: [{ season: "2021/22", position: 12 }],
        color: "#06b6d4"
    },
    {
        id: 8,
        name: "Sebastian Waters",
        teams: {
            "2020/21": 9,
            "2021/22": 206495,
            "2022/23": 9,
            "2023/24": 142413,
        },
        notablePlacements: [],
        color: "#a855f7",
    },
    {
        id: 9,
        name: "Alexander Greenhalgh",
        teams: {
            "2020/21": 7,
            "2021/22": 205525,
            "2022/23": 7,
            "2023/24": 142602,
        },
        notablePlacements: [],
        color: "#ec4899"
    },
    {
        id: 10,
        name: "Sam Senior",
        teams: {
            "2020/21": 10,
            "2021/22": 207042,
            "2022/23": 10,
            "2023/24": 147306,
        },
        notablePlacements: [
            { season: "2020/21", position: 12 },
            { season: "2022/23", position: 12 },
        ],
        color: "#f43f5e"
    },
    {
        id: 11,
        name: "Ben Malpass",
        teams: {
            "2020/21": 8,
            "2021/22": 206241,
            "2022/23": 8,
            "2023/24": 150040,
        },
        notablePlacements: [],
        color: "#0f766e"
    },
    {
        id: 12,
        name: "Luke Trevett",
        teams: {
            "2020/21": 11,
            "2021/22": 208287,
            "2022/23": 11,
            "2023/24": 169965,
        },
        notablePlacements: [],
        color: "#404040"
    },
];

export const Manager = {
    bySeason: SEASONS.reduce<Partial<Record<Season, Record<number, Manager>>>>(
        (acc, season) => ({
            ...acc,
            [season]: MANAGERS.reduce(
                (acc, manager) => ({
                    ...acc,
                    [manager.teams[season]]: manager,
                }),
                {}
            ),
        }),
        {}
    ),
    byId: indexBy(MANAGERS, (manager) => manager.id),
};

export interface Match {
    season: Season;
    gameWeek: number;
    status: "scheduled" | "live" | "finished";
    teamOne: {
        id: number;
        name: string;
        manager: Manager;
        points: number;
    };
    teamTwo: {
        id: number;
        name: string;
        manager: Manager;
        points: number;
    };
}
export const Match = {
    from: ({
        fplMatch,
        season,
        teams,
    }: {
        fplMatch: FplMatch;
        season: Season;
        teams: Map<number, Entry>;
    }): Match | undefined => {
        const {
            event,
            finished,
            started,
            league_entry_1: oneId,
            league_entry_1_points: onePoints,
            league_entry_2: twoId,
            league_entry_2_points: twoPoints,
        } = fplMatch;
        const managers = Manager.bySeason[season];
        const managerOne = managers?.[oneId];
        const managerTwo = managers?.[twoId];
        const teamNameOne = teams.get(oneId)?.name;
        const teamNameTwo = teams.get(twoId)?.name;
        if (managerOne && managerTwo && teamNameOne && teamNameTwo) {
            return {
                season,
                gameWeek: event,
                status: finished ? "finished" : started ? "live" : "scheduled",
                teamOne: {
                    id: oneId,
                    name: teamNameOne,
                    manager: managerOne,
                    points: onePoints,
                },
                teamTwo: {
                    id: twoId,
                    name: teamNameTwo,
                    manager: managerTwo,
                    points: twoPoints,
                },
            };
        } else {
            return undefined;
        }
    },
    sort: (a: Match, b: Match): number =>
        Season.sort(a.season, b.season) || a.gameWeek - b.gameWeek,
    getResult: (match: Match) => {
        if (Match.isFinished(match)) {
            const { teamOne, teamTwo } = match;
            if (teamOne.points === teamTwo.points) {
                return "draw";
            } else if (teamOne.points > teamTwo.points) {
                return { winner: teamOne, loser: teamTwo };
            } else {
                return { winner: teamTwo, loser: teamOne };
            }
        } else {
            return undefined;
        }
    },
    getWinner: (match: Match) => {
        const result = Match.getResult(match);
        return result === undefined || result === "draw"
            ? undefined
            : result.winner;
    },
    getLoser: (match: Match) => {
        const result = Match.getResult(match);
        return result === undefined || result === "draw"
            ? undefined
            : result.loser;
    },
    isWinner: (match: Match, teamId: number): boolean =>
        Match.getWinner(match)?.id === teamId,
    isLoser: (match: Match, teamId: number): boolean =>
        Match.getLoser(match)?.id === teamId,
    isDraw: (match: Match): boolean => Match.getResult(match) === "draw",
    resultForTeam: (
        match: Match,
        teamId: number
    ): "win" | "draw" | "loss" | undefined =>
        Match.isDraw(match)
            ? "draw"
            : Match.isWinner(match, teamId)
            ? "win"
            : Match.isLoser(match, teamId)
            ? "loss"
            : undefined,
    getTeam: (match: Match, teamId: number) =>
        Match.getAlignment(match, teamId)?.team,
    getOpposition: (match: Match, teamId: number) =>
        Match.getAlignment(match, teamId)?.opposition,
    getAlignment: ({ teamOne, teamTwo }: Match, teamId: number) =>
        teamOne.id === teamId
            ? { team: teamOne, opposition: teamTwo }
            : teamTwo.id === teamId
            ? { team: teamTwo, opposition: teamOne }
            : undefined,
    isFinished: ({ status }: Match) => status === "finished",
    getMaxPoints: ({ teamOne, teamTwo }: Match) =>
        Math.max(teamOne.points, teamTwo.points),
    getMinPoints: ({ teamOne, teamTwo }: Match) =>
        Math.min(teamOne.points, teamTwo.points),
    getWinningRatio: ({ teamOne, teamTwo }: Match) =>
        Math.max(
            teamOne.points / teamTwo.points,
            teamTwo.points / teamOne.points
        ),
};

export const SEASON_NOTES: Partial<
    Record<
        Season,
        {
            general: string;
            gameweeks: Record<number, { description: string; url?: string }>;
        }
    >
> = {
    "2020/21": {
        general:
            "The data for the 2020/21 season was manually reconstructed. It could contain mistakes/inaccuracies.",
        gameweeks: {
            11: {
                description:
                    "No results could be found. The scores are best guesses based on the known fixtures and standings before gameweek 11 and after gameweek 12.",
            },
            12: {
                description:
                    "No results could be found. The scores are best guesses based on the known fixtures and standings before gameweek 11 and after gameweek 12.",
            },
        },
    },
    "2022/23": {
        general:
            "The data for the 2022/23 season was manually reconstructed. It could contain mistakes/inaccuracies.",
        gameweeks: {
            7: {
                description:
                    "The Premier League postponed games as a mark of respect to Queen Elizabeth II so all teams scored 0 points",
                url: "https://twitter.com/OfficialFPL/status/1568210457286086661",
            },
        },
    },
};

export interface Entry {
    id: number;
    name: string;
    manager: Manager;
}

export interface LeagueDetails {
    league: {
        id: number;
        name: string;
        transactionMode: string;
        season: Season;
    };
    entries: Entry[];
    matches: Match[];
}
export const LeagueDetails = {
    build: (
        {
            league: { id, name, transaction_mode },
            league_entries,
            matches: fplMatches,
        }: FplLeagueDetails,
        season: Season
    ): LeagueDetails => {
        const managers = Manager.bySeason[season];
        const entries = league_entries
            .map((le) => {
                const manager = managers?.[le.id];
                if (manager) {
                    return {
                        id: le.id,
                        name: le.entry_name,
                        manager,
                    };
                } else {
                    return undefined;
                }
            })
            .filter((e): e is Entry => e !== undefined);
        const entriesById = indexBy(entries, (e) => e.id);
        const matches = fplMatches
            .map((m) => Match.from({ fplMatch: m, season, teams: entriesById }))
            .filter((m): m is Match => m !== undefined);
        return {
            league: {
                id: id,
                name: name,
                transactionMode: transaction_mode,
                season: season,
            },
            entries,
            matches,
        };
    },
};
