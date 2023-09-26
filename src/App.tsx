import { useQuery } from "react-query";
import { getAllLeagueDetails } from "./requests";
import { Standings } from "./components/standings/Standings";
import { Warning } from "./components/Warning";
import { Match, SEASON_NOTES, SEASONS } from "./domain";
import {
    Selection,
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
import { Chevron } from "./components/Chevron";
import { useState } from "react";
import { getSeasons } from "./components/standings/helpers";
import { MatchList } from "./components/MatchList";

export const App = () => {
    const { isLoading, error, data } = useQuery("leagueDetails", () =>
        getAllLeagueDetails()
    );
    const [seasonSelection, setSeasonSelection] = useState<Selection>(
        new Set(["2023/24"])
    );

    const [tab, setTab] = useState<string>("Standings");

    const seasons = getSeasons(seasonSelection);
    const seasonNotes = seasons
        .map((s) => SEASON_NOTES[s]?.general)
        .filter((note): note is string => note !== undefined);
    const seasonData = (data ?? []).filter((s) =>
        seasons.includes(s.league.season)
    );

    if (isLoading) return "Loading...";
    if (error || data === undefined) {
        return "Error";
    }

    const leagueDetails = seasonData[0];
    const title = `A Real Sport (${leagueDetails.league.season})`;

    return (
        <main className="max-h-screen max-w-screen h-screen w-screen overflow-x-hidden flex items-center justify-center p-2">
            {/* TODO on small screens padding at the bottom gets lost */}
            <div className="w-4/5 h-full">
                <Card shadow="sm">
                    <CardBody>
                        {/* TODO not sure I need another container here */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-semibold">
                                    {title}
                                </h1>
                                {seasonNotes.length > 0 ? (
                                    <Warning warnings={seasonNotes} />
                                ) : null}
                            </div>
                            <Dropdown>
                                <DropdownTrigger className="hidden sm:flex">
                                    <Button
                                        endContent={
                                            <Chevron orientation="down" />
                                        }
                                        variant="flat"
                                    >
                                        Season
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    disallowEmptySelection
                                    aria-label="Seasons"
                                    closeOnSelect={true}
                                    selectedKeys={seasonSelection}
                                    selectionMode="single"
                                    onSelectionChange={setSeasonSelection}
                                >
                                    {SEASONS.map((season) => (
                                        <DropdownItem
                                            key={season}
                                            className="capitalize"
                                        >
                                            {season}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                        <Tabs
                            selectedKey={tab}
                            className="pt-2"
                            onSelectionChange={(x) =>
                                typeof x === "string" ? setTab(x) : undefined
                            }
                        >
                            <Tab key="Standings" title="Standings" />
                            <Tab key="Results" title="Results" />
                            <Tab key="Fixtures" title="Fixtures" />
                        </Tabs>
                    </CardBody>
                </Card>
                {tab === "Standings" ? (
                    <Standings key={leagueDetails.league.season} data={leagueDetails} />
                ) : null}
                {tab === "Results" ? (
                    <MatchList
                        key={leagueDetails.league.season}
                        matches={leagueDetails.matches
                            .filter(Match.isFinished)
                            .reverse()}
                    />
                ) : null}
                {tab === "Fixtures" ? (
                    <MatchList
                        key={leagueDetails.league.season}
                        matches={leagueDetails.matches.filter(
                            (m) => !Match.isFinished(m)
                        )}
                    />
                ) : null}
            </div>
        </main>
    );
};
