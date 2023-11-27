import { Entry } from "../../../domain";
import { StandingsRow } from "../domain";
import { ELOGraph } from "./ELOGraph";
import { FairPointsDifference } from "./FairPointsDifference";
import { FairPositionDifference } from "./FairPositionDifference";
import { LeaguePositionGraph } from "./LeaguePositionGraph";
import { PointsFor } from "./PointsFor";

export const GRAPHS = ["League Position by Gameweek", "Points For by Gameweek", "Fair Points Difference by Gameweek", "Fair Position Difference by Gameweek", "ELO"]
export type Graph = typeof GRAPHS[number]

export interface Props {
    graph: Graph
    standings: Map<number, Map<number, StandingsRow>>;
    gameweek: number;
    entries: Entry[];
}

export const StandingsGraph = ({graph, standings, gameweek, entries}: Props) => {
    switch (graph) {
        case "League Position by Gameweek":
            return <LeaguePositionGraph standings={standings} gameweek={gameweek} entries={entries} />
        case "Points For by Gameweek":
            return <PointsFor standings={standings} gameweek={gameweek} entries={entries} />
        case "Fair Points Difference by Gameweek":
            return <FairPointsDifference standings={standings} gameweek={gameweek} entries={entries} />
        case "Fair Position Difference by Gameweek":
            return <FairPositionDifference standings={standings} gameweek={gameweek} entries={entries} />
        case "ELO":
            return <ELOGraph standings={standings} gameweek={gameweek} entries={entries} />
    }
}


