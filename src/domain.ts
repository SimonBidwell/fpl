import {
  Element as FplElement,
  ElementStatus as FplElementStatus,
  LeagueDetails as FplLeagueDetails,
  Match as FplMatch,
  ElementType as FplPosition,
  Team as FplTeam,
} from "./api/domain";
import { indexBy } from "./helpers";

export const SEASONS = [
  "2020-21",
  "2021-22",
  "2022-23",
  "2023-24",
  "2024-25",
  "2025-26",
] as const;
export const DEFAULT_SEASON = SEASONS[SEASONS.length - 1];
export type Season = (typeof SEASONS)[number];
export const Season = {
  isSeason: (s: unknown): s is Season => SEASONS.includes(s as Season),
  sort: (a: Season, b: Season) => a.localeCompare(b),
  getSeason: (s: unknown): Season | undefined => {
    if (typeof s === "string") {
      return SEASONS.find((season) => season === s);
    }
    return undefined;
  },
  toDisplayFormat: (s: Season): string => s.replaceAll("-", "/"),
};

export interface NotablePlacement {
  season: string;
  position: number;
}

export interface Manager {
  id: number;
  name: string;
  teams: Record<Season, number>;
  entries: Record<Season, number>;
  notablePlacements: NotablePlacement[];
  color: string;
}
export const MANAGERS = [
  {
    id: 1,
    name: "Ed Brett",
    teams: {
      "2020-21": 1,
      "2021-22": 154306,
      "2022-23": 1,
      "2023-24": 115199,
      "2024-25": 28773,
      "2025-26": 333896,
    },
    entries: {
      "2020-21": 1,
      "2021-22": 154068,
      "2022-23": 1,
      "2023-24": 114849,
      "2024-25": 28723,
      "2025-26": 334301,
    },
    notablePlacements: [],
    color: "#ef4444",
  },
  {
    id: 2,
    name: "Alex Harrison",
    teams: {
      "2020-21": 3,
      "2021-22": 154519,
      "2022-23": 3,
      "2023-24": 115222,
      "2024-25": 24026,
      "2025-26": 334690,
    },
    entries: {
      "2020-21": 3,
      "2021-22": 154279,
      "2022-23": 3,
      "2023-24": 114872,
      "2024-25": 23994,
      "2025-26": 335088,
    },
    notablePlacements: [{ season: "2021-22", position: 1 }],
    color: "#f59e0b",
  },
  {
    id: 3,
    name: "Ollie Craig",
    teams: {
      "2020-21": 4,
      "2021-22": 154677,
      "2022-23": 4,
      "2023-24": 116308,
      "2024-25": 22781,
      "2025-26": 335338,
    },
    entries: {
      "2020-21": 4,
      "2021-22": 154436,
      "2022-23": 4,
      "2023-24": 115955,
      "2024-25": 22752,
      "2025-26": 335728,
    },
    notablePlacements: [
      { season: "2023-24", position: 1 },
      { season: "2024-25", position: 1 },
    ],
    color: "#fde047",
  },
  {
    id: 4,
    // name: "Charlie Schofield",
    name: "Jonathan Purvis",
    teams: {
      "2020-21": 6,
      "2021-22": 201935,
      "2022-23": 6,
      "2023-24": 118328,
      "2024-25": 23533,
      //Jon from here
      "2025-26": 340643,
    },
    entries: {
      "2020-21": 6,
      "2021-22": 201554,
      "2022-23": 6,
      "2023-24": 117961,
      "2024-25": 23503,
      //Jon from here
      "2025-26": 341006,
    },
    notablePlacements: [
      // { season: "2022-23", position: 1 }
    ],
    color: "#22c55e",
  },
  {
    id: 5,
    name: "Simon Bidwell",
    teams: {
      "2020-21": 12,
      "2021-22": 208300,
      "2022-23": 12,
      "2023-24": 123888,
      "2024-25": 21776,
      "2025-26": 333433,
    },
    entries: {
      "2020-21": 12,
      "2021-22": 207888,
      "2022-23": 12,
      "2023-24": 123495,
      "2024-25": 21751,
      "2025-26": 333841,
    },
    notablePlacements: [{ season: "2019-20", position: 1 }],
    color: "#670E36",
  },
  {
    id: 6,
    name: "Anjit Aulakh",
    teams: {
      "2020-21": 5,
      "2021-22": 154909,
      "2022-23": 5,
      "2023-24": 139985,
      "2024-25": 23618,
      "2025-26": 362777,
    },
    entries: {
      "2020-21": 5,
      "2021-22": 154668,
      "2022-23": 5,
      "2023-24": 139532,
      "2024-25": 23588,
      "2025-26": 362708,
    },
    notablePlacements: [
      { season: "2020-21", position: 1 },
      { season: "2024-25", position: 12 },
    ],
    color: "#059669",
  },
  {
    id: 7,
    name: "Aaron Veale",
    teams: {
      "2020-21": 2,
      "2021-22": 154352,
      "2022-23": 2,
      "2023-24": 140440,
      "2024-25": 145990,
      "2025-26": 422898,
    },
    entries: {
      "2020-21": 2,
      "2021-22": 154113,
      "2022-23": 2,
      "2023-24": 139981,
      "2024-25": 145310,
      "2025-26": 421637,
    },
    notablePlacements: [
      { season: "2021-22", position: 12 },
      { season: "2023-24", position: 12 },
    ],
    color: "#06b6d4",
  },
  {
    id: 8,
    name: "Sebastian Waters",
    teams: {
      "2020-21": 9,
      "2021-22": 206495,
      "2022-23": 9,
      "2023-24": 142413,
      "2024-25": 146507,
      "2025-26": 400317,
    },
    entries: {
      "2020-21": 9,
      "2021-22": 206091,
      "2022-23": 9,
      "2023-24": 141943,
      "2024-25": 145824,
      "2025-26": 399667,
    },
    notablePlacements: [],
    color: "#a855f7",
  },
  {
    id: 9,
    name: "Alexander Greenhalgh",
    teams: {
      "2020-21": 7,
      "2021-22": 205525,
      "2022-23": 7,
      "2023-24": 142602,
      "2024-25": 198584,
      "2025-26": 375720,
    },
    entries: {
      "2020-21": 7,
      "2021-22": 205124,
      "2022-23": 7,
      "2023-24": 142132,
      "2024-25": 197538,
      "2025-26": 375295,
    },
    notablePlacements: [],
    color: "#ec4899",
  },
  {
    id: 10,
    name: "Sam Senior",
    teams: {
      "2020-21": 10,
      "2021-22": 207042,
      "2022-23": 10,
      "2023-24": 147306,
      "2024-25": 191841,
      "2025-26": 344571,
    },
    entries: {
      "2020-21": 10,
      "2021-22": 206636,
      "2022-23": 10,
      "2023-24": 146808,
      "2024-25": 190843,
      "2025-26": 344919,
    },
    notablePlacements: [
      { season: "2020-21", position: 12 },
      { season: "2022-23", position: 12 },
    ],
    color: "#f43f5e",
  },
  {
    id: 11,
    name: "Ben Malpass",
    teams: {
      "2020-21": 8,
      "2021-22": 206241,
      "2022-23": 8,
      "2023-24": 150040,
      "2024-25": 303394,
      "2025-26": 392127,
    },
    entries: {
      "2020-21": 8,
      "2021-22": 205838,
      "2022-23": 8,
      "2023-24": 149528,
      "2024-25": 300884,
      "2025-26": 391545,
    },
    notablePlacements: [],
    color: "#0f766e",
  },
  {
    id: 12,
    name: "Luke Trevett",
    teams: {
      "2020-21": 11,
      "2021-22": 208287,
      "2022-23": 11,
      "2023-24": 169965,
      "2024-25": 268172,
      "2025-26": 335523,
    },
    entries: {
      "2020-21": 11,
      "2021-22": 207875,
      "2022-23": 11,
      "2023-24": 169318,
      "2024-25": 266197,
      "2025-26": 335912,
    },
    notablePlacements: [],
    color: "#404040",
  },
];

export const Manager = {
  bySeason: SEASONS.reduce<Partial<Record<Season, Record<number, Manager>>>>(
    (acc, season) => ({
      ...acc,
      [season]: MANAGERS.reduce(
        (acc, manager) => ({
          ...acc,
          [manager.teams[season]]: manager,
        }),
        {}
      ),
    }),
    {}
  ),
  entryIdBySeason: SEASONS.reduce<
    Partial<Record<Season, Record<number, Manager>>>
  >(
    (acc, season) => ({
      ...acc,
      [season]: MANAGERS.reduce(
        (acc, manager) => ({
          ...acc,
          [manager.entries[season]]: manager,
        }),
        {}
      ),
    }),
    {}
  ),
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
  from: ({
    fplMatch,
    season,
    teams,
  }: {
    fplMatch: FplMatch;
    season: Season;
    teams: Map<number, Entry>;
  }): Match | undefined => {
    const {
      event,
      finished,
      started,
      league_entry_1: oneId,
      league_entry_1_points: onePoints,
      league_entry_2: twoId,
      league_entry_2_points: twoPoints,
    } = fplMatch;
    const managers = Manager.bySeason[season];
    const managerOne = managers?.[oneId];
    const managerTwo = managers?.[twoId];
    const teamNameOne = teams.get(oneId)?.name;
    const teamNameTwo = teams.get(twoId)?.name;
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
  getResult: (match: Match) => {
    if (Match.isFinished(match)) {
      const { teamOne, teamTwo } = match;
      if (teamOne.points === teamTwo.points) {
        return "draw";
      } else if (teamOne.points > teamTwo.points) {
        return { winner: teamOne, loser: teamTwo };
      } else {
        return { winner: teamTwo, loser: teamOne };
      }
    } else {
      return undefined;
    }
  },
  getWinner: (match: Match) => {
    const result = Match.getResult(match);
    return result === undefined || result === "draw"
      ? undefined
      : result.winner;
  },
  getLoser: (match: Match) => {
    const result = Match.getResult(match);
    return result === undefined || result === "draw" ? undefined : result.loser;
  },
  isWinner: (match: Match, teamId: number): boolean =>
    Match.getWinner(match)?.id === teamId,
  isLoser: (match: Match, teamId: number): boolean =>
    Match.getLoser(match)?.id === teamId,
  isDraw: (match: Match): boolean => Match.getResult(match) === "draw",
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
  getTeam: (match: Match, teamId: number) =>
    Match.getAlignment(match, teamId)?.team,
  getOpposition: (match: Match, teamId: number) =>
    Match.getAlignment(match, teamId)?.opposition,
  getAlignment: ({ teamOne, teamTwo }: Match, teamId: number) =>
    teamOne.id === teamId
      ? { team: teamOne, opposition: teamTwo }
      : teamTwo.id === teamId
      ? { team: teamTwo, opposition: teamOne }
      : undefined,
  isFinished: ({ status }: Match) => status === "finished",
  getMaxPoints: ({ teamOne, teamTwo }: Match) =>
    Math.max(teamOne.points, teamTwo.points),
  getMinPoints: ({ teamOne, teamTwo }: Match) =>
    Math.min(teamOne.points, teamTwo.points),
  getWinningRatio: ({ teamOne, teamTwo }: Match) =>
    Math.max(teamOne.points / teamTwo.points, teamTwo.points / teamOne.points),
};

export const SEASON_NOTES: Partial<
  Record<
    Season,
    {
      general: string;
      gameweeks: Record<number, { description: string; url?: string }>;
    }
  >
> = {
  "2020-21": {
    general:
      "The data for the 2020/21 season was manually reconstructed. It could contain mistakes/inaccuracies.",
    gameweeks: {
      11: {
        description:
          "No results could be found. The scores are best guesses based on the known fixtures and standings before gameweek 11 and after gameweek 12.",
      },
      12: {
        description:
          "No results could be found. The scores are best guesses based on the known fixtures and standings before gameweek 11 and after gameweek 12.",
      },
    },
  },
  "2022-23": {
    general:
      "The data for the 2022/23 season was manually reconstructed. It could contain mistakes/inaccuracies.",
    gameweeks: {
      7: {
        description:
          "The Premier League postponed games as a mark of respect to Queen Elizabeth II so all teams scored 0 points",
        url: "https://twitter.com/OfficialFPL/status/1568210457286086661",
      },
    },
  },
};

export interface Entry {
  id: number;
  entryId: number;
  name: string;
  manager: Manager;
}

export interface LeagueDetails {
  league: {
    id: number;
    name: string;
    transactionMode: string;
    season: Season;
  };
  entries: Entry[];
  matches: Match[];
}
export const LeagueDetails = {
  build: (
    {
      league: { id, name, transaction_mode },
      league_entries,
      matches: fplMatches,
    }: FplLeagueDetails,
    season: Season
  ): LeagueDetails => {
    const managers = Manager.bySeason[season];
    const entries = league_entries
      .map((le) => {
        const manager = managers?.[le.id];
        if (manager) {
          return {
            id: le.id,
            entryId: le.entry_id,
            name: le.entry_name,
            manager,
          };
        } else {
          return undefined;
        }
      })
      .filter((e): e is Entry => e !== undefined);
    const entriesById = indexBy(entries, (e) => e.id);
    const matches = fplMatches
      .map((m) => Match.from({ fplMatch: m, season, teams: entriesById }))
      .filter((m): m is Match => m !== undefined);
    return {
      league: {
        id: id,
        name: name,
        transactionMode: transaction_mode,
        season: season,
      },
      entries,
      matches,
    };
  },
};

export const PLAYER_NAME_OVERRIDES: Record<number, string> = {
  141746: "Bruno Fernandes",
  430871: "Matheus Cunha",
  165809: "Bernardo Silva",
  447203: "Darwin Núñez",
  230046: "Douglas Luiz",
  444145: "Gabriel Martinelli",
  475168: "João Pedro",
  208706: "Bruno Guimarães",
  205651: "Gabriel Jesus",
  224024: "Lucas Paquetá",
  156689: "Andreas Pereira",
  212319: "Richarlison",
  247632: "Pedro Neto",
  47431: "Willian",
  179018: "Miguel Almirón",
  194634: "Diogo Jota",
  216051: "Diogo Dalot",
  180974: "Joelinton",
  51090: "Thiago Silva",
  109533: "Emerson Palmieri",
  152551: "Jefferson Lerma",
  154296: "João Palhinha",
  199798: "Ezri Konsa",
  200402: "Nelson Semedo",
  226597: "Gabriel",
  467169: "Antony",
  171314: "Rúben Dias",
  69752: "Neto",
  98980: "Emiliano Martínez",
  575476: "Murillo",
  116535: "Alisson Becker",
  448089: "João Gomes",
  486672: "Moisés Caicedo",
  61256: "Casemiro",
  149065: "José Sá",
  510362: "Toti",
  220307: "Arnaut Danjuma",
  213999: "Edson Álvarez",
  424001: "Vinícius Souza",
  241157: "Emerson Royal",
  121160: "Ederson",
  465607: "Ansu Fati",
  486385: "Beto",
  179268: "Marc Cucurella",
  226956: "Mads Roerslev",
  165659: "Diego Carlos",
  245824: "Carlos Vinícius",
  106468: "Àlex Moreno",
  465351: "Matheus Nunes",
  438098: "Fábio Vieira",
  223434: "Igor",
  441455: "Vitinha",
  244042: "Rodrigo Muniz",
  217593: "Pablo Fornals",
  490721: "Hugo Bueno",
  488404: "Facundo Pellistri",
  436234: "Bryan Gil",
  85955: "Jorginho",
  513046: "Danilo",
  536694: "Matheus França",
  116404: "Felipe",
  183751: "Manuel Benson",
  491012: "Youssef Chermiti",
  88248: "Sefan Ortega",
  437626: "Nuno Tavares",
  84583: "Philippe Coutinho",
  617054: "Deivid Washington",
  532605: "Andrey Santos",
  58822: "Cédric Soares",
  479683: "Marquinhos",
  195546: "Emi Buendía",
  213345: "Wesley",
  174932: "Sergi Canós",
  441192: "Jeremy Sarmiento",
  66749: "Romelu Lukaku",
  166324: "Ivan Cavaleiro",
  60706: "Adrián",
  116643: "Fabinho",
  61558: "Thiago Alcántara",
  515501: "Álvaro Fernández",
  101582: "Fred",
  461682: "Brandon Aguilera",
  185253: "Gustavo Scarpa",
  231372: "Tanguy Ndombélé",
  510363: "Chiquinho",
  181284: "Gonçalo Guedes",
  428610: "Bruno Jordão",
  200600: "Daniel Podence",
  518620: "Ângelo",
  491011: "Diego Moreira",
  492779: "Yago Santiago",
  443629: "Marcelo Pitaluga",
  220566: "Rodri",
  154561: "David Raya",
  51940: "David De Gea",
  171317: "Ruben Neves",
  159533: "Adama Traoré",
  198849: "Lucas Torreira",
  120250: "André Gomes",
  224995: "Luis Sinisterra",
  38533: "Rui Patrício",
  19624: "João Moutinho",
  121145: "João Cancelo",
  14937: "Cristiano Ronaldo",
  219961: "Raphinha",
  78056: "Oriol Romeu",
  95715: "Lucas Moura",
  122798: "Andy Robertson",
  172850: "Ben Chilwell",
  165808: "Helder Costa",
  182539: "Dani Ceballos",
  148508: "Trézéguet",
  109345: "Solly March",
  153256: "Mohamed Elneny",
  205533: "Eddie Nketiah",
  146426: "Semi Ajayi",
};

export type Team = FplTeam;
export type Position = FplPosition;
export type Player = FplElement & { displayName: string };
export const Player = {
  build: (element: FplElement): Player => ({
    ...element,
    displayName:
      PLAYER_NAME_OVERRIDES[element.code] ??
      `${element.first_name} ${element.second_name}`,
  }),
};
export type PlayerStatus = FplElementStatus;
