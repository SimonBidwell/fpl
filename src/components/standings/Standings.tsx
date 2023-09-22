import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    SortDescriptor,
    Selection,
} from "@nextui-org/react";
import { useState, useMemo, useCallback, Key } from "react";
import { Header } from "./Header";
import { COLUMNS, INITIAL_COLUMNS } from "./columns";
import { LeagueDetails } from "../../domain";
import { buildStandingsTable, StandingsRow } from "./domain";
import { ColumnHeader } from "./ColumnHeader";
import { getMode, getSeasons } from "./helpers";

export interface Props {
    data: LeagueDetails[];
}

export const Standings = ({ data }: Props) => {
    const [seasonSelection, setSeasonSelection] = useState<Selection>(
        new Set(["2023/24"])
    );

    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "Position",
        direction: "ascending",
    });

    const [visibleColumns, setVisibleColumns] = useState<Selection>(
        new Set(INITIAL_COLUMNS)
    );

    const columns = useMemo(() => {
        const mode = getMode(seasonSelection);
        const cols = visibleColumns === "all" ? [...COLUMNS] : COLUMNS.filter((col) =>
        Array.from(visibleColumns).includes(col.key)
        )
        return cols.filter(col => col.specificMode === undefined ? true : col.specificMode === mode)
    }, [visibleColumns, seasonSelection]);

    const renderCell = useCallback(
        (row: StandingsRow, key: Key) =>
            COLUMNS.find((col) => col.key === key)?.render(row),
        []
    );

    const sortedItems = useMemo(() => {
        return buildStandingsTable(
            data.filter(
                (ld) =>
                    seasonSelection === "all" || seasonSelection.has(ld.league.season)
            )
        ).sort((a, b) => {
            const { direction, column } = sortDescriptor;
            const col = COLUMNS.find((col) => col.key === column);
            if (col && col.sort !== undefined) {
                const comparison = col.sort(a, b);
                return direction === "descending" ? -comparison : comparison;
            } else {
                return 0;
            }
        });
    }, [sortDescriptor, seasonSelection, data]);

    

    return (
        <Table
            aria-label={`League Standings for ${getSeasons(seasonSelection).join(", ")}`}
            isHeaderSticky
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
            topContent={
                <Header
                    visibleColumns={visibleColumns}
                    setVisibleColumns={setVisibleColumns}
                    seasonSelection={seasonSelection}
                    setSeasonSelection={setSeasonSelection}
                />
            }
            topContentPlacement="outside"
            classNames={{
                base: "max-h-full",
                wrapper:
                    "overflow-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-default-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-default-300 scrollbar-track:!rounded",
            }}
        >
            <TableHeader columns={columns}>
                {({ key, abbr, sort, description }) => (
                    <TableColumn key={key} allowsSorting={sort !== undefined}>
                        <ColumnHeader
                            key={key}
                            name={key}
                            abbr={abbr}
                            description={description}
                            setSortDescriptor={sort!== undefined ? setSortDescriptor : undefined}
                        />
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody items={sortedItems}>
                {(item) => (
                    <TableRow key={`${item.season}-${item.entry.id}`}>
                        {(columnKey) => (
                            <TableCell>{renderCell(item, columnKey)}</TableCell>
                        )}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};
