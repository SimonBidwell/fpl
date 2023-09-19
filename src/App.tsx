import { useQuery } from "react-query";
import {
    TableRow as LeagueTableRow,
    buildTable,
    Match,
    MANAGERS,
} from "./domain";
import { getAllLeagueDetails } from "./api/requests";
import { SEASONS, Match as FPLMatch } from "./api/domain";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    SortDescriptor,
    Button,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Selection,
    Tooltip,
} from "@nextui-org/react";
import { useCallback, useState, useMemo } from "react";
import { Result } from "./Result";
import { MovementIcon } from "./MovementIcon";
import { ReactNode, Key } from "react";
import { ChevronDownIcon } from "./ChevronDownIcon";
import { Manager } from "./Manager";
import { ResultsListHover } from "./ResultsListHover";

const columns = {
    Pos: {
        render: ({ position, previousPosition }: LeagueTableRow): ReactNode => (
            <div className="flex items-center gap-1">
                {position}
                {previousPosition !== undefined ? (
                    <MovementIcon
                        currentPosition={position}
                        previousPosition={previousPosition}
                    />
                ) : null}
            </div>
        ),
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.position - b.position,
        selectedByDefault: true,
    },
    "Team & Manager": {
        render: ({ manager, team }: LeagueTableRow): ReactNode => (
            <Manager manager={manager} teamName={team} />
        ),
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.team.localeCompare(b.team),
        selectedByDefault: true,
    },
    W: {
        render: ({ id, matches, manager, team }: LeagueTableRow): ReactNode => {
            const matchesWon = matches.filter((m) => Match.isWinner(m, id));
            return (
                <ResultsListHover
                    teamId={id}
                    managerId={manager.id}
                    teamName={team}
                    matches={matchesWon}
                    result="won"
                />
            );
        },
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => a.wins - b.wins,
        selectedByDefault: true,
    },
    D: {
        render: ({ id, matches, manager, team }: LeagueTableRow): ReactNode => {
            const matchesDrawn = matches.filter(Match.isDraw);
            return (
                <ResultsListHover
                    teamId={id}
                    managerId={manager.id}
                    teamName={team}
                    matches={matchesDrawn}
                    result="drawn"
                />
            );
        },
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.draws - b.draws,
        selectedByDefault: true,
    },
    L: {
        render: ({ id, matches, manager, team }: LeagueTableRow): ReactNode => {
            const matchesLost = matches.filter((m) => Match.isLoser(m, id));
            return (
                <ResultsListHover
                    teamId={id}
                    managerId={manager.id}
                    teamName={team}
                    matches={matchesLost}
                    result="lost"
                />
            );
        },
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.losses - b.losses,
        selectedByDefault: true,
    },
    "+": {
        render: ({ scoreFor }: LeagueTableRow): ReactNode => scoreFor,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.scoreFor - b.scoreFor,
        selectedByDefault: true,
    },
    "-": {
        render: ({ scoreAgainst }: LeagueTableRow): ReactNode => scoreAgainst,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.scoreAgainst - b.scoreAgainst,
        selectedByDefault: true,
    },
    "+/-": {
        render: ({ scoreFor, scoreAgainst }: LeagueTableRow): ReactNode => (
            <>{scoreFor - scoreAgainst}</>
        ),
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.scoreFor - a.scoreAgainst - (b.scoreFor - b.scoreAgainst),
        selectedByDefault: true,
    },
    Pts: {
        render: ({ points }: LeagueTableRow): ReactNode => points,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => a.points,
        selectedByDefault: true,
    },
    xPts: {
        render: ({ expectedPoints }: LeagueTableRow): ReactNode =>
            expectedPoints.toFixed(3),
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.expectedPoints,
        selectedByDefault: true,
    },
    "Pts - xPts": {
        render: ({ points, expectedPoints }: LeagueTableRow): ReactNode => {
            const diff = points - expectedPoints;
            return (
                <span
                    className={
                        diff > 0
                            ? "text-success-500"
                            : diff < 0
                            ? "text-danger-500"
                            : undefined
                    }
                >
                    {diff > 0 ? "+" : ""}
                    {diff.toFixed(3)}
                </span>
            );
        },
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.points - a.expectedPoints - (b.points - b.expectedPoints),
        selectedByDefault: true,
    },
    xPos: {
        render: ({ expectedPosition }: LeagueTableRow): ReactNode =>
            expectedPosition,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.expectedPosition - b.expectedPosition,
        selectedByDefault: true,
    },
    "Pos - xPos": {
        render: ({ position, expectedPosition }: LeagueTableRow): ReactNode => {
            const diff = position - expectedPosition;
            return (
                <span
                    className={
                        diff > 0
                            ? "text-success-500"
                            : diff < 0
                            ? "text-danger-500"
                            : undefined
                    }
                >
                    {diff > 0 ? "+" : ""}
                    {diff}
                </span>
            );
        },
        sort: (a: LeagueTableRow, b: LeagueTableRow): number =>
            a.position - a.expectedPosition - (b.position - b.expectedPosition),
        selectedByDefault: true,
    },
    Form: {
        //TODO tidy up duplication etc, can possibly add some weighting for more recent games?
        //TODO disable for all time table/when there are more than 2 leagues selected
        render: ({ id, matches }: LeagueTableRow) => {
            const mostRecent = matches
                .filter((m) => m.status === "finished")
                .sort(Match.sort)
                .slice(-4);
            return (
                <div className="flex gap-[0.1rem]">
                    {mostRecent.map((match, i) => {
                        const thisTeam = Match.getTeam(match, id);
                        const opposition = Match.getOpposition(match, id);
                        if (thisTeam && opposition) {
                            return (
                                <Tooltip
                                    content={
                                        <div className="flex flex-col p-1">
                                            <div className="text-tiny uppercase font-medium text-foreground-400 pb-1">
                                                Gameweek {match.gameWeek}
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                {thisTeam.points}-
                                                {opposition.points}
                                                <Manager
                                                    manager={opposition.manager}
                                                    teamName={opposition.name}
                                                />
                                            </div>
                                        </div>
                                    }
                                >
                                    <div>
                                        <Result
                                            result={Match.resultForTeam(
                                                match,
                                                id
                                            )}
                                        />
                                    </div>
                                </Tooltip>
                            );
                        } else {
                            return null;
                        }
                    })}
                </div>
            );
        },
        sort: (a: LeagueTableRow, b: LeagueTableRow) => {
            const formSum = (id: number, matches: Match[]): number => {
                return matches.reduce((a, b) => {
                    const resultForTeam = Match.resultForTeam(b, id);
                    const points =
                        resultForTeam === "win"
                            ? 3
                            : resultForTeam === "draw"
                            ? 1
                            : 0;
                    return a + points;
                }, 0);
            };
            const mostRecent = (matches: Match[]) =>
                matches
                    .filter((m) => m.status === "finished")
                    .sort(Match.sort)
                    .slice(-4);
            return (
                formSum(a.id, mostRecent(a.matches)) -
                formSum(b.id, mostRecent(b.matches))
            );
        },
        selectedByDefault: true,
    },
    "Up next": {
        render: ({ id, matches }: LeagueTableRow) => {
            const nextMatch = matches
                .filter((m) => m.status !== "finished")
                .sort(Match.sort)[0];
            const opposition = nextMatch
                ? Match.getOpposition(nextMatch, id)
                : undefined;
            if (opposition === undefined) {
                return (
                    <span className="text-xs text-foreground-400">
                        No upcoming fixtures
                    </span>
                );
            } else {
                return (
                    <Manager
                        manager={opposition.manager}
                        teamName={opposition.name}
                    />
                );
            }
        },
        sort: () => 0,
        selectedByDefault: true,
    },
    "Avg +": {
        render: (row: LeagueTableRow) =>
            row.scoreFor /
            row.matches.filter((m) => m.status === "finished").length,
        sort: () => 0,
        selectedByDefault: false,
    },
    "Avg -": {
        render: (row: LeagueTableRow) =>
            row.scoreAgainst /
            row.matches.filter((m) => m.status === "finished").length,
        sort: () => 0,
        selectedByDefault: false,
    },
    "Avg Pts": {
        render: (row: LeagueTableRow) =>
            row.points /
            row.matches.filter((m) => m.status === "finished").length,
        sort: () => 0,
        selectedByDefault: false,
    },
    "Avg xPts": {
        render: (row: LeagueTableRow) =>
            (
                row.expectedPoints /
                row.matches.filter((m) => m.status === "finished").length
            ).toFixed(3),
        sort: () => 0,
        selectedByDefault: false,
    },
    //TODO reinstate when I make things selectable
    // "Waiver": {
    //     render: ({waiverPick}: LeagueTableRow) => waiverPick,
    //     sort: (a: LeagueTableRow, b: LeagueTableRow) => (a.waiverPick ?? 0) - (b.waiverPick ?? 0)
    // }
};
type Column = keyof typeof columns;
const isColumn = (key: Key | undefined): key is Column =>
    typeof key === "string" && Object.keys(columns).includes(key);
const INITIAL_COLUMNS: Column[] = Object.entries(columns)
    .filter(([, value]) => value.selectedByDefault)
    .map(([key]) => key)
    .filter(isColumn);

export const App = () => {
    const [seasonSelection, setSeasonSelection] = useState<Selection>(
        new Set(["2023/24"])
    );
    const [visibleColumns, setVisibleColumns] = useState<Selection>(
        new Set(INITIAL_COLUMNS)
    );
    const { isLoading, error, data } = useQuery("leagueDetails", () =>
        getAllLeagueDetails()
    );
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "Pos",
        direction: "ascending",
    });

    const renderCell = useCallback((row: LeagueTableRow, key: Key) => {
        if (isColumn(key)) {
            const { render } = columns[key];
            return render(row);
        } else {
            return null;
        }
    }, []);

    const sortedItems = useMemo(() => {
        return buildTable(
            (data ?? []).filter(
                ([season]) =>
                    seasonSelection === "all" || seasonSelection.has(season)
            )
        ).sort((a, b) => {
            const { direction, column } = sortDescriptor;
            if (isColumn(column)) {
                const comparison = columns[column].sort(a, b);
                return direction === "descending" ? -comparison : comparison;
            } else {
                return 0;
            }
        });
    }, [sortDescriptor, seasonSelection, data]);

    const topContent = useMemo(() => {
        return (
            <div className="flex justify-between gap-3 items-end">
                <h1 className="text-3xl font-semibold p-2">
                    A Real Sport (
                    {seasonSelection === "all" ||
                    seasonSelection.size === SEASONS.length
                        ? "All time"
                        : [...seasonSelection].join(", ")}
                    )
                </h1>
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
                            {Object.keys(columns).map((column) => (
                                <DropdownItem key={column}>
                                    {column}
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
                            {SEASONS.map((status) => (
                                <DropdownItem
                                    key={status}
                                    className="capitalize"
                                >
                                    {status}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
        );
    }, [seasonSelection, visibleColumns]);

    const headerColumns = useMemo(() => {
        const columnNames = Object.keys(columns);
        if (visibleColumns === "all") return columnNames;

        return columnNames.filter((column) =>
            Array.from(visibleColumns).includes(column)
        );
    }, [visibleColumns]);

    if (isLoading) return "Loading...";
    if (error || data === undefined) {
        return "Error";
    }

    return (
        <main className="h-screen w-screen flex items-center justify-center">
            <div className="w-4/5 h-[90%]">
                <Table
                    isHeaderSticky
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                    topContent={topContent}
                    topContentPlacement="outside"
                    classNames={{
                        base: "max-h-full",
                        wrapper:
                            "overflow-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-default-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-default-300 scrollbar-track:!rounded",
                    }}
                >
                    <TableHeader
                        columns={headerColumns.map((c) => ({
                            key: c,
                            label: c,
                        }))}
                    >
                        {(column) => (
                            <TableColumn key={column.key} allowsSorting>
                                {column.label}
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody items={sortedItems}>
                        {(item) => (
                            <TableRow key={item.manager.id}>
                                {(columnKey) => (
                                    <TableCell>
                                        {renderCell(item, columnKey)}
                                    </TableCell>
                                )}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </main>
    );
};
