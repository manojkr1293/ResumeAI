import React from "react"

interface ScoreGaugeProps {
  label: string;
  value: number; // 0-100
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ label, value }) => {
  const radius = 54
  const stroke = 8
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg height={radius * 2} width={radius * 2} className="fade-in">
        <circle
          stroke="var(--color-surface)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="var(--color-primary)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{
            strokeDasharray: `${circumference} ${circumference}`,
            strokeDashoffset,
            transition: "stroke-dashoffset 0.6s ease-out",
          }}
        />
        <text
          x="50%"
          y="50%"
          dy="0.3em"
          textAnchor="middle"
          className="text-2xl font-bold fill-current"
          style={{ fill: "var(--color-primary)" }}
        >
          {value}%
        </text>
      </svg>
      <span className="mt-2 text-sm text-slate-300">{label}</span>
    </div>
  )
}
