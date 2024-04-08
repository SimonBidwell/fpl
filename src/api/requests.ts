import {
    bootstrapStaticSchema,
    leagueDetailsSchema,
    elementStatusResponseSchema,
    choicesResponseSchema,
    transactionsResponseSchema,
} from "./domain";

export const getLeagueDetails = async (seasonId: string) => {
    const res = await fetch(`${import.meta.env.BASE_URL}/${seasonId}.json`);
    return leagueDetailsSchema.parse(await res.json());
};

export const getBootstrapStatic = async (seasonId: string) => {
    const res = await fetch(
        `${import.meta.env.BASE_URL}/bootstrap-static-${seasonId}.json`
    );
    return bootstrapStaticSchema.parse(await res.json());
};

export const getElementStatus = async (seasonId: string) => {
    const res = await fetch(
        `${import.meta.env.BASE_URL}/element-status-${seasonId}.json`
    );
    return elementStatusResponseSchema.parse(await res.json());
};

export const getDraftChoices = async (seasonId: string) => {
    const res = await fetch(
        `${import.meta.env.BASE_URL}/draft-choices-${seasonId}.json`
    );
    if (res.ok) {
        return choicesResponseSchema.parse(await res.json());
    } else {
        return undefined;
    }
};

export const getTransactions = async (seasonId: string) => {
    const res = await fetch(
        `${import.meta.env.BASE_URL}/transactions-${seasonId}.json`
    );
    if (res.ok) {
        return transactionsResponseSchema.parse(await res.json());
    } else {
        return undefined;
    }
};
