import { useQuery } from "react-query";
import { LeagueDetails, Standing, getLeagueDetails, userMap } from "./domain";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    User,
    SortDescriptor,
    Tooltip
} from "@nextui-org/react";
import { useCallback, useState, useMemo } from "react";
import { Records } from "./Records";
import { MovementIcon } from "./MovementIcon";

const columns = [
    "Rank",
    "Team & Manager",
    "W",
    "D",
    "L",
    "+",
    "-",
    "+/-",
    "Pts",
    "Fair Pts",
    "Pts - Fair Pts",
    "Fair Rank",
    "Rank - Fair Rank"
] as const;
const columnsWithKeys = columns.map((label) => ({ key: label, label: label }));

export const App = () => {
    const { isLoading, error, data } = useQuery(
        "leagueDetails",
        getLeagueDetails
    );
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "Rank",
        direction: "ascending",
    });

    const entries = useMemo(() => {
        if (data === undefined) {
            return new Map();
        } else {
            return LeagueDetails.getEntries(data);
        }
    }, [data]);

    const renderCell = useCallback(
        (standing: Standing, columnKey: (typeof columns)[number]) => {
            switch (columnKey) {
                case "Rank":
                    return (
                        <div className="flex items-center gap-1">
                            {standing.rank}
                            <MovementIcon currentRank={standing.rank} lastRank={standing.last_rank}/>
                        </div>
                    );
                case "Team & Manager":
                    const entry = entries.get(standing.league_entry);
                    const id = (entry as any).id as number;
                    const user = userMap[id];
                    return (
                        <User
                            avatarProps={{
                                radius: "lg",
                                src: `/${user.id}.jpg`,
                            }}
                            description={
                                <>
                                    {user.name}{" "}
                                    <Records records={user.record} />
                                </>
                            }
                            name={entry.entry_name}
                        />
                    );
                case "W":
                    return standing.matches_won;
                case "D":
                    return standing.matches_drawn;
                case "L":
                    return standing.matches_lost;
                case "+":
                    return standing.points_for;
                case "-":
                    return standing.points_against;
                case "+/-":
                    return standing.points_for - standing.points_against;
                case "Pts":
                    return standing.total;
                case "Fair Pts": {
                    const entry = entries.get(standing.league_entry);
                    const id = (entry as any).id as number;
                    const user = userMap[id];
                    return user.fairPoints
                }
                case "Pts - Fair Pts": {
                    const entry = entries.get(standing.league_entry);
                    const id = (entry as any).id as number;
                    const user = userMap[id];
                    const diff = standing.total - user.fairPoints
                    return <span className={diff > 0 ? "text-success-500" : diff < 0 ? "text-danger-500" : undefined}>{diff > 0 ? "+" : ""}{diff.toFixed(3)}</span>
                }
                case "Fair Rank": {
                    const entry = entries.get(standing.league_entry);
                    const id = (entry as any).id as number;
                    const user = userMap[id];
                    return user.fairPointsRank
                }
                case "Rank - Fair Rank": {
                    const entry = entries.get(standing.league_entry);
                    const id = (entry as any).id as number;
                    const user = userMap[id];
                    const diff = standing.rank - user.fairPointsRank
                    return <span className={diff > 0 ? "text-success-500" : diff < 0 ? "text-danger-500" : undefined}>{diff > 0 ? "+" : ""}{diff}</span>
                }
            }
        },
        [entries]
    );

    const sortedItems = useMemo(() => {
        return [...(data?.standings ?? [])].sort((a, b) => {
            const getComparison = () => {
                switch (sortDescriptor.column) {
                    case "Rank":
                        return a.rank - b.rank;
                    case "Team & Manager":
                        return a.league_entry - b.league_entry;
                    case "W":
                        return a.matches_won - b.matches_won;
                    case "D":
                        return a.matches_drawn - b.matches_drawn;
                    case "L":
                        return a.matches_lost - b.matches_lost;
                    case "+":
                        return a.points_for - b.points_for;
                    case "-":
                        return a.points_against - b.points_against;
                    case "+/-":
                        return (
                            a.points_for -
                            a.points_against -
                            (b.points_for - b.points_against)
                        );
                    case "Pts":
                        return a.total - b.total;
                    case "Fair Pts": {
                        const aentry = entries.get(a.league_entry);
                        const aid = (aentry as any).id as number;
                        const auser = userMap[aid];
                        const bentry = entries.get(b.league_entry);
                        const bid = (bentry as any).id as number;
                        const buser = userMap[bid];
                        return auser.fairPoints - buser.fairPoints
                    }
                    case "Pts - Fair Pts": {
                        const aentry = entries.get(a.league_entry);
                        const aid = (aentry as any).id as number;
                        const auser = userMap[aid];
                        const bentry = entries.get(b.league_entry);
                        const bid = (bentry as any).id as number;
                        const buser = userMap[bid];
                        return (a.total - auser.fairPoints) - (b.total - buser.fairPoints)
                    }
                    case "Fair Rank": {
                        const aentry = entries.get(a.league_entry);
                        const aid = (aentry as any).id as number;
                        const auser = userMap[aid];
                        const bentry = entries.get(b.league_entry);
                        const bid = (bentry as any).id as number;
                        const buser = userMap[bid];
                        return auser.fairPointsRank - buser.fairPointsRank
                    }
                    case "Rank - Fair Rank": {
                        const aentry = entries.get(a.league_entry);
                        const aid = (aentry as any).id as number;
                        const auser = userMap[aid];
                        const bentry = entries.get(b.league_entry);
                        const bid = (bentry as any).id as number;
                        const buser = userMap[bid];
                        return (a.rank - auser.fairPointsRank) - (b.rank - buser.fairPointsRank)
                    }
                    default:
                        return 0;
                }
            };
            const comparison = getComparison();
            return sortDescriptor.direction === "descending"
                ? -comparison
                : comparison;
        });
    }, [sortDescriptor, data, entries]);

    if (isLoading) return "Loading...";
    if (error || data === undefined) {
        return "Error";
    }

    return (
        <main className="h-screen w-screen flex items-center justify-center">
            <div className="w-4/5">
                <h1 className="text-3xl font-semibold p-2">{data.league.name}</h1>
                <Table
                    aria-label="Example table with custom cells"
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                >
                    <TableHeader columns={columnsWithKeys}>
                        {(column) => (
                            <TableColumn key={column.key} allowsSorting>
                                {column.label}
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody items={sortedItems}>
                        {(item) => (
                            <TableRow key={item.league_entry}>
                                {(columnKey) => (
                                    <TableCell>
                                        {renderCell(item, columnKey as any)}
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
