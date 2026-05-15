import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { calculateTitanStats, getRoundFrequency } from '../utils/titanStats'
import StatCard from './StatCard'
import { CollapsibleStatsSection } from './CollapsibleStatsSection'
import { RoundFrequencySparkline } from './RoundFrequencySparkline'

function getTitanUrl(titan) {
  return `/titan/${titan.replace(/\s+/g, '_')}`
}

function TitanStats({ episodes }) {
  const titanStats = useMemo(() => calculateTitanStats(episodes), [episodes])
  const roundFrequency = useMemo(() => getRoundFrequency(episodes), [episodes])

  const titans = Object.keys(titanStats)

  const sortedTitans = [...titans].sort((a, b) => {
    const roundsA = titanStats[a].totalRounds
    const roundsB = titanStats[b].totalRounds
    if (roundsB !== roundsA) {
      return roundsB - roundsA
    }
    return a.localeCompare(b)
  })

  const maxWinRate = Math.max(...titans.map((t) => titanStats[t].winRate))
  const maxAvgMargin = Math.max(...titans.map((t) => titanStats[t].avgMargin))

  const roundAppearanceDomainMax = useMemo(() => {
    let m = 1
    for (const t of sortedTitans) {
      const f = roundFrequency[t]
      if (!f) continue
      m = Math.max(m, f.round1 || 0, f.round2 || 0, f.round3 || 0)
    }
    return m
  }, [sortedTitans, roundFrequency])

  return (
    <section className="titan-stats-section">
      <h2>Titan Performance Statistics</h2>

      <CollapsibleStatsSection
        id="section-win-rate"
        step={1}
        title="Overall Win Rate"
        defaultOpenMobile
      >
        <div className="stats-grid">
          {sortedTitans.map((titan) => {
            const stats = titanStats[titan]
            const isBest = stats.winRate === maxWinRate
            return (
              <StatCard
                key={titan}
                title={titan}
                value={`${stats.winRate}%`}
                subtitle={`${stats.wins}W / ${stats.losses}L / ${stats.ties}T`}
                color="gold"
                highlight={isBest}
                linkTo={getTitanUrl(titan)}
              />
            )
          })}
        </div>
      </CollapsibleStatsSection>

      <CollapsibleStatsSection
        id="section-margin"
        step={2}
        title="Average Margin"
        note={
          <p className="stats-note">
            All rounds normalized to 10-point scale for fair comparison
          </p>
        }
      >
        <div className="stats-grid">
          {sortedTitans.map((titan) => {
            const stats = titanStats[titan]
            const isBest = stats.avgMargin === maxAvgMargin
            const color =
              stats.avgMargin > 0
                ? 'emerald'
                : stats.avgMargin < 0
                  ? 'red'
                  : 'neutral'
            return (
              <StatCard
                key={titan}
                title={titan}
                value={
                  stats.avgMargin > 0
                    ? `+${stats.avgMargin.toFixed(1)}`
                    : `${stats.avgMargin.toFixed(1)}`
                }
                subtitle={`R1: ${stats.avgMarginR1 > 0 ? '+' : ''}${stats.avgMarginR1.toFixed(1)} | R2: ${stats.avgMarginR2 > 0 ? '+' : ''}${stats.avgMarginR2.toFixed(1)} | R3: ${stats.avgMarginR3 > 0 ? '+' : ''}${stats.avgMarginR3.toFixed(1)}`}
                color={color}
                highlight={isBest}
                linkTo={getTitanUrl(titan)}
              />
            )
          })}
        </div>
      </CollapsibleStatsSection>

      <CollapsibleStatsSection
        id="section-round-freq"
        step={3}
        title="Round Appearance Frequency"
      >
        <div className="stats-grid">
          {sortedTitans.map((titan) => {
            const freq = roundFrequency[titan]
            return (
              <div key={titan} className="round-frequency-card">
                <Link
                  to={getTitanUrl(titan)}
                  className="round-frequency-title round-frequency-title-link"
                >
                  {titan}
                </Link>
                <RoundFrequencySparkline
                  round1={freq?.round1 || 0}
                  round2={freq?.round2 || 0}
                  round3={freq?.round3 || 0}
                  domainMax={roundAppearanceDomainMax}
                />
                <div className="round-frequency-stats">
                  <div className="round-frequency-item">
                    <span className="round-frequency-label">R1</span>
                    <span
                      className="round-frequency-value"
                      style={{ color: '#fbbf24' }}
                    >
                      {freq?.round1 || 0}
                    </span>
                  </div>
                  <div className="round-frequency-item">
                    <span className="round-frequency-label">R2</span>
                    <span
                      className="round-frequency-value"
                      style={{ color: '#1e40af' }}
                    >
                      {freq?.round2 || 0}
                    </span>
                  </div>
                  <div className="round-frequency-item">
                    <span className="round-frequency-label">R3</span>
                    <span
                      className="round-frequency-value"
                      style={{ color: '#059669' }}
                    >
                      {freq?.round3 || 0}
                    </span>
                  </div>
                  <div className="round-frequency-total">
                    Total: {freq?.total || 0}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CollapsibleStatsSection>

      <CollapsibleStatsSection
        id="section-round-winrate"
        step={4}
        title="Win Rate by Round"
      >
        <div className="stats-grid">
          {sortedTitans.map((titan) => {
            const stats = titanStats[titan]
            return (
              <div key={titan} className="round-winrate-card">
                <Link
                  to={getTitanUrl(titan)}
                  className="round-winrate-title round-winrate-title-link"
                >
                  {titan}
                </Link>
                <div className="round-winrate-stats">
                  <div className="round-winrate-item">
                    <span className="round-winrate-label">Round 1</span>
                    <span
                      className="round-winrate-value"
                      style={{ color: '#fbbf24' }}
                    >
                      {stats.rounds[1].winRate}%
                    </span>
                    <span className="round-winrate-count">
                      ({stats.rounds[1].wins}-{stats.rounds[1].losses})
                    </span>
                  </div>
                  <div className="round-winrate-item">
                    <span className="round-winrate-label">Round 2</span>
                    <span
                      className="round-winrate-value"
                      style={{ color: '#1e40af' }}
                    >
                      {stats.rounds[2].winRate}%
                    </span>
                    <span className="round-winrate-count">
                      ({stats.rounds[2].wins}-{stats.rounds[2].losses})
                    </span>
                  </div>
                  <div className="round-winrate-item">
                    <span className="round-winrate-label">Round 3</span>
                    <span
                      className="round-winrate-value"
                      style={{ color: '#059669' }}
                    >
                      {stats.rounds[3].winRate}%
                    </span>
                    <span className="round-winrate-count">
                      ({stats.rounds[3].wins}-{stats.rounds[3].losses})
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CollapsibleStatsSection>

      <CollapsibleStatsSection
        id="section-detail-table"
        step={5}
        title="Detailed Statistics"
      >
        <div className="stats-table-wrap">
          <div className="stats-table-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Titan</th>
                  <th>Total Rounds</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>Ties</th>
                  <th>Win Rate</th>
                  <th>Avg Margin</th>
                  <th>Round 1 Win Rate</th>
                  <th>Round 2 Win Rate</th>
                  <th>Round 3 Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {sortedTitans.map((titan) => {
                  const stats = titanStats[titan]
                  return (
                    <tr key={titan}>
                      <td>
                        <Link
                          to={getTitanUrl(titan)}
                          className="titan-table-link"
                        >
                          <strong>{titan}</strong>
                        </Link>
                      </td>
                      <td>{stats.totalRounds}</td>
                      <td>{stats.wins}</td>
                      <td>{stats.losses}</td>
                      <td>{stats.ties}</td>
                      <td>{stats.winRate}%</td>
                      <td>
                        {stats.avgMargin > 0 ? '+' : ''}
                        {stats.avgMargin}
                      </td>
                      <td>
                        {stats.rounds[1].winRate}% ({stats.rounds[1].total})
                      </td>
                      <td>
                        {stats.rounds[2].winRate}% ({stats.rounds[2].total})
                      </td>
                      <td>
                        {stats.rounds[3].winRate}% ({stats.rounds[3].total})
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div
            className="stats-table-mobile-cards"
            aria-label="Titan statistics (compact)"
          >
            {sortedTitans.map((titan) => {
              const stats = titanStats[titan]
              return (
                <article key={titan} className="stats-titan-summary-card">
                  <h4 className="stats-titan-summary-title">
                    <Link to={getTitanUrl(titan)}>{titan}</Link>
                  </h4>
                  <dl className="stats-titan-summary-dl">
                    <div>
                      <dt>Rounds</dt>
                      <dd>{stats.totalRounds}</dd>
                    </div>
                    <div>
                      <dt>Record</dt>
                      <dd>
                        {stats.wins}W / {stats.losses}L / {stats.ties}T
                      </dd>
                    </div>
                    <div>
                      <dt>Win rate</dt>
                      <dd>{stats.winRate}%</dd>
                    </div>
                    <div>
                      <dt>Avg margin</dt>
                      <dd>
                        {stats.avgMargin > 0 ? '+' : ''}
                        {stats.avgMargin}
                      </dd>
                    </div>
                  </dl>
                  <details className="stats-titan-round-details">
                    <summary>Round win rates</summary>
                    <ul className="stats-titan-round-list">
                      <li>
                        <span className="round-label r1">R1</span>
                        <span>
                          {stats.rounds[1].winRate}% ({stats.rounds[1].total}{' '}
                          played)
                        </span>
                      </li>
                      <li>
                        <span className="round-label r2">R2</span>
                        <span>
                          {stats.rounds[2].winRate}% ({stats.rounds[2].total}{' '}
                          played)
                        </span>
                      </li>
                      <li>
                        <span className="round-label r3">R3</span>
                        <span>
                          {stats.rounds[3].winRate}% ({stats.rounds[3].total}{' '}
                          played)
                        </span>
                      </li>
                    </ul>
                  </details>
                </article>
              )
            })}
          </div>
        </div>
      </CollapsibleStatsSection>
    </section>
  )
}

export default TitanStats
