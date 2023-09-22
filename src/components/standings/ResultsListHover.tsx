import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Divider,
    Tooltip,
} from "@nextui-org/react";
import { Entry, Match } from "../../domain";
import { Manager } from "../Manager";

export interface Props {
    entry: Entry;
    matches: Match[];
    result: "won" | "lost" | "drawn";
}

export const ResultsListHover = ({
    entry: {id, name, manager },
    matches,
    result,
}: Props) => {
    const { length } = matches;
    const description = `${length} match${length !== 1 ? "es" : ""} ${result}`;
    const sortedMatches = matches.sort(Match.sort).reverse();
    return (
        <Tooltip
            content={
                <div className="pt-2">
                    <Manager
                        id={manager.id}
                        description={description}
                        teamName={name}
                    />
                    {length > 0 ? (
                        <>
                            <Divider className="m-1" />
                            <Table
                                removeWrapper
                                hideHeader
                                className="max-h-64 overflow-y-auto overflow-x-hidden scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-default-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-default-300 scrollbar-track:!rounded"
                            >
                                <TableHeader>
                                    <TableColumn>Game week</TableColumn>
                                    <TableColumn>Score</TableColumn>
                                    <TableColumn>Opposition</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {sortedMatches.map((match) => {
                                        const alignment = Match.getAlignment(match, id)
                                        if (alignment !== undefined) {
                                            const { team, opposition } = alignment;
                                            return (
                                                <TableRow
                                                    key={`${match.season}-${match.gameWeek}`}
                                                >
                                                    <TableCell>
                                                        <span className="text-foreground-400">
                                                            {match.gameWeek}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span>
                                                            {team.points} -{" "}
                                                            {opposition.points}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Manager
                                                            manager={
                                                                opposition.manager
                                                            }
                                                            teamName={
                                                                opposition.name
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        } else {
                                            return <></>;
                                        }
                                    })}
                                </TableBody>
                            </Table>
                        </>
                    ) : null}
                </div>
            }
        >
            <span>{length}</span>
        </Tooltip>
    );
};
