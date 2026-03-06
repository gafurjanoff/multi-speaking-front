"use client"

import { useEffect, useState } from "react"

interface ScoreBandProps {
  label: string
  value: number
  delay?: number
}

export function ScoreBand({ label, value, delay = 0 }: ScoreBandProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay + 600)
    return () => clearTimeout(t)
  }, [delay])

  const clamped = Math.max(0, Math.min(75, value))
  const pct = (clamped / 75) * 100

  return (
    <div style={{ animationDelay: `${delay}ms` }} className="score-band">
      <div className="band-header">
        <span className="band-label">{label}</span>
        <span className="band-value">
          {clamped}
          <span className="band-max">/75</span>
        </span>
      </div>
      <div className="band-track">
        <div
          className="band-fill"
          style={{ width: animated ? `${pct}%` : "0%" }}
        />
      </div>
    </div>
  )
}
