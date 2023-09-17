import { number, z } from "zod";

export const leagueSchema = z.object({
    id: z.number(),
    name: z.string(),
    transaction_mode: z.string()
})
export type League = z.infer<typeof leagueSchema>;

export const entrySchema = z.object({
    entry_name: z.string(),
    id: z.number(),
    player_first_name: z.string(),
    player_last_name: z.string(),
    short_name: z.string(),
    waiver_pick: z.number()
})
export type Entry = z.infer<typeof entrySchema>;

export const matchSchema = z.object({
    event: z.number(),
    finished: z.boolean(),
    league_entry_1: z.number(),
    league_entry_1_points: z.number(),
    league_entry_2: z.number(),
    league_entry_2_points: z.number(),
    started: z.boolean()
})
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
    total: z.number()
})
export type Standing = z.infer<typeof standingSchema>;

export const leagueDetailsSchema = z.object({
    league: leagueSchema,
    league_entries: z.array(entrySchema),
    "matches": z.array(matchSchema),
    "standings": z.array(standingSchema)
})
export type LeagueDetails = z.infer<typeof leagueDetailsSchema>;
export const LeagueDetails = {
    getEntries: (leagueDetails: LeagueDetails): Map<number, Entry> => leagueDetails.league_entries.reduce((acc, entry) => {
        acc.set(entry.id, entry)
        return acc
    }, new Map())
}

export const getLeagueDetails = async () => {
    const res = await fetch("./2023-24.json");
    return leagueDetailsSchema.parse(await res.json())
}

export interface User {
    id: number
    name: string
    record: SeasonRecord[]
    fairPoints: number
    fairPointsRank: number
}

export interface SeasonRecord {
    season: string
    position: number
}

export const userMap: Record<number, User> = {
    115199: {
        id: 1,
        name: "Ed Brett",
        record: [],
        fairPoints: 7.727,
        fairPointsRank: 2
    },
    115222: {
        id: 2,
        name: "Alex Harrison",
        record: [{season: "2021/22", position: 1}],
        fairPoints: 3.364,
        fairPointsRank: 10
    },
    116308: {
        id: 3,
        name: "Ollie Craig",
        record: [],
        fairPoints: 6.091,
        fairPointsRank: 6
    },
    118328: {
        id: 4,
        name: "Charlie Schofield",
        record: [{season: "2022/23", position: 1}],
        fairPoints: 2.455,
        fairPointsRank: 12
    },
    123888: {
        id: 5,
        name: "Simon Bidwell",
        record: [{season: "2019/20", position: 1}],
        fairPoints: 7.455,
        fairPointsRank: 3
    },
    139985: {
        id: 6,
        name: "Anjit Aulakh",
        record: [{season: "2020/21", position: 1}],
        fairPoints: 5.818,
        fairPointsRank: 8
    },
    140440: {
        id: 7,
        name: "Aaron Veale",
        record: [{season: "2021/22", position: 12}],
        fairPoints: 5.273,
        fairPointsRank: 9
    },
    142413: {
        id: 8,
        name: "Sebastian Waters",
        record: [],
        fairPoints: 7.091,
        fairPointsRank: 5
    },
    142602: {
        id: 9,
        name: "Alexander Greenhalgh",
        record: [],
        fairPoints: 6.00,
        fairPointsRank: 7
    },
    147306: {
        id: 10,
        name: "Sam Senior",
        record: [{season: "2020/21", position: 12}, {season: "2022/23", position: 12}],
        fairPoints: 3.364,
        fairPointsRank: 11
    },
    150040: {
        id: 11,
        name: "Ben Malpass",
        record: [],
        fairPoints: 7.455,
        fairPointsRank: 4
    },
    169965: {
        id: 12,
        name: "Luke Trevett",
        record: [],
        fairPoints: 9.455,
        fairPointsRank: 1
    }

}