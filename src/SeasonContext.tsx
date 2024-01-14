import { createContext, useContext, ReactNode } from "react";
import {
    LeagueDetails,
    Manager,
    Player,
    Team,
    Position,
    PlayerStatus,
    MANAGERS,
    Entry,
} from "./domain";
import { indexBy } from "./helpers";
import { BootstrapStatic, ElementStatus, ElementStatusResponse, Fixture } from "./api/domain"; //TODO replace this with my own domain object

export interface SeasonContext {
    leagueDetails: LeagueDetails;
    teams: Team[];
    players: Player[];
    playerStatuses: PlayerStatus[];
    positions: Position[];
    managers: Manager[];
    currentGameweek: number | undefined;
    getTeam: (teamId: number) => Team | undefined;
    getPlayerStatus: (playerId: number) => PlayerStatus | undefined;
    getEntry: (entryId: number) => Entry | undefined;
    getPosition: (id: number) => Position | undefined;
    getGames: (gameweek: number, teamId: number) => Fixture[];
    //TODO add a getManager onto here too
}

const SeasonContext = createContext<SeasonContext | null>(null);

export const useSeasonContext = () => {
    const ctx = useContext(SeasonContext);
    if (ctx === null) {
        throw Error("TODO");
    }
    return ctx;
};

export const SeasonContextProvider = ({
    children,
    leagueDetails,
    bootstrap, 
    playerStatus
}: {
    children: ReactNode;
    leagueDetails: LeagueDetails | undefined;
    bootstrap: BootstrapStatic | undefined;
    playerStatus: ElementStatusResponse | undefined;
}) => {
    if (
        leagueDetails === undefined ||
        bootstrap == undefined ||
        playerStatus == undefined
    ) {
        return "Error";
    }

    const teams = indexBy(bootstrap.teams, (t) => t.id);
    const statuses = indexBy(playerStatus.element_status, (e) => e.element);
    const positionsById = indexBy(bootstrap.element_types, (et) => et.id);

    const ctx: SeasonContext = {
        leagueDetails: leagueDetails,
        teams: bootstrap.teams,
        players: bootstrap.elements.map((p) => Player.build(p)),
        positions: bootstrap.element_types,
        playerStatuses: playerStatus.element_status,
        managers: MANAGERS,
        currentGameweek:
            bootstrap.events.current === null ? undefined : bootstrap.events.current,
        getTeam: (id) => teams.get(id),
        getPlayerStatus: (id) => statuses.get(id),
        getEntry: (entryId) =>
            leagueDetails.entries.find((entry) => entry.entryId === entryId),
        getPosition: (id) => positionsById.get(id),
        //TODO memoise this?
        getGames: (gameweek, teamId) =>
            bootstrap.fixtures[gameweek]?.filter(
                (f) => f.team_h === teamId || f.team_a === teamId
            ) ?? [],
    };

    return (
        <SeasonContext.Provider value={ctx}>{children}</SeasonContext.Provider>
    );
};
