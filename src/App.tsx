import { useQuery } from "react-query";
import { getAllLeagueDetails } from "./requests";
import { Standings } from "./components/standings/Standings";
import { Warning } from "./components/Warning";
import { SEASON_NOTES, SEASONS } from "./domain";
import {
    Selection,
    Dropdown,
    DropdownTrigger,
    Button,
    DropdownMenu,
    DropdownItem,
} from "@nextui-org/react";
import { ChevronDownIcon } from "./components/ChevronDownIcon";
import { useState } from "react";
import { getSeasons } from "./components/standings/helpers";

export const App = () => {
    const { isLoading, error, data } = useQuery("leagueDetails", () =>
        getAllLeagueDetails()
    );
    const [seasonSelection, setSeasonSelection] = useState<Selection>(
        new Set(["2023/24"])
    );

    const seasons = getSeasons(seasonSelection);
    const seasonNotes = seasons
        .map((s) => SEASON_NOTES[s]?.general)
        .filter((note): note is string => note !== undefined);
    const seasonData = (data ?? []).filter((s) =>
        seasons.includes(s.league.season)
    );
    const title = `A Real Sport (${seasons.join(", ")})`;

    if (isLoading) return "Loading...";
    if (error || data === undefined) {
        return "Error";
    }

    return (
        <main className="max-h-screen max-w-screen h-screen w-screen flex items-center justify-center">
            <div className="w-4/5 h-[90%] px-2 pb-2 overflow-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-default-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-default-300 scrollbar-track:!rounded">
                <div className="flex items-center justify-between pb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-semibold">{title}</h1>
                        {seasonNotes.length > 0 ? (
                            <Warning warnings={seasonNotes} />
                        ) : null}
                    </div>
                    <Dropdown>
                        <DropdownTrigger className="hidden sm:flex">
                            <Button
                                endContent={
                                    <ChevronDownIcon className="text-small" />
                                }
                                variant="flat"
                            >
                                Season
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            disallowEmptySelection
                            aria-label="Seasons"
                            closeOnSelect={false}
                            selectedKeys={seasonSelection}
                            selectionMode="multiple"
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
                <Standings data={seasonData}/>
            </div>
        </main>
    );
};
