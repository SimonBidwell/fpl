import { z } from "zod";

export const leagueSchema = z.object({
    id: z.number(),
    name: z.string(),
    transaction_mode: z.string(),
});
export type League = z.infer<typeof leagueSchema>;

export const entrySchema = z.object({
    entry_name: z.string(),
    entry_id: z.number(),
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

export const elementSchema = z.object({
    "id": z.number(),
    "assists": z.number(),
    "bonus": z.number(),
    "bps": z.number(),
    "clean_sheets": z.number(),
    "creativity": z.union([z.string(), z.number()]).transform((x) => Number(x)),
    "goals_conceded": z.number(),
    "goals_scored": z.number(),
    "ict_index": z.union([z.string(), z.number()]).transform((x) => Number(x)),
    "influence": z.union([z.string(), z.number()]).transform((x) => Number(x)),
    "minutes": z.number(),
    "own_goals": z.number(),
    "penalties_missed": z.number(),
    "penalties_saved": z.number(),
    "red_cards": z.number(),
    "saves": z.number(),
    "threat": z.union([z.string(), z.number()]).transform((x) => Number(x)),
    "yellow_cards": z.number(),
    "starts": z.number().optional(),
    "expected_goals": z.union([z.string(), z.number(), z.undefined()]).transform((x) => x === undefined ? undefined : Number(x)),
    "expected_assists": z.union([z.string(), z.number(), z.undefined()]).transform((x) => x === undefined ? undefined : Number(x)),
    "expected_goal_involvements": z.union([z.string(), z.number(), z.undefined()]).transform((x) => x === undefined ? undefined : Number(x)),
    "expected_goals_conceded": z.union([z.string(), z.number(), z.undefined()]).transform((x) => x === undefined ? undefined : Number(x)),
    "added": z.string().optional(),
    "chance_of_playing_next_round": z.union([z.string(), z.number(), z.null()]).transform((x) => x === null || x === "None" ? undefined : Number(x)),
    "chance_of_playing_this_round": z.union([z.string(), z.number(), z.null()]).transform((x) => x === null || x === "None" ? undefined : Number(x)),
    "code": z.number(),
    "draft_rank": z.number().optional(),
    "dreamteam_count": z.number(), 
    "ep_next": z.union([z.string(), z.number(), z.null()]).transform((x) => x === null ? null : Number(x)), 
    "ep_this": z.union([z.string(), z.number(), z.null()]).transform((x) => x === null ? null : Number(x)), 
    "event_points": z.number(),
    "first_name": z.string(),
    "form": z.union([z.string(), z.number()]).transform((x) => Number(x)),
    "in_dreamteam": z.boolean(),
    "news": z.string(),
    "news_added": z.string().nullable(),
    "news_return": z.string().nullable().optional(), 
    "news_updated": z.string().nullable().optional(),
    "points_per_game": z.union([z.string(), z.number()]).transform((x) => Number(x)),
    "second_name": z.string(),
    "squad_number": z.union([z.string(), z.number(), z.null()]).transform((x) => x === "None" || x === null ? undefined : Number(x)), //TODO this can be "None"
    "status": z.string(),
    "total_points": z.number(),
    "web_name": z.string(),
    "influence_rank": z.number(),
    "influence_rank_type": z.number(), //influence rank for position
    "creativity_rank": z.number(),
    "creativity_rank_type": z.number(),
    "threat_rank": z.number(),
    "threat_rank_type": z.number(),
    "ict_index_rank": z.number(),
    "ict_index_rank_type": z.number(),
    "form_rank": z.number().nullable().optional(),
    "form_rank_type": z.number().nullable().optional(),
    "points_per_game_rank": z.number().nullable().optional(),
    "points_per_game_rank_type": z.union([z.string(), z.number(), z.undefined(), z.null()]).transform((x) => x === undefined || x === null ? undefined : Number(x)),
    "corners_and_indirect_freekicks_order": z.union([z.string(), z.number(), z.null()]).transform((x) => x === null ? null : Number(x)),
    "corners_and_indirect_freekicks_text": z.string().nullable(),
    "direct_freekicks_order": z.union([z.string(), z.number(), z.null()]).transform((x) => x === null ? null : Number(x)),
    "direct_freekicks_text": z.string().nullable(), 
    "penalties_order": z.union([z.string(), z.number(), z.null()]).transform((x) => x === null ? null : Number(x)), //always null
    "penalties_text": z.string().nullable(), 
    "element_type": z.number(),
    "team": z.number(),
})
export type Element = z.infer<typeof elementSchema>

export const elementTypeSchema = z.object({
    "id": z.number(),
    "element_count": z.number(),
    "singular_name": z.string(),
    "singular_name_short": z.string(),
    "plural_name": z.string(),
    "plural_name_short": z.string()
})
export type ElementType = z.infer<typeof elementTypeSchema>

export const elementStatSchema = z.object({
    "name": z.string(),
    "label": z.string(),
    "abbreviation": z.string(),
    "is_match_stat": z.boolean(),
    "match_stat_order": z.number().nullable(),
    "sort": z.string()
})
export type ElementStat = z.infer<typeof elementStatSchema>

export const eventSchema = z.object({
    "average_entry_score": z.number().nullable(),
    "deadline_time": z.string(),
    "id": z.number(),
    "name": z.string(),
    "finished": z.boolean(),
    "highest_scoring_entry": z.number().nullable(),
    "trades_time": z.string(),
    "waivers_time": z.string()
})
export type Event = z.infer<typeof eventSchema>

export const fixtureSchema = z.object({
    "id": z.number(),
    "started": z.boolean(),
    "code": z.number(),
    "finished": z.boolean(),
    "finished_provisional": z.boolean(),
    "kickoff_time": z.string(),
    "minutes": z.number(),
    "provisional_start_time": z.boolean(),
    "team_a_score": z.number().nullable(),
    "team_h_score": z.number().nullable(),
    "pulse_id": z.number(),
    "event": z.number(),
    "team_a": z.number(),
    "team_h": z.number()
})
export type Fixture = z.infer<typeof fixtureSchema>

export const settingsSchema = z.object({
    "league": z.object({
        "default_entries": z.number(),
        "draft_reminder_hours": z.array(z.number()),
        "draft_postpone_hours": z.number(),
        "draft_pushback_times": z.number(),
        "h2h_draw": z.number(),
        "h2h_lose": z.number(),
        "h2h_win": z.number(),
        "max_entries": z.number(),
        "min_entries": z.number(),
        "private_max": z.number(),
        "public_draft_delay_minutes": z.number(),
        "public_draft_tz_default": z.string(),
        "public_entry_sizes": z.array(z.number()),
        "public_max": z.number()
    }),
    "scoring": z.object({
        "long_play_limit": z.number(),
        "short_play": z.number(),
        "long_play": z.number(),
        "concede_limit": z.number(),
        "goals_conceded_GKP": z.number(),
        "goals_conceded_DEF": z.number(),
        "goals_conceded_MID": z.number(),
        "goals_conceded_FWD": z.number(),
        "saves_limit": z.number(),
        "saves": z.number(),
        "goals_scored_GKP": z.number(),
        "goals_scored_DEF": z.number(),
        "goals_scored_MID": z.number(),
        "goals_scored_FWD": z.number(),
        "assists": z.number(),
        "clean_sheets_GKP": z.number(),
        "clean_sheets_DEF": z.number(),
        "clean_sheets_MID": z.number(),
        "clean_sheets_FWD": z.number(),
        "penalties_saved": z.number(),
        "penalties_missed": z.number(),
        "yellow_cards": z.number(),
        "red_cards": z.number(),
        "own_goals": z.number(),
        "bonus": z.number(),
    }),
    "squad": z.object({
        "size": z.number(),
        "select_GKP": z.number(),
        "select_DEF": z.number(),
        "select_MID": z.number(),
        "select_FWD": z.number(),
        "play": z.number(),
        "min_play_GKP": z.number(),
        "max_play_GKP": z.number(),
        "min_play_DEF": z.number(),
        "max_play_DEF": z.number(),
        "min_play_MID": z.number(),
        "max_play_MID": z.number(),
        "min_play_FWD": z.number(),
        "max_play_FWD": z.number(),
        "position_type_locks": z.record(z.number(), z.string()),
        "captains_disabled": z.boolean()
    }),
    "transactions": z.object({
        "new_element_locked_hours": z.number(),
        "trade_veto_minimum": z.number(),
        "trade_veto_hours": z.number(),
        "waivers_before_start_min_hours": z.number(),
        "waivers_before_deadline_hours": z.number(),
        "waivers_before_deadline_hours_event": z.object({})
    }),
    "ui": z.object({
        "special_shirt_exclusions": z.array(z.number()),
        "use_special_shirts": z.boolean()
    })
})
export type Settings = z.infer<typeof settingsSchema>

export const teamSchema = z.object({
    "code": z.number(),
    "id": z.number(),
    "name": z.string(),
    "pulse_id": z.number(),
    "short_name": z.string()
})
export type Team = z.infer<typeof teamSchema>

export const bootstrapStaticSchema = z.object({
    "elements": z.array(elementSchema),
    "element_types": z.array(elementTypeSchema),
    "element_stats": z.array(elementStatSchema),
    "events": z.object({
        "current": z.number().nullable(),
        "data": z.array(eventSchema),
        "next": z.number().nullable()
    }),
    "fixtures": z.record(z.string(), z.array(fixtureSchema)),
    // "settings": settingsSchema,
    "teams": z.array(teamSchema)
})
export type BootstrapStatic = z.infer<typeof bootstrapStaticSchema>;

export const elementStatusSchema = z.object({
    "element": z.number(),
    "in_accepted_trade": z.boolean(),
    "owner": z.number().nullable(),
    "status": z.string()
})
export type ElementStatus = z.infer<typeof elementStatusSchema>;

export const elementStatusResponseSchema = z.object({
    "element_status": z.array(elementStatusSchema)
})
export type ElementStatusResponse = z.infer<typeof elementStatusResponseSchema>;

export const choiceSchema = z.object({
    "choice_time": z.string(),
    "element": z.number(),
    "entry": z.number(),
    "entry_name": z.string(),
    "id": z.number(),
    "index": z.number(),
    "league": z.number(),
    "pick": z.number(),
    "player_first_name": z.string(),
    "player_last_name": z.string(),
    "round": z.number(),
    "seconds_to_pick": z.number().nullable(),
    "was_auto": z.boolean()
})
export type Choice = z.infer<typeof choiceSchema>

export const choicesResponseSchema = z.object({
    "choices": z.array(choiceSchema)
})
export type ChoicesResponse = z.infer<typeof choicesResponseSchema>