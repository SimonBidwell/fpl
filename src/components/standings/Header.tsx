import { SEASONS, Season } from "../../api/domain";
import {
    Button,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Selection,
} from "@nextui-org/react";
import { ChevronDownIcon } from "../ChevronDownIcon";
import { COLUMNS } from "./columns";
import { SEASON_NOTES } from "../../domain";
import { isAllSeasons, getSeasons } from "./helpers";

export interface Props {
    seasonSelection: Selection;
    setSeasonSelection: (selection: Selection) => void;
    visibleColumns: Selection;
    setVisibleColumns: (selection: Selection) => void;
}

const Warning = ({ warning }: { warning: string }) => (
    <div className="bg-yellow-50 p-2 rounded-medium shadow-sm text-tiny flex items-center max-w-[2.25rem] group hover:max-w-full transition-[max-width] duration-1000" 
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="h-5 w-5 text-yellow-400"
        >
            <path
                fill-rule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clip-rule="evenodd"
            ></path>
        </svg>
        <div
            className="text-no-wrap text-yellow-700 inline-block max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-full transition-[max-width] duration-1000"
        >
            {warning}
        </div>
    </div>
);

export const Header = ({
    seasonSelection,
    setSeasonSelection,
    visibleColumns,
    setVisibleColumns,
}: Props) => {
    const isAll = isAllSeasons(seasonSelection)
    const seasons = getSeasons(seasonSelection)
    const seasonNotes = seasons.map((s) => SEASON_NOTES[s]?.general).join(". ");
    return (
        <div className="flex justify-between gap-3 items-end">
            <div className="flex items-center">
                <h1 className="text-3xl font-semibold p-2">
                    A Real Sport ({isAll ? "All time" : seasons.join(", ")})
                </h1>
                {seasonNotes ? <Warning warning={seasonNotes} /> : null}
            </div>
            <div className="flex gap-3">
                <Dropdown>
                    <DropdownTrigger className="hidden sm:flex">
                        <Button
                            endContent={
                                <ChevronDownIcon className="text-small" />
                            }
                            variant="flat"
                        >
                            Columns
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        disallowEmptySelection
                        aria-label="Columns"
                        closeOnSelect={false}
                        selectedKeys={visibleColumns}
                        selectionMode="multiple"
                        onSelectionChange={setVisibleColumns}
                    >
                        {COLUMNS.map(({ key, abbr }) => (
                            <DropdownItem key={key}>
                                {key} {abbr ? `(${abbr})` : ""}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
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
                        closeOnSelect={true}
                        selectedKeys={seasonSelection}
                        selectionMode="single"
                        onSelectionChange={setSeasonSelection}
                    >
                        {SEASONS.map((season) => (
                            <DropdownItem key={season} className="capitalize">
                                {season}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
            </div>
        </div>
    );
};
