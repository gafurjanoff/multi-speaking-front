"use client"

import { useEffect, useState } from "react"
import { Clock, Mic, CheckCircle2 } from "lucide-react"
import { getApiUrl } from "@/lib/api-client"

interface PartInfo {
  part: string
  title: string
  questionsCount: number
  prep: string
  answer: string
}

interface ExamStructureSectionProps {
  firstExamId?: string
}

export function ExamStructureSection({ firstExamId }: ExamStructureSectionProps) {
  const [parts, setParts] = useState<PartInfo[]>([])

  useEffect(() => {
    if (!firstExamId) return
    fetch(getApiUrl(`/api/exams/${firstExamId}/structure`))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.parts) return
        setParts(
          data.parts.map((p: { title: string; part_number: number; prep_time: number; answer_time: number; questions_count: number }) => ({
            part: `Part ${p.part_number}`,
            title: p.title.replace(/^Part \d+(\.\d+)?\s*[–-]\s*/, ""),
            questionsCount: p.questions_count,
            prep: `${p.prep_time}s prep`,
            answer: formatTime(p.answer_time),
          }))
        )
      })
  }, [firstExamId])

  if (parts.length === 0) return null

  return (
    <section
      className="border-t border-border px-4 py-16"
      style={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-10 text-center text-2xl font-bold text-foreground md:text-3xl">
          Exam Structure
        </h2>
        <div className="space-y-4">
          {parts.map((part, index) => (
            <div
              key={part.part + index}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg"
            >
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white"
                style={{ backgroundColor: "hsl(var(--exam-primary))" }}
              >
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className="text-sm font-bold"
                    style={{ color: "hsl(var(--exam-primary))" }}
                  >
                    {part.part}
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {part.title}
                  </span>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  {part.questionsCount} question{part.questionsCount !== 1 ? "s" : ""} in this section
                </p>
                <div className="flex gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {part.prep}
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                    style={{ backgroundColor: "hsl(var(--exam-primary))" }}
                  >
                    <Mic className="h-3 w-3" />
                    {part.answer}
                  </span>
                </div>
              </div>
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-muted-foreground/20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function formatTime(seconds: number): string {
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins} min ${secs}s` : `${mins} min`
  }
  return `${seconds}s`
}
