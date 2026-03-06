"use client"

import { ScoreBand } from "./score-band"

interface ScoreBandsGridProps {
  score75: number
}

export function ScoreBandsGrid({ score75 }: ScoreBandsGridProps) {
  return (
    <div className="bands-grid">
      <ScoreBand label="Fluency" value={Math.max(score75 - 10, 0)} delay={0} />
      <ScoreBand label="Pronunciation" value={score75} delay={100} />
      <ScoreBand
        label="Range & Accuracy"
        value={Math.max(score75 - 5, 0)}
        delay={200}
      />
      <ScoreBand label="Task Achievement" value={score75} delay={300} />
    </div>
  )
}
