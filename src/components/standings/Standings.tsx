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
    ButtonGroup,
    CardBody,
    Card,
} from "@nextui-org/react";
import { useState, useMemo, useCallback, Key } from "react";
import { COLUMNS, INITIAL_COLUMNS } from "./columns";
import { LeagueDetails, Match } from "../../domain";
import { buildStandings, StandingsRow } from "./domain";
import { ColumnHeader } from "./ColumnHeader";
import { Chevron } from "../Chevron";
import { DownloadCSV, buildStandingsSerialiser } from "../DownloadCSV";
import { GameWeekSelector } from "../GameweekSelector";
import { GRAPHS, Graph, StandingsGraph } from "./graphs/StandingsGraph";
import { useLocation, useParams } from "wouter";

export interface Props {
    leagueDetails: LeagueDetails;
}

export const Standings = ({
    leagueDetails
}: Props) => {
    const { gameWeek } = useParams();
    const [, navigate] = useLocation();
    const finishedGameWeeks = useMemo(
        () =>
            [
                ...new Set(
                    leagueDetails.matches
                        .filter(Match.isFinished)
                        .map((m) => m.gameWeek)
                ),
            ].sort((a, b) => b - a),
        [leagueDetails]
    );

    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "Position",
        direction: "ascending",
    });

    const [visibleColumns, setVisibleColumns] = useState<Selection>(
        new Set(INITIAL_COLUMNS)
    );

    const [graph, setGraph] = useState<Selection>(new Set([GRAPHS[0]]));

    const [mode, setMode] = useState<"table" | "graph">("table");

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

    const standings = useMemo(
        () => buildStandings(leagueDetails),
        [leagueDetails]
    );
    const selectedStandings = useMemo(() => {
        const selected =
            standings.get(Number(gameWeek)) ?? new Map<number, StandingsRow>();
        return [...selected.values()];
    }, [gameWeek]);
    const sortedStandings = useMemo(
        () =>
            selectedStandings.sort((a, b) => {
                const { direction, column } = sortDescriptor;
                const col = COLUMNS.find((col) => col.key === column);
                if (col && col.sort !== undefined) {
                    const comparison = col.sort(a, b);
                    return direction === "descending"
                        ? -comparison
                        : comparison;
                } else {
                    return 0;
                }
            }),
        [selectedStandings, sortDescriptor]
    );

    //TODO add some height and scroll to the dropdown
    const topContent = useMemo(
        () => (
            <div className="sm:flex sm:justify-between sm:items-center p-4 grid grid-rows-2 gap-2">
                <GameWeekSelector
                    gameWeeks={finishedGameWeeks}
                    selectedGameWeek={Number(gameWeek)}
                    setSelectedGameWeek={(gameWeek) => navigate(`/${gameWeek}`)}
                />
                <div className="w-full flex gap-3 justify-end">
                    {mode === "table" ? (
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    className="w-full sm:w-fit"
                                    endContent={<Chevron orientation="down" />}
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
                    ) : null}
                    {mode === "graph" ? (
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    className="w-full sm:w-fit"
                                    endContent={<Chevron orientation="down" />}
                                    variant="flat"
                                >
                                    Graph
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Graph"
                                closeOnSelect
                                selectedKeys={graph}
                                selectionMode="single"
                                onSelectionChange={setGraph}
                            >
                                {GRAPHS.map((graph) => (
                                    <DropdownItem key={graph}>
                                        {graph}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    ) : null}
                    {mode === "table" ? (
                        <DownloadCSV
                            serialiser={buildStandingsSerialiser(columns)}
                            data={sortedStandings}
                            filename="standings"
                        />
                    ) : null}
                    <ButtonGroup>
                        <Button
                            variant={mode === "table" ? undefined : "flat"}
                            onClick={() => setMode("table")}
                            isIconOnly
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-gray-700"
                                opacity="0.5"
                            >
                                <path d="M12 3v18" />
                                <rect
                                    width="18"
                                    height="18"
                                    x="3"
                                    y="3"
                                    rx="2"
                                />
                                <path d="M3 9h18" />
                                <path d="M3 15h18" />
                            </svg>
                        </Button>
                        <Button
                            variant={mode === "graph" ? undefined : "flat"}
                            isIconOnly
                            onClick={() => setMode("graph")}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-gray-700"
                                opacity="0.5"
                            >
                                <line x1="12" x2="12" y1="20" y2="10" />
                                <line x1="18" x2="18" y1="20" y2="4" />
                                <line x1="6" x2="6" y1="20" y2="16" />
                            </svg>
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
        ),
        [
            graph,
            mode,
            visibleColumns,
            sortedStandings,
            finishedGameWeeks,
            gameWeek
        ]
    );

    if (mode === "graph") {
        return (
            <>
                {topContent}
                <Card shadow="sm">
                    <CardBody className="flex flex-col gap-4">
                        <StandingsGraph
                            graph={Array.from(graph)[0] as Graph}
                            standings={standings}
                            gameweek={Number(gameWeek)}
                            entries={leagueDetails.entries}
                        />
                    </CardBody>
                </Card>
            </>
        );
    } else {
        return (
            <>
                {topContent}
                <Table
                    aria-label="League Standings"
                    isHeaderSticky
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                    topContentPlacement="outside"
                    classNames={{
                        wrapper:
                            "overflow-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-default-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-default-300 scrollbar-track:!rounded",
                    }}
                >
                    <TableHeader columns={columns}>
                        {({ key, abbr, sort, description }) => (
                            <TableColumn
                                key={key}
                                allowsSorting={sort !== undefined}
                            >
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
                                    <TableCell>
                                        {renderCell(item, columnKey)}
                                    </TableCell>
                                )}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </>
        );
    }
};
