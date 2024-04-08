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
import { BootstrapStatic, Choice, ChoicesResponse, ElementStatusResponse, Fixture, Transaction, TransactionResponse } from "./api/domain"; //TODO replace this with my own domain object

export interface SeasonContext {
    leagueDetails: LeagueDetails;
    teams: Team[];
    players: Player[];
    playerStatuses: PlayerStatus[];
    positions: Position[];
    managers: Manager[];
    draft: Choice[] | "Unknown";
    transactions: Transaction[] | "Unknown";
    currentGameweek: number | undefined;
    getTeam: (teamId: number) => Team | undefined;
    getPlayerStatus: (playerId: number) => PlayerStatus | undefined;
    getEntry: (entryId: number) => Entry | undefined;
    getPosition: (id: number) => Position | undefined;
    getGames: (gameweek: number, teamId: number) => Fixture[];
    getDraftInfo: (playerId: number) => "Unknown" | Choice | undefined;
    getPlayer: (playerId: number) => Player | undefined;
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
    playerStatus,
    draft,
    transactions
}: {
    children: ReactNode;
    leagueDetails: LeagueDetails | undefined;
    bootstrap: BootstrapStatic | undefined;
    playerStatus: ElementStatusResponse | undefined;
    draft: ChoicesResponse | undefined;
    transactions: TransactionResponse | undefined;
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
    const draftChoices = draft === undefined ? "Unknown" : draft.choices;
    const draftByPlayerId = indexBy(draftChoices === "Unknown" ? [] : draftChoices, (choice) => choice.element);
    const players = bootstrap.elements.map((p) => Player.build(p));
    const playersById = indexBy(players, p => p.id);

    const ctx: SeasonContext = {
        leagueDetails: leagueDetails,
        teams: bootstrap.teams,
        players: players,
        positions: bootstrap.element_types,
        playerStatuses: playerStatus.element_status,
        managers: MANAGERS,
        draft: draftChoices,
        transactions: transactions === undefined ? "Unknown" : transactions.transactions,
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
        getDraftInfo: draftChoices === "Unknown" ? () => "Unknown" : (playerId) => draftByPlayerId.get(playerId),
        getPlayer: (id) => playersById.get(id)
    };

    return (
        <SeasonContext.Provider value={ctx}>{children}</SeasonContext.Provider>
    );
};
