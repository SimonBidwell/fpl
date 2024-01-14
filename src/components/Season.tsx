import { Standings } from "./standings/Standings";
import { Warning } from "./Warning";
import { LeagueDetails, Match, SEASON_NOTES, SEASONS, Season } from "../domain";
import {
    Dropdown,
    DropdownTrigger,
    Button,
    DropdownMenu,
    DropdownItem,
    Card,
    CardBody,
    Tabs,
    Tab,
} from "@nextui-org/react";
import { Chevron } from "./Chevron";
import { Fixtures } from "./Fixtures";
import { Results } from "./Results";
import {
    Route,
    useParams,
    Redirect,
} from "wouter";
import { partition } from "../helpers";
import { WithDefaultGameWeek } from "./WithDefaultGameWeek";
import { useReplaceNavigate } from "../useReplaceNavigate";
import { useSeasonContext } from "../SeasonContext";
import { PlayersTable } from "./playerstable/PlayersTable";

export interface Props {
    allLeagueDetails: LeagueDetails[];
}

const TABS = ["standings", "results", "fixtures", "players"] as const;
export const DEFAULT_TAB = TABS[0];
type Tab = (typeof TABS)[number];
const isTab = (s: unknown): s is Tab => TABS.includes(s as Tab);
const shouldDisplayTab = (tab: Tab, fixtures: Match[]) =>
    !(tab === "fixtures" && fixtures.length === 0);
const isSeason = (s: unknown): s is Season => SEASONS.includes(s as Season);

//TODO give this a better name
export const SeasonComponent = () => {
    const { season, tab } = useParams();
    const navigate = useReplaceNavigate();
    const { leagueDetails } = useSeasonContext()

    if (!isTab(tab) || !isSeason(season) || leagueDetails == undefined) {
        return <Redirect to={`~/404`} />;
    }

    const seasonNotes = SEASON_NOTES[season]?.general;
    const { matches } = leagueDetails;

    const title = `A Real Sport (${Season.toDisplayFormat(season)})`;
    const [results, fixtures] = partition(matches, Match.isFinished);
    return (
        <>
            <Card shadow="sm" className="shrink-0">
                <CardBody>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-semibold">{title}</h1>
                            {seasonNotes !== undefined ? (
                                <Warning warnings={[seasonNotes]} />
                            ) : null}
                        </div>
                        <Dropdown>
                            <DropdownTrigger className="flex">
                                <Button
                                    endContent={<Chevron orientation="down" />}
                                    variant="flat"
                                >
                                    Season
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Seasons"
                                closeOnSelect={true}
                                selectedKeys={new Set([season])}
                                selectionMode="single"
                                onSelectionChange={(selected) => {
                                    const selectedSeason =
                                        Season.getSeason(
                                            Array.from(selected)[0]
                                        ) ?? "";
                                    navigate(season, selectedSeason);
                                }}
                            >
                                {SEASONS.map((season) => (
                                    <DropdownItem key={season}>
                                        {Season.toDisplayFormat(season)}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                    <Tabs
                        selectedKey={tab}
                        classNames={{
                            base: "pt-2",
                            tabList: "w-full sm:w-fit",
                        }}
                        onSelectionChange={(selected) => {
                            if (typeof selected === "string") {
                                navigate(tab, selected);
                            }
                        }}
                    >
                        {TABS.map((t) =>
                            shouldDisplayTab(t, fixtures) ? (
                                <Tab className="capitalize" key={t} title={t} />
                            ) : null
                        )}
                    </Tabs>
                </CardBody>
            </Card>
            <Route path={"/:gameWeek?"}>
                {tab === "standings" ? (
                    <WithDefaultGameWeek
                        defaultGameWeek={results[results.length - 1].gameWeek}
                        isValidGameWeek={(gameWeek, defaultGameWeek) =>
                            gameWeek > 0 && gameWeek <= defaultGameWeek
                        }
                    >
                        <Standings
                            key={`standings-${season}`}
                            leagueDetails={leagueDetails}
                        />
                    </WithDefaultGameWeek>
                ) : null}
                {tab === "results" ? (
                    <WithDefaultGameWeek
                        defaultGameWeek={results[results.length - 1].gameWeek}
                        isValidGameWeek={(gameWeek, defaultGameWeek) =>
                            gameWeek > 0 && gameWeek <= defaultGameWeek
                        }
                    >
                        <Results
                            key={`results-${season}`}
                            matches={results.reverse()}
                        />
                    </WithDefaultGameWeek>
                ) : null}
                {tab === "fixtures" && fixtures.length > 0 ? (
                    <WithDefaultGameWeek
                        defaultGameWeek={fixtures[0].gameWeek}
                        isValidGameWeek={(gameWeek, defaultGameWeek) =>
                            gameWeek >= defaultGameWeek && gameWeek <= fixtures[fixtures.length - 1].gameWeek
                        }
                    >
                        <Fixtures
                            key={`fixtures-${season}`}
                            matches={fixtures}
                        />
                    </WithDefaultGameWeek>
                ) : null}
                {tab === "players" ? <PlayersTable /> : null}
            </Route>
        </>
    );
};
