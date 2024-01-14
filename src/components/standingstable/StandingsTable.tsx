import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    SortDescriptor,
} from "@nextui-org/react";
import { useState, useCallback, useMemo, Key, ReactNode } from "react";
import { Column } from "./columns";
import { ColumnHeader } from "../table/ColumnHeader";
import { Entry, Match, Season } from "../../domain";

export interface StandingsRow {
    key: Key;
    season: Season;
    entry: Entry;
    position: number;
    previousPosition: number | undefined;
    played: Match[];
    wins: Match[];
    draws: Match[];
    losses: Match[];
    upcoming: Match | undefined;
    pointsScoreFor: number;
    pointsScoreAgainst: number;
    points: number;
    fairPoints: number;
    fairPosition: number;
    elo: number;
}

export interface Props {
    columns: Column[];
    standings: StandingsRow[];
    defaultSortDescriptor: SortDescriptor;
    topContent?: ReactNode;
}

export const StandingsTable = ({
    columns,
    standings,
    defaultSortDescriptor,
    topContent,
}: Props) => {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>(
        defaultSortDescriptor
    );

    const renderCell = useCallback(
        (row: StandingsRow, key: Key) =>
            columns.find((col) => col.key === key)?.render(row),
        [columns]
    );

    const sortedStandings = useMemo(
        () =>
            standings.sort((a, b) => {
                const { direction, column } = sortDescriptor;
                const col = columns.find((col) => col.key === column);
                if (col && col.sort !== undefined) {
                    const comparison = col.sort(a, b);
                    return direction === "descending"
                        ? -comparison
                        : comparison;
                } else {
                    return 0;
                }
            }),
        [columns, standings, sortDescriptor]
    );

    return (
        <Table
            aria-label="Standings"
            isHeaderSticky
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
            topContent={topContent}
            classNames={{
                wrapper:
                    "overflow-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-default-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-default-300 scrollbar-track:!rounded",
            }}
        >
            <TableHeader columns={columns}>
                {({ key, title, abbr, sort, description }) => (
                    <TableColumn key={key} allowsSorting={sort !== undefined}>
                        <ColumnHeader
                            key={key}
                            columnKey={key}
                            title={title}
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
