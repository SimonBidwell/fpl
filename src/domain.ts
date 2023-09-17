import { z } from "zod";

export const leagueSchema = z.object({
    id: z.number(),
    name: z.string(),
    transaction_mode: z.string(),
});
export type League = z.infer<typeof leagueSchema>;

export const entrySchema = z.object({
    entry_name: z.string(),
    id: z.number(),
    player_first_name: z.string(),
    player_last_name: z.string(),
    short_name: z.string(),
    waiver_pick: z.number(),
});
export type Entry = z.infer<typeof entrySchema>;

export const matchSchema = z.object({
    event: z.number(),
    finished: z.boolean(),
    league_entry_1: z.number(),
    league_entry_1_points: z.number(),
    league_entry_2: z.number(),
    league_entry_2_points: z.number(),
    started: z.boolean(),
});
export type Match = z.infer<typeof matchSchema>;

export const standingSchema = z.object({
    last_rank: z.number(),
    league_entry: z.number(),
    matches_drawn: z.number(),
    matches_lost: z.number(),
    matches_played: z.number(),
    matches_won: z.number(),
    points_against: z.number(),
    points_for: z.number(),
    rank: z.number(),
    total: z.number(),
});
export type Standing = z.infer<typeof standingSchema>;

export const leagueDetailsSchema = z.object({
    league: leagueSchema,
    league_entries: z.array(entrySchema),
    matches: z.array(matchSchema),
    standings: z.array(standingSchema),
});
export type LeagueDetails = z.infer<typeof leagueDetailsSchema>;
export const LeagueDetails = {
    getEntries: (leagueDetails: LeagueDetails): Map<number, Entry> =>
        leagueDetails.league_entries.reduce((acc, entry) => {
            acc.set(entry.id, entry);
            return acc;
        }, new Map()),
};

export const getLeagueDetails = async () => {
    const res = await fetch("./2023-24.json");
    return leagueDetailsSchema.parse(await res.json());
};

export interface User {
    id: number;
    name: string;
    //TODO rename to accolade/achievement/something
    record: SeasonRecord[]
}

export interface SeasonRecord {
    season: string;
    position: number;
}

export const userMap: Record<number, User> = {
    115199: {
        id: 1,
        name: "Ed Brett",
        record: []
    },
    115222: {
        id: 2,
        name: "Alex Harrison",
        record: [{ season: "2021/22", position: 1 }],
    },
    116308: {
        id: 3,
        name: "Ollie Craig",
        record: [],
    },
    118328: {
        id: 4,
        name: "Charlie Schofield",
        record: [{ season: "2022/23", position: 1 }],
    },
    123888: {
        id: 5,
        name: "Simon Bidwell",
        record: [{ season: "2019/20", position: 1 }],
    },
    139985: {
        id: 6,
        name: "Anjit Aulakh",
        record: [{ season: "2020/21", position: 1 }],
    },
    140440: {
        id: 7,
        name: "Aaron Veale",
        record: [{ season: "2021/22", position: 12 }],
    },
    142413: {
        id: 8,
        name: "Sebastian Waters",
        record: [],
    },
    142602: {
        id: 9,
        name: "Alexander Greenhalgh",
        record: [],
    },
    147306: {
        id: 10,
        name: "Sam Senior",
        record: [
            { season: "2020/21", position: 12 },
            { season: "2022/23", position: 12 },
        ],
    },
    150040: {
        id: 11,
        name: "Ben Malpass",
        record: [],
    },
    169965: {
        id: 12,
        name: "Luke Trevett",
        record: [],
    },
};

export const calculateExpectedPointsForGameWeek = (
    matches: Match[],
    gameWeek: number,
    allPossibleMatches: [number, number][],
    teamIds: number[]
): Map<number, number> => {
    const gameWeekScores = matches
        .filter((match) => match.event === gameWeek)
        .reduce((acc, match) => {
            acc.set(match.league_entry_1, match.league_entry_1_points);
            acc.set(match.league_entry_2, match.league_entry_2_points);
            return acc;
        }, new Map());
    const pointsForWeek = allPossibleMatches.reduce(
        (acc, [teamA, teamB]) => {
            const teamATotal = acc.get(teamA) ?? 0;
            const teamBTotal = acc.get(teamB) ?? 0;
            const teamAPoints = gameWeekScores.get(teamA) ?? 0;
            const teamBPoints = gameWeekScores.get(teamB) ?? 0;
            if (teamAPoints > teamBPoints) {
                acc.set(teamA, teamATotal + 3);
            } else if (teamBPoints > teamAPoints) {
                acc.set(teamB, teamBTotal + 3)
            } else {
                acc.set(teamA, teamATotal + 1)
                acc.set(teamB, teamBTotal + 1)
            }
            return acc;
        },
        new Map()
    )
    return teamIds.reduce(
        (acc, teamId) => {
            const expectedPoints = (pointsForWeek.get(teamId) ?? 0) / (teamIds.length - 1)
            acc.set(teamId, expectedPoints)
            return acc;
        },
        new Map()
    )
};

const getAllUniquePairs = (ids: number[]): [number, number][] => {
    const allPossibleMatches: [number, number][] = [];
    for (let i = 0; i < ids.length; i++) {
        const team = ids[i];
        for (let j = i + 1; j < ids.length; j++) {
            const opponent = ids[j]
            const game = [team, opponent] as [number, number]
            allPossibleMatches.push(game)
        }
    }
    return allPossibleMatches
}

export const calculateExpectedPoints = (
    teamIds: number[],
    matches: Match[],
): Map<number, number> => {
    const allPossibleMatches = getAllUniquePairs(teamIds);
    const finishedMatches = matches.filter(m => m.finished);
    const lastCompletedGameWeek = Math.max(...finishedMatches.map(m => m.event))
    const matchesByGameWeek = finishedMatches.reduce(
        (acc, match) => {
            const { event } = match;
            const matches = acc.get(event) ?? []; 
            acc.set(event, [...matches, match])
            return acc
        }, 
        new Map()
    );
    return [...Array(lastCompletedGameWeek).keys()].map(idx => {
        const gameWeek = idx + 1;
        const matches = matchesByGameWeek.get(gameWeek) ?? []
        return calculateExpectedPointsForGameWeek(
            matches,
            gameWeek,
            allPossibleMatches,
            teamIds
        )
    }).reduce(
        (acc, gameWeekExpectedPoints) => {
            for (const [teamId, points] of gameWeekExpectedPoints) {
                const currentPoints = acc.get(teamId) ?? 0
                acc.set(teamId, currentPoints + points)
            }
            return acc
        },
        new Map()
    )
}

const calculateExpectedPointsRank = (expectedPoints: Map<number, number>): Map<number, number> => 
    new Map([...expectedPoints.entries()]
        .sort(([,aPoints], [,bPoints]) => bPoints - aPoints)
        .map(([teamId,], idx) => [teamId, idx + 1]))

export interface TableRow {
    id: number;
    rank: number; //TODO rename to position
    previousRank: number;
    team: string;
    manager: User;
    wins: number;
    draws: number;
    losses: number;
    scoreFor: number;
    scoreAgainst: number;
    points: number;
    expectedPoints: number;
    expectedRank: number;
    matches: Match[] //TODO use my own domain object
}
export const buildTableRow = (
    id: number,
    manager: User,
    standing: Standing,
    matches: Match[],
    entry: Entry,
    expectedPoints: number,
    expectedRank: number
): TableRow => ({
    id: id,
    rank: standing.rank,
    previousRank: standing.last_rank,
    team: entry.entry_name,
    manager: manager,
    wins: standing.matches_won,
    draws: standing.matches_drawn,
    losses: standing.matches_lost,
    scoreFor: standing.points_for,
    scoreAgainst: standing.points_against,
    points: standing.total,
    expectedPoints: expectedPoints,
    expectedRank: expectedRank,
    matches: matches
});

export const buildTable = ({
    league_entries,
    standings,
    matches
}: LeagueDetails): TableRow[] => {
    const teams: Map<number, Entry> = league_entries.reduce((acc, entry) => {
        acc.set(entry.id, entry);
        return acc;
    }, new Map());
    const teamIds = new Array(...teams.keys());

    const standingsByTeamId: Map<number, Standing> = standings.reduce(
        (acc, standing) => {
            acc.set(standing.league_entry, standing);
            return acc;
        },
        new Map()
    );

    const expectedPointsByTeamId = calculateExpectedPoints(
        teamIds,
        matches
    )
    const expectedPointsRankByTeamId = calculateExpectedPointsRank(expectedPointsByTeamId)

    const matchesByTeam = matches.filter(m => m.finished).reduce((acc, match) => {
        const teamA = match.league_entry_1;
        const teamB = match.league_entry_2;
        const teamAMatches = acc.get(teamA) ?? []
        const teamBMatches = acc.get(teamB) ?? []
        acc.set(teamA, [...teamAMatches, match])
        acc.set(teamB, [...teamBMatches, match])       
        return acc
    }, new Map<number, Match[]>())

    return league_entries.reduce<TableRow[]>((acc, entry) => {
        const { id } = entry;
        const manager = userMap[id];
        const standing = standingsByTeamId.get(id);
        const expectedPoints = expectedPointsByTeamId.get(id) ?? 0
        const expectedPointsRank = expectedPointsRankByTeamId.get(id) ?? 0
        const matches = matchesByTeam.get(id) ?? []
        if (manager && standing) {
            acc.push(buildTableRow(id, manager, standing, matches, entry, expectedPoints, expectedPointsRank));
        }
        return acc;
    }, []);
};

export const getTable = async () => {
    const leagueDetails = await getLeagueDetails();
    return buildTable(leagueDetails);
};
