"use client"

import type { ExamQuestion } from "@/lib/exam-types"

interface QuestionCardProps {
  question: ExamQuestion
  questionNumber: number
  partImages?: string[] | null
}

export function QuestionCard({ question, questionNumber, partImages }: QuestionCardProps) {
  const images = partImages && partImages.length > 0 ? partImages : question.images

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

      {/* Images (part-level or question-level) */}
      {images && images.length > 0 && (
        <div className={`mb-4 grid gap-4 ${images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {images.map((img, index) => (
            <div key={index} className="overflow-hidden rounded-lg">
              <img
                src={img || "/placeholder.svg"}
                alt={`Question ${questionNumber} image ${index + 1}`}
                className="h-48 w-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
          ))}
        </div>
      )}

      {/* Main question text */}
      <div className="mb-4 rounded-lg border border-border bg-card p-4">
        <p className="text-base font-medium leading-relaxed text-foreground">{question.text}</p>
      </div>

      {/* Sub-questions */}
      {question.subQuestions && question.subQuestions.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <ul className="space-y-2">
            {question.subQuestions.map((sub, index) => (
              <li key={index} className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: "hsl(var(--exam-primary))" }}>
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
