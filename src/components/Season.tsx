import { Redirect, Route, useParams } from "wouter";
import { Match, Season } from "../domain";
import { partition } from "../helpers";
import { useSeasonContext } from "../SeasonContext";
import { useReplaceNavigate } from "../useReplaceNavigate";
import { DraftBoard } from "./DraftBoard";
import { Fixtures } from "./Fixtures";
import { PlayersTable } from "./playerstable/PlayersTable";
import { Results } from "./Results";
import { Standings } from "./standings/Standings";
import { WithDefaultGameWeek } from "./WithDefaultGameWeek";
import { SeasonHeader, isSeasonTab } from "./SeasonHeader";

export { DEFAULT_TAB } from "./SeasonHeader";

//TODO give this a better name
export const SeasonComponent = () => {
  const { season, tab } = useParams();
  const navigate = useReplaceNavigate();
  const { leagueDetails, draft, transactions, nextEvent } = useSeasonContext();

  if (!isSeasonTab(tab) || !Season.isSeason(season) || leagueDetails == undefined) {
    return <Redirect to={`~/404`} />;
  }

  const { matches } = leagueDetails;

  const [results, fixtures] = partition(matches, Match.isFinished);
  const defaultResultsGameweek =
    results.length == 0 ? 1 : results[results.length - 1].gameWeek;
  return (
    <>
      <SeasonHeader
        season={season}
        tab={tab}
        matches={matches}
        draft={draft}
        nextEvent={nextEvent}
        onSeasonChange={selected => navigate(season, selected)}
        onTabChange={selected => navigate(tab, selected)}
      />
      <Route path={"/:gameWeek?"}>
        {tab === "standings" ? (
          <WithDefaultGameWeek
            defaultGameWeek={defaultResultsGameweek}
            isValidGameWeek={(gameWeek, defaultGameWeek) =>
              gameWeek > 0 && gameWeek <= defaultGameWeek
            }
          >
            <Standings
              key={`standings-${season}`}
              leagueDetails={leagueDetails}
              transactions={
                transactions === "Unknown" ? undefined : transactions
              }
            />
          </WithDefaultGameWeek>
        ) : null}
        {tab === "results" && results.length > 0 ? (
          <WithDefaultGameWeek
            defaultGameWeek={defaultResultsGameweek}
            isValidGameWeek={(gameWeek, defaultGameWeek) =>
              gameWeek > 0 && gameWeek <= defaultGameWeek
            }
          >
            <Results key={`results-${season}`} matches={results.reverse()} />
          </WithDefaultGameWeek>
        ) : null}
        {tab === "fixtures" && fixtures.length > 0 ? (
          <WithDefaultGameWeek
            defaultGameWeek={fixtures[0].gameWeek}
            isValidGameWeek={(gameWeek, defaultGameWeek) =>
              gameWeek >= defaultGameWeek &&
              gameWeek <= fixtures[fixtures.length - 1].gameWeek
            }
          >
            <Fixtures key={`fixtures-${season}`} matches={fixtures} />
          </WithDefaultGameWeek>
        ) : null}
        {tab === "players" ? <PlayersTable /> : null}
        {/* //TODO the redirect here isn't working as expected */}
        {tab === "draft" ? (
          draft === "Unknown" ? (
            <Redirect
              to={`~/fpl/league/1/season/${season}/standings`}
              replace
            />
          ) : (
            <DraftBoard />
          )
        ) : null}
      </Route>
    </>
  );
};
