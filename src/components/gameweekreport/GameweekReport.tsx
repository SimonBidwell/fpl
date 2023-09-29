import { Match, Manager as ManagerI } from "../../domain";
import { Card, CardBody } from "@nextui-org/react";
import { Manager } from "../Manager";
import { ReactNode, useMemo } from "react";
import { buildReport } from "./domain";

export interface Props {
    matches: Match[];
}

const ReportItem = ({
    title,
    description,
    visual,
}: {
    title: string;
    description?: string;
    visual: ReactNode;
}) => (
    <Card shadow="sm" className="w-full h-fit md:w-64 md:h-full">
        <CardBody className="flex flex-col">
            <div className="text-tiny uppercase font-medium text-foreground-400 mb-2">
                {title}
            </div>
            {description ? (
                <div className="text-tiny mb-4 grow">{description}</div>
            ) : null}
            {visual}
        </CardBody>
    </Card>
);

const ScoreSummary = ({
    teamName,
    manager,
    points,
    className,
}: {
    teamName: string;
    manager: ManagerI;
    points: number;
    className?: string;
}) => (
    <div
        className={`flex items-center justify-between pb-2 ${className ?? ""}`}
    >
        <Manager manager={manager} teamName={teamName} />
        <div className="font-medium text-foreground-400">{points}</div>
    </div>
);

const MatchSummary = ({ match, highlight = "winner" }: { match: Match, highlight?: "winner" | "loser" }) => {
    const result = Match.getResult(match);
    const teamOne =
        result === "draw" || result === undefined
            ? match.teamOne
            : result.winner;
    const teamTwo =
        result === "draw" || result === undefined
            ? match.teamTwo
            : result.loser;
    return (
        <>
            <ScoreSummary
                teamName={teamOne.name}
                manager={teamOne.manager}
                points={teamOne.points}
                className={result === "draw" ? undefined : highlight === "winner" ? undefined : "opacity-50"}
            />
            <ScoreSummary
                teamName={teamTwo.name}
                manager={teamTwo.manager}
                points={teamTwo.points}
                className={result === "draw" ? undefined : highlight === "loser" ? undefined : "opacity-50"}
            />
        </>
    );
};

export const GameweekReport = ({ matches }: Props) => {
    const report = useMemo(() => buildReport(matches), [matches]);
    console.log(report)
    return (
        <Card shadow="sm" className="w-full h-64 md:h-full md:w-fit">
            <CardBody className="overflow-auto scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-default-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-default-300 scrollbar-track:!rounded">
                <div className="flex flex-col items-center gap-4 md:grid md:grid-cols-2 ">
                    <ReportItem
                        title="Highest Scorer 😎"
                        visual={
                            <ScoreSummary
                                teamName={report.highestScorer.teamName}
                                manager={report.highestScorer.manager}
                                points={report.highestScorer.points}
                            />
                        }
                    />
                    <ReportItem
                        title="Lowest Scorer 💩"
                        visual={
                            <ScoreSummary
                                teamName={report.lowestScorer.teamName}
                                manager={report.lowestScorer.manager}
                                points={report.lowestScorer.points}
                            />
                        }
                    />
                    <ReportItem
                        title="Biggest Blowout 😂"
                        description={
                            `${report.biggestBlowout.winnerName} beat ${report.biggestBlowout.loserName} by a margin of ${((report.biggestBlowout.ratio-1) * 100).toFixed(2)}%`
                        }
                        visual={<MatchSummary match={report.biggestBlowout.match} />}
                    />
                    <ReportItem
                        title="Narrow Victory 😱"
                        description={
                            `${report.narrowVictory.winnerName} beat ${report.narrowVictory.loserName} by a margin of ${((report.narrowVictory.ratio-1) * 100).toFixed(2)}%`
                        }
                        visual={<MatchSummary match={report.narrowVictory.match} />}
                    />
                    <ReportItem
                        title="Charmed Life 🍀"
                        description={
                            //TODO redo this so the wording is "but would only have won X other possible matchups"
                            //TODO account for draws
                            `${report.charmedLife.winnerName} beat ${report.charmedLife.loserName} but their score was only worth ${report.charmedLife.fairPoints.toFixed(2)} fair points`
                        }
                        visual={<MatchSummary match={report.charmedLife.match} />}
                    />
                    <ReportItem
                        title="Luckless Loser 😭"
                        description={
                            //TODO redo this so the wording is "but would only have lost X other possible matchups"
                            //TODO account for draws
                            `${report.lucklessLoser.loserName} lost to ${report.lucklessLoser.winnerName} but their score was worth ${report.lucklessLoser.fairPoints.toFixed(2)} fair points`
                        }
                        visual={<MatchSummary match={report.lucklessLoser.match} highlight="loser" />}
                    />
                </div>
            </CardBody>
        </Card>
    );
};
