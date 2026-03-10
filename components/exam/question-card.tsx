"use client"

import type { ExamQuestion } from "@/lib/exam-types"

interface QuestionCardProps {
  question: ExamQuestion
  partImages?: string[] | null
}

export function QuestionCard({ question, partImages }: QuestionCardProps) {
  const images = partImages && partImages.length > 0 ? partImages : question.images

  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm">
      {/* Images (part-level or question-level) */}
      {images && images.length > 0 && (
        <div className={`mb-4 grid gap-3 ${images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {images.map((img, index) => (
            <div key={index} className="overflow-hidden rounded-xl">
              <img
                src={img || "/placeholder.svg"}
                alt={`Question image ${index + 1}`}
                className="h-44 w-full object-cover sm:h-52 md:h-60"
                crossOrigin="anonymous"
              />
            </div>
          ))}
        </div>
      )}

      {/* Main question text */}
      {question.text && question.text.trim() !== "" && (
        <div className="rounded-xl bg-muted/60 p-4 md:p-5">
          <p className="text-base font-medium leading-relaxed text-foreground md:text-lg">{question.text}</p>
        </div>
      )}

      {/* Sub-questions */}
      {question.subQuestions && question.subQuestions.length > 0 && (
        <div className={`rounded-xl bg-muted/40 p-4 md:p-5 ${question.text && question.text.trim() !== "" ? "mt-3" : ""}`}>
          <ul className="space-y-3">
            {question.subQuestions.map((sub, index) => (
              <li key={index} className="flex items-start gap-3 text-sm leading-relaxed text-foreground md:text-base">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: "hsl(var(--exam-primary))" }}>
                  {index + 1}
                </span>
                {sub}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
