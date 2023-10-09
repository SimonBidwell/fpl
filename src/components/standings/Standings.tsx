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
import { LeagueDetails, Match } from "../../domain";
import { buildStandings, StandingsRow } from "./domain";
import { ColumnHeader } from "./ColumnHeader";
import { Chevron } from "../Chevron";
import { DownloadCSV, buildStandingsSerialiser } from "../DownloadCSV";
import { GameWeekSelector } from "../GameweekSelector";

export interface Props {
    leagueDetails: LeagueDetails;
}

export const Standings = ({ leagueDetails }: Props) => {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "Position",
        direction: "ascending",
    });

    const [visibleColumns, setVisibleColumns] = useState<Selection>(
        new Set(INITIAL_COLUMNS)
    );

    const finishedGameWeeks = useMemo(
        () =>
            [
                ...new Set(
                    leagueDetails.matches.filter(Match.isFinished).map((m) => m.gameWeek)
                ),
            ].sort((a, b) => b - a),
        [leagueDetails]
    );
    const [selectedGameWeek, setSelectedGameWeek] = useState<number>(
        finishedGameWeeks[0]
    );

    const columns = useMemo(
        () =>
            visibleColumns === "all"
                ? [...COLUMNS]
                : COLUMNS.filter((col) =>
                      Array.from(visibleColumns).includes(col.key)
                  ),
        [visibleColumns]
    );

    const renderCell = useCallback(
        (row: StandingsRow, key: Key) =>
            COLUMNS.find((col) => col.key === key)?.render(row),
        []
    );

    const standings = useMemo(() => buildStandings(leagueDetails), [leagueDetails])
    const selectedStandings = useMemo(() => {
        const selected = standings.get(selectedGameWeek) ?? new Map<number, StandingsRow>()
        return [...selected.values()]
    }, [selectedGameWeek])
    const sortedStandings = useMemo(
        () => selectedStandings.sort((a, b) => {
            const { direction, column } = sortDescriptor;
            const col = COLUMNS.find((col) => col.key === column);
            if (col && col.sort !== undefined) {
                const comparison = col.sort(a, b);
                return direction === "descending" ? -comparison : comparison;
            } else {
                return 0;
            }
        }), 
        [selectedStandings, sortDescriptor]
    )

    //TODO add some height and scroll to the dropdown
    const topContent = useMemo(
        () => (
            <div className="flex justify-between items-center px-4 pt-4">
                <GameWeekSelector
                    gameWeeks={finishedGameWeeks}
                    selectedGameWeek={selectedGameWeek}
                    setSelectedGameWeek={setSelectedGameWeek}
                />
                <div className="flex gap-3 justify-end">
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                endContent={
                                    <Chevron orientation="down" />
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
                    <DownloadCSV
                        serialiser={buildStandingsSerialiser(columns)}
                        data={sortedStandings}
                        filename="standings"
                    />
                </div>
            </div>
        ),
        [
            visibleColumns,
            sortedStandings,
            finishedGameWeeks,
            selectedGameWeek,
            setSelectedGameWeek,
        ]
    );

    return (
        <Table
            aria-label="League Standings"
            isHeaderSticky
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
            topContent={topContent}
            topContentPlacement="outside"
            classNames={{
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
                            setSortDescriptor={
                                sort !== undefined
                                    ? setSortDescriptor
                                    : undefined
                            }
                        />
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody items={sortedStandings}>
                {(item) => (
                    <TableRow key={item.key}>
                        {(columnKey) => (
                            <TableCell>{renderCell(item, columnKey)}</TableCell>
                        )}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};