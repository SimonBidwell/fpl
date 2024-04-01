import {
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
import { useState, useMemo } from "react";
import { LeagueDetails, Match } from "../../domain";
import { buildStandings } from "./domain";
import { Chevron } from "../Chevron";
import { DownloadCSV, buildStandingsSerialiser } from "../DownloadCSV";
import { GameWeekSelector } from "../GameweekSelector";
import { GRAPHS, Graph, StandingsGraph } from "./graphs/StandingsGraph";
import { useLocation, useParams } from "wouter";
import { StandingsTable, StandingsRow } from "../standingstable/StandingsTable";
import {
    AverageFairPointsCol,
    AveragePointsAgainstCol,
    AveragePointsCol,
    AveragePointsForCol,
    DrawnCol,
    ELOCol,
    FairPointsCol,
    FairPointsDifferenceCol,
    FairPositionCol,
    FairPositionDifferenceCol,
    FormCol,
    LostCol,
    PlayedCol,
    PointsAgainstCol,
    PointsCol,
    PointsDifferenceCol,
    PointsForCol,
    PositionCol,
    TeamAndManagerCol,
    UpNextCol,
    WonCol,
} from "../standingstable/columns";
import { LineChart, Table2 } from "lucide-react";

export interface Props {
    leagueDetails: LeagueDetails;
}

const COLUMNS = [
    PositionCol,
    TeamAndManagerCol,
    PlayedCol,
    WonCol,
    DrawnCol,
    LostCol,
    PointsForCol,
    PointsAgainstCol,
    PointsDifferenceCol,
    PointsCol,
    FairPointsCol,
    FairPointsDifferenceCol,
    FairPositionCol,
    FairPositionDifferenceCol,
    AveragePointsForCol,
    AveragePointsAgainstCol,
    AveragePointsCol,
    AverageFairPointsCol,
    ELOCol,
    FormCol,
    UpNextCol,
];
const INITIAL_COLUMNS = [
    PositionCol,
    TeamAndManagerCol,
    WonCol,
    DrawnCol,
    LostCol,
    PointsForCol,
    PointsAgainstCol,
    PointsDifferenceCol,
    PointsCol,
    FairPointsCol,
    FairPointsDifferenceCol,
    FairPositionCol,
    FairPositionDifferenceCol,
    FormCol,
    UpNextCol,
].map((col) => col.key);

export const Standings = ({ leagueDetails }: Props) => {
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

    const standings = useMemo(
        () => buildStandings(leagueDetails),
        [leagueDetails]
    );
    const selectedStandings = useMemo(() => {
        const selected =
            standings.get(Number(gameWeek)) ?? new Map<number, StandingsRow>();
        return [...selected.values()];
    }, [gameWeek]);

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
                            data={selectedStandings}
                            filename="standings"
                        />
                    ) : null}
                    <ButtonGroup>
                        <Button
                            variant={mode === "table" ? undefined : "flat"}
                            onClick={() => setMode("table")}
                            isIconOnly
                        >
                            <Table2 strokeWidth={1}/>
                        </Button>
                        <Button
                            variant={mode === "graph" ? undefined : "flat"}
                            isIconOnly
                            onClick={() => setMode("graph")}
                        >
                            <LineChart strokeWidth={1}/>
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
        ),
        [
            graph,
            mode,
            visibleColumns,
            selectedStandings,
            finishedGameWeeks,
            gameWeek,
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
                <StandingsTable
                    columns={columns}
                    standings={selectedStandings}
                    defaultSortDescriptor={{
                        column: "Position",
                        direction: "ascending",
                    }}
                />
            </>
        );
    }
};
