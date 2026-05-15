import { useState, useEffect } from 'react'

const NARROW_MQ = '(max-width: 768px)'

function useNarrowMobile() {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(NARROW_MQ).matches : false
  )

  useEffect(() => {
    const mq = window.matchMedia(NARROW_MQ)
    const onChange = () => setNarrow(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return narrow
}

export function CollapsibleStatsSection({
  id,
  step,
  title,
  note,
  defaultOpenMobile = false,
  children,
}) {
  const narrow = useNarrowMobile()
  const [open, setOpen] = useState(() => (narrow ? defaultOpenMobile : true))

  useEffect(() => {
    setOpen(narrow ? defaultOpenMobile : true)
  }, [narrow, defaultOpenMobile])

  const heading = (
    <div className="stats-section-heading">
      <span className="section-step-badge" aria-hidden="true">
        {step}
      </span>
      <h3>{title}</h3>
    </div>
  )

  if (!narrow) {
    return (
      <div className="stats-grid-container" id={id}>
        {heading}
        {note}
        {children}
      </div>
    )
  }

  return (
    <div className="stats-grid-container stats-grid-container--collapsible" id={id}>
      <button
        type="button"
        className="stats-section-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-toggle`}
      >
        <span className="section-step-badge" aria-hidden="true">
          {step}
        </span>
        <span className="stats-section-toggle-title">{title}</span>
        <span className="stats-section-chevron" aria-hidden="true">
          {open ? '▼' : '▶'}
        </span>
      </button>
      <div
        className="stats-section-panel"
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-toggle`}
        hidden={!open}
      >
        {note}
        {open ? children : null}
      </div>
    </div>
  )
}
