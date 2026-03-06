"use client"

import Link from "next/link"
import type { ExamCard as ExamCardType } from "@/lib/api-types"
import { ArrowRight, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ExamCardProps {
  exam: ExamCardType
}

// Single brand color for all exams (levels are determined AFTER exam, not shown here)
const EXAM_COLOR = "174 42% 51%"

export function ExamCardItem({ exam }: ExamCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:border-border/80">
      {/* Top color bar */}
      <div className="h-1.5" style={{ backgroundColor: `hsl(${EXAM_COLOR})` }} />

      <div className="p-6">
        {/* Badges row */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {exam.isFree && (
            <Badge variant="secondary" className="gap-1 bg-green-50 text-green-700 border-green-200">
              <Sparkles className="h-3 w-3" />
              Free
            </Badge>
          )}
          {exam.isMock && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              Mock
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-2 text-lg font-bold text-foreground group-hover:text-foreground/80 transition-colors">
          {exam.title}
        </h3>

        {/* Description */}
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {exam.description}
        </p>

        {/* Parts indicator */}
        <div className="mb-5 flex items-center gap-2">
          {Array.from({ length: exam.totalParts }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full"
              style={{ backgroundColor: `hsl(${EXAM_COLOR} / 0.25)` }}
            />
          ))}
          <span className="ml-1 text-xs text-muted-foreground">{exam.totalParts} parts</span>
        </div>

        {/* Action */}
        <Link href={`/exam/${exam.id}`} className="block">
          <button
            type="button"
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
            )}
            style={{ backgroundColor: `hsl(${EXAM_COLOR})` }}
          >
            Start Exam
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </Link>
      </div>
    </div>
  )
}
