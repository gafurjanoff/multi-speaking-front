"use client"

import Link from "next/link"
import type { ExamCard as ExamCardType } from "@/lib/api-types"
import { Clock, Users, BarChart3, ArrowRight, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ExamCardProps {
  exam: ExamCardType
}

const levelColors: Record<string, string> = {
  B1: "174 42% 51%",
  B2: "32 85% 55%",
  C1: "0 0% 20%",
}

export function ExamCardItem({ exam }: ExamCardProps) {
  const levelColor = levelColors[exam.level] || "174 42% 51%"

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:border-border/80">
      {/* Top color bar */}
      <div className="h-1.5" style={{ backgroundColor: `hsl(${levelColor})` }} />

      <div className="p-6">
        {/* Badges row */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white"
            style={{ backgroundColor: `hsl(${levelColor})` }}
          >
            {exam.level}
          </span>
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

        {/* Stats */}
        <div className="mb-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {exam.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {exam.completedBy} taken
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Avg {exam.averageScore}%
          </span>
        </div>

        {/* Parts indicator */}
        <div className="mb-5 flex items-center gap-2">
          {Array.from({ length: exam.totalParts }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full"
              style={{ backgroundColor: `hsl(${levelColor} / 0.25)` }}
            />
          ))}
          <span className="ml-1 text-xs text-muted-foreground">{exam.totalParts} parts</span>
        </div>

        {/* Action */}
        <Link href={`/exam?id=${exam.id}`} className="block">
          <button
            type="button"
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
            )}
            style={{ backgroundColor: `hsl(${levelColor})` }}
          >
            Start Exam
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </Link>
      </div>
    </div>
  )
}
