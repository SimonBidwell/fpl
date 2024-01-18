import {
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableCell,
    TableRow,
    Pagination,
    Dropdown,
    DropdownTrigger,
    Button,
    DropdownMenu,
    DropdownItem,
    Selection,
    SortDescriptor,
    Checkbox,
} from "@nextui-org/react";
import { useCallback, useState, useMemo } from "react";
import { Chevron } from "../Chevron";
import { useSeasonContext } from "../../SeasonContext";
import {
    AssistsCol,
    BonusPtsCol,
    CleanSheetsCol,
    Column,
    ExpectedAssistsCol,
    ExpectedGoalInvolvementsCol,
    ExpectedGoalsCol,
    GoalsConcededCol,
    GoalsScoredCol,
    MinutesCol,
    PlayerCol,
    PlayerRow,
    PointsPerGameCol,
    TotalPointsCol,
    TeamAndManagerCol,
    TotalPointsRankCol,
    buildPlayerRows,
    StatusCol,
    buildColumns,
    buildFixturesCol,
} from "./columns";
import { ColumnHeader } from "../table/ColumnHeader";
import { usePagination } from "../table/usePagination";
import { DebouncedSearch as SearchField } from "../table/DebouncedSearch";
import { range } from "../../helpers";

const buildDefaultColumns = (gameweek: number | undefined): Column[] => [
    TotalPointsRankCol,
    StatusCol,
    PlayerCol,
    TotalPointsCol,
    MinutesCol,
    GoalsScoredCol,
    GoalsConcededCol,
    AssistsCol,
    CleanSheetsCol,
    ExpectedGoalsCol,
    ExpectedAssistsCol,
    ExpectedGoalInvolvementsCol,
    BonusPtsCol,
    PointsPerGameCol,
    ...(gameweek === undefined
        ? []
        : range(1, 4).map((offset) => buildFixturesCol(gameweek, offset))),
    TeamAndManagerCol,
];

const applySelection = (
    selection: Selection,
    row: PlayerRow,
    get: (row: PlayerRow) => string
): boolean =>
    selection instanceof Set
        ? selection.size === 0 || selection.has(get(row))
        : true;

const applyFilters = (
    rows: PlayerRow[],
    positions: Selection,
    teams: Selection,
    name: string,
    freeAgentsOnly: boolean
): PlayerRow[] =>
    rows.filter(
        (row) =>
            applySelection(
                positions,
                row,
                (row) => (row.position?.id ?? "").toString()
            ) &&
            applySelection(teams, row, (row) =>
                (row.team?.id ?? "").toString()
            ) &&
            //TODO this doesn't work for people like odegaard
            (name
                ? row.displayName.toLowerCase().includes(name.toLowerCase())
                : true) &&
            (freeAgentsOnly ? row.owner === undefined : true)
    );

export const PlayersTable = () => {
    const {
        players,
        teams,
        getTeam,
        getEntry,
        getPosition,
        getPlayerStatus,
        getGames,
        currentGameweek,
        positions,
        getDraftInfo
    } = useSeasonContext();

    const columns = useMemo(
        () => buildColumns(currentGameweek),
        [currentGameweek]
    );
    const defaultColumns = useMemo(
        () => buildDefaultColumns(currentGameweek),
        [currentGameweek]
    );

    const playerRows = useMemo(
        () =>
            buildPlayerRows(
                players,
                currentGameweek,
                getTeam,
                getEntry,
                getPosition,
                getPlayerStatus,
                getGames, 
                getDraftInfo
            ),
        [
            players,
            currentGameweek,
            getTeam,
            getEntry,
            getPosition,
            getPlayerStatus,
            getGames,
        ]
    );

    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "totalPointsRank",
        direction: "ascending",
    });

    const sorted = useMemo(() => {
        const { direction, column } = sortDescriptor;
        const sortFn = columns.find((col) => col.key === column)?.sort;
        return playerRows.toSorted((a, b) => {
            if (sortFn) {
                const comparison = sortFn(a, b);
                return direction === "descending" ? -comparison : comparison;
            } else {
                return 0;
            }
        });
    }, [columns, sortDescriptor, playerRows]);

    const [selectedPositions, setSelectedPositions] = useState<Selection>(
        new Set()
    );
    const [selectedTeams, setSelectedTeams] = useState<Selection>(new Set());
    const [nameSearchValue, setNameSearchValue] = useState("");
    const [freeAgentsOnly, setFreeAgentsOnly] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<Selection>(
        new Set(defaultColumns.map((c) => c.key))
    );

    const onClear = useCallback(() => {
        setNameSearchValue("");
        setPage(1);
    }, []);

    const filteredSorted = useMemo(
        () =>
            applyFilters(
                sorted,
                selectedPositions,
                selectedTeams,
                nameSearchValue,
                freeAgentsOnly
            ),
        [
            sorted,
            selectedPositions,
            selectedTeams,
            nameSearchValue,
            freeAgentsOnly,
        ]
    );

    const { page, pages, setPage, items } = usePagination({
        rows: filteredSorted,
    });

    const selectedColumns = useMemo(
        () =>
            columns.filter((col) =>
                Array.from(visibleColumns).includes(col.key)
            ),
        [columns, visibleColumns]
    );

    return (
        <>
            <div className="sm:flex sm:justify-between sm:items-center p-4 grid grid-rows-2 gap-2">
                <SearchField
                    onValueChange={setNameSearchValue}
                    onClear={onClear}
                />
                <div className="w-full flex gap-3 justify-end">
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
                            className="max-h-64 overflow-y-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-default-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-default-300 scrollbar-track:!rounded"
                        >
                            {columns.map(({ key, title, abbr }) => (
                                <DropdownItem key={key}>
                                    {title}{" "}
                                    {abbr && abbr !== " " ? `(${abbr})` : ""}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                className="w-full sm:w-fit"
                                endContent={<Chevron orientation="down" />}
                                variant="flat"
                            >
                                Positions
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Positions"
                            closeOnSelect={false}
                            selectedKeys={selectedPositions}
                            selectionMode="multiple"
                            onSelectionChange={setSelectedPositions}
                            className="overflow-y-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-default-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-default-300 scrollbar-track:!rounded"
                        >
                            {positions.map((position) => (
                                <DropdownItem key={position.id}>{position.singular_name}</DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                className="w-full sm:w-fit"
                                endContent={<Chevron orientation="down" />}
                                variant="flat"
                            >
                                Teams
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Positions"
                            closeOnSelect={false}
                            selectedKeys={selectedTeams}
                            selectionMode="multiple"
                            onSelectionChange={setSelectedTeams}
                            className="max-h-64 overflow-y-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-default-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-default-300 scrollbar-track:!rounded"
                        >
                            {teams.map(({ id, name, code }) => (
                                <DropdownItem key={id}>
                                    <img
                                        className="h-6 mr-2 inline"
                                        src={`https://resources.premierleague.com/premierleague/badges/t${code}.png`}
                                    />
                                    {name}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                    <Checkbox
                        isSelected={freeAgentsOnly}
                        onValueChange={setFreeAgentsOnly}
                        color="default"
                        classNames={{ label: "text-small" }}
                    >
                        Free Agents
                    </Checkbox>
                </div>
            </div>
            <Table
                aria-label="Standings"
                isHeaderSticky
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
                className="min-h-0 h-full"
                classNames={{
                    wrapper:
                        "overflow-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-default-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-default-300 scrollbar-track:!rounded",
                }}
                bottomContent={
                    <div className="flex w-full justify-center">
                        <Pagination
                            isCompact
                            showControls
                            showShadow
                            color="default"
                            page={page}
                            total={pages}
                            onChange={setPage}
                        />
                    </div>
                }
            >
                <TableHeader columns={selectedColumns}>
                    {({ key, title, abbr, description, sort }) => (
                        <TableColumn
                            key={key}
                            allowsSorting={sort !== undefined}
                        >
                            <ColumnHeader
                                key={key}
                                columnKey={key}
                                title={title}
                                abbr={abbr}
                                description={description}
                                setSortDescriptor={setSortDescriptor}
                            />
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={items}>
                    {(item) => (
                        <TableRow key={item.code}>
                            {(columnKey) => (
                                <TableCell>
                                    {columns
                                        .find((col) => col.key === columnKey)
                                        ?.render(item)}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </>
    );
};