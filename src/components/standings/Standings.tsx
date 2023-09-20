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
import { TableRow as LeagueTableRow, buildTable } from "../../domain";
import { Season, LeagueDetails } from "../../api/domain";

export interface Props {
    data: [Season, LeagueDetails][];
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
        if (visibleColumns === "all") return [...COLUMNS];
        return COLUMNS.filter((col) =>
            Array.from(visibleColumns).includes(col.key)
        );
    }, [visibleColumns]);

    const renderCell = useCallback(
        (row: LeagueTableRow, key: Key) =>
            COLUMNS.find((col) => col.key === key)?.render(row),
        []
    );

    const sortedItems = useMemo(() => {
        return buildTable(
            data.filter(
                ([season]) =>
                    seasonSelection === "all" || seasonSelection.has(season)
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
                {({ key, renderLabel, sort }) => (
                    <TableColumn key={key} allowsSorting={sort !== undefined}>
                        {renderLabel()}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody items={sortedItems}>
                {(item) => (
                    <TableRow key={item.manager.id}>
                        {(columnKey) => (
                            <TableCell>{renderCell(item, columnKey)}</TableCell>
                        )}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};
