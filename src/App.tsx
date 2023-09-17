import { useQuery } from "react-query";
import { TableRow as LeagueTableRow, Match, getTable } from "./domain";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    User,
    SortDescriptor
} from "@nextui-org/react";
import { useCallback, useState, useMemo } from "react";
import { Records } from "./Records";
import { Result } from "./Result";
import { MovementIcon } from "./MovementIcon";
import { ReactNode, Key } from "react";

const columns = {
    "Rank": {
        render: ({rank, previousRank}: LeagueTableRow): ReactNode => (
            <div className="flex items-center gap-1">
                {rank}
                <MovementIcon currentRank={rank} previousRank={previousRank}/>
            </div>
        ),
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => a.rank - b.rank
    },
    "Team & Manager": {
        render: ({manager, team}: LeagueTableRow): ReactNode => (
            <User
                avatarProps={{
                    radius: "lg",
                    src: `./${manager.id}.jpg`,
                }}
                description={
                    <>
                        {manager.name}{" "}
                        <Records records={manager.record} />
                    </>
                }
                name={team}
            />
        ),
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => a.team.localeCompare(b.team)
    },
    "W": {
        render: ({wins}: LeagueTableRow): ReactNode => wins,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => a.wins - b.wins
    },
    "D": {
        render: ({draws}: LeagueTableRow): ReactNode => draws,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => a.draws - b.draws
    },
    "L": {
        render: ({losses}: LeagueTableRow): ReactNode => losses,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => a.losses - b.losses
    },
    "+": {
        render: ({scoreFor}: LeagueTableRow): ReactNode => scoreFor,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => a.scoreFor - b.scoreFor
    },
    "-": {
        render: ({scoreAgainst}: LeagueTableRow): ReactNode => scoreAgainst,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => a.scoreAgainst - b.scoreAgainst
    },
    "+/-": {
        render: ({scoreFor, scoreAgainst}: LeagueTableRow): ReactNode => <>{scoreFor - scoreAgainst}</>,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => (a.scoreFor - a.scoreAgainst) - (b.scoreFor - b.scoreAgainst)
    },
    "Pts": {
        render: ({points}: LeagueTableRow): ReactNode => points,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => a.points
    },
    "xPts": {
        render: ({expectedPoints}: LeagueTableRow): ReactNode => expectedPoints.toFixed(3),
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => a.expectedPoints
    },
    "Pts - xPts": {
        render: ({points, expectedPoints}: LeagueTableRow): ReactNode =>  {
            const diff = points - expectedPoints;
            return <span className={diff > 0 ? "text-success-500" : diff < 0 ? "text-danger-500" : undefined}>{diff > 0 ? "+" : ""}{diff.toFixed(3)}</span>
        },
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => (a.points - a.expectedPoints) - (b.points - b.expectedPoints)
    },
    "xRank": {
        render: ({expectedRank}: LeagueTableRow): ReactNode => expectedRank,
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => a.expectedRank - b.expectedRank
    },
    "Rank - xRank": {
        render: ({rank, expectedRank}: LeagueTableRow): ReactNode => {
            const diff = rank - expectedRank
            return <span className={diff > 0 ? "text-success-500" : diff < 0 ? "text-danger-500" : undefined}>{diff > 0 ? "+" : ""}{diff}</span>
        },
        sort: (a: LeagueTableRow, b: LeagueTableRow): number => (a.rank - a.expectedRank) - (b.rank - b.expectedRank)
    },
    "Form": {
        //TODO tidy up duplication etc, can possibly add some weighting for more recent games?
        render: ({id, matches}: LeagueTableRow) => {
            const mostRecent = matches.sort((a, b) => b.event - a.event).slice(0, 4)
            const isWinner = (m: Match) => id === m.league_entry_1 && m.league_entry_1_points > m.league_entry_2_points || id === m.league_entry_2 && m.league_entry_2_points > m.league_entry_1_points
            const isDraw = (m: Match) => m.league_entry_1_points === m.league_entry_2_points
            return <div className="flex gap-[0.1rem]">
                {mostRecent.map(match => <Result result={isWinner(match) ? "win" : isDraw(match) ? "draw" : "loss"}/>)}
            </div>
        },
        sort: (a: LeagueTableRow, b: LeagueTableRow) => {
            const isWinner = (id: number, m: Match) => id === m.league_entry_1 && m.league_entry_1_points > m.league_entry_2_points || id === m.league_entry_2 && m.league_entry_2_points > m.league_entry_1_points
            const isDraw = (m: Match) => m.league_entry_1_points === m.league_entry_2_points
            const formSum = (id: number, matches: Match[]): number => {
                return matches.reduce((a, b) => a + (isWinner(id, b) ? 3 : isDraw(b) ? 1 : 0), 0)
            }
            const mostRecent = (matches: Match[]) => matches.sort((a, b) => b.event - a.event).slice(0, 4)
            return formSum(a.id, mostRecent(a.matches)) - formSum(b.id, mostRecent(b.matches))
        }

    }
}
type Column = keyof typeof columns
const isColumn = (key: Key | undefined): key is Column => typeof key === 'string' && Object.keys(columns).includes(key)


export const App = () => {
    const { isLoading, error, data } = useQuery(
        "leagueDetails",
        getTable
    );
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "Rank",
        direction: "ascending",
    });

    const renderCell = useCallback(
        (row: LeagueTableRow, key: Key) => {
            if (isColumn(key)) {
                const { render } = columns[key]
                return render(row)
            } else {
                return null
            }
        },
        []
    );

    const sortedItems = useMemo(() => {
        return [...(data ?? [])].sort((a, b) => {
            const { direction, column } = sortDescriptor
            if (isColumn(column)) {
                const comparison = columns[column].sort(a, b)
                return direction === "descending" ? -comparison : comparison;
            } else {
                return 0
            }
        });
    }, [sortDescriptor, data]);

    if (isLoading) return "Loading...";
    if (error || data === undefined) {
        return "Error";
    }

    return (
        <main className="h-screen w-screen flex items-center justify-center">
            <div className="w-4/5">
                <h1 className="text-3xl font-semibold p-2">A Real Sport 2023/24</h1>
                <Table
                    aria-label="Example table with custom cells"
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                >
                    <TableHeader columns={Object.keys(columns).map(c => ({key: c, label: c}))}>
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
