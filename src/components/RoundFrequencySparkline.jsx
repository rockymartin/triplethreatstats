import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const DOT_COLORS = ['#fbbf24', '#60a5fa', '#34d399']

export function RoundFrequencySparkline({
  round1,
  round2,
  round3,
  domainMax,
}) {
  const data = [
    { round: 'R1', count: round1 },
    { round: 'R2', count: round2 },
    { round: 'R3', count: round3 },
  ]

  const yMax = Math.max(domainMax, 1)

  return (
    <div className="round-frequency-sparkline">
      <ResponsiveContainer width="100%" height={56}>
        <LineChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
          <XAxis
            dataKey="round"
            tick={{ fill: '#dcc48a', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(251, 191, 36, 0.22)' }}
            tickLine={false}
          />
          <YAxis domain={[0, yMax]} hide />
          <Tooltip
            cursor={{ stroke: 'rgba(251, 191, 36, 0.3)', strokeWidth: 1 }}
            contentStyle={{
              background: 'rgba(26, 16, 20, 0.98)',
              border: '1px solid rgba(251, 191, 36, 0.45)',
              borderRadius: 8,
            }}
            labelStyle={{ color: '#fbbf24', fontWeight: 600 }}
            formatter={(value) => [`${value}`, 'Appearances']}
          />
          <Line
            type="linear"
            dataKey="count"
            stroke="rgba(251, 191, 36, 0.5)"
            strokeWidth={2}
            isAnimationActive={false}
            dot={(props) => {
              const { cx, cy, index } = props
              if (cx == null || cy == null) return null
              const fill = DOT_COLORS[index] ?? '#fbbf24'
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill={fill}
                  stroke="#1a1614"
                  strokeWidth={1.5}
                />
              )
            }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
