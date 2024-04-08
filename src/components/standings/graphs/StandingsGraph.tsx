import { Entry } from "../../../domain";
import { StandingsRow } from "../../standingstable/StandingsTable";
import { ForAgainstAndDifferenceBarChart } from "./ForAgainstAndDifferenceBarChart";
import { LineGraph } from "./LineGraph";

export const GRAPHS = [
    "League Position by Gameweek",
    "Fair League Position by Gameweek",
    "Points For by Gameweek",
    "Fair Points Difference by Gameweek",
    "Fair Position Difference by Gameweek",
    "ELO",
    "Points Difference",
    "Total Waivers by Gameweek"
];
export type Graph = (typeof GRAPHS)[number];

export interface Props {
    graph: Graph;
    standings: Map<number, Map<number, StandingsRow>>;
    gameweek: number;
    entries: Entry[];
}

export const StandingsGraph = ({
    graph,
    standings,
    gameweek,
    entries,
}: Props) => {
    switch (graph) {
        case "League Position by Gameweek":
            return (
                <LineGraph
                    title={graph}
                    standings={standings}
                    gameweek={gameweek}
                    entries={entries}
                    getY={(row) => row.position}
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
            );
        case "Fair League Position by Gameweek":
            return (
                <LineGraph
                    title={graph}
                    standings={standings}
                    gameweek={gameweek}
                    entries={entries}
                    getY={(row) => row.fairPosition}
                    xConfig={{
                        title: "Gameweek",
                        direction: "ASC",
                        min: 1,
                    }}
                    yConfig={{
                        title: "Fair Position",
                        direction: "DESC",
                        min: 1,
                    }}
                />
            );
        case "Total Waivers by Gameweek":
            return (
                <LineGraph
                    title={graph}
                    standings={standings}
                    gameweek={gameweek}
                    entries={entries}
                    getY={(row) => row.totalWaivers ?? 0}
                    initialPoint={{ x: 0, y: 0 }}
                    xConfig={{
                        title: "Gameweek",
                        direction: "ASC",
                        min: 0,
                    }}
                    yConfig={{
                        title: "Total Waivers",
                        direction: "ASC",
                        ticks: 10
                    }}
                />
            );
        case "Points For by Gameweek":
            return (
                <LineGraph
                    title={graph}
                    standings={standings}
                    gameweek={gameweek}
                    entries={entries}
                    getY={(row) => row.pointsScoreFor}
                    initialPoint={{ x: 0, y: 0 }}
                    xConfig={{
                        title: "Gameweek",
                        direction: "ASC",
                        min: 0,
                    }}
                    yConfig={{
                        title: "Points For",
                        direction: "ASC",
                        min: 0,
                        ticks: 10,
                    }}
                />
            );
        case "Fair Points Difference by Gameweek":
            return (
                <LineGraph
                    title={graph}
                    standings={standings}
                    gameweek={gameweek}
                    entries={entries}
                    getY={(row) => row.points - row.fairPoints}
                    initialPoint={{ x: 0, y: 0 }}
                    xConfig={{
                        title: "Gameweek",
                        direction: "ASC",
                    }}
                    yConfig={{
                        title: "Fair Points Difference",
                        direction: "ASC",
                    }}
                />
            );
        case "Fair Position Difference by Gameweek":
            return (
                <LineGraph
                    title={graph}
                    standings={standings}
                    gameweek={gameweek}
                    entries={entries}
                    getY={(row) => row.position - row.fairPosition}
                    initialPoint={{ x: 0, y: 0 }}
                    xConfig={{
                        title: "Gameweek",
                        direction: "ASC",
                    }}
                    yConfig={{
                        title: "Fair Position Difference",
                        direction: "ASC",
                    }}
                />
            );
        case "ELO":
            return (
                <LineGraph
                    title={graph}
                    standings={standings}
                    gameweek={gameweek}
                    entries={entries}
                    getY={(row) => row.elo}
                    initialPoint={{ x: 0, y: 1500 }}
                    xConfig={{
                        title: "Gameweek",
                        direction: "ASC",
                    }}
                    yConfig={{
                        title: "ELO Rating",
                        direction: "ASC",
                        ticks: 10,
                    }}
                />
            );
        case "Points Difference":
            return (
                <ForAgainstAndDifferenceBarChart
                    title={graph}
                    data={[
                        ...(standings.get(gameweek) ?? new Map()).values(),
                    ].map((r) => ({
                        scoreFor: r.pointsScoreFor,
                        scoreAgainst: r.pointsScoreAgainst,
                        difference: r.pointsScoreFor - r.pointsScoreAgainst,
                        entry: r.entry,
                    }))}
                />
            );
    }
};
