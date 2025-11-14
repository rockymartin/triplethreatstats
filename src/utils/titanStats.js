/**
 * Utility functions for calculating titan statistics
 */

export function calculateTitanStats(episodes) {
  const titanStats = {}

  episodes.forEach(episode => {
    for (let roundNum = 1; roundNum <= 3; roundNum++) {
      const titan = episode[`r${roundNum}_titan`]
      if (!titan) continue

      if (!titanStats[titan]) {
        titanStats[titan] = {
          rounds: { 1: { wins: 0, losses: 0, ties: 0, total: 0 }, 2: { wins: 0, losses: 0, ties: 0, total: 0 }, 3: { wins: 0, losses: 0, ties: 0, total: 0 } },
          totalRounds: 0,
          totalWins: 0,
          totalLosses: 0,
          totalTies: 0,
          scores: { contestant: [], titan: [] },
          margins: []
        }
      }

      const outcome = episode[`r${roundNum}_outcome`]
      const contestantScore = parseInt(episode[`r${roundNum}_contestant_score`]) || 0
      const titanScore = parseInt(episode[`r${roundNum}_titan_score`]) || 0

      titanStats[titan].rounds[roundNum].total++
      titanStats[titan].totalRounds++

      // Calculate margin (titanScore - contestantScore)
      let margin = titanScore - contestantScore
      
      // Normalize Round 3 margins to 10-point scale for fair comparison
      // (Round 3 is worth 20 points, so divide by 2)
      if (roundNum === 3) {
        margin = margin / 2
      }

      if (outcome === 'W') {
        // Contestant wins - titan loses, margin should be negative
        titanStats[titan].rounds[roundNum].losses++
        titanStats[titan].totalLosses++
        titanStats[titan].margins.push(margin)
      } else if (outcome === 'L') {
        // Titan wins - margin should be positive
        titanStats[titan].rounds[roundNum].wins++
        titanStats[titan].totalWins++
        titanStats[titan].margins.push(margin)
      } else {
        titanStats[titan].rounds[roundNum].ties++
        titanStats[titan].totalTies++
        titanStats[titan].margins.push(0)
      }

      // Store round-specific margins for breakdown (normalized)
      if (!titanStats[titan].roundMargins) {
        titanStats[titan].roundMargins = { 1: [], 2: [], 3: [] }
      }
      titanStats[titan].roundMargins[roundNum].push(margin)

      titanStats[titan].scores.contestant.push(contestantScore)
      titanStats[titan].scores.titan.push(titanScore)
    }
  })

  // Calculate derived statistics
  const result = {}
  Object.keys(titanStats).forEach(titan => {
    const stats = titanStats[titan]
    // Win rate = wins / (wins + losses), excluding ties
    const totalGames = stats.totalWins + stats.totalLosses
    const winRate = totalGames > 0 ? (stats.totalWins / totalGames * 100) : 0

    const avgContestantScore = stats.scores.contestant.length > 0
      ? stats.scores.contestant.reduce((a, b) => a + b, 0) / stats.scores.contestant.length
      : 0

    const avgTitanScore = stats.scores.titan.length > 0
      ? stats.scores.titan.reduce((a, b) => a + b, 0) / stats.scores.titan.length
      : 0

    // Calculate average margin (all rounds normalized to 10-point scale)
    const avgMargin = stats.margins.length > 0
      ? stats.margins.reduce((a, b) => a + b, 0) / stats.margins.length
      : 0

    // Calculate round-specific average margins
    const avgMarginR1 = stats.roundMargins[1].length > 0
      ? stats.roundMargins[1].reduce((a, b) => a + b, 0) / stats.roundMargins[1].length
      : 0
    const avgMarginR2 = stats.roundMargins[2].length > 0
      ? stats.roundMargins[2].reduce((a, b) => a + b, 0) / stats.roundMargins[2].length
      : 0
    const avgMarginR3 = stats.roundMargins[3].length > 0
      ? stats.roundMargins[3].reduce((a, b) => a + b, 0) / stats.roundMargins[3].length
      : 0

    const winMargins = stats.margins.filter(m => m > 0)
    const lossMargins = stats.margins.filter(m => m < 0).map(m => Math.abs(m))

    result[titan] = {
      totalRounds: stats.totalRounds,
      wins: stats.totalWins,
      losses: stats.totalLosses,
      ties: stats.totalTies,
      winRate: Math.round(winRate * 10) / 10,
      rounds: {
        1: {
          ...stats.rounds[1],
          winRate: (stats.rounds[1].wins + stats.rounds[1].losses) > 0
            ? Math.round((stats.rounds[1].wins / (stats.rounds[1].wins + stats.rounds[1].losses) * 100) * 10) / 10
            : 0
        },
        2: {
          ...stats.rounds[2],
          winRate: (stats.rounds[2].wins + stats.rounds[2].losses) > 0
            ? Math.round((stats.rounds[2].wins / (stats.rounds[2].wins + stats.rounds[2].losses) * 100) * 10) / 10
            : 0
        },
        3: {
          ...stats.rounds[3],
          winRate: (stats.rounds[3].wins + stats.rounds[3].losses) > 0
            ? Math.round((stats.rounds[3].wins / (stats.rounds[3].wins + stats.rounds[3].losses) * 100) * 10) / 10
            : 0
        }
      },
      avgContestantScore: Math.round(avgContestantScore * 100) / 100,
      avgTitanScore: Math.round(avgTitanScore * 100) / 100,
      avgMargin: Math.round(avgMargin * 100) / 100,
      avgMarginR1: Math.round(avgMarginR1 * 100) / 100,
      avgMarginR2: Math.round(avgMarginR2 * 100) / 100,
      avgMarginR3: Math.round(avgMarginR3 * 100) / 100,
      avgWinMargin: winMargins.length > 0
        ? Math.round((winMargins.reduce((a, b) => a + b, 0) / winMargins.length) * 100) / 100
        : 0,
      avgLossMargin: lossMargins.length > 0
        ? Math.round((lossMargins.reduce((a, b) => a + b, 0) / lossMargins.length) * 100) / 100
        : 0,
      maxWinMargin: winMargins.length > 0 ? Math.max(...winMargins) : 0,
      maxLossMargin: lossMargins.length > 0 ? Math.max(...lossMargins) : 0
    }
  })

  return result
}

export function getRoundFrequency(episodes) {
  const frequency = {}

  episodes.forEach(episode => {
    for (let roundNum = 1; roundNum <= 3; roundNum++) {
      const titan = episode[`r${roundNum}_titan`]
      if (!titan) continue

      if (!frequency[titan]) {
        frequency[titan] = { round1: 0, round2: 0, round3: 0, total: 0 }
      }

      frequency[titan][`round${roundNum}`]++
      frequency[titan].total++
    }
  })

  return frequency
}

