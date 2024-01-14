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
    ElementStatusResponse,
} from "../api/domain";
import { getBootstrapStatic, getElementStatus } from "../api/requests";

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

const isSeason = (s: unknown): s is Season => SEASONS.includes(s as Season);

export const League = () => {
    const requests = useQueries([
        { queryKey: ["leagueDetails"], queryFn: getAllLeagueDetails },
        { queryKey: ["bootstrap"], queryFn: getAllBootstraps },
        { queryKey: ["element-status"], queryFn: getAllPlayerStatuses },
    ]);

    const isLoading = requests.some((request) => request.isLoading);
    const isError = requests.some((request) => request.isError);
    const leagueDetails = requests[0].data
    const bootstrap = requests[1].data
    const playerStatus = requests[2].data

    if (isLoading) return "Loading...";
    if (
        isError ||
        leagueDetails === undefined ||
        bootstrap === undefined ||
        playerStatus === undefined
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
