import { useState, useEffect, useMemo, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TitanStats from './components/TitanStats'
import Overview from './components/Overview'
import Filters from './components/Filters'
import TitanDetail from './components/TitanDetail'
import { getDataCoverageLabel } from './utils/dataCoverage'
import './App.css'

function HomePage({ episodes, filters, handleFilterChange }) {
  // Filter episodes based on selected seasons
  const filteredEpisodes = useMemo(() => {
    if (filters.seasons.size === 0) {
      return []
    }

    return episodes.filter(episode => {
      // Filter by season
      return filters.seasons.has(episode.season)
    })
  }, [episodes, filters])

  const coverageLabel = getDataCoverageLabel(episodes)

  return (
    <>
      <header className="app-header">
        <h1>Bobby's Triple Threat Statistics</h1>
        <p>Analyzing performance data from all episodes</p>
        <p className="app-header-subheader">Click any Titan name to view their personal dashboard</p>
      </header>

      {filteredEpisodes.length > 0 && (
        <nav className="page-subnav" aria-label="On this page">
          <div className="page-subnav-inner">
            <a href="#overview">Overview</a>
            <a href="#section-win-rate">Win rate</a>
            <a href="#section-margin">Avg margin</a>
            <a href="#section-round-freq">Round frequency</a>
            <a href="#section-round-winrate">Wins by round</a>
            <a href="#section-detail-table">Full table</a>
          </div>
        </nav>
      )}
      
      <main className="app-main">
        <aside className="filters-sidebar">
          <Filters episodes={episodes} onFilterChange={handleFilterChange} />
        </aside>
        <div className="app-content">
          {filteredEpisodes.length > 0 ? (
            <>
              <Overview episodes={filteredEpisodes} />
              <TitanStats episodes={filteredEpisodes} />
            </>
          ) : (
            <div className="no-data-message">
              <p>Please select at least one season to view statistics.</p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Data sourced from <a href="https://en.wikipedia.org/wiki/Bobby's_Triple_Threat" target="_blank" rel="noopener noreferrer">Wikipedia</a></p>
        {coverageLabel && <p className="app-footer-meta">{coverageLabel}</p>}
      </footer>
    </>
  )
}

function App() {
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ seasons: new Set() })

  useEffect(() => {
    // Load episode data
    import('./data/episodes.json')
      .then(module => {
        setEpisodes(module.default)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading episodes:', err)
        setLoading(false)
      })
  }, [])

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [])

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading episode data...</h2>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route 
            path="/" 
            element={<HomePage episodes={episodes} filters={filters} handleFilterChange={handleFilterChange} />} 
          />
          <Route 
            path="/titan/:titanName" 
            element={<TitanDetail episodes={episodes} filters={filters} handleFilterChange={handleFilterChange} />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App

