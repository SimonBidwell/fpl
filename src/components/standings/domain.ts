import { Transaction } from "../../api/domain";
import { Match, LeagueDetails } from "../../domain";
import { groupBy, indexBy, partition, rankBy } from "../../helpers";
import { StandingsRow } from "../standingstable/StandingsTable";
import { calculateElo } from "./elo";

//TODO move to helpers?
export const getUniquePairs = (ids: number[]): [number, number][] => {
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

export const calculateFairPoints = (
    matches: Match[],
    allPossibleMatches: [number, number][]
): Map<number, number> => {
    const gameWeekScores = matches.reduce((acc, match) => {
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
            acc.set(teamB, teamBTotal);
        } else if (teamBPoints > teamAPoints) {
            acc.set(teamB, teamBTotal + 3);
            acc.set(teamA, teamATotal);
        } else {
            acc.set(teamA, teamATotal + 1);
            acc.set(teamB, teamBTotal + 1);
        }
        return acc;
    }, new Map());
    const teamIds = [...pointsForWeek.keys()];
    return teamIds.reduce((acc, teamId) => {
        const expectedPoints =
            (pointsForWeek.get(teamId) ?? 0) / (teamIds.length - 1);
        acc.set(teamId, expectedPoints);
        return acc;
    }, new Map());
};

interface TeamRecord {
    played: Match[];
    wins: Match[];
    draws: Match[];
    losses: Match[];
    pointsScoreFor: number;
    pointsScoreAgainst: number;
    points: number;
    fairPoints: number;
    elo: number;
}
const EMPTY_RECORD: TeamRecord = {
    played: [],
    wins: [],
    draws: [],
    losses: [],
    pointsScoreFor: 0,
    pointsScoreAgainst: 0,
    points: 0,
    fairPoints: 0,
    elo: 1500,
};

//TODO adding ELO here makes me think that how this is structured can probably use a rework.
const addToRecords = ({
    teamId,
    match,
    oppositionElo,
    records = new Map(),
    fairPoints = 0,
}: {
    teamId: number;
    match: Match;
    oppositionElo: number;
    records?: Map<number, TeamRecord>;
    fairPoints?: number;
}): Map<number, TeamRecord> => {
    const previousRecord = records.get(match.gameWeek - 1) ?? EMPTY_RECORD;
    const alignment = Match.getAlignment(match, teamId);
    if (alignment !== undefined) {
        const { team, opposition } = alignment;
        const {
            played,
            wins,
            draws,
            losses,
            pointsScoreFor,
            pointsScoreAgainst,
            points,
            fairPoints: existingFairPoints,
            elo,
        } = previousRecord;
        const isWinner = Match.isWinner(match, teamId);
        const isDraw = Match.isDraw(match);
        const isLoser = Match.isLoser(match, teamId);
        const record = {
            played: [...played, match],
            wins: isWinner ? [...wins, match] : wins,
            draws: isDraw ? [...draws, match] : draws,
            losses: isLoser ? [...losses, match] : losses,
            pointsScoreFor: pointsScoreFor + team.points,
            pointsScoreAgainst: pointsScoreAgainst + opposition.points,
            points: points + (isWinner ? 3 : isDraw ? 1 : 0),
            fairPoints: fairPoints + existingFairPoints,
            elo: calculateElo(
                elo,
                oppositionElo,
                Match.resultForTeam(match, teamId) ?? "win"
            ), //TODO defaulting this to win is probably dumb
        };
        records.set(match.gameWeek, record);
        return records;
    } else {
        return records;
    }
};

const buildTeamRecords = (
    matches: Match[],
    allPossibleMatches: [number, number][]
): Map<number, Map<number, TeamRecord>> => {
    const matchesByGameWeek = groupBy(matches, (m) => m.gameWeek);

    const fairPointsByGameWeekAndTeamId = [...matchesByGameWeek.keys()].reduce(
        (acc, gameWeek) => {
            const fairPoints = calculateFairPoints(
                matchesByGameWeek.get(gameWeek) ?? [],
                allPossibleMatches
            );
            acc.set(gameWeek, fairPoints);
            return acc;
        },
        new Map()
    );

    return matches
        .sort((a, b) => a.gameWeek - b.gameWeek)
        .reduce((acc, match) => {
            const { teamOne, teamTwo } = match;

            const recordsOne = addToRecords({
                teamId: teamOne.id,
                match: match,
                records: acc.get(teamOne.id),
                oppositionElo: (
                    acc.get(teamTwo.id)?.get(match.gameWeek - 1) ?? EMPTY_RECORD
                ).elo,
                fairPoints: fairPointsByGameWeekAndTeamId
                    .get(match.gameWeek)
                    ?.get(teamOne.id),
            });
            const recordsTwo = addToRecords({
                teamId: teamTwo.id,
                match: match,
                records: acc.get(teamTwo.id),
                oppositionElo: (
                    acc.get(teamOne.id)?.get(match.gameWeek - 1) ?? EMPTY_RECORD
                ).elo,
                fairPoints: fairPointsByGameWeekAndTeamId
                    .get(match.gameWeek)
                    ?.get(teamTwo.id),
            });

            acc.set(teamOne.id, recordsOne);
            acc.set(teamTwo.id, recordsTwo);
            return acc;
        }, new Map());
};

export const buildStandings = ({
    league,
    matches,
    entries,
}: LeagueDetails, transactions: Transaction[] | undefined): Map<number, Map<number, StandingsRow>> => {
    const teamIds = entries.map((e) => e.id);
    const allPossibleMatches = getUniquePairs(teamIds);
    const matchesByTeam = matches.reduce((acc, match) => {
        const { teamOne, teamTwo, gameWeek } = match;
        const teamOneMatches = acc.get(teamOne.id) ?? new Map();
        teamOneMatches.set(gameWeek, match);
        acc.set(teamOne.id, teamOneMatches);
        const teamTwoMatches = acc.get(teamTwo.id) ?? new Map();
        teamTwoMatches.set(gameWeek, match);
        acc.set(teamTwo.id, teamTwoMatches);
        return acc;
    }, new Map());
    const finishedMatches = matches.filter(Match.isFinished);
    const finishedGameweeks = [
        ...new Set(finishedMatches.map((m) => m.gameWeek)),
    ].sort((a, b) => a - b);
    const records = buildTeamRecords(finishedMatches, allPossibleMatches);

    return finishedGameweeks.reduce((acc, gameweek) => {
        const results: [number, TeamRecord][] = teamIds.map((teamId) => [
            teamId,
            records.get(teamId)?.get(gameweek) ?? EMPTY_RECORD,
        ]);

        const pointsPositionByTeamId = rankBy(
            results,
            ([, a], [, b]) =>
                b.points - a.points || b.pointsScoreFor - a.pointsScoreFor,
            ([teamId]) => teamId
        );

        const fairPositionByTeamId = rankBy(
            results,
            ([, a], [, b]) => b.fairPoints - a.fairPoints,
            ([teamId]) => teamId
        );

        //TODO make this more efficient. Lots of wasted work atm. 
        const transactionsUpToGameweek = (transactions ?? []).filter(t => t.event <= gameweek);
        const transactionsByEntry = groupBy(transactionsUpToGameweek, t => t.entry)

        const standings = entries.map((entry) => {
            const { id, entryId } = entry;
            const position = pointsPositionByTeamId.get(id) ?? 0;
            const fairPosition = fairPositionByTeamId.get(id) ?? 0;
            const previousStanding = acc.get(gameweek - 1)?.get(id);
            const {
                played,
                wins,
                draws,
                losses,
                pointsScoreFor,
                pointsScoreAgainst,
                points,
                fairPoints,
                elo,
            } = records.get(id)?.get(gameweek) ?? EMPTY_RECORD;
            const transactionsForEntry = transactionsByEntry.get(entryId) ?? []
            const [acceptedWaivers, rejectedWaivers] = partition(
                transactionsForEntry.filter(t => t.kind === "w"),
                t => t.result === "a"
            );
            const freeAgents = transactionsForEntry.filter(t => t.kind === "f")
            return {
                key: `${league.season}-${gameweek}-${id}`,
                played,
                entry,
                position,
                wins,
                draws,
                losses,
                upcoming: matchesByTeam.get(id)?.get(gameweek + 1),
                pointsScoreFor,
                pointsScoreAgainst,
                points,
                fairPoints,
                fairPosition,
                season: league.season,
                previousPosition: previousStanding?.position,
                elo,
                totalWaivers: transactions === undefined ? undefined : acceptedWaivers.length + rejectedWaivers.length,
                acceptedWaivers: transactions === undefined ? undefined : acceptedWaivers.length,
                rejectedWaivers: transactions === undefined ? undefined : rejectedWaivers.length,
                freeAgents: transactions === undefined ? undefined : freeAgents.length,
                transactions: transactions === undefined ? undefined : transactionsForEntry.length
            };
        });

        const standingsByTeamId = indexBy(standings, (s) => s.entry.id);

        acc.set(gameweek, standingsByTeamId);
        return acc;
    }, new Map());
};
