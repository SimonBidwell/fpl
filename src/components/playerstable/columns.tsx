import { Entry, Player, PlayerStatus, Position, Team } from "../../domain";
import { Tooltip, User } from "@nextui-org/react";
import { capitalizeFirstLetter, range } from "../../helpers";
import { Manager as ManagerComponent } from "../Manager";
import { WarningIcon } from "../WarningIcon";
import { Column as ColumnType } from "../table/column";
import { Choice, Fixture } from "../../api/domain";

type OppositionWithSide = { opposition: Team; side: "home" | "away" };
type FixturesByGameweek = Record<number, OppositionWithSide[]>;

export type PlayerRow = Omit<Player, "status" | "team"> & {
    team?: Team;
    owner?: Entry;
    position?: Position;
    status?: PlayerStatus;
    totalPointsRank: number;
    //TODO should I replace the various rank columns with a generic index column?
    xGp90: number | undefined;
    xGp90Rank: number | undefined;
    xAp90: number | undefined;
    xAp90Rank: number | undefined;
    xGIp90: number | undefined;
    xGIp90Rank: number | undefined;
    nineties: number | undefined;
    goalInvolvements: number;
    goalsMinusExpectedGoals: number | undefined;
    assistsMinusExpectedAssists: number | undefined;
    goalInvolvementsMinusExpectedGoalInvolvements: number | undefined;
    draftRankMinusRank: number | undefined;
    fixtures: FixturesByGameweek;
    draftPickNumber: "Unknown" | number | undefined;
    draftedBy: Entry | undefined;
    draftPickMinusTotalPointsRank: number | undefined;
    draftPickMinusDraftRank: number | undefined;
};

export type Column = ColumnType<PlayerRow>;

export const buildPlayerRows = (
    players: Player[],
    gameweek: number | undefined,
    getTeam: (id: number) => Team | undefined,
    getEntry: (entryId: number) => Entry | undefined,
    getPosition: (id: number) => Position | undefined,
    getStatus: (id: number) => PlayerStatus | undefined,
    getGames: (gameweek: number, teamId: number) => Fixture[],
    getDraftInfo: (playerId: number) => "Unknown" | Choice | undefined
): PlayerRow[] => {
    return players
        .map((p) =>
            buildPlayerRow(
                p,
                gameweek,
                getTeam,
                getEntry,
                getPosition,
                getStatus,
                getGames,
                getDraftInfo
            )
        )
        .sort((a, b) => b.total_points - a.total_points)
        .map((p, i) => {
            const rank = i + 1;
            return {
                ...p,
                totalPointsRank: rank,
                draftRankMinusRank:
                    p.draft_rank === undefined
                        ? undefined
                        : p.draft_rank - rank,
                draftPickMinusTotalPointsRank:
                    p.draftPickNumber === undefined ||
                    p.draftPickNumber === "Unknown"
                        ? undefined
                        : p.draftPickNumber - rank,
            };
        })
        .sort((a, b) => (b.xGp90 ?? 0) - (a.xGp90 ?? 0))
        .map((p, i) => ({
            ...p,
            xGp90Rank: p.xGp90 === undefined ? undefined : i + 1,
        }))
        .sort((a, b) => (b.xAp90 ?? 0) - (a.xAp90 ?? 0))
        .map((p, i) => ({
            ...p,
            xAp90Rank: p.xAp90 === undefined ? undefined : i + 1,
        }))
        .sort((a, b) => (b.xGIp90 ?? 0) - (a.xGIp90 ?? 0))
        .map((p, i) => ({
            ...p,
            xGIp90Rank: p.xGIp90 === undefined ? undefined : i + 1,
        }));
};

const MINIMUM_MINS_PER_90 = 45;
const calculatePer90 = (
    stat: number | undefined,
    minutes: number,
    minMinutes: number = MINIMUM_MINS_PER_90
): number | undefined => {
    if (minutes <= minMinutes || stat === undefined) {
        return undefined;
    }
    const p90 = stat === 0 ? 0 : stat / (minutes / 90);
    return +p90.toFixed(2);
};

const buildFixtures = (
    gameweek: number | undefined,
    team: Team | undefined,
    getTeam: (teamId: number) => Team | undefined,
    getGames: (gameweek: number, teamId: number) => Fixture[]
): FixturesByGameweek => {
    if (gameweek !== undefined && team !== undefined) {
        const { id } = team;
        //TODO derive this from the fixtures available on the bootstrap instead
        return range(gameweek + 1, gameweek + 4).reduce<FixturesByGameweek>(
            (acc, next) => {
                const games = getGames(next, team.id)
                    .map((game) => {
                        const { team_h, team_a } = game;
                        const side = team_h === id ? "home" : "away";
                        const opposition = getTeam(
                            side === "home" ? team_a : team_h
                        );
                        if (opposition !== undefined) {
                            return { opposition, side };
                        }
                        return undefined;
                    })
                    .filter((g): g is OppositionWithSide => g !== undefined);
                return {
                    ...acc,
                    [next]: games,
                };
            },
            {}
        );
    } else {
        return {};
    }
};

export const buildPlayerRow = (
    player: Player,
    gameweek: number | undefined,
    getTeam: (id: number) => Team | undefined,
    getEntry: (entryId: number) => Entry | undefined,
    getPosition: (id: number) => Position | undefined,
    getStatus: (id: number) => PlayerStatus | undefined,
    getGames: (gameweek: number, teamId: number) => Fixture[],
    getDraftInfo: (playerId: number) => "Unknown" | Choice | undefined
): PlayerRow => {
    const status = getStatus(player.id);
    const owner = getEntry(status?.owner ?? -1);
    const goalInvolvements = player.goals_scored + player.assists;
    const team = getTeam(player.team);
    const draftInfo = getDraftInfo(player.id);
    return {
        ...player,
        team,
        owner,
        position: getPosition(player.element_type),
        status: status,
        totalPointsRank: 0,
        xGp90: calculatePer90(player.expected_goals, player.minutes),
        xGp90Rank: 0,
        xAp90: calculatePer90(player.expected_assists, player.minutes),
        xAp90Rank: 0,
        xGIp90: calculatePer90(
            player.expected_goal_involvements,
            player.minutes
        ),
        xGIp90Rank: 0,
        nineties: player.minutes === 0 ? 0 : +(player.minutes / 90).toFixed(2),
        goalInvolvements: goalInvolvements,
        goalsMinusExpectedGoals:
            player.expected_goals === undefined
                ? undefined
                : +(player.goals_scored - player.expected_goals).toFixed(2),
        assistsMinusExpectedAssists:
            player.expected_assists === undefined
                ? undefined
                : +(player.assists - player.expected_assists).toFixed(2),
        goalInvolvementsMinusExpectedGoalInvolvements:
            player.expected_goal_involvements === undefined
                ? undefined
                : +(
                      goalInvolvements - player.expected_goal_involvements
                  ).toFixed(2),
        draftRankMinusRank: 0,
        fixtures: buildFixtures(gameweek, team, getTeam, getGames),
        draftPickNumber: draftInfo === "Unknown" ? "Unknown" : draftInfo?.index,
        draftedBy:
            draftInfo === "Unknown"
                ? undefined
                : getEntry(draftInfo?.entry ?? -1),
        draftPickMinusTotalPointsRank: 0,
        draftPickMinusDraftRank:
            draftInfo !== "Unknown" &&
            draftInfo !== undefined &&
            player.draft_rank !== undefined
                ? draftInfo?.index - player.draft_rank
                : undefined,
    };
};

//TODO not entire sure why this needs to exclude undefined
type KeysMatching<T, V> = Exclude<
    { [K in keyof T]: T[K] extends V ? K : never }[keyof T],
    undefined
>;

//TODO can I combine number column and string column into one function?
const numberColumn = (
    key: KeysMatching<PlayerRow, number | null | undefined>,
    {
        title,
        abbr,
        description,
        sort,
    }: Partial<Omit<Column, "key" | "render">> = {}
): Column => ({
    key,
    title:
        title ??
        key
            .replaceAll("_", " ")
            .split(" ")
            .map(capitalizeFirstLetter)
            .join(" "),
    abbr,
    description,
    render: (row) =>
        row[key] === undefined || row[key] === null ? "-" : row[key],
    sort: sort === undefined ? (a, b) => (a[key] ?? 0) - (b[key] ?? 0) : sort,
});
const stringColumn = (
    key: KeysMatching<PlayerRow, string | null>,
    {
        title,
        abbr,
        description,
        sort,
    }: Partial<Omit<Column, "key" | "render">> = {}
): Column => ({
    key,
    title:
        title ??
        key
            .replaceAll("_", " ")
            .split(" ")
            .map(capitalizeFirstLetter)
            .join(" "),
    abbr,
    description,
    render: (row) => (!row[key] ? "-" : row[key]),
    sort: (a, b) => (a[key] ?? "").localeCompare(b[key] ?? ""),
});

const playerDescription = (team?: string, position?: string) => 
    `${team ?? "Unknown"} - ${position ?? "Unknown"}`

export const PlayerCol: Column = {
    key: "player",
    title: "Player",
    headerClassName: "sticky -left-4",
    cellClassName: "sticky -left-4 z-20 bg-white",
    render: ({ code, displayName, web_name, position, team }) => {
        const avatarProps = {
            radius: "md",
            src: `https://resources.premierleague.com/premierleague/photos/players/40x40/p${code}.png`,
        } as const
        return (
            <>
                <User
                    className="hidden sm:inline-flex truncate"
                    name={displayName}
                    description={playerDescription(team?.name, position?.singular_name)}
                    avatarProps={avatarProps}
                />
                <User
                    className="sm:hidden truncate"
                    name={web_name}
                    description={playerDescription(team?.short_name, position?.singular_name_short)}
                    avatarProps={avatarProps}
                />
            </>
        );
    },
    sort: (a, b) => a.displayName.localeCompare(b.displayName),
};
export const OwnerCol: Column = {
    key: "owner",
    title: "Owner",
    render: ({ owner }) =>
        owner === undefined ? (
            <div>-</div>
        ) : (
            <div className="truncate">{owner.manager.name}</div>
        ),
    sort: (a, b) =>
        (a.owner?.manager.name ?? "").localeCompare(
            b.owner?.manager.name ?? ""
        ),
};
export const TeamAndManagerCol: Column = {
    key: "team_and_manager",
    title: "Team & Manager",
    render: ({ owner }) =>
        owner === undefined ? (
            <div>-</div>
        ) : (
            <ManagerComponent manager={owner.manager} teamName={owner.name} />
        ),
    sort: (a, b) => (a.owner?.name ?? "").localeCompare(b.owner?.name ?? ""),
};
export const TeamCol: Column = {
    key: "team",
    title: "Team",
    render: ({ team }) =>
        team === undefined ? (
            "-"
        ) : (
            <div className="truncate">
                <img
                    className="h-6 mr-2 inline"
                    src={`https://resources.premierleague.com/premierleague/badges/t${team.code}.png`}
                />
                {team?.name}
            </div>
        ),
    sort: (a, b) => (a.team?.id ?? -1) - (b.team?.id ?? -1),
};
export const PositionCol: Column = {
    key: "position",
    title: "Position",
    abbr: "Pos",
    render: ({ position }) =>
        position === undefined ? (
            "-"
        ) : (
            <div>{position.singular_name_short}</div>
        ),
    sort: (a, b) => (a.position?.id ?? 0) - (b.position?.id ?? 0),
};
export const StatusCol: Column = {
    key: "status",
    title: "Status",
    abbr: " ",
    render: ({ news, chance_of_playing_next_round }) => {
        //TODO refactor this so it can be reused in the card view
        if (
            chance_of_playing_next_round === 100 ||
            chance_of_playing_next_round === undefined
        ) {
            return null;
        } else {
            const tooltipContent = news
                ? news
                : `${chance_of_playing_next_round}% chance of playing`;
            return (
                <Tooltip
                    delay={500}
                    placement="right"
                    content={<div>{tooltipContent}</div>}
                >
                    <div>
                        <WarningIcon
                            level={
                                chance_of_playing_next_round === 0
                                    ? "very severe"
                                    : chance_of_playing_next_round === 25
                                    ? "severe"
                                    : chance_of_playing_next_round === 50
                                    ? "high"
                                    : "elevated"
                            }
                        />
                    </div>
                </Tooltip>
            );
        }
    },
};
export const DraftRankCol = numberColumn("draft_rank", {
    abbr: "DR",
    description:
        "Where this player ranks based on FPL's projected points model (the player who FPL expects to receive the most points over a season is Rank #1)",
});
export const DraftRankMinusRankCol = numberColumn("draftRankMinusRank", {
    title: "Draft Rank - Rank",
    abbr: "#DR-#Pts",
    description: `By how many positions is this player over or under performing their projected rank?
    A player with a positive score is above their FPL projection, a player with a negative score is below their FPL projection.`,
});
export const TotalPointsCol = numberColumn("total_points", { abbr: "Pts" });
export const AssistsCol = numberColumn("assists", { abbr: "A" });
export const BonusPtsCol = numberColumn("bonus", {
    abbr: "BPts",
    description: "How many bonus points the player has received this season.",
});
export const BpsCol = numberColumn("bps", {
    title: "Bonus Points System Total",
    abbr: "Bps",
    description: `The Bonus Points System ranks players based on statistics supplied by Opta. The top 3 players by the BPS in a game receive bonus points.
    This column shows how many points in total a player has accumulated as part of the Bonus Points System.`,
});
export const CleanSheetsCol = numberColumn("clean_sheets", { abbr: "CS" });
export const CreativityCol = numberColumn("creativity", {
    abbr: "C",
    description: `"Creativity assesses player performance in terms of producing goalscoring opportunities for others. It can be used as a guide to identify the players most likely to supply assists. 
    While this analyses frequency of passing and crossing, it also considers pitch location and quality of the final ball." - FPL
    Creativity is part of the ICT Index.`,
});
export const GoalsConcededCol = numberColumn("goals_conceded", { abbr: "GC" });
export const GoalsScoredCol = numberColumn("goals_scored", { abbr: "GS" });
export const ICTIndexCol = numberColumn("ict_index", {
    title: "ICT Index",
    abbr: "ICT",
    description: `"Statistical index developed specifically to assess a player as an FPL asset, especially relative to others in the same position in FPL, by combining Influence, Creativty, and Threat score" - FPL. `,
});
export const InfluenceCol = numberColumn("influence", {
    abbr: "I",
    description: `"Influence evaluates the degree to which a player has made an impact on a single match or throughout the season. It takes into account events and actions that could directly or indirectly effect the outcome of the fixture. 
    At the top level these are decisive actions like goals and assists. But the Influence score also processes significant defensive actions to analyse the effectiveness of defenders and goalkeepers." - FPL
    Influence is part of the ICT Index.`,
});
export const ThreatCol = numberColumn("threat", {
    abbr: "T",
    description: `"This is a value that examines a player's threat on goal. It gauges the individuals most likely to score goals.

While attempts are the key action, the Index looks at pitch location, giving greater weight to actions that are regarded as the best chances to score." - FPL
Threat is part of the ICT Index.`,
});
export const MinutesCol = numberColumn("minutes", { abbr: "Mins" });
export const OwnGoalsCol = numberColumn("own_goals", { abbr: "OG" });
export const PenaltiesMissedCol = numberColumn("penalties_missed", {
    abbr: "P. Miss",
});
export const SavesCol = numberColumn("saves");
export const PenaltiesSavedCol = numberColumn("penalties_saved", {
    abbr: "P. Saved",
});
export const YellowCardsCol = numberColumn("yellow_cards", { abbr: "Yel" });
export const RedCardsCol = numberColumn("red_cards", { abbr: "Red" });
export const StartsCol = numberColumn("starts");
export const ExpectedGoalsCol = numberColumn("expected_goals", { abbr: "xG" });
export const ExpectedAssistsCol = numberColumn("expected_assists", {
    abbr: "xA",
});
export const ExpectedGoalInvolvementsCol = numberColumn(
    "expected_goal_involvements",
    { abbr: "xG+xA" }
);
export const ExpectedGoalsConcededCol = numberColumn(
    "expected_goals_conceded",
    { abbr: "xGA" }
);
export const buildChanceOfPlayingNextRoundCol = (
    nextGameweek: number
): Column => ({
    key: "chance_of_playing_next_round",
    title: "Chance of Playing Next Round",
    abbr: "% Next",
    description: `How likely FPL think it is that this player will play in Gameweek ${nextGameweek}`,
    render: ({ chance_of_playing_next_round }) =>
        chance_of_playing_next_round === null
            ? "Unknown"
            : `${chance_of_playing_next_round}%`,
    sort: (a, b) =>
        (a.chance_of_playing_next_round ?? -1) -
        (b.chance_of_playing_next_round ?? -1),
});
export const buildChanceOfPlayingThisRoundCol = (gameweek: number): Column => ({
    key: "chance_of_playing_this_round",
    title: "Chance of Playing This Round",
    abbr: "%",
    description: `How likely FPL think it is that this player will play in Gameweek ${gameweek}`,
    render: ({ chance_of_playing_this_round }) =>
        chance_of_playing_this_round === null
            ? "Unknown"
            : `${chance_of_playing_this_round}%`,
    sort: (a, b) =>
        (a.chance_of_playing_this_round ?? -1) -
        (b.chance_of_playing_this_round ?? -1),
});
export const CodeCol = numberColumn("code", {
    title: "Premier League ID",
    abbr: "ID",
    description: "A unique identifier assigned to every Premier League player",
});
export const buildEventPointsCol = (gameweek: number): Column =>
    numberColumn("event_points", {
        title: `Gameweek ${gameweek} Points`,
        abbr: `GW${gameweek} Pts`,
        description: `How many points this player accumulated in Gameweek ${gameweek}`,
    });
export const FormCol = numberColumn("form", {
    abbr: "F",
    description:
        "The form of a player is the average of points they have accumulated per match, calculated on the basis of every game their team has played in the last 30 days.",
});
export const NewsCol = stringColumn("news");
export const NameCol = stringColumn("displayName", { title: "Name" });
export const PointsPerGameCol = numberColumn("points_per_game", {
    abbr: "PPG",
    description:
        "The Total Points for a player divided by the number of games they have played in.",
});
export const InfluenceRankCol = numberColumn("influence_rank", {
    abbr: "#I",
    description: "Where the player ranks if sorted by their Influence score.",
});
export const InfluenceRankTypeCol = numberColumn("influence_rank_type", {
    title: "Influence Rank for Position",
    abbr: "#IPos",
    description:
        "Where the player ranks for their position if sorted by Influence score.",
});
export const CreativityRankCol = numberColumn("creativity_rank", {
    abbr: "#C",
    description: "Where the player ranks if sorted by their Creativity score.",
});
export const CreativityRankTypeCol = numberColumn("creativity_rank_type", {
    title: "Creativity Rank for Position",
    abbr: "#CPos",
    description:
        "Where the player ranks for their position if sorted by Creativity score.",
});
export const ThreatRankCol = numberColumn("threat_rank", {
    abbr: "#T",
    description: "Where the player ranks if sorted by their Threat score.",
});
export const ThreatRankTypeCol = numberColumn("threat_rank_type", {
    title: "Threat Rank for Position",
    abbr: "#TPos",
    description:
        "Where the player ranks for their position if sorted by Threat score.",
});
export const ICTIndexRankCol = numberColumn("ict_index_rank", {
    title: "ICT Rank",
    abbr: "#ICT",
    description: "Where the player ranks if sorted by ICT Index.",
});
export const ICTIndexRankTypeCol = numberColumn("ict_index_rank_type", {
    title: "ICT Rank for Position",
    abbr: "#ICTPos",
    description:
        "Where the player ranks for their position if sorted by ICT Index.",
});
export const TotalPointsRankCol = numberColumn("totalPointsRank", {
    title: "Total Points Rank",
    abbr: "#",
});
export const xGp90Col = numberColumn("xGp90", {
    title: "Expected Goals per 90",
    abbr: "xG/90",
    description: `Expected Goals for the player per 90 minutes played (minimum ${MINIMUM_MINS_PER_90} mins)`,
});
export const xGp90RankCol = numberColumn("xGp90Rank", {
    title: "Expected Goals per 90 Rank",
    abbr: "#xG/90",
});
export const xAp90Col = numberColumn("xAp90", {
    title: "Expected Assists per 90",
    abbr: "xA/90",
    description: `Expected Assists for the player per 90 minutes played (minimum ${MINIMUM_MINS_PER_90} mins)`,
});
export const xAp90RankCol = numberColumn("xAp90Rank", {
    title: "Expected Assists per 90 Rank",
    abbr: "#xA/90",
});
export const xGIp90Col = numberColumn("xGIp90", {
    title: "Expected Goal Involvements per 90",
    abbr: "(xG+xA)/90",
    description: `Expected Goals + Expected Assists for the player per 90 minutes played (minimum ${MINIMUM_MINS_PER_90} mins)`,
});
export const xGIp90RankRol = numberColumn("xGIp90Rank", {
    title: "Expected Goal Involvements per 90 Rank",
    abbr: "#(xG+xA)/90",
});
export const NinetiesCol = numberColumn("nineties", {
    title: "90s Played",
    abbr: "90s",
    description: "Total Minutes divided by 90",
});
export const GoalInvolvementsCol = numberColumn("goalInvolvements", {
    title: "Goal Involvements",
    abbr: "G+A",
    description: "Goals plus Assists",
});
export const GoalsMinusExpectedGoalsCol = numberColumn(
    "goalsMinusExpectedGoals",
    {
        title: "Goals - Expected Goals",
        abbr: "G-xG",
        description: `A positive value means a player is overperforming expectation (i.e scoring more goals than you'd expect given the chances they've had). A negative number means they're underperforming.`,
    }
);
export const AssistsMinusExpectedAssistsCol = numberColumn(
    "assistsMinusExpectedAssists",
    {
        title: "Assists - Expected Assists",
        abbr: "A-xA",
        description: `A positive value means a player is overperforming expectation (i.e assisting more goals than you'd expect given the chances they've created). A negative number means they're underperforming.`,
    }
);
export const GoalInvolvementsMinusExpectedGoalInvolvementsCol = numberColumn(
    "goalInvolvementsMinusExpectedGoalInvolvements",
    {
        title: "Goal Involvements - Expected Goal Involvements",
        abbr: "(G+A)-(xG+xA)",
        description: `A positive value means a player is overperforming expectation (i.e scoring and assisting more goals than you'd expect given the chances they're involved with). A negative number means they're underperforming.`,
    }
);

export const buildFixturesCol = (
    currentGameweek: number,
    offset: number
): Column => {
    const gameweek = currentGameweek + offset;
    return {
        key: `gw_plus_${offset}_fixture`,
        title: `Gameweek ${gameweek} Opposition`,
        abbr: `GW${gameweek}`,
        render: ({ fixtures }) => {
            const maybeFixtures = fixtures[gameweek];
            if (maybeFixtures !== undefined && maybeFixtures.length > 0) {
                return (
                    <>
                        {maybeFixtures.map((fixture) => {
                            const { opposition, side } = fixture;
                            return (
                                <div className="truncate">
                                    {opposition.short_name} (
                                    {side === "home" ? "H" : "A"})
                                </div>
                            );
                        })}
                    </>
                );
            } else {
                return "-";
            }
        },
    };
};

//TODO account for when we just don't have the draft info
export const DraftPickCol: Column = {
    key: "draft_pick",
    title: "Draft Pick",
    abbr: "Pick #",
    render: ({ draftPickNumber }) => {
        if (draftPickNumber === "Unknown") {
            return "-";
        } else if (draftPickNumber === undefined) {
            return "Undrafted";
        } else {
            return draftPickNumber;
        }
    },
    sort: (a, b) => {
        const aVal =
            a.draftPickNumber === "Unknown" || a.draftPickNumber === undefined
                ? Infinity
                : a.draftPickNumber;
        const bVal =
            b.draftPickNumber === "Unknown" || b.draftPickNumber === undefined
                ? Infinity
                : b.draftPickNumber;
        return aVal - bVal;
    },
};
export const DraftPickMinusPositionCol = numberColumn(
    "draftPickMinusTotalPointsRank",
    {
        title: "Draft Pick - Rank",
        abbr: "Pick#-#Pts",
        description:
            "A negative value means the player is ranked lower by total points than the position they were picked in the draft. A positive value means they are ranked higher by total points than their draft pick position.",
    }
);
export const DraftPickMinusDraftRankCol = numberColumn(
    "draftPickMinusDraftRank",
    {
        title: "Draft Pick - Draft Rank",
        abbr: "Pick#-DR",
        description:
            "A negative value means the player was picked earlier than their draft rank. A positive value means they were picked later than their draft rank.",
    }
);
export const DraftedByCol: Column = {
    key: "drafted_by",
    title: "Drafted By",
    render: ({ draftedBy }) =>
        draftedBy === undefined ? (
            <div>-</div>
        ) : (
            <ManagerComponent
                manager={draftedBy.manager}
                teamName={draftedBy.name}
            />
        ),
    sort: (a, b) =>
        (a.draftedBy?.name ?? "").localeCompare(b.draftedBy?.name ?? "") ||
        (b.draftPickNumber === "Unknown" || b.draftPickNumber === undefined
            ? 0
            : b.draftPickNumber) -
            (a.draftPickNumber === "Unknown" || a.draftPickNumber === undefined
                ? 0
                : a.draftPickNumber),
};

export const buildColumns = (gameweek: number | undefined): Column[] => {
    return [
        TotalPointsRankCol,
        StatusCol,
        CodeCol,
        PlayerCol,
        NameCol,
        PositionCol,
        TeamCol,
        ...(gameweek === undefined ? [] : [buildEventPointsCol(gameweek)]),
        TotalPointsCol,
        FormCol,
        NewsCol,
        NinetiesCol,
        MinutesCol,
        StartsCol,
        GoalsScoredCol,
        GoalsConcededCol,
        OwnGoalsCol,
        PenaltiesMissedCol,
        AssistsCol,
        GoalInvolvementsCol,
        CleanSheetsCol,
        SavesCol,
        PenaltiesSavedCol,
        YellowCardsCol,
        RedCardsCol,
        ExpectedGoalsCol,
        ExpectedAssistsCol,
        ExpectedGoalInvolvementsCol,
        ExpectedGoalsConcededCol,
        BonusPtsCol,
        BpsCol,
        PointsPerGameCol,
        xGp90RankCol,
        xGp90Col,
        xAp90RankCol,
        xAp90Col,
        xGIp90RankRol,
        xGIp90Col,
        GoalsMinusExpectedGoalsCol,
        AssistsMinusExpectedAssistsCol,
        GoalInvolvementsMinusExpectedGoalInvolvementsCol,
        DraftRankCol,
        DraftRankMinusRankCol,
        DraftPickCol,
        DraftPickMinusPositionCol,
        DraftPickMinusDraftRankCol,
        DraftedByCol,
        InfluenceRankCol,
        InfluenceRankTypeCol,
        InfluenceCol,
        CreativityRankCol,
        CreativityRankTypeCol,
        CreativityCol,
        ThreatRankCol,
        ThreatRankTypeCol,
        ThreatCol,
        ICTIndexRankCol,
        ICTIndexRankTypeCol,
        ICTIndexCol,
        ...(gameweek === undefined
            ? []
            : [
                  buildChanceOfPlayingThisRoundCol(gameweek),
                  buildChanceOfPlayingNextRoundCol(gameweek),
              ]),
        ...(gameweek === undefined
            ? []
            : range(1, 4).map((offset) => buildFixturesCol(gameweek, offset))),
        OwnerCol,
        TeamAndManagerCol,
    ];
};
