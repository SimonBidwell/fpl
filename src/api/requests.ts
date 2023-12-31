import { leagueDetailsSchema } from "./domain";

export const getLeagueDetails = async (seasonId: string) => {
    const res = await fetch(`${import.meta.env.BASE_URL}/${seasonId}.json`);
    return leagueDetailsSchema.parse(await res.json());
};
