import { Card, CardBody } from "@nextui-org/card";
import { PlayerRow, StatusCol } from "./columns";
import { PlayerHeading } from "../PlayerHeading";
import { Manager as ManagerComponent } from "../Manager";
import { ReactNode } from "react";
import clsx from "clsx";
import { useSeasonContext } from "../../SeasonContext";

export interface Props {
    player: PlayerRow;
}

export const Section = ({
    children,
    title,
    className = "items-center",
}: {
    children: ReactNode;
    title: string;
    className?: string;
}) => (
    <div
        className={clsx(
            "flex flex-col gap-1 text-sm rounded-lg bg-default-100 p-1 justify-center",
            className
        )}
    >
        <div className="text-foreground-400 text-xs">{title}</div>
        {children}
    </div>
);

export const PlayerCard = ({ player }: Props) => {
    const {
        displayName,
        team,
        position,
        code,
        totalPointsRank,
        total_points,
        event_points,
        owner,
        expected_goals,
        points_per_game,
        minutes,
        goals_scored,
        goals_conceded,
        assists,
        clean_sheets,
        expected_assists,
        expected_goal_involvements,
        fixtures,
    } = player;
    const { currentGameweek } = useSeasonContext();
    return (
        <Card className="w-64 flex-shrink-0">
            <CardBody className="flex flex-col gap-2 p-2">
                <PlayerHeading
                    teamCode={team?.code ?? -1}
                    className="h-32 p-2 flex flex-col justify-between relative rounded-lg overflow-hidden"
                >
                    <img
                        className="absolute h-28 bottom-0 right-2"
                        src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${code}.png`}
                    />
                    <div className="font-extrabold">#{totalPointsRank}</div>
                    <div>
                        <div
                            className="font-bold w-1/2"
                            style={{ wordSpacing: "100vw" }}
                        >
                            {displayName}
                        </div>
                        <div className="text-xs">
                            {team?.name} - {position?.singular_name}
                        </div>
                    </div>
                    <div className="absolute top-3 right-2">{StatusCol.render(player)}</div>
                </PlayerHeading>
                <div className="grid gap-2 grid-cols-3">
                    <Section title="Pts">{total_points}</Section>
                    <Section title="PPG">{points_per_game}</Section>
                    {/* TODO default this better */}
                    <Section title={`GW${currentGameweek ?? 38} Pts`}>
                        {event_points}
                    </Section>
                </div>
                <Section className="items-start" title="Upcoming">
                    {/* //TODO redesign this to handle empty gameweeks etc */}
                    {Object.keys(fixtures).length !== 0 ? <div className="flex flex-row justify-between w-full">
                        {Object.keys(fixtures)
                            .map(Number)
                            .sort((a, b) => a - b)
                            .map((gameweek) => (
                                <div className="flex flex-col items-center text-xs px-2">
                                    <div className="flex">
                                        {fixtures[
                                            gameweek
                                        ].map(({opposition}) => (
                                            <img
                                                className="w-6 inline"
                                                src={`https://resources.premierleague.com/premierleague/badges/t${opposition.code}.png`}
                                            />
                                        ))}
                                    </div>
                                    GW{gameweek}
                                </div>
                            ))}
                    </div> : "None"}
                </Section>
                {/* //TODO use columns rather than hard coding to share things like descriptions */}
                <div className="grid gap-2 grid-cols-4">
                    <Section title="Mins">{minutes}</Section>
                    <Section title="GS">{goals_scored}</Section>
                    <Section title="GC">{goals_conceded}</Section>
                    <Section title="A">{assists}</Section>
                    <Section title="CS">{clean_sheets}</Section>
                    <Section title="xG">{expected_goals}</Section>
                    <Section title="xA">{expected_assists}</Section>
                    <Section title="xG + xA">
                        {expected_goal_involvements}
                    </Section>
                </div>
                <Section className="items-start h-[4.25rem]" title="Owner">
                    <div className="flex-grow">
                        {owner === undefined ? (
                            "Free agent"
                        ) : (
                            <ManagerComponent
                                manager={owner.manager}
                                teamName={owner.name}
                            />
                        )}
                    </div>
                </Section>
            </CardBody>
        </Card>
    );
};
