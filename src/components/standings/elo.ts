//https://stanislav-stankovic.medium.com/elo-rating-system-6196cc59941e
export const calculateElo = (
    currentRating: number,
    oppositionRating: number,
    outcome: "win" | "loss" | "draw", //TODO is this interface useful?
    k: number = 32, //TODO get actual names for k and c. k can be 16 or 32
    c: number = 400    
) => {
    //TODO get better names for qa, qb, and sa
    const qa = Math.pow(10, currentRating / c)
    const qb = Math.pow(10, oppositionRating / c)
    const expectedOutcome = qa / (qa + qb)
    const sa = outcome === "win" ? 1 : outcome === "draw" ? 0.5 : 0
    return currentRating + (k * (sa - expectedOutcome))
}

// https://medium.com/purple-theory/what-is-elo-rating-c4eb7a9061e0
// If the organizers determined that K =16 and Anand wins, then the new ratings would be:

// Anand = 2600 + 16 (1 – 0.849) = 2602
// Boris = 2300 + 16 (0 – 0.151) = 2298
// If the organizers determined that K =16 and Boris wins, then the new ratings would be:

// Anand = 2600 + 16 (0 – 0.849) = 2586
// Boris = 2300 + 16 (1 – 0.151) = 2314
// console.log(`Anand: ${calculateElo(2600, 2300, "loss")}`)
// console.log(`Boris: ${calculateElo(2300, 2600, "win")}`)

