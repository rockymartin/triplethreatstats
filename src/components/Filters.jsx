import { useState, useEffect, useMemo } from 'react'
import './Filters.css'

function Filters({ episodes, onFilterChange }) {
  const [allSeasonsSelected, setAllSeasonsSelected] = useState(true)
  const [selectedSeasons, setSelectedSeasons] = useState(new Set())

  // Get unique seasons from episodes
  const seasons = useMemo(() => {
    const seasonSet = new Set()
    episodes.forEach(episode => {
      seasonSet.add(episode.season)
    })
    return Array.from(seasonSet).sort((a, b) => parseInt(a) - parseInt(b))
  }, [episodes])

  // Initialize all seasons as selected
  useEffect(() => {
    if (seasons.length > 0 && selectedSeasons.size === 0) {
      setSelectedSeasons(new Set(seasons))
    }
  }, [seasons])

  // Notify parent when filters change
  useEffect(() => {
    if (allSeasonsSelected) {
      // When "All Seasons" is checked, send all seasons
      onFilterChange({ seasons: new Set(seasons) })
    } else {
      // When "All Seasons" is unchecked, send only selected seasons
      onFilterChange({ seasons: selectedSeasons })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSeasonsSelected, selectedSeasons, seasons])

  const toggleAllSeasons = () => {
    setAllSeasonsSelected(!allSeasonsSelected)
    // When enabling "All Seasons", select all individual seasons
    if (!allSeasonsSelected) {
      setSelectedSeasons(new Set(seasons))
    }
  }

  const toggleSeason = (season) => {
    // If "All Seasons" is checked, clicking a season filters to just that season
    if (allSeasonsSelected) {
      setAllSeasonsSelected(false)
      setSelectedSeasons(new Set([season]))
      return
    }
    
    const newSeasons = new Set(selectedSeasons)
    if (newSeasons.has(season)) {
      // If unchecking the only selected season, don't allow it (must have at least one)
      if (newSeasons.size === 1) {
        return
      }
      newSeasons.delete(season)
    } else {
      newSeasons.add(season)
    }
    setSelectedSeasons(newSeasons)
    
    // If all seasons are now selected, check "All Seasons"
    if (newSeasons.size === seasons.length) {
      setAllSeasonsSelected(true)
    }
  }

  return (
    <section className="filters-section">
      <div className="filters-container">
        <div className="filter-header">
          <h3>Season</h3>
        </div>
        <div className="filter-options-horizontal">
          <label className="filter-checkbox filter-checkbox-all">
            <input
              type="checkbox"
              checked={allSeasonsSelected}
              onChange={toggleAllSeasons}
            />
            <span>All Seasons</span>
          </label>
          {seasons.map(season => (
            <label key={season} className="filter-checkbox">
              <input
                type="checkbox"
                checked={allSeasonsSelected || selectedSeasons.has(season)}
                onChange={() => toggleSeason(season)}
              />
              <span>Season {season}</span>
            </label>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Filters

