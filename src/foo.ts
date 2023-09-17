// console.log("Hello world")

// const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

// const getAllUniquePairs = (ids: number[]): [number, number][] => {
//     const allPossibleMatches: [number, number][] = [];
//     for (let i = 0; i < ids.length; i++) {
//         const team = ids[i];
//         for (let j = i + 1; j < ids.length; j++) {
//             const opponent = ids[j]
//             const game = [team, opponent] as [number, number]
//             allPossibleMatches.push(game)
//         }
//     }
//     return allPossibleMatches
// }

// const foo = 

// console.log(foo.league.name)
// const teamIds = foo.league_entries.map(x => x.id)
// const allPossibleMatches = getAllUniquePairs(teamIds)
// const teamsByIds = foo.league_entries.reduce((a,b) => {
//     a.set(b.id, b)
//     return a
// }, new Map())

// const getFairPointsForGameWeek = (gameweek: number): Map<number, number> => {
//     const gameweekScores = foo.matches.filter(match => match.event === gameweek).reduce((a, b) => {
//         a.set(b.league_entry_1, b.league_entry_1_points);
//         a.set(b.league_entry_2, b.league_entry_2_points);
//         return a
//     }, new Map())
//     const pointsForWeek = allPossibleMatches.reduce(
//         (a, b) => {
//             const [teamA, teamB] = b;
//             const teamATotal = a.get(teamA) ?? 0;
//             const teamBTotal = a.get(teamB) ?? 0;
//             const teamAPoints = gameweekScores.get(teamA) ?? 0;
//             const teamBPoints = gameweekScores.get(teamB) ?? 0;
//             if (teamAPoints > teamBPoints) {
//                 a.set(teamA, teamATotal + 3)
//             } else if (teamBPoints > teamAPoints) {
//                 a.set(teamB, teamBTotal + 3)
//             } else {
//                 a.set(teamA, teamATotal + 1)
//                 a.set(teamB, teamBTotal + 1)
//             }
//             return a;
//         },
//         new Map()
//     )
    
//     const fairPoints = teamIds.reduce(
//         (a, b) => {
//             const fairPoints = (pointsForWeek.get(b) ?? 0) / 11
//             a.set(b, fairPoints)
//             return a
//         }, 
//         new Map()
//     )
//     return fairPoints
// }

// const one = getFairPointsForGameWeek(1)
// const two = getFairPointsForGameWeek(2)
// const three = getFairPointsForGameWeek(3)
// const four = getFairPointsForGameWeek(4)
// const total = teamIds.reduce(
//     (a, b) => {
//         const oneT = one.get(b) ?? 0
//         const twoT = two.get(b) ?? 0
//         const threeT = three.get(b) ?? 0
//         const fourT = four.get(b) ?? 0
//         a.set(b, oneT + twoT + threeT + fourT)
//         return a;
//     },
//     new Map()
// )
// console.log(total);
// const table = new Array(...total.entries()).sort(
//     ([,a], [,b]) => (b as any) - (a as any)
// ).map(
//     ([id, pts], i) => {
//         const entry = teamsByIds.get(id);
//         const teamName = entry?.entry_name ?? "";
//         const playerName = `${entry?.player_first_name ?? ""} ${entry?.player_last_name ?? ""}`.trim()
//         return `${i + 1}. ${teamName} (${playerName}) ${(pts as any).toFixed(3)}`
//     }
// )
// console.log(table.join("\n"))

// export interface EventSummary {
//     event: number
//     playerId: number
//     opponentId: number
//     scoreFor: number
//     scoreAgainst: number
//     eventExpectedPoints: number
// }

// export interface PlayerStanding {
//     playerId: number
//     draws: number
//     lost: number
//     won: number
//     scoreFor: number
//     scoreAgainst: number
//     expectedPoints: number
//     events: EventSummary[]
// }

// export type Standings = PlayerStanding[]

