import { TableRow } from "@nextui-org/react";
import { indexBy, rankBy } from "./helpers";
import { Match as FPLMatch, LeagueDetails, Season, Entry } from "./api/domain";

export interface NotablePlacement {
    season: string;
    position: number;
}

export interface Manager {
    id: number;
    name: string;
    teams: Record<Season, number>;
    notablePlacements: NotablePlacement[];
}
export const MANAGERS = [
    {
        id: 1,
        name: "Ed Brett",
        teams: {
            "2021/22": 154306,
            "2022/23": 1,
            "2023/24": 115199,
        },
        notablePlacements: [],
    },
    {
        id: 2,
        name: "Alex Harrison",
        teams: {
            "2021/22": 154519,
            "2022/23": 3,
            "2023/24": 115222,
        },
        notablePlacements: [{ season: "2021/22", position: 1 }],
    },
    {
        id: 3,
        name: "Ollie Craig",
        teams: {
            "2021/22": 154677,
            "2022/23": 4,
            "2023/24": 116308,
        },
        notablePlacements: [],
    },
    {
        id: 4,
        name: "Charlie Schofield",
        teams: {
            "2021/22": 201935,
            "2022/23": 6,
            "2023/24": 118328,
        },
        notablePlacements: [{ season: "2022/23", position: 1 }],
    },
    {
        id: 5,
        name: "Simon Bidwell",
        teams: {
            "2021/22": 208300,
            "2022/23": 12,
            "2023/24": 123888,
        },
        notablePlacements: [{ season: "2019/20", position: 1 }],
    },
    {
        id: 6,
        name: "Anjit Aulakh",
        teams: {
            "2021/22": 154909,
            "2022/23": 5,
            "2023/24": 139985,
        },
        notablePlacements: [{ season: "2020/21", position: 1 }],
    },
    {
        id: 7,
        name: "Aaron Veale",
        teams: {
            "2021/22": 154352,
            "2022/23": 2,
            "2023/24": 140440,
        },
        notablePlacements: [{ season: "2021/22", position: 12 }],
    },
    {
        id: 8,
        name: "Sebastian Waters",
        teams: {
            "2021/22": 206495,
            "2022/23": 9,
            "2023/24": 142413,
        },
        notablePlacements: [],
    },
    {
        id: 9,
        name: "Alexander Greenhalgh",
        teams: {
            "2021/22": 205525,
            "2022/23": 7,
            "2023/24": 142602,
        },
        notablePlacements: [],
    },
    {
        id: 10,
        name: "Sam Senior",
        teams: {
            "2021/22": 207042,
            "2022/23": 10,
            "2023/24": 147306,
        },
        notablePlacements: [
            { season: "2020/21", position: 12 },
            { season: "2022/23", position: 12 },
        ],
    },
    {
        id: 11,
        name: "Ben Malpass",
        teams: {
            "2021/22": 206241,
            "2022/23": 8,
            "2023/24": 150040,
        },
        notablePlacements: [],
    },
    {
        id: 12,
        name: "Luke Trevett",
        teams: {
            "2021/22": 208287,
            "2022/23": 11,
            "2023/24": 169965,
        },
        notablePlacements: [],
    },
];
export const Manager = {
    //TODO change this to a constant rather than a function in the form Record<Season, Record<number, Manager>>
    getManagersForSeason: (season: Season): Map<number, Manager> =>
        MANAGERS.reduce((acc, manager) => {
            acc.set(manager.teams[season], manager);
            return acc;
        }, new Map()),
    byId: indexBy(MANAGERS, (manager) => manager.id),
};

export interface Match {
    season: Season;
    gameWeek: number;
    status: "scheduled" | "live" | "finished";
    teamOne: {
        id: number;
        name: string;
        manager: Manager;
        points: number;
    };
    teamTwo: {
        id: number;
        name: string;
        manager: Manager;
        points: number;
    };
}
export const Match = {
    from: (
        fplMatch: FPLMatch,
        season: Season,
        teams: Map<number, Entry>
    ): Match | undefined => {
        const {
            event,
            finished,
            started,
            league_entry_1: oneId,
            league_entry_1_points: onePoints,
            league_entry_2: twoId,
            league_entry_2_points: twoPoints,
        } = fplMatch;
        const managers = Manager.getManagersForSeason(season);
        const managerOne = managers.get(oneId);
        const managerTwo = managers.get(twoId);
        const teamNameOne = teams.get(oneId)?.entry_name;
        const teamNameTwo = teams.get(twoId)?.entry_name;
        if (managerOne && managerTwo && teamNameOne && teamNameTwo) {
            return {
                season,
                gameWeek: event,
                status: finished ? "finished" : started ? "live" : "scheduled",
                teamOne: {
                    id: oneId,
                    name: teamNameOne,
                    manager: managerOne,
                    points: onePoints,
                },
                teamTwo: {
                    id: twoId,
                    name: teamNameTwo,
                    manager: managerTwo,
                    points: twoPoints,
                },
            };
        } else {
            return undefined;
        }
    },
    sort: (a: Match, b: Match): number =>
        Season.sort(a.season, b.season) || a.gameWeek - b.gameWeek,
    //TODO tidy this up as the ternaries are getting messy
    getWinner: ({ teamOne, teamTwo, status }: Match) =>
        status === "finished"
            ? teamOne.points > teamTwo.points
                ? teamOne
                : teamTwo.points > teamOne.points
                ? teamTwo
                : undefined
            : undefined,
    getLoser: ({ teamOne, teamTwo, status }: Match) =>
        status === "finished"
            ? teamOne.points > teamTwo.points
                ? teamTwo
                : teamTwo.points > teamOne.points
                ? teamOne
                : undefined
            : undefined,
    isWinner: (match: Match, teamId: number): boolean =>
        Match.getWinner(match)?.id === teamId,
    isLoser: (match: Match, teamId: number): boolean =>
        Match.getLoser(match)?.id === teamId,
    isDraw: ({
        teamOne: { points: teamOnePoints },
        teamTwo: { points: teamTwoPoints },
        status,
    }: Match): boolean =>
        status === "finished" && teamOnePoints === teamTwoPoints,
    resultForTeam: (
        match: Match,
        teamId: number
    ): "win" | "draw" | "loss" | undefined =>
        Match.isDraw(match)
            ? "draw"
            : Match.isWinner(match, teamId)
            ? "win"
            : Match.isLoser(match, teamId)
            ? "loss"
            : undefined,
    getTeam: ({ teamOne, teamTwo }: Match, teamId: number) =>
        teamOne.id === teamId
            ? teamOne
            : teamTwo.id === teamId
            ? teamTwo
            : undefined,
    getOpposition: ({ teamOne, teamTwo }: Match, teamId: number) =>
        teamOne.id === teamId
            ? teamTwo
            : teamTwo.id === teamId
            ? teamOne
            : undefined,
};

export const calculateExpectedPointsForGameWeek = (
    matches: FPLMatch[],
    gameWeek: number,
    allPossibleMatches: [number, number][],
    teamIds: number[]
): Map<number, number> => {
    const gameWeekScores = matches
        .filter((match) => match.event === gameWeek)
        .reduce((acc, match) => {
            acc.set(match.league_entry_1, match.league_entry_1_points);
            acc.set(match.league_entry_2, match.league_entry_2_points);
            return acc;
        }, new Map());
    const pointsForWeek = allPossibleMatches.reduce((acc, [teamA, teamB]) => {
        const teamATotal = acc.get(teamA) ?? 0;
        const teamBTotal = acc.get(teamB) ?? 0;
        const teamAPoints = gameWeekScores.get(teamA) ?? 0;
        const teamBPoints = gameWeekScores.get(teamB) ?? 0;
        if (teamAPoints > teamBPoints) {
            acc.set(teamA, teamATotal + 3);
        } else if (teamBPoints > teamAPoints) {
            acc.set(teamB, teamBTotal + 3);
        } else {
            acc.set(teamA, teamATotal + 1);
            acc.set(teamB, teamBTotal + 1);
        }
        return acc;
    }, new Map());
    return teamIds.reduce((acc, teamId) => {
        const expectedPoints =
            (pointsForWeek.get(teamId) ?? 0) / (teamIds.length - 1);
        acc.set(teamId, expectedPoints);
        return acc;
    }, new Map());
};

const getAllUniquePairs = (ids: number[]): [number, number][] => {
    const allPossibleMatches: [number, number][] = [];
    for (let i = 0; i < ids.length; i++) {
        const team = ids[i];
        for (let j = i + 1; j < ids.length; j++) {
            const opponent = ids[j];
            const game = [team, opponent] as [number, number];
            allPossibleMatches.push(game);
        }
    }
    return allPossibleMatches;
};

export const calculateExpectedPoints = (
    teamIds: number[],
    matches: FPLMatch[]
): Map<number, number> => {
    const allPossibleMatches = getAllUniquePairs(teamIds);
    const finishedMatches = matches.filter((m) => m.finished);
    const lastCompletedGameWeek = Math.max(
        ...finishedMatches.map((m) => m.event)
    );
    const matchesByGameWeek = finishedMatches.reduce((acc, match) => {
        const { event } = match;
        const matches = acc.get(event) ?? [];
        acc.set(event, [...matches, match]);
        return acc;
    }, new Map());
    return [...Array(lastCompletedGameWeek).keys()]
        .map((idx) => {
            const gameWeek = idx + 1;
            const matches = matchesByGameWeek.get(gameWeek) ?? [];
            return calculateExpectedPointsForGameWeek(
                matches,
                gameWeek,
                allPossibleMatches,
                teamIds
            );
        })
        .reduce((acc, gameWeekExpectedPoints) => {
            for (const [teamId, points] of gameWeekExpectedPoints) {
                const currentPoints = acc.get(teamId) ?? 0;
                acc.set(teamId, currentPoints + points);
            }
            return acc;
        }, new Map());
};

export interface SeasonRecord {
    entryId: number;
    managerId: number;
    teamName: string;
    wins: number; //TODO should this be an array of matches instead? Same for draws and losses
    draws: number;
    losses: number;
    scoreFor: number;
    scoreAgainst: number;
    points: number;
    expectedPoints: number;
    matches: Match[];
}

export interface TableRow {
    id: number;
    position: number;
    previousPosition: number | undefined;
    team: string;
    manager: Manager;
    wins: number;
    draws: number;
    losses: number;
    scoreFor: number;
    scoreAgainst: number;
    points: number;
    expectedPoints: number;
    expectedPosition: number;
    matches: Match[];
    waiverPick: number | undefined;
}
//TODO change this to take an object instead so the DX is nicer
export const buildTableRow = (
    manager: Manager,
    position: number,
    previousPosition: number | undefined,
    expectedPosition: number,
    {
        entryId,
        wins,
        draws,
        losses,
        scoreFor,
        scoreAgainst,
        points,
        expectedPoints,
        matches,
        teamName,
    }: SeasonRecord
): TableRow => ({
    id: entryId,
    position,
    previousPosition,
    manager,
    wins,
    losses,
    draws,
    scoreFor,
    scoreAgainst,
    points,
    expectedPoints,
    expectedPosition,
    matches,
    team: teamName,
    waiverPick: 0,
});

export const buildSeasonRecords = (
    { league_entries, standings, matches }: LeagueDetails,
    season: Season
): SeasonRecord[] => {
    const managers = Manager.getManagersForSeason(season);
    const standingsByTeamId = indexBy(standings, (s) => s.league_entry);

    const matchesByTeam = matches.reduce((acc, match) => {
        const teamA = match.league_entry_1;
        const teamB = match.league_entry_2;
        const teamAMatches = acc.get(teamA) ?? [];
        const teamBMatches = acc.get(teamB) ?? [];
        acc.set(teamA, [...teamAMatches, match]);
        acc.set(teamB, [...teamBMatches, match]);
        return acc;
    }, new Map<number, FPLMatch[]>());
    const teams = indexBy(league_entries, (le) => le.id);
    const teamIds = league_entries.map((le) => le.id);
    const expectedPointsByTeamId = calculateExpectedPoints(teamIds, matches);
    return league_entries.reduce<SeasonRecord[]>((acc, entry) => {
        const { id, entry_name } = entry;
        const manager = managers.get(id);
        const standing = standingsByTeamId.get(id);
        const expectedPoints = expectedPointsByTeamId.get(id) ?? 0;
        const fplMatches = matchesByTeam.get(id) ?? [];
        const matches = fplMatches
            .map((m) => Match.from(m, season, teams))
            .filter((m): m is Match => m !== undefined);
        if (standing && manager) {
            acc.push({
                entryId: id,
                teamName: entry_name,
                managerId: manager.id,
                wins: standing.matches_won,
                draws: standing.matches_drawn,
                losses: standing.matches_lost,
                scoreFor: standing.points_for,
                scoreAgainst: standing.points_against,
                points: standing.total,
                expectedPoints: expectedPoints,
                matches: matches,
            });
        }
        return acc;
    }, []);
};

export const buildTable = (
    leagueDetails: [Season, LeagueDetails][]
): TableRow[] => {
    const seasonRecordsBySeason: SeasonRecord[][] = leagueDetails.map(
        ([season, leagueDetails]) => buildSeasonRecords(leagueDetails, season)
    );
    const seasonRecordsByManager: Map<number, SeasonRecord[]> =
        seasonRecordsBySeason.reduce((acc, records) => {
            records.forEach((record) => {
                const existingRecords = acc.get(record.managerId) ?? [];
                acc.set(record.managerId, [...existingRecords, record]);
            });
            return acc;
        }, new Map());
    const mergedRecords: SeasonRecord[] = [
        ...seasonRecordsByManager.values(),
    ].map((records) =>
        records.reduce((a, b) => ({
            entryId: a.entryId, //TODO how to handle
            managerId: a.managerId,
            teamName: `${a.teamName}, ${b.teamName}`, //TODO can merge here maybe
            wins: a.wins + b.wins,
            draws: a.draws + b.draws,
            losses: a.losses + b.losses,
            scoreFor: a.scoreFor + b.scoreFor,
            scoreAgainst: a.scoreAgainst + b.scoreAgainst,
            points: a.points + b.points,
            expectedPoints: a.expectedPoints + b.expectedPoints,
            matches: [...a.matches, ...b.matches],
        }))
    );
    const pointsPositionByManagerId = rankBy(
        mergedRecords,
        (a, b) => b.points - a.points || b.scoreFor - a.scoreFor,
        (row) => row.managerId
    );
    const expectedPointsPositionByManagerId = rankBy(
        mergedRecords,
        (a, b) => b.expectedPoints - a.expectedPoints,
        (row) => row.managerId
    );
    const tableRows: TableRow[] = mergedRecords
        .map((sr) => {
            const { managerId } = sr;
            const position = pointsPositionByManagerId.get(managerId) ?? 0;
            const previousPosition = undefined;
            const expectedRank =
                expectedPointsPositionByManagerId.get(managerId) ?? 0;
            const manager = Manager.byId.get(managerId);
            if (manager) {
                return buildTableRow(
                    manager,
                    position,
                    previousPosition,
                    expectedRank,
                    sr
                );
            } else {
                return undefined;
            }
        })
        .filter((tr): tr is TableRow => tr !== undefined);
    return tableRows;
};
