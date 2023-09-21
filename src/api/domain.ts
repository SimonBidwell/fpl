import { z } from "zod";

export const SEASONS = ["2020/21", "2021/22", "2022/23", "2023/24"] as const;
export type Season = (typeof SEASONS)[number];
export const Season = {
    isSeason: (s: unknown): s is Season  => SEASONS.includes(s as Season),
    sort: (a: Season, b: Season) => a.localeCompare(b),
};

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
    waiver_pick: z.number().nullable(),
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
