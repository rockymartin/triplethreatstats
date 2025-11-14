import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { calculateTitanStats, getRoundFrequency } from '../utils/titanStats'
import StatCard from './StatCard'

function getTitanUrl(titan) {
  return `/titan/${titan.replace(/\s+/g, '_')}`
}

function TitanStats({ episodes }) {
  const titanStats = useMemo(() => calculateTitanStats(episodes), [episodes])
  const roundFrequency = useMemo(() => getRoundFrequency(episodes), [episodes])

  const titans = Object.keys(titanStats)

  // Sort titans consistently: by total rounds descending, then alphabetically
  const sortedTitans = [...titans].sort((a, b) => {
    const roundsA = titanStats[a].totalRounds
    const roundsB = titanStats[b].totalRounds
    if (roundsB !== roundsA) {
      return roundsB - roundsA // More rounds first
    }
    return a.localeCompare(b) // Alphabetical tiebreaker
  })
  
  // Find max values for color coding
  const maxWinRate = Math.max(...titans.map(t => titanStats[t].winRate))
  const maxAvgMargin = Math.max(...titans.map(t => titanStats[t].avgMargin))

  return (
    <section className="titan-stats-section">
      <h2>Titan Performance Statistics</h2>

      {/* Overall Win Rate */}
      <div className="stats-grid-container">
        <h3>Overall Win Rate</h3>
        <div className="stats-grid">
          {sortedTitans.map((titan, index) => {
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
      </div>

      {/* Average Margin */}
      <div className="stats-grid-container">
        <h3>Average Margin</h3>
        <p className="stats-note">All rounds normalized to 10-point scale for fair comparison</p>
        <div className="stats-grid">
          {sortedTitans.map((titan) => {
            const stats = titanStats[titan]
            const isBest = stats.avgMargin === maxAvgMargin
            const color = stats.avgMargin > 0 ? 'emerald' : stats.avgMargin < 0 ? 'red' : 'neutral'
            return (
              <StatCard
                key={titan}
                title={titan}
                value={stats.avgMargin > 0 ? `+${stats.avgMargin.toFixed(1)}` : `${stats.avgMargin.toFixed(1)}`}
                subtitle={`R1: ${stats.avgMarginR1 > 0 ? '+' : ''}${stats.avgMarginR1.toFixed(1)} | R2: ${stats.avgMarginR2 > 0 ? '+' : ''}${stats.avgMarginR2.toFixed(1)} | R3: ${stats.avgMarginR3 > 0 ? '+' : ''}${stats.avgMarginR3.toFixed(1)}`}
                color={color}
                highlight={isBest}
                linkTo={getTitanUrl(titan)}
              />
            )
          })}
        </div>
      </div>

      {/* Round Frequency */}
      <div className="stats-grid-container">
        <h3>Round Appearance Frequency</h3>
        <div className="stats-grid">
          {sortedTitans.map((titan) => {
            const freq = roundFrequency[titan]
            return (
              <div key={titan} className="round-frequency-card">
                <Link to={getTitanUrl(titan)} className="round-frequency-title round-frequency-title-link">{titan}</Link>
                <div className="round-frequency-stats">
                  <div className="round-frequency-item">
                    <span className="round-frequency-label">R1</span>
                    <span className="round-frequency-value" style={{ color: '#fbbf24' }}>{freq?.round1 || 0}</span>
                  </div>
                  <div className="round-frequency-item">
                    <span className="round-frequency-label">R2</span>
                    <span className="round-frequency-value" style={{ color: '#1e40af' }}>{freq?.round2 || 0}</span>
                  </div>
                  <div className="round-frequency-item">
                    <span className="round-frequency-label">R3</span>
                    <span className="round-frequency-value" style={{ color: '#059669' }}>{freq?.round3 || 0}</span>
                  </div>
                  <div className="round-frequency-total">Total: {freq?.total || 0}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Round-by-Round Win Rate */}
      <div className="stats-grid-container">
        <h3>Win Rate by Round</h3>
        <div className="stats-grid">
          {sortedTitans.map((titan) => {
            const stats = titanStats[titan]
            return (
              <div key={titan} className="round-winrate-card">
                <Link to={getTitanUrl(titan)} className="round-winrate-title round-winrate-title-link">{titan}</Link>
                <div className="round-winrate-stats">
                  <div className="round-winrate-item">
                    <span className="round-winrate-label">Round 1</span>
                    <span className="round-winrate-value" style={{ color: '#fbbf24' }}>
                      {stats.rounds[1].winRate}%
                    </span>
                    <span className="round-winrate-count">({stats.rounds[1].wins}-{stats.rounds[1].losses})</span>
                  </div>
                  <div className="round-winrate-item">
                    <span className="round-winrate-label">Round 2</span>
                    <span className="round-winrate-value" style={{ color: '#1e40af' }}>
                      {stats.rounds[2].winRate}%
                    </span>
                    <span className="round-winrate-count">({stats.rounds[2].wins}-{stats.rounds[2].losses})</span>
                  </div>
                  <div className="round-winrate-item">
                    <span className="round-winrate-label">Round 3</span>
                    <span className="round-winrate-value" style={{ color: '#059669' }}>
                      {stats.rounds[3].winRate}%
                    </span>
                    <span className="round-winrate-count">({stats.rounds[3].wins}-{stats.rounds[3].losses})</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="stats-table-container">
        <h3>Detailed Statistics</h3>
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
            {sortedTitans.map(titan => {
              const stats = titanStats[titan]
              return (
                <tr key={titan}>
                  <td><Link to={getTitanUrl(titan)} className="titan-table-link"><strong>{titan}</strong></Link></td>
                  <td>{stats.totalRounds}</td>
                  <td>{stats.wins}</td>
                  <td>{stats.losses}</td>
                  <td>{stats.ties}</td>
                  <td>{stats.winRate}%</td>
                  <td>{stats.avgMargin > 0 ? '+' : ''}{stats.avgMargin}</td>
                  <td>{stats.rounds[1].winRate}% ({stats.rounds[1].total})</td>
                  <td>{stats.rounds[2].winRate}% ({stats.rounds[2].total})</td>
                  <td>{stats.rounds[3].winRate}% ({stats.rounds[3].total})</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default TitanStats

