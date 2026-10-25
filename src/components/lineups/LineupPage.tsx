import type { CSSProperties } from "react";
import { Avatar } from "@nextui-org/react";
import { useQuery } from "react-query";
import { Link, useLocation, useParams } from "wouter";
import { ArrowDownLeft, ArrowUpRight, Users } from "lucide-react";
import type { BootstrapStatic, Choice, ChoicesResponse } from "../../api/domain";
import { getLineup } from "../../api/requests";
import { LeagueDetails, Match, Season } from "../../domain";
import { GameWeekSelector } from "../GameweekSelector";
import { Manager } from "../Manager";
import { SeasonHeader } from "../SeasonHeader";
import { buildLineup, positionPlayers, type Lineup, type LineupPlayer } from "./domain";
import "./lineups.css";

interface Props {
  leagueDetails: Map<Season, LeagueDetails>;
  bootstrap: Map<Season, BootstrapStatic>;
  draftChoices: Map<Season, ChoicesResponse | undefined>;
}

type Side = Match["teamOne"];

function Player({ player, bench = false }: {
  player: LineupPlayer; bench?: boolean;
}) {
  const value = player.points;
  const label = `${player.fullName}${player.team ? `, ${player.team.name}` : ""}: ${value === undefined ? "points unavailable" : `${value} points`}`;
  return (
    <div className={`lineup-player${bench ? " lineup-player--bench" : ""}`} title={label} aria-label={label}>
      <div className="lineup-player-photo">
        <Avatar
          key={player.id}
          radius="md"
          className="lineup-portrait"
          src={player.player ? `https://resources.premierleague.com/premierleague25/photos/players/40x40/${player.player.code}.png` : undefined}
          name={player.fullName}
        />
        <span className={`lineup-stat${value === undefined || value === 0 ? " lineup-stat--quiet" : ""}${value !== undefined && value < 0 ? " lineup-stat--negative" : ""}`}>
          {value ?? "–"}
        </span>
        {player.substitution ? (
          <span className={`lineup-substitution lineup-substitution--${player.substitution}`} title={`Substituted ${player.substitution}`}>
            {player.substitution === "on" ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
          </span>
        ) : null}
      </div>
      <span className="lineup-player-name">{player.name}</span>
      <span className="lineup-player-club">{player.team?.short_name ?? "Unknown club"}</span>
    </div>
  );
}

function PitchMarkings() {
  return (
    <svg className="lineup-pitch-markings" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M600 0V700" />
        <circle cx="600" cy="350" r="96" />
        <path d="M0 145H155V555H0M1200 145H1045V555H1200" />
        <path d="M0 255H60V445H0M1200 255H1140V445H1200" />
        <path d="M155 270Q220 350 155 430M1045 270Q980 350 1045 430" />
      </g>
      <g fill="currentColor"><circle cx="600" cy="350" r="4" /><circle cx="108" cy="350" r="3" /><circle cx="1092" cy="350" r="3" /></g>
    </svg>
  );
}

function LineupState({ loading, error, upcoming, retry }: {
  loading: boolean; error: boolean; upcoming: boolean; retry: () => void;
}) {
  return (
    <div className="lineup-state" role={loading ? "status" : undefined}>
      <Users size={30} strokeWidth={1.5} aria-hidden="true" />
      <strong>{loading ? "Loading lineup…" : error ? "Couldn’t load this lineup" : upcoming ? "Lineup to come" : "Lineup unavailable"}</strong>
      <span>{loading ? "Getting the squad ready." : error ? "Please try again." : upcoming ? "Check back after the gameweek deadline." : "No saved squad for this gameweek."}</span>
      {error ? <button type="button" onClick={retry}>Try again</button> : null}
    </div>
  );
}

function TeamHeading({ team, lineup, reverse = false }: { team: Side; lineup?: Lineup; reverse?: boolean }) {
  return (
    <div className={`lineup-team-heading${reverse ? " lineup-team-heading--away" : ""}`}>
      <Manager manager={team.manager} teamName={team.name} align={reverse ? "right" : "left"} descriptionClassName="lineup-manager-name text-white font-medium" />
      {lineup ? <span className="lineup-formation" aria-label={`Formation ${lineup.formation}`}>{lineup.formation}</span> : null}
    </div>
  );
}

function Bench({ team, lineup }: { team: Side; lineup?: Lineup }) {
  if (!lineup?.bench.length) return null;
  return (
    <section className="lineup-bench" aria-label={`${team.name} substitutes`}>
      <h3 className="lineup-bench-title">Substitutes</h3>
      <div className="lineup-bench-players">
        {lineup.bench.map(player => <Player key={player.id} player={player} bench />)}
      </div>
    </section>
  );
}

function MatchLineups({ match, home, away, bootstrap, league, draft }: {
  match: Match; home: Side; away: Side; bootstrap: BootstrapStatic; league: LeagueDetails; draft: "Unknown" | Choice[];
}) {
  const [, navigate] = useLocation();
  const canLoad = bootstrap.events.data.some(event => event.id === match.gameWeek && (event.finished || event.id === bootstrap.events.current));
  const homeEntry = league.entries.find(entry => entry.id === home.id);
  const awayEntry = league.entries.find(entry => entry.id === away.id);
  const homeQuery = useQuery(["lineup", match.season, homeEntry?.entryId, match.gameWeek],
    () => getLineup(match.season, homeEntry!.entryId, match.gameWeek),
    { enabled: canLoad && homeEntry !== undefined, retry: 1 });
  const awayQuery = useQuery(["lineup", match.season, awayEntry?.entryId, match.gameWeek],
    () => getLineup(match.season, awayEntry!.entryId, match.gameWeek),
    { enabled: canLoad && awayEntry !== undefined, retry: 1 });
  const homeLineup = homeQuery.data ? buildLineup(homeQuery.data, bootstrap, match.gameWeek) : undefined;
  const awayLineup = awayQuery.data ? buildLineup(awayQuery.data, bootstrap, match.gameWeek) : undefined;
  const latestGameweek = bootstrap.events.current ?? Math.max(0, ...bootstrap.events.data.filter(event => event.finished).map(event => event.id));
  const gameweeks = [...new Set(league.matches.filter(fixture =>
    (fixture.teamOne.id === home.id || fixture.teamTwo.id === home.id) &&
    (fixture.gameWeek <= latestGameweek || fixture.gameWeek === match.gameWeek)).map(fixture => fixture.gameWeek))].sort((a, b) => b - a);
  const changeWeek = (week: number) => navigate(`/season/${match.season}/manager/${home.manager.id}/gameweek/${week}`);
  const resultsPath = `/season/${match.season}/${match.status === "finished" ? "results" : "fixtures"}/${match.gameWeek}`;
  const sides = [
    { side: "home" as const, team: home, lineup: homeLineup, query: homeQuery },
    { side: "away" as const, team: away, lineup: awayLineup, query: awayQuery },
  ];

  return (
    <div className="lineup-page">
      <SeasonHeader
        season={match.season}
        tab={match.status === "finished" ? "results" : "fixtures"}
        matches={league.matches}
        draft={draft}
        nextEvent={bootstrap.events.data.find(event => event.id === bootstrap.events.next)}
        onSeasonChange={season => navigate(`/season/${season}/manager/${home.manager.id}/gameweek/${match.gameWeek}`)}
        onTabChange={tab => navigate(`/season/${match.season}/${tab}`)}
      />
      <div className="flex justify-between items-center p-4">
        <GameWeekSelector gameWeeks={gameweeks} selectedGameWeek={match.gameWeek} setSelectedGameWeek={changeWeek} />
        <Link href={resultsPath} className="text-sm text-foreground-500 hover:underline" aria-label={`Back to ${match.status === "finished" ? "results" : "fixtures"}`}>
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to {match.status === "finished" ? "results" : "fixtures"}</span>
        </Link>
      </div>
      <article className="lineup-card" aria-label={`${home.name} versus ${away.name}, gameweek ${match.gameWeek}`}>
        <div className="lineup-match-header">
          <TeamHeading team={home} lineup={homeLineup} />
          <div className="lineup-score">
            <span className={`lineup-match-status${match.status === "live" ? " lineup-match-status--live" : ""}`}>{match.status === "live" ? "Live" : match.status === "finished" ? "Full time" : "Upcoming"}</span>
            <div>{match.status === "scheduled" ? <span className="lineup-versus">vs</span> : <><span>{home.points}</span><span className="lineup-score-divider">–</span><span>{away.points}</span></>}</div>
          </div>
          <TeamHeading team={away} lineup={awayLineup} reverse />
        </div>
        <div className="lineup-field" aria-label="Starting lineups">
          <PitchMarkings />
          {sides.map(({ side, team, lineup, query }) => (
            <section key={side} className={`lineup-half lineup-half--${side}`} aria-label={`${team.name} starting eleven`}>
              {lineup ? positionPlayers(lineup.starters, side).map(({ player, x, y }) => (
                <div key={player.id} className="lineup-position" style={{ "--player-x": `${x}%`, "--player-y": `${y}%` } as CSSProperties}>
                  <Player player={player} />
                </div>
              )) : <LineupState loading={canLoad && query.isLoading} error={query.isError} upcoming={!canLoad} retry={() => { void query.refetch(); }} />}
            </section>
          ))}
        </div>
        {homeLineup?.bench.length || awayLineup?.bench.length ? <div className="lineup-benches">{sides.map(({ side, team, lineup }) => <Bench key={side} team={team} lineup={lineup} />)}</div> : null}
      </article>
    </div>
  );
}

export function LineupPage({ leagueDetails, bootstrap, draftChoices }: Props) {
  const params = useParams();
  const season = Season.getSeason(params.season);
  const managerId = Number(params.id);
  const gameweek = Number(params.gameweek);
  const league = season ? leagueDetails.get(season) : undefined;
  const seasonBootstrap = season ? bootstrap.get(season) : undefined;
  const match = Number.isSafeInteger(gameweek) && Number.isSafeInteger(managerId) ? league?.matches.find(match =>
    match.gameWeek === gameweek && (match.teamOne.manager.id === managerId || match.teamTwo.manager.id === managerId)) : undefined;
  if (!league || !seasonBootstrap || !match) {
    return <div className="lineup-not-found"><h1>Match not found</h1><p>Choose a fixture to view its lineups.</p><Link href={season ? `/season/${season}/standings` : "/"}>Back to league</Link></div>;
  }
  const home = match.teamOne.manager.id === managerId ? match.teamOne : match.teamTwo;
  const away = home === match.teamOne ? match.teamTwo : match.teamOne;
  const draft = draftChoices.get(match.season)?.choices ?? "Unknown";
  return <MatchLineups key={`${season}-${managerId}-${gameweek}`} match={match} home={home} away={away} bootstrap={seasonBootstrap} league={league} draft={draft} />;
}
