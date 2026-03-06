"use client"

import type { ExamQuestion } from "@/lib/exam-types"

interface ForAgainstCardProps {
  question: ExamQuestion
  questionNumber: number
}

export function ForAgainstCard({ question, questionNumber }: ForAgainstCardProps) {
  const forPoints = question.forAgainst?.filter((p) => p.side === "for") ?? []
  const againstPoints = question.forAgainst?.filter((p) => p.side === "against") ?? []

  return (
    <div className="rounded-xl border-2 p-6" style={{ borderColor: "hsl(var(--exam-card-border))" }}>
      <div className="mb-4">
        <span
          className="inline-block rounded-md px-3 py-1 text-sm font-semibold text-white"
          style={{ backgroundColor: "hsl(var(--exam-primary))" }}
        >
          Question #{questionNumber}
        </span>
      </div>

      <div className="mb-4 overflow-hidden rounded-lg border border-border">
        <div className="border-b border-border bg-muted px-4 py-3 text-center">
          <h3 className="text-lg font-bold text-foreground">{question.text}</h3>
        </div>

        <div className="grid grid-cols-2">
          <div className="border-r border-border p-4">
            <h4 className="mb-3 text-base font-bold" style={{ color: "hsl(var(--exam-primary))" }}>
              FOR
            </h4>
            <ul className="space-y-3">
              {forPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: "hsl(var(--exam-primary))" }} />
                  {point.pointText}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4">
            <h4 className="mb-3 text-base font-bold" style={{ color: "hsl(var(--exam-pending))" }}>
              AGAINST
            </h4>
            <ul className="space-y-3">
              {againstPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: "hsl(var(--exam-pending))" }} />
                  {point.pointText}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
