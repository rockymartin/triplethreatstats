import { Link } from 'react-router-dom'
import './StatCard.css'

function StatCard({ title, value, subtitle, color = 'gold', highlight = false, linkTo }) {
  const colorClass = `stat-card-number-${color}`
  const highlightClass = highlight ? 'stat-card-highlight' : ''
  
  const TitleComponent = linkTo ? Link : 'div'
  const titleProps = linkTo ? { to: linkTo, className: 'stat-card-number-label stat-card-link' } : { className: 'stat-card-number-label' }
  
  return (
    <div className={`stat-card-number ${colorClass} ${highlightClass}`}>
      <TitleComponent {...titleProps}>{title}</TitleComponent>
      <div className="stat-card-number-value">{value}</div>
      {subtitle && <div className="stat-card-number-subtitle">{subtitle}</div>}
    </div>
  )
}

export default StatCard

