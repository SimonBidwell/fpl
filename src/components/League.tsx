import { useQueries } from "react-query";
import { Route, Redirect, Switch } from "wouter";
import { SeasonComponent, DEFAULT_TAB } from "./Season";
import { DEFAULT_SEASON, LeagueDetails, SEASONS, Season } from "../domain";
import { ManagerPage } from "./ManagerPage";
import { SeasonContextProvider } from "../SeasonContext";
import { getLeagueDetails } from "../requests";
import { indexBy } from "../helpers";
import {
    BootstrapStatic,
    ChoicesResponse,
    ElementStatusResponse,
    TransactionResponse,
} from "../api/domain";
import {
    getBootstrapStatic,
    getDraftChoices,
    getElementStatus,
    getTransactions,
} from "../api/requests";

const getAllLeagueDetails = async (): Promise<Map<Season, LeagueDetails>> => {
    const seasons = await Promise.all(SEASONS.map(getLeagueDetails));
    return indexBy(seasons, (s) => s.league.season);
};

const getAllBootstraps = async (): Promise<Map<Season, BootstrapStatic>> => {
    const seasons = await Promise.all(
        SEASONS.map((s) => getBootstrapStatic(s).then((bs) => [s, bs] as const))
    );
    return seasons.reduce((acc, [season, bs]) => {
        acc.set(season, bs);
        return acc;
    }, new Map());
};

const getAllPlayerStatuses = async (): Promise<
    Map<Season, ElementStatusResponse>
> => {
    const seasons = await Promise.all(
        SEASONS.map((s) => getElementStatus(s).then((bs) => [s, bs] as const))
    );
    return seasons.reduce((acc, [season, bs]) => {
        acc.set(season, bs);
        return acc;
    }, new Map());
};

const getAllDraftChoices = async (): Promise<Map<Season, ChoicesResponse | undefined>> => {
    const seasons = await Promise.all(
        SEASONS.map((s) =>
            getDraftChoices(s).then((dc) => [s, dc] as const)
        )
    );
    return seasons.reduce((acc, [season, bs]) => {
        acc.set(season, bs);
        return acc;
    }, new Map());
};

const getAllTransactions = async (): Promise<Map<Season, TransactionResponse | undefined>> => {
    const seasons = await Promise.all(
        SEASONS.map((s) =>
            getTransactions(s).then((t) => [s, t] as const)
        )
    );
    return seasons.reduce((acc, [season, t]) => {
        acc.set(season, t);
        return acc;
    }, new Map());
};

const isSeason = (s: unknown): s is Season => SEASONS.includes(s as Season);

export const League = () => {
    const requests = useQueries([
        { queryKey: ["leagueDetails"], queryFn: getAllLeagueDetails },
        { queryKey: ["bootstrap"], queryFn: getAllBootstraps },
        { queryKey: ["element-status"], queryFn: getAllPlayerStatuses },
        { queryKey: ["draft-choices"], queryFn: getAllDraftChoices },
        { queryKey: ["transactions"], queryFn: getAllTransactions }
    ]);

    const isLoading = requests.some((request) => request.isLoading);
    const isError = requests.some((request) => request.isError);
    const leagueDetails = requests[0].data;
    const bootstrap = requests[1].data;
    const playerStatus = requests[2].data;
    const draftChoices = requests[3].data;
    const transactions = requests[4].data;

    if (isLoading) return "Loading...";
    if (
        isError ||
        leagueDetails === undefined ||
        bootstrap === undefined ||
        playerStatus === undefined ||
        draftChoices === undefined || 
        transactions === undefined
    ) {
        return "Error";
    }

    return (
        <Switch>
            <Route path="/season/:season/:tab" nest>
                {(params) =>
                    !isSeason(params.season) ? (
                        <Redirect to={`~/404`} />
                    ) : (
                        <SeasonContextProvider
                            leagueDetails={leagueDetails.get(params.season)}
                            bootstrap={bootstrap.get(params.season)}
                            playerStatus={playerStatus.get(params.season)}
                            draft={draftChoices.get(params.season)}
                            transactions={transactions.get(params.season)}
                        >
                            <SeasonComponent />
                        </SeasonContextProvider>
                    )
                }
            </Route>
            <Route path="/manager/:id">
                <ManagerPage leagueDetails={[...leagueDetails.values()]} />
            </Route>
            <Route>
                <Redirect
                    to={`/season/${DEFAULT_SEASON}/${DEFAULT_TAB}`}
                    replace
                />
            </Route>
        </Switch>
    );
};
