"use client"

import type { ForAgainstData } from "@/lib/sample-exam"

interface ForAgainstCardProps {
  data: ForAgainstData
  questionNumber: number
}

export function ForAgainstCard({ data, questionNumber }: ForAgainstCardProps) {
  return (
    <div className="rounded-xl border-2 p-6" style={{ borderColor: "hsl(var(--exam-card-border))" }}>
      {/* Question label */}
      <div className="mb-4">
        <span
          className="inline-block rounded-md px-3 py-1 text-sm font-semibold text-white"
          style={{ backgroundColor: "hsl(var(--exam-primary))" }}
        >
          Question #{questionNumber}
        </span>
      </div>

      {/* Topic */}
      <div className="mb-4 overflow-hidden rounded-lg border border-border">
        <div className="border-b border-border bg-muted px-4 py-3 text-center">
          <h3 className="text-lg font-bold text-foreground">{data.topic}</h3>
        </div>

        <div className="grid grid-cols-2">
          {/* FOR column */}
          <div className="border-r border-border p-4">
            <h4 className="mb-3 text-base font-bold" style={{ color: "hsl(var(--exam-primary))" }}>
              FOR
            </h4>
            <ul className="space-y-3">
              {data.forPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: "hsl(var(--exam-primary))" }} />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* AGAINST column */}
          <div className="p-4">
            <h4 className="mb-3 text-base font-bold" style={{ color: "hsl(var(--exam-pending))" }}>
              AGAINST
            </h4>
            <ul className="space-y-3">
              {data.againstPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: "hsl(var(--exam-pending))" }} />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
