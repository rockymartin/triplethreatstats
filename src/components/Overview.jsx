import { useMemo } from 'react'
import StatCard from './StatCard'

function Overview({ episodes }) {
  const overview = useMemo(() => {
    const total = episodes.length
    const contestantWins = episodes.filter(e => e.final_outcome === 'W').length
    const titanWins = episodes.filter(e => e.final_outcome === 'L').length
    const ties = episodes.filter(e => e.final_outcome === 'T').length

    return {
      total,
      contestantWins,
      titanWins,
      ties,
      contestantWinRate: total > 0 ? Math.round((contestantWins / total * 100) * 10) / 10 : 0,
      titanWinRate: total > 0 ? Math.round((titanWins / total * 100) * 10) / 10 : 0
    }
  }, [episodes])

  return (
    <section className="overview-section-compact">
      <div className="overview-stats-compact">
        <StatCard
          title="Total Episodes"
          value={overview.total}
          color="neutral"
        />
        <StatCard
          title="Contestant Wins"
          value={overview.contestantWins}
          subtitle={`${overview.contestantWinRate}%`}
          color="gold"
        />
        <StatCard
          title="Titan Wins"
          value={overview.titanWins}
          subtitle={`${overview.titanWinRate}%`}
          color="gold"
        />
      </div>
    </section>
  )
}

export default Overview

