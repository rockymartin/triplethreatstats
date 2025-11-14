/**
 * Utility functions for filtering episodes by titan
 */

export function getEpisodesForTitan(episodes, titanName) {
  return episodes.filter(episode => {
    // Check if titan appears in any round
    return episode.r1_titan === titanName ||
           episode.r2_titan === titanName ||
           episode.r3_titan === titanName
  })
}

export function getTitanRoundDetails(episodes, titanName) {
  const rounds = []
  
  episodes.forEach(episode => {
    for (let roundNum = 1; roundNum <= 3; roundNum++) {
      const titan = episode[`r${roundNum}_titan`]
      if (titan === titanName) {
        const ingredients = episode[`r${roundNum}_ingredients`]
        rounds.push({
          episode: episode,
          round: roundNum,
          contestant: episode.contestant,
          judge: episode.judge,
          ingredients: ingredients,
          outcome: episode[`r${roundNum}_outcome`],
          contestantScore: parseInt(episode[`r${roundNum}_contestant_score`]) || 0,
          titanScore: parseInt(episode[`r${roundNum}_titan_score`]) || 0,
          season: episode.season,
          episodeNumber: episode.episode_number
        })
      }
    }
  })
  
  return rounds.sort((a, b) => {
    // Sort by season, then episode number
    if (a.season !== b.season) {
      return parseInt(a.season) - parseInt(b.season)
    }
    return parseInt(a.episodeNumber) - parseInt(b.episodeNumber)
  })
}

