import { Match, Entry, LeagueDetails, Season } from "../../domain";
import { groupBy, indexBy, rankBy } from "../../helpers";

export interface StandingsRow {
    season: Season;
    entry: Entry;
    position: number;
    previousPosition: number | undefined;
    played: Match[];
    wins: Match[];
    draws: Match[];
    losses: Match[];
    upcoming: Match[];
    pointsScoreFor: number;
    pointsScoreAgainst: number;
    points: number;
    fairPoints: number;
    fairPosition: number;
    waiverPick: number | undefined;
}

const getUniquePairs = (ids: number[]): [number, number][] => {
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

const calculateExpectedPointsForGameWeek = (
    matches: Match[],
    gameWeek: number,
    allPossibleMatches: [number, number][],
    teamIds: number[]
): Map<number, number> => {
    const gameWeekScores = matches
        .filter((match) => match.gameWeek === gameWeek)
        .reduce((acc, match) => {
            acc.set(match.teamOne.id, match.teamOne.points);
            acc.set(match.teamTwo.id, match.teamTwo.points);
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

const calculateFairPoints = (
    teamIds: number[],
    matches: Match[]
): Map<number, number> => {
    const allPossibleMatches = getUniquePairs(teamIds);
    const finishedMatches = matches.filter((m) => m.status === "finished");
    const lastCompletedGameWeek = Math.max(
        ...finishedMatches.map((m) => m.gameWeek)
    );
    const matchesByGameWeek = groupBy(
        finishedMatches,
        m => m.gameWeek
    )
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


interface Results {
    played: Match[],
    wins: Match[],
    draws: Match[],
    losses: Match[],
    upcoming: Match[],
    pointsScoreFor: number,
    pointsScoreAgainst: number,
    points: number,
    fairPoints: number,
}
const EMPTY_RESULTS: Results = {
    played: [],
    wins: [],
    draws: [],
    losses: [],
    upcoming: [],
    pointsScoreFor: 0,
    pointsScoreAgainst: 0,
    points: 0,
    fairPoints: 0
}
const addToResults = (teamId: number, match: Match, results: Results = EMPTY_RESULTS, fairPoints: number): Results => {
    const alignment = Match.getAlignment(match, teamId);
    const { played, wins, draws, losses, upcoming, pointsScoreFor, pointsScoreAgainst, points} = results
    if (alignment !== undefined && match.status === "finished") {
        const {team, opposition} = alignment;
        const isWinner = Match.isWinner(match, teamId);
        const isDraw = Match.isDraw(match);
        const isLoser = Match.isLoser(match, teamId);
        return {
            upcoming,
            played: [...played, match],
            wins: isWinner ? [...wins, match] : wins,
            draws: isDraw ? [...draws, match] : draws,
            losses: isLoser ? [...losses, match] : losses,
            pointsScoreFor: pointsScoreFor + team.points,
            pointsScoreAgainst: pointsScoreAgainst + opposition.points,
            points: points + (isWinner ? 3 : isDraw ? 1 : 0),
            fairPoints: fairPoints
        }
    } else if (alignment !== undefined)  {
        return {...results, upcoming: [...upcoming, match]}
    } else {
        return results
    }
}

const buildResults = (
    teamIds: number[],
    matches: Match[]
): Map<number, Results> => {
    //TODO this should be moved into the reduce eventually
    const fairPointsByTeamId = calculateFairPoints(
        teamIds,
        matches
    )

    return matches.reduce(
        (acc, match) => {
            const teamOneSummary = addToResults(
                match.teamOne.id,
                match,
                acc.get(match.teamOne.id),
                fairPointsByTeamId.get(match.teamOne.id) ?? 0
            )
            const teamTwoSummary = addToResults(
                match.teamTwo.id,
                match,
                acc.get(match.teamTwo.id),
                fairPointsByTeamId.get(match.teamTwo.id) ?? 0
            )
            acc.set(match.teamOne.id, teamOneSummary)
            acc.set(match.teamTwo.id, teamTwoSummary)
            return acc;
        },
        new Map()
    )
}

//TODO tidy this function as naming etc is a mess
export const buildStandingsTable = (
    leagueDetails: LeagueDetails[]
): StandingsRow[] => {
    const x = leagueDetails.flatMap(({league, entries, matches}) => {
        const teamIds = entries.map(e => e.id)
        const resultsByTeam = buildResults(teamIds, matches);
        return [...resultsByTeam.entries()].map(([id, results]) => [id, results, league.season] as const);
    })

    const resultsByTeam = indexBy(
        x,
        ([teamId, results, season]) => `${teamId}-${season}`,
    )

    const pointsPositionByTeamId = rankBy(
        x,
        ([,a], [,b]) => b.points - a.points || b.pointsScoreFor - a.pointsScoreFor,
        ([teamId,,season]) => `${teamId}-${season}`
    )
    const fairPositionByTeamId = rankBy(
        x,
        ([, a], [, b]) => b.fairPoints - a.fairPoints,
        ([teamId,,season]) => `${teamId}-${season}`
    )

    const allEntriesWithSeason = leagueDetails.flatMap(ld => ld.entries.map(e => ({entry: e, season: ld.league.season})))

    return allEntriesWithSeason.map(({entry, season}) => {
        const id = `${entry.id}-${season}`
        const position = pointsPositionByTeamId.get(id) ?? 0
        const fairPosition = fairPositionByTeamId.get(id) ?? 0
        const {played, wins, draws, losses, upcoming, pointsScoreFor, pointsScoreAgainst, points, fairPoints} = resultsByTeam.get(id)?.[1] ?? EMPTY_RESULTS
        return {
            played,
            entry,
            position,
            wins,
            draws,
            losses,
            upcoming,
            pointsScoreFor,
            pointsScoreAgainst,            
            points,
            fairPoints,
            fairPosition,
            season: season,
            previousPosition: undefined,
            waiverPick: undefined
        }
    })
}