import { bootstrapStaticSchema, leagueDetailsSchema, elementStatusResponseSchema } from "./domain";

export const getLeagueDetails = async (seasonId: string) => {
    const res = await fetch(`${import.meta.env.BASE_URL}/${seasonId}.json`);
    return leagueDetailsSchema.parse(await res.json());
};

export const getBootstrapStatic = async (seasonId: string) => {
    const res = await fetch(`${import.meta.env.BASE_URL}/bootstrap-static-${seasonId}.json`);
    return bootstrapStaticSchema.parse(await res.json());
}

export const getElementStatus = async (seasonId: string) => {
    const res = await fetch(`${import.meta.env.BASE_URL}/element-status-${seasonId}.json`);
    return elementStatusResponseSchema.parse(await res.json())
}