import { useState } from "react";
import { Data, LineGraph } from "./LineGraph";
import { Entry, MANAGERS } from "../../../domain";
import { StandingsRow } from "../domain";
import { range } from "../../../helpers";
import { Manager } from "../../Manager";

export interface Props {
    standings: Map<number, Map<number, StandingsRow>>;
    gameweek: number;
    entries: Entry[];
}

const buildGraphData = (
    standings: Map<number, Map<number, StandingsRow>>,
    gameweek: number,
    selectedEntries: number[],
    color?: string
): Data[] => {
    const gameweeks = range(gameweek + 1);

    const foo: Record<number, { x: number; y: number }[]> = {};
    gameweeks.map((gameweek) => {
        const standingsForWeek = standings.get(gameweek) ?? new Map();
        for (const [teamId, standing] of standingsForWeek) {
            if (selectedEntries.includes(teamId)) {
                const point = { x: gameweek, y: standing.position };
                const existingPoints = foo[teamId];
                if (existingPoints) {
                    existingPoints.push(point);
                } else {
                    foo[teamId] = [point];
                }
            }
        }
    });

    return Object.entries(foo).map(([id, points], idx) => ({
        id: "foo",
        color:
            color ??
            MANAGERS.find((m) => Object.values(m.teams).includes(+id))?.color ??
            "#000",
        points,
    }));
};

export const LeaguePositionGraph = ({
    entries,
    standings,
    gameweek,
}: Props) => {
    const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
    const [hovered, setHovered] = useState<number | undefined>(undefined);
    return (
        <>
            <LineGraph
                title="League Position by Gameweek"
                data={[
                    ...buildGraphData(
                        standings,
                        gameweek,
                        entries.map((e) => e.id),
                        "#e5e7eb"
                    ),
                    ...buildGraphData(
                        standings,
                        gameweek,
                        selectedEntries.concat(
                            hovered !== undefined ? [hovered] : []
                        )
                    ),
                ]}
                xConfig={{
                    title: "Gameweek",
                    direction: "ASC",
                    min: 1,
                }}
                yConfig={{
                    title: "Position",
                    direction: "DESC",
                    min: 1,
                }}
            />
            <div className="flex flex-wrap gap-4 p-2 bg-default/20 rounded-medium">
                {entries.map((entry) => (
                    <div
                        className="cursor-pointer"
                        onClick={() =>
                            setSelectedEntries((entries) => {
                                if (entries.includes(entry.id)) {
                                    return entries.filter(
                                        (e) => e !== entry.id
                                    );
                                } else {
                                    return [...entries, entry.id];
                                }
                            })
                        }
                        onMouseEnter={() => setHovered(entry.id)}
                        onMouseLeave={() => setHovered(undefined)}
                    >
                        <Manager
                            manager={entry.manager}
                            teamName={entry.name}
                            border={
                                selectedEntries.includes(entry.id) ||
                                hovered === entry.id
                                    ? entry.manager.color
                                    : undefined
                            }
                        />
                    </div>
                ))}
            </div>
        </>
    );
};
