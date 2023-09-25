import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    SortDescriptor,
    Selection,
    Dropdown,
    DropdownTrigger,
    Button,
    DropdownMenu,
    DropdownItem,
} from "@nextui-org/react";
import { useState, useMemo, useCallback, Key } from "react";
import { COLUMNS, INITIAL_COLUMNS } from "./columns";
import { LeagueDetails } from "../../domain";
import { buildStandingsTable, StandingsRow } from "./domain";
import { ColumnHeader } from "./ColumnHeader";
import { ChevronDownIcon } from "../ChevronDownIcon";
import { DownloadCSV, buildStandingsSerialiser } from "../DownloadCSV";

export interface Props {
    data: LeagueDetails[];
}

export const Standings = ({ data }: Props) => {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "Position",
        direction: "ascending",
    });

    const [visibleColumns, setVisibleColumns] = useState<Selection>(
        new Set(INITIAL_COLUMNS)
    );

    const mode = data.length === 1 ? "single" : "multi";
    const columns = useMemo(() => {
        const cols =
            visibleColumns === "all"
                ? [...COLUMNS]
                : COLUMNS.filter((col) =>
                      Array.from(visibleColumns).includes(col.key)
                  );
        return cols.filter((col) =>
            col.specificMode === undefined ? true : col.specificMode === mode
        );
    }, [visibleColumns]);

    const renderCell = useCallback(
        (row: StandingsRow, key: Key) =>
            COLUMNS.find((col) => col.key === key)?.render(row),
        []
    );

    const sortedItems = useMemo(() => {
        return buildStandingsTable(data).sort((a, b) => {
            const { direction, column } = sortDescriptor;
            const col = COLUMNS.find((col) => col.key === column);
            if (col && col.sort !== undefined) {
                const comparison = col.sort(a, b);
                return direction === "descending" ? -comparison : comparison;
            } else {
                return 0;
            }
        });
    }, [sortDescriptor, data]);

    const topContent = useMemo(
        () => (
            <div className="flex gap-3 justify-end">
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
                        {COLUMNS.filter((col) =>
                            col.specificMode === undefined
                                ? true
                                : col.specificMode === mode
                        ).map(({ key, abbr }) => (
                            <DropdownItem key={key}>
                                {key} {abbr ? `(${abbr})` : ""}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
                <DownloadCSV
                    serialiser={buildStandingsSerialiser(columns)}
                    data={sortedItems}
                    filename="standings"
                />
            </div>
        ),
        [visibleColumns, mode, sortedItems]
    );

    return (
        <Table
            aria-label="League Standings"
            isHeaderSticky
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
            topContent={topContent}
            topContentPlacement="outside"
        >
            <TableHeader columns={columns}>
                {({ key, abbr, sort, description }) => (
                    <TableColumn key={key} allowsSorting={sort !== undefined}>
                        <ColumnHeader
                            key={key}
                            name={key}
                            abbr={abbr}
                            description={description}
                            setSortDescriptor={
                                sort !== undefined
                                    ? setSortDescriptor
                                    : undefined
                            }
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
