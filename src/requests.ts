import { SEASONS, Season, LeagueDetails } from "./domain";
import { getLeagueDetails as getFplLeagueDetails } from "./api/requests";

export const getLeagueDetails = async (
    season: Season
): Promise<LeagueDetails> => {
    const details = await getFplLeagueDetails(season);
    return LeagueDetails.build(details, season);
};