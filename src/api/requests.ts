import { LeagueDetails, leagueDetailsSchema } from "./domain";

export const getLeagueDetails = async (seasonId: string) => {
    const res = await fetch(`/${seasonId}.json`);
    return leagueDetailsSchema.parse(await res.json());
};