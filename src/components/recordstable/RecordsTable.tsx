import { Key, ReactNode, useCallback, useState, useMemo } from "react";
import { Manager, Match } from "../../domain";
import { Manager as ManagerComponent } from "../Manager";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    SortDescriptor,
    Tooltip,
} from "@nextui-org/react";
import { Result } from "../standingstable/Result";
import { Link } from "wouter";

export interface RecordsRow {
    key: Key;
    manager: Manager;
    played: Match[];
    wins: Match[];
    draws: Match[];
    losses: Match[];
}

interface Column {
    key: string;
    abbr?: string;
    render: (row: RecordsRow) => ReactNode;
    sort?: (a: RecordsRow, b: RecordsRow) => number;
}

const COLUMNS: Column[] = [
    {
        key: "Manager",
        render: ({ manager }) => (
            <Link
                className="hover:text-foreground-400"
                to={`~/fpl/league/1/manager/${manager.id}`}
            >
                {manager.name}
            </Link>
        ),
        sort: (a, b) => a.manager.name.localeCompare(b.manager.name),
    },
    {
        key: "Played",
        abbr: "P",
        render: ({ played }) => played.length,
        sort: (a, b) => a.played.length - b.played.length,
    },
    {
        key: "Wins",
        abbr: "W",
        render: ({ wins }) => wins.length,
        sort: (a, b) => a.wins.length - b.wins.length,
    },
    {
        key: "Draws",
        abbr: "D",
        render: ({ draws }) => draws.length,
        sort: (a, b) => a.draws.length - b.draws.length,
    },
    {
        key: "Losses",
        abbr: "L",
        render: ({ losses }) => losses.length,
        sort: (a, b) => a.losses.length - b.losses.length,
    },
    {
        key: "Win %",
        abbr: "W%",
        render: ({ wins, played }) =>
            ((wins.length / played.length) * 100).toFixed(1) + "%",
        sort: (a, b) =>
            a.wins.length / a.played.length - b.wins.length / b.played.length,
    },
    {
        key: "Draw %",
        abbr: "D%",
        render: ({ draws, played }) =>
            ((draws.length / played.length) * 100).toFixed(1) + "%",
        sort: (a, b) =>
            a.draws.length / a.played.length - b.draws.length / b.played.length,
    },
    {
        key: "Loss %",
        abbr: "L%",
        render: ({ losses, played }) =>
            ((losses.length / played.length) * 100).toFixed(1) + "%",
        sort: (a, b) =>
            a.losses.length / a.played.length -
            b.losses.length / b.played.length,
    },
    {
        //TODO share parts of this with the one in Standings table
        key: "Form",
        render: ({ manager, played }) => {
            const mostRecent = played.sort(Match.sort).slice(-4);
            return (
                <div className="flex gap-[0.1rem]">
                    {mostRecent.map((match, i) => {
                        const entryId = manager.teams[match.season];
                        const alignment = Match.getAlignment(match, entryId);
                        if (alignment) {
                            const { team: opposition, opposition: team } =
                                alignment;
                            return (
                                <Tooltip
                                    delay={600}
                                    key={i}
                                    content={
                                        <div className="flex flex-col p-1">
                                            <div className="text-tiny uppercase font-medium text-foreground-400 pb-1">
                                                {match.season} - Gameweek{" "}
                                                {match.gameWeek}
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                {team.points}-
                                                {opposition.points}
                                                <ManagerComponent
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
                                                team.id
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
    },
];

export interface Props {
    records: RecordsRow[];
    topContent?: ReactNode;
}

export const RecordsTable = ({ records, topContent }: Props) => {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "Win %",
        direction: "descending",
    });

    const renderCell = useCallback(
        (row: RecordsRow, key: Key) =>
            COLUMNS.find((col) => col.key === key)?.render(row),
        []
    );

    const sorted = useMemo(
        () =>
            records.sort((a, b) => {
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
        [records, sortDescriptor]
    );

    return (
        <Table
            aria-label="Standings"
            isHeaderSticky
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
            classNames={{
                wrapper:
                    "overflow-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-default-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-default-300 scrollbar-track:!rounded",
            }}
            topContent={topContent}
        >
            <TableHeader columns={COLUMNS}>
                {({ abbr, key, sort }) => (
                    <TableColumn key={key} allowsSorting={sort !== undefined}>
                        {abbr ?? key}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody items={sorted}>
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
