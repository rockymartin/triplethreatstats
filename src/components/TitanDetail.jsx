import { useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { calculateTitanStats, getRoundFrequency } from '../utils/titanStats'
import { getEpisodesForTitan, getTitanRoundDetails } from '../utils/titanEpisodes'
import { getWikipediaUrl } from '../utils/wikipedia'
import { hasOtherAppearances, getOtherAppearancesLabel } from '../utils/contestantClassification'
import Filters from './Filters'
import StatCard from './StatCard'
import { getDataCoverageLabel } from '../utils/dataCoverage'
import './TitanDetail.css'

function capitalizeIngredients(ingredients) {
  if (!ingredients) return ''
  // Split by common separators and capitalize each word
  return ingredients
    .split(/[&,]/)
    .map(part => 
      part.trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    )
    .join(' & ')
}

function TitanDetail({ episodes, filters, handleFilterChange }) {
  const { titanName } = useParams()
  const decodedTitanName = titanName.replace(/_/g, ' ')
  
  // Scroll to top when component mounts or titan changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [titanName])
  
  // Filter episodes by season first
  const filteredEpisodes = useMemo(() => {
    if (filters.seasons.size === 0) {
      return []
    }
    return episodes.filter(episode => filters.seasons.has(episode.season))
  }, [episodes, filters])
  
  const titanEpisodes = useMemo(() => {
    return getEpisodesForTitan(filteredEpisodes, decodedTitanName)
  }, [filteredEpisodes, decodedTitanName])
  
  const titanStats = useMemo(() => {
    const stats = calculateTitanStats(titanEpisodes)
    return stats[decodedTitanName] || null
  }, [titanEpisodes, decodedTitanName])
  
  const roundDetails = useMemo(() => {
    return getTitanRoundDetails(filteredEpisodes, decodedTitanName)
  }, [filteredEpisodes, decodedTitanName])
  
  const roundFrequency = useMemo(() => {
    const freq = getRoundFrequency(titanEpisodes)
    return freq[decodedTitanName] || { round1: 0, round2: 0, round3: 0, total: 0 }
  }, [titanEpisodes, decodedTitanName])

  const coverageLabel = getDataCoverageLabel(episodes)

  if (filteredEpisodes.length === 0) {
    return (
      <div className="app">
        <header className="app-header">
          <Link to="/" className="titan-detail-back">← Back to Overview</Link>
          <h1>{decodedTitanName}</h1>
          <p className="titan-detail-subtitle">Detailed Performance Statistics</p>
        </header>
        
        <main className="app-main">
          <aside className="filters-sidebar">
            <Filters episodes={episodes} onFilterChange={handleFilterChange} />
          </aside>
          <div className="app-content">
            <nav className="titan-detail-sticky-nav" aria-label="Breadcrumb">
              <ol className="titan-breadcrumbs">
                <li><Link to="/">Overview</Link></li>
                <li aria-current="page">{decodedTitanName}</li>
              </ol>
            </nav>
            <div className="no-data-message">
              <p>Please select at least one season to view statistics.</p>
            </div>
          </div>
        </main>

        <footer className="app-footer">
          <p>Data sourced from <a href="https://en.wikipedia.org/wiki/Bobby's_Triple_Threat" target="_blank" rel="noopener noreferrer">Wikipedia</a></p>
          {coverageLabel && <p className="app-footer-meta">{coverageLabel}</p>}
        </footer>
      </div>
    )
  }

  if (!titanStats) {
    return (
      <div className="app">
        <div className="titan-detail-container titan-detail-container--error">
          <nav className="titan-detail-sticky-nav titan-detail-sticky-nav--static" aria-label="Breadcrumb">
            <ol className="titan-breadcrumbs">
              <li><Link to="/">Overview</Link></li>
              <li aria-current="page">Not found</li>
            </ol>
          </nav>
          <div className="titan-detail-error">
            <h2>Titan not found</h2>
            <Link to="/">← Back to Overview</Link>
          </div>
        </div>

        <footer className="app-footer">
          <p>Data sourced from <a href="https://en.wikipedia.org/wiki/Bobby's_Triple_Threat" target="_blank" rel="noopener noreferrer">Wikipedia</a></p>
          {coverageLabel && <p className="app-footer-meta">{coverageLabel}</p>}
        </footer>
      </div>
    )
  }
  
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="titan-detail-back">← Back to Overview</Link>
        <h1>{decodedTitanName}</h1>
        <p className="titan-detail-subtitle">Detailed Performance Statistics</p>
      </header>
      
      <main className="app-main">
        <aside className="filters-sidebar">
          <Filters episodes={episodes} onFilterChange={handleFilterChange} />
        </aside>
        <div className="app-content">
          <nav className="titan-detail-sticky-nav" aria-label="Breadcrumb">
            <ol className="titan-breadcrumbs">
              <li><Link to="/">Overview</Link></li>
              <li aria-current="page">{decodedTitanName}</li>
            </ol>
          </nav>
          <div className="titan-detail-container">
            <div className="titan-detail-stats">
        <div className="titan-detail-stat-grid">
          <StatCard
            title="Overall Win Rate"
            value={`${titanStats.winRate}%`}
            subtitle={`${titanStats.wins}W / ${titanStats.losses}L / ${titanStats.ties}T`}
            color="gold"
          />
          <StatCard
            title="Total Rounds"
            value={titanStats.totalRounds}
            subtitle={`R1: ${roundFrequency.round1} | R2: ${roundFrequency.round2} | R3: ${roundFrequency.round3}`}
            color="neutral"
          />
          <StatCard
            title="Average Margin"
            value={titanStats.avgMargin > 0 ? `+${titanStats.avgMargin.toFixed(1)}` : `${titanStats.avgMargin.toFixed(1)}`}
            subtitle={`R1: ${titanStats.avgMarginR1 > 0 ? '+' : ''}${titanStats.avgMarginR1.toFixed(1)} | R2: ${titanStats.avgMarginR2 > 0 ? '+' : ''}${titanStats.avgMarginR2.toFixed(1)} | R3: ${titanStats.avgMarginR3 > 0 ? '+' : ''}${titanStats.avgMarginR3.toFixed(1)}`}
            color={titanStats.avgMargin > 0 ? 'emerald' : titanStats.avgMargin < 0 ? 'red' : 'neutral'}
          />
          <StatCard
            title="Average Scores"
            value={`${titanStats.avgTitanScore.toFixed(1)}`}
            subtitle={`Titan: ${titanStats.avgTitanScore.toFixed(1)} | Contestant: ${titanStats.avgContestantScore.toFixed(1)}`}
            color="gold"
          />
        </div>
        
        <div className="titan-detail-round-stats">
          <h2>Round-by-Round Performance</h2>
          <div className="titan-detail-round-grid">
            <div className="titan-detail-round-card">
              <h3>Round 1</h3>
              <div className="titan-detail-round-metrics">
                <div className="titan-detail-round-metric">
                  <span className="metric-label">Win Rate</span>
                  <span className="metric-value" style={{ color: '#fbbf24' }}>{titanStats.rounds[1].winRate}%</span>
                </div>
                <div className="titan-detail-round-metric">
                  <span className="metric-label">Record</span>
                  <span className="metric-value">{titanStats.rounds[1].wins}W / {titanStats.rounds[1].losses}L / {titanStats.rounds[1].ties}T</span>
                </div>
                <div className="titan-detail-round-metric">
                  <span className="metric-label">Avg Margin</span>
                  <span className="metric-value">{titanStats.avgMarginR1 > 0 ? '+' : ''}{titanStats.avgMarginR1.toFixed(1)}</span>
                </div>
                <div className="titan-detail-round-metric">
                  <span className="metric-label">Total Appearances</span>
                  <span className="metric-value">{titanStats.rounds[1].total}</span>
                </div>
              </div>
            </div>
            
            <div className="titan-detail-round-card">
              <h3>Round 2</h3>
              <div className="titan-detail-round-metrics">
                <div className="titan-detail-round-metric">
                  <span className="metric-label">Win Rate</span>
                  <span className="metric-value" style={{ color: '#1e40af' }}>{titanStats.rounds[2].winRate}%</span>
                </div>
                <div className="titan-detail-round-metric">
                  <span className="metric-label">Record</span>
                  <span className="metric-value">{titanStats.rounds[2].wins}W / {titanStats.rounds[2].losses}L / {titanStats.rounds[2].ties}T</span>
                </div>
                <div className="titan-detail-round-metric">
                  <span className="metric-label">Avg Margin</span>
                  <span className="metric-value">{titanStats.avgMarginR2 > 0 ? '+' : ''}{titanStats.avgMarginR2.toFixed(1)}</span>
                </div>
                <div className="titan-detail-round-metric">
                  <span className="metric-label">Total Appearances</span>
                  <span className="metric-value">{titanStats.rounds[2].total}</span>
                </div>
              </div>
            </div>
            
            <div className="titan-detail-round-card">
              <h3>Round 3</h3>
              <div className="titan-detail-round-metrics">
                <div className="titan-detail-round-metric">
                  <span className="metric-label">Win Rate</span>
                  <span className="metric-value" style={{ color: '#059669' }}>{titanStats.rounds[3].winRate}%</span>
                </div>
                <div className="titan-detail-round-metric">
                  <span className="metric-label">Record</span>
                  <span className="metric-value">{titanStats.rounds[3].wins}W / {titanStats.rounds[3].losses}L / {titanStats.rounds[3].ties}T</span>
                </div>
                <div className="titan-detail-round-metric">
                  <span className="metric-label">Avg Margin</span>
                  <span className="metric-value">{titanStats.avgMarginR3 > 0 ? '+' : ''}{titanStats.avgMarginR3.toFixed(1)}</span>
                </div>
                <div className="titan-detail-round-metric">
                  <span className="metric-label">Total Appearances</span>
                  <span className="metric-value">{titanStats.rounds[3].total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="titan-detail-episodes">
          <h2>Round History</h2>
          <div className="titan-detail-episodes-table-container">
            <table className="titan-detail-episodes-table">
              <thead>
                <tr>
                  <th>Season</th>
                  <th>Episode</th>
                  <th>Round</th>
                  <th>Contestant</th>
                  <th>Other Appearances</th>
                  <th>Judge</th>
                  <th>Ingredients</th>
                  <th>Outcome</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {roundDetails.map((round, index) => {
                  const outcomeText = round.outcome === 'W' ? 'Loss' : round.outcome === 'L' ? 'Win' : 'Tie'
                  
                  return (
                    <tr key={index} className={round.outcome === 'L' ? 'titan-win' : round.outcome === 'W' ? 'titan-loss' : 'titan-tie'}>
                      <td>S{round.season}</td>
                      <td>E{round.episodeNumber}</td>
                      <td>R{round.round}</td>
                      <td>
                        {getWikipediaUrl(round.contestant) ? (
                          <a 
                            href={getWikipediaUrl(round.contestant)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="wikipedia-link"
                          >
                            {round.contestant}
                          </a>
                        ) : (
                          round.contestant
                        )}
                      </td>
                      <td>
                        {hasOtherAppearances(round.contestant) ? (
                          <span className="strong-competitor-badge strong-competitor-yes">
                            {getOtherAppearancesLabel(round.contestant)}
                          </span>
                        ) : (
                          <span className="strong-competitor-badge strong-competitor-no">No</span>
                        )}
                      </td>
                      <td>
                        {getWikipediaUrl(round.judge) ? (
                          <a 
                            href={getWikipediaUrl(round.judge)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="wikipedia-link"
                          >
                            {round.judge}
                          </a>
                        ) : (
                          round.judge
                        )}
                      </td>
                      <td className="ingredients-cell">{capitalizeIngredients(round.ingredients)}</td>
                      <td>
                        <span className={`outcome-badge outcome-${round.outcome.toLowerCase()}`}>
                          {outcomeText}
                        </span>
                      </td>
                      <td className="score-cell">
                        {round.titanScore} - {round.contestantScore}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Data sourced from <a href="https://en.wikipedia.org/wiki/Bobby's_Triple_Threat" target="_blank" rel="noopener noreferrer">Wikipedia</a></p>
        {coverageLabel && <p className="app-footer-meta">{coverageLabel}</p>}
      </footer>
    </div>
  )
}

export default TitanDetail

