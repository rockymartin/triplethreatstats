/**
 * Human-readable coverage line for the episode dataset (full JSON, not filter state).
 */
export function getDataCoverageLabel(episodes) {
  if (!episodes?.length) return null

  let maxSeason = -Infinity
  const episodesBySeason = new Map()

  for (const ep of episodes) {
    const s = parseInt(ep.season, 10)
    const n = parseInt(ep.episode_number, 10)
    if (Number.isNaN(s) || Number.isNaN(n)) continue
    if (s > maxSeason) maxSeason = s
    if (!episodesBySeason.has(s)) episodesBySeason.set(s, [])
    episodesBySeason.get(s).push(n)
  }

  if (maxSeason === -Infinity) return null

  const nums = episodesBySeason.get(maxSeason) || []
  const maxEp = nums.length ? Math.max(...nums) : 0

  return `Dataset covers Season ${maxSeason} through episode ${maxEp} (${episodes.length} episodes total).`
}
