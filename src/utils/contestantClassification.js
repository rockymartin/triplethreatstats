/**
 * Utility functions for classifying contestants' other appearances
 * Other appearances = appeared on Top Chef OR Tournament of Champions OR Iron Chef America OR Beat Bobby Flay
 * 
 * Lists are loaded from comprehensive JSON datasets in src/data/
 */

import topChefContestantsData from '../data/topChefContestants.json'
import ironChefContestantsData from '../data/ironChefAmericaContestants.json'
import tournamentOfChampionsData from '../data/tournamentOfChampionsContestants.json'
import beatBobbyFlayData from '../data/beatBobbyFlayContestants.json'

// Contestants who appeared on Top Chef (loaded from comprehensive dataset)
const TOP_CHEF_CONTESTANTS = new Set(topChefContestantsData)

// Contestants who appeared on Tournament of Champions (loaded from comprehensive dataset)
const TOURNAMENT_OF_CHAMPIONS_CONTESTANTS = new Set(tournamentOfChampionsData)

// Contestants who appeared on Iron Chef America (loaded from comprehensive dataset)
const IRON_CHEF_AMERICA_CONTESTANTS = new Set(ironChefContestantsData)

// Contestants who appeared on Beat Bobby Flay (loaded from comprehensive dataset)
const BEAT_BOBBY_FLAY_CONTESTANTS = new Set(beatBobbyFlayData)

/**
 * Determines if a contestant has other appearances
 * Other appearances = Top Chef OR Tournament of Champions OR Iron Chef America OR Beat Bobby Flay
 */
export function hasOtherAppearances(contestantName) {
  if (!contestantName) {
    return false
  }
  
  return (
    TOP_CHEF_CONTESTANTS.has(contestantName) ||
    TOURNAMENT_OF_CHAMPIONS_CONTESTANTS.has(contestantName) ||
    IRON_CHEF_AMERICA_CONTESTANTS.has(contestantName) ||
    BEAT_BOBBY_FLAY_CONTESTANTS.has(contestantName)
  )
}

/**
 * Gets the reasons why a contestant has other appearances
 */
export function getOtherAppearancesReasons(contestantName) {
  if (!contestantName) {
    return []
  }
  
  const reasons = []
  
  if (TOP_CHEF_CONTESTANTS.has(contestantName)) {
    reasons.push('Top Chef')
  }
  
  if (TOURNAMENT_OF_CHAMPIONS_CONTESTANTS.has(contestantName)) {
    reasons.push('TOC')
  }
  
  if (IRON_CHEF_AMERICA_CONTESTANTS.has(contestantName)) {
    reasons.push('Iron Chef America')
  }
  
  if (BEAT_BOBBY_FLAY_CONTESTANTS.has(contestantName)) {
    reasons.push('Beat Bobby Flay')
  }
  
  return reasons
}

/**
 * Gets a display label for other appearances status
 */
export function getOtherAppearancesLabel(contestantName) {
  const reasons = getOtherAppearancesReasons(contestantName)
  if (reasons.length === 0) {
    return 'No'
  }
  return reasons.join(', ')
}

// Legacy exports for backward compatibility (deprecated)
export const isStrongCompetitor = hasOtherAppearances
export const getStrongCompetitorReasons = getOtherAppearancesReasons
export const getStrongCompetitorLabel = getOtherAppearancesLabel

