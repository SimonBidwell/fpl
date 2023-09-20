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
import { COLUMN_KEYS } from "./columns";
import { SEASON_NOTES } from "../../domain";

export interface Props {
    seasonSelection: Selection;
    setSeasonSelection: (selection: Selection) => void;
    visibleColumns: Selection;
    setVisibleColumns: (selection: Selection) => void;
}

export const Header = ({
    seasonSelection,
    setSeasonSelection,
    visibleColumns,
    setVisibleColumns,
}: Props) => {
    const isAll = seasonSelection === "all" || seasonSelection.size === SEASONS.length
    const seasons = (isAll ? SEASONS : [...seasonSelection]) as Season[];
    return (
        <div className="flex justify-between gap-3 items-end">
            <div className="flex items-center">
                <h1 className="text-3xl font-semibold p-2">
                    A Real Sport ({isAll? "All time" : seasons.join(", ")})
                </h1>
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
                        {COLUMN_KEYS.map((column) => (
                            <DropdownItem key={column}>{column}</DropdownItem>
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
