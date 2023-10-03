import { Match, Manager } from "../../domain";
import { getUniquePairs, calculateFairPoints } from "../standings/domain";


//TODO rewrite this as it's really badly done
export interface Report {
    highestScorer: { teamName: string; manager: Manager; points: number };
    lowestScorer: { teamName: string; manager: Manager; points: number };
    biggestBlowout: {
        match: Match;
        winnerName: string;
        loserName: string;
        ratio: number;
    };
    narrowVictory: {
        match: Match;
        winnerName: string;
        loserName: string;
        ratio: number;
    };
    charmedLife: {
        match: Match;
        winnerName: string;
        loserName: string;
        fairPoints: number;
    };
    lucklessLoser: {
        match: Match;
        winnerName: string;
        loserName: string;
        fairPoints: number;
    };
}
export const buildReport = (matches: Match[]): Report => {
    const teamIds = matches.flatMap((match) => [
        match.teamOne.id,
        match.teamTwo.id,
    ]);
    const allPossibleMatches = getUniquePairs(teamIds);
    const expectedPoints = calculateFairPoints(
        matches,
        allPossibleMatches
    );
    return matches.reduce((report, match) => {
        const maxPoints = Match.getMaxPoints(match);
        const hasHighestScore = maxPoints > (report.highestScorer?.points ?? 0);
        const maxPointsTeam =
            match.teamOne.points === maxPoints ? match.teamOne : match.teamTwo;

        const minPoints = Match.getMinPoints(match);
        const hasLowestScore =
            minPoints < (report.lowestScorer?.points ?? 9999);
        const minPointsTeam =
            match.teamOne.points === minPoints ? match.teamOne : match.teamTwo;

        const winningRatio = Match.getWinningRatio(match);
        const hasBiggestBlowout =
            winningRatio > (report.biggestBlowout?.ratio ?? 0);
        const hasNarrowVictory =
            winningRatio < (report.narrowVictory?.ratio ?? 9999) &&
            Match.getResult(match) !== "draw";
        const { wRatio, lRatio } =
            match.teamOne.points / match.teamTwo.points === winningRatio
                ? { wRatio: match.teamOne, lRatio: match.teamTwo }
                : { wRatio: match.teamTwo, lRatio: match.teamOne };

        const result = Match.getResult(match);
        const winnerFair =
            result === "draw" || result === undefined
                ? undefined
                : expectedPoints.get(result.winner.id) ?? 0;
        const loserFair =
            result === "draw" || result === undefined
                ? undefined
                : expectedPoints.get(result.loser.id) ?? 0;
        if (result !== "draw" && result !== undefined) {
            console.log(expectedPoints.get(result.loser.id));
        }
        const hasCharmedLife =
            winnerFair !== undefined &&
            winnerFair < (report.charmedLife?.fairPoints ?? 9999);
        const hasLucklessLoser =
            loserFair !== undefined &&
            loserFair > (report.lucklessLoser?.fairPoints ?? 0);

        return {
            ...report,
            highestScorer: hasHighestScore
                ? {
                      teamName: maxPointsTeam.name,
                      manager: maxPointsTeam.manager,
                      points: maxPointsTeam.points,
                  }
                : report.highestScorer,
            lowestScorer: hasLowestScore
                ? {
                      teamName: minPointsTeam.name,
                      manager: minPointsTeam.manager,
                      points: minPointsTeam.points,
                  }
                : report.lowestScorer,
            biggestBlowout: hasBiggestBlowout
                ? {
                      match: match,
                      winnerName: wRatio.name,
                      loserName: lRatio.name,
                      ratio: winningRatio,
                  }
                : report.biggestBlowout,
            narrowVictory: hasNarrowVictory
                ? {
                      match: match,
                      winnerName: wRatio.name,
                      loserName: lRatio.name,
                      ratio: winningRatio,
                  }
                : report.narrowVictory,
            charmedLife:
                hasCharmedLife && result !== undefined && result !== "draw"
                    ? {
                          match: match,
                          winnerName: result.winner.name,
                          loserName: result.loser.name,
                          fairPoints: winnerFair,
                      }
                    : report.charmedLife,
            lucklessLoser:
                hasLucklessLoser && result !== undefined && result !== "draw"
                    ? {
                          match: match,
                          winnerName: result.winner.name,
                          loserName: result.loser.name,
                          fairPoints: loserFair,
                      }
                    : report.lucklessLoser,
        };
    }, {} as Report);
};
