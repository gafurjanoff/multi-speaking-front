"use client"

import type { ExamQuestion } from "@/lib/exam-types"

interface ForAgainstCardProps {
  question: ExamQuestion
}

export function ForAgainstCard({ question }: ForAgainstCardProps) {
  const forPoints = question.forAgainst?.filter((p) => p.side === "for") ?? []
  const againstPoints = question.forAgainst?.filter((p) => p.side === "against") ?? []

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Topic header */}
      {question.text && question.text.trim() !== "" && (
        <div className="border-b border-border bg-muted/60 px-5 py-4 text-center md:px-6">
          <h3 className="text-base font-bold text-foreground md:text-lg">{question.text}</h3>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2">
        <div className="border-b sm:border-b-0 sm:border-r border-border p-4 md:p-5">
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: "hsl(var(--exam-primary))" }}>
            For
          </h4>
          <ul className="space-y-3">
            {forPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground md:text-base">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: "hsl(var(--exam-primary))" }} />
                {point.pointText}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 md:p-5">
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: "hsl(var(--exam-pending))" }}>
            Against
          </h4>
          <ul className="space-y-3">
            {againstPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground md:text-base">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: "hsl(var(--exam-pending))" }} />
                {point.pointText}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
