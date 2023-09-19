import { Season, SEASONS, LeagueDetails, leagueDetailsSchema } from "./domain";

export const getLeagueDetails = async (season: Season) => {
    const res = await fetch(`./${season.replaceAll("/", "-")}.json`);
    return leagueDetailsSchema.parse(await res.json());
};

export const getAllLeagueDetails = async (): Promise<
    [Season, LeagueDetails][]
> => {
    return Promise.all(
        SEASONS.map(async (season) => {
            const details = await getLeagueDetails(season);
            return [season, details];
        })
    );
};
