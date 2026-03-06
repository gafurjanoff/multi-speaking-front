"use client"

import { useState } from "react"
import {
  Search,
  ChevronDown,
  Play,
  Pause,
  Download,
  AlertCircle,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ExamResult } from "@/lib/api-types"

const statusLabels: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending_review: {
    label: "Pending Review",
    color: "hsl(var(--exam-pending))",
    bg: "hsl(var(--exam-pending) / 0.1)",
  },
  reviewed: {
    label: "Reviewed",
    color: "hsl(var(--exam-primary))",
    bg: "hsl(var(--exam-primary) / 0.1)",
  },
  graded: {
    label: "Graded",
    color: "hsl(150 40% 40%)",
    bg: "hsl(150 40% 40% / 0.1)",
  },
}

interface ResultsTabProps {
  results: ExamResult[]
}

function generateReport(result: ExamResult) {
  const lines = [
    `SPEAKING EXAM RESULT REPORT`,
    `${"=".repeat(50)}`,
    ``,
    `Student: ${result.studentName}`,
    `Email: ${result.studentEmail}`,
    `Exam: ${result.examTitle}`,
    `Level: ${result.level}`,
    `Date: ${new Date(result.completedAt).toLocaleDateString()}`,
    `Duration: ${Math.floor(result.totalDuration / 60)} minutes`,
    `Status: ${result.status.replace("_", " ").toUpperCase()}`,
    result.score ? `Overall Score: ${result.score}%` : "",
    ``,
    `${"=".repeat(50)}`,
    `RECORDINGS BREAKDOWN`,
    `${"=".repeat(50)}`,
  ]

  result.recordings.forEach((rec, i) => {
    lines.push(``)
    lines.push(`${i + 1}. ${rec.partTitle}`)
    lines.push(`   Question: ${rec.questionText}`)
    lines.push(
      `   Duration: ${Math.floor(rec.duration / 60)}:${(rec.duration % 60).toString().padStart(2, "0")}`
    )
    if (rec.score !== undefined) lines.push(`   Score: ${rec.score}%`)
    if (rec.feedback) lines.push(`   Feedback: ${rec.feedback}`)
  })

  if (result.feedback) {
    lines.push(``)
    lines.push(`${"=".repeat(50)}`)
    lines.push(`OVERALL FEEDBACK`)
    lines.push(`${"=".repeat(50)}`)
    lines.push(result.feedback)
  }

  const blob = new Blob([lines.join("\n")], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${result.studentName.replace(/\s/g, "_")}_${result.examTitle.replace(/\s/g, "_")}_result.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export function ResultsTab({ results }: ResultsTabProps) {
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedResult, setExpandedResult] = useState<string | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  const filtered = results.filter((r) => {
    const matchesStatus =
      statusFilter === "all" || r.status === statusFilter
    const matchesSearch =
      searchQuery === "" ||
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.examTitle.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by student or exam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["all", "pending_review", "reviewed", "graded"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                statusFilter === status
                  ? "text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
              style={
                statusFilter === status
                  ? { backgroundColor: "hsl(var(--exam-primary))" }
                  : undefined
              }
            >
              {status === "all"
                ? "All"
                : status === "pending_review"
                  ? "Pending"
                  : status === "reviewed"
                    ? "Reviewed"
                    : "Graded"}
            </button>
          ))}
        </div>
      </div>

      {/* Results list */}
      <div className="space-y-3">
        {filtered.map((result) => {
          const isExpanded = expandedResult === result.id
          const statusInfo = statusLabels[result.status]

          return (
            <div
              key={result.id}
              className="overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedResult(isExpanded ? null : result.id)
                }
                className="flex w-full items-center gap-4 p-5 text-left"
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{
                    backgroundColor: "hsl(var(--exam-primary))",
                  }}
                >
                  {result.studentName.charAt(0)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {result.studentName}
                    </p>
                    <span
                      className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color,
                      }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {result.examTitle} ({result.level}) -{" "}
                    {new Date(result.completedAt).toLocaleDateString()}
                  </p>
                </div>

                {result.score !== undefined && (
                  <span className="text-xl font-bold text-foreground">
                    {result.score}%
                  </span>
                )}

                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-border px-5 pb-5 pt-4">
                  {result.feedback && (
                    <div className="mb-4 rounded-lg bg-muted px-4 py-3">
                      <p className="mb-1 text-xs font-semibold text-foreground">
                        Overall Feedback
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.feedback}
                      </p>
                    </div>
                  )}

                  <div className="mb-4 space-y-2">
                    {result.recordings.map((rec, i) => (
                      <div
                        key={`${rec.partId}-${rec.questionId}`}
                        className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3"
                      >
                        <button
                          type="button"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                          style={{
                            backgroundColor: "hsl(var(--exam-primary))",
                          }}
                          aria-label={
                            playingAudio === `${result.id}-${i}`
                              ? "Pause"
                              : "Play"
                          }
                          onClick={() =>
                            setPlayingAudio(
                              playingAudio === `${result.id}-${i}`
                                ? null
                                : `${result.id}-${i}`
                            )
                          }
                        >
                          {playingAudio === `${result.id}-${i}` ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="ml-0.5 h-3.5 w-3.5" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground">
                            {rec.partTitle}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {rec.questionText}
                          </p>
                        </div>

                        {rec.score !== undefined && (
                          <span className="flex items-center gap-1 text-sm font-bold text-foreground">
                            <Star
                              className="h-3.5 w-3.5"
                              style={{
                                color: "hsl(var(--exam-pending))",
                              }}
                            />
                            {rec.score}%
                          </span>
                        )}

                        <span className="text-xs tabular-nums text-muted-foreground">
                          {Math.floor(rec.duration / 60)}:
                          {(rec.duration % 60)
                            .toString()
                            .padStart(2, "0")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      onClick={() => generateReport(result)}
                      className="gap-2 text-white"
                      style={{
                        backgroundColor: "hsl(var(--exam-primary))",
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Download Report
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No results found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
