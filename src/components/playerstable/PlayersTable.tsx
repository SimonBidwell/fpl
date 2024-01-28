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
    ButtonGroup,
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
import clsx from "clsx";
import { PlayerCard } from "./PlayerCard";

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
            applySelection(positions, row, (row) =>
                (row.position?.id ?? "").toString()
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
        getDraftInfo,
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

    //TODO make this pattern apply to when teams and positions are set too
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

    const [mode, setMode] = useState<"table" | "card">("card");

    const { page, pages, setPage, items } = usePagination({
        rows: filteredSorted,
        rowsPerPage: mode === "table" ? 13 : 12,
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
            <div className="md:flex md:justify-between md:items-center p-4 grid gap-2">
                <SearchField
                    onValueChange={setNameSearchValue}
                    onClear={onClear}
                />
                <div className="w-full grid grid-cols-3 md:flex md:justify-end gap-1">
                    {mode === "table" ? (
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    className="w-full md:w-fit"
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
                                        {abbr && abbr !== " "
                                            ? `(${abbr})`
                                            : ""}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    ) : null}
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                className="w-full md:w-fit"
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
                                <DropdownItem key={position.id}>
                                    {position.singular_name}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                className={clsx(
                                    "w-full md:w-fit",
                                    mode === "card" && "col-span-2"
                                )}
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
                        classNames={{ label: "text-small whitespace-nowrap" }}
                        className="col-start-1"
                    >
                        Free Agents
                    </Checkbox>
                    <ButtonGroup className="col-start-3">
                        <Button
                            variant={mode === "table" ? undefined : "flat"}
                            onClick={() => setMode("table")}
                            isIconOnly
                            className="w-full md:w-fit"
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
                            variant={mode === "card" ? undefined : "flat"}
                            isIconOnly
                            onClick={() => setMode("card")}
                            className="w-full md:w-fit"
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
                                <rect width="7" height="7" x="3" y="3" rx="1" />
                                <rect
                                    width="7"
                                    height="7"
                                    x="14"
                                    y="3"
                                    rx="1"
                                />
                                <rect
                                    width="7"
                                    height="7"
                                    x="14"
                                    y="14"
                                    rx="1"
                                />
                                <rect
                                    width="7"
                                    height="7"
                                    x="3"
                                    y="14"
                                    rx="1"
                                />
                            </svg>
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
            {mode === "table" ? (
                <Table
                    isCompact
                    aria-label="Players List"
                    isHeaderSticky
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                    className="lg:min-h-0 lg:h-full pb-2 lg:pb-0"
                    classNames={{
                        wrapper:
                            "overflow-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-default-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-default-300 scrollbar-track:!rounded",
                        thead: "z-30",
                    }}
                    bottomContent={
                        <div className="flex w-full justify-center sticky left-0">
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
                        {({
                            key,
                            title,
                            abbr,
                            description,
                            sort,
                            headerClassName,
                        }) => (
                            <TableColumn
                                key={key}
                                allowsSorting={sort !== undefined}
                                className={clsx(
                                    headerClassName,
                                    "p-1 first:pl-2"
                                )}
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
                                    <TableCell
                                        className={clsx(
                                            columns.find(
                                                (col) => col.key === columnKey
                                            )?.cellClassName,
                                            "p-1 first:pl-2"
                                        )}
                                    >
                                        {columns
                                            .find(
                                                (col) => col.key === columnKey
                                            )
                                            ?.render(item)}
                                    </TableCell>
                                )}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            ) : (
                <>
                    <div className="overflow-x-auto flex flex-row lg:flex-wrap gap-2 lg:justify-center min-h-0 p-6 -m-6">
                        {items.map((p) => (
                            <PlayerCard player={p} />
                        ))}
                    </div>
                    <div className="flex w-full justify-center pt-7">
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
                </>
            )}
        </>
    );
};
