import { useQuery } from "react-query";
import { getAllLeagueDetails } from "../requests";
import {
    Route,
    Redirect,
    Switch,
} from "wouter";
import { SeasonComponent, DEFAULT_TAB } from "./Season";
import { DEFAULT_SEASON } from "../domain";
import { ManagerPage } from "./ManagerPage";

export const League = () => {
    const { isLoading, error, data } = useQuery("leagueDetails", () =>
        getAllLeagueDetails()
    );

    if (isLoading) return "Loading...";
    if (error || data === undefined) {
        return "Error";
    }

    return (
        <Switch>
            <Route path="/season/:season/:tab" nest>
                <SeasonComponent allLeagueDetails={data} />
            </Route>
            <Route path="/manager/:id">
                <ManagerPage leagueDetails={data}/>
            </Route>
            <Route><Redirect to={`/season/${DEFAULT_SEASON}/${DEFAULT_TAB}`} replace/></Route>
        </Switch>
    );
};
