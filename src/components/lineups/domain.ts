import type { BootstrapStatic, Element, LineupResponse, Team } from "../../api/domain";

export interface LineupPlayer {
  id: number;
  order: number;
  position: number;
  name: string;
  fullName: string;
  player: Element | undefined;
  points: number | undefined;
  team: Team | undefined;
  substitution: "on" | "off" | undefined;
}

export interface Lineup {
  starters: LineupPlayer[];
  bench: LineupPlayer[];
  formation: string;
}

export function buildLineup(data: LineupResponse, bootstrap: BootstrapStatic, gameweek: number): Lineup {
  const players = new Map(bootstrap.elements.map(player => [player.id, player]));
  const teams = new Map(bootstrap.teams.map(team => [team.id, team]));
  const subbedOn = new Set(data.subs.map(sub => sub.element_in));
  const subbedOff = new Set(data.subs.map(sub => sub.element_out));
  const picks = [...data.picks].sort((a, b) => a.position - b.position).map(pick => {
    const player = players.get(pick.element);
    return {
      id: pick.element,
      order: pick.position,
      position: player?.element_type ?? (pick.position === 1 ? 1 : 3),
      name: player?.web_name ?? `Player ${pick.element}`,
      fullName: player ? `${player.first_name} ${player.second_name}` : `Player ${pick.element}`,
      player,
      points: pick.points ?? (gameweek === bootstrap.events.current ? player?.event_points : undefined),
      team: player ? teams.get(player.team) : undefined,
      substitution: subbedOn.has(pick.element) ? "on" as const
        : subbedOff.has(pick.element) ? "off" as const : undefined,
    };
  });
  const starters = picks.filter(pick => pick.order <= 11);
  return {
    starters,
    bench: picks.filter(pick => pick.order > 11),
    formation: [2, 3, 4].map(position => starters.filter(pick => pick.position === position).length).join("–"),
  };
}

export function positionPlayers(players: LineupPlayer[], side: "home" | "away") {
  return [1, 2, 3, 4].flatMap((position, index) => {
    const group = players.filter(player => player.position === position);
    const depth = [9, 33, 58, 83][index];
    return group.map((player, i) => ({
      player,
      x: side === "home" ? depth : 100 - depth,
      y: group.length >= 4
        ? 11 + i * 78 / (group.length - 1)
        : 50 + (i - (group.length - 1) / 2) * 20,
    }));
  });
}
