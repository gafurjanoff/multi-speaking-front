"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppHeader } from "@/components/app-header"
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  Search,
  BarChart3,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sampleExamResults, sampleStudents, sampleTeacher } from "@/lib/sample-data"
import type { ExamResult } from "@/lib/api-types"

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  pending_review: { label: "Pending Review", color: "hsl(var(--exam-pending))", bg: "hsl(var(--exam-pending) / 0.1)" },
  reviewed: { label: "Reviewed", color: "hsl(var(--exam-primary))", bg: "hsl(var(--exam-primary) / 0.1)" },
  graded: { label: "Graded", color: "hsl(150 40% 40%)", bg: "hsl(150 40% 40% / 0.1)" },
}

export default function TeacherDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"results" | "students">("results")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedResult, setExpandedResult] = useState<string | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
    if (!isLoading && user && user.role !== "teacher") {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    )
  }

  const results = sampleExamResults
  const students = sampleStudents

  const filteredResults = results.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    const matchesSearch =
      searchQuery === "" ||
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.examTitle.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const pendingCount = results.filter((r) => r.status === "pending_review").length
  const gradedCount = results.filter((r) => r.status === "graded").length

  const generatePdf = (result: ExamResult) => {
    // Generate a text-based report (in production, use a PDF library)
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
      lines.push(`   Duration: ${Math.floor(rec.duration / 60)}:${(rec.duration % 60).toString().padStart(2, "0")}`)
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

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-bold text-foreground">
            Teacher Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Review student exams, grade results, and download reports
          </p>
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "hsl(var(--exam-primary) / 0.1)" }}>
              <Users className="h-5 w-5" style={{ color: "hsl(var(--exam-primary))" }} />
            </div>
            <p className="text-2xl font-bold text-foreground">{sampleTeacher.totalStudents}</p>
            <p className="text-xs text-muted-foreground">Total Students</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "hsl(var(--exam-pending) / 0.1)" }}>
              <Clock className="h-5 w-5" style={{ color: "hsl(var(--exam-pending))" }} />
            </div>
            <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "hsl(150 40% 40% / 0.1)" }}>
              <CheckCircle2 className="h-5 w-5" style={{ color: "hsl(150 40% 40%)" }} />
            </div>
            <p className="text-2xl font-bold text-foreground">{gradedCount}</p>
            <p className="text-xs text-muted-foreground">Graded</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "hsl(210 11% 25% / 0.1)" }}>
              <FileText className="h-5 w-5" style={{ color: "hsl(210 11% 25%)" }} />
            </div>
            <p className="text-2xl font-bold text-foreground">{results.length}</p>
            <p className="text-xs text-muted-foreground">Total Results</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => setActiveTab("results")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "results"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            Exam Results
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("students")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "students"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            Students
          </button>
        </div>

        {/* Results tab */}
        {activeTab === "results" && (
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
                    style={statusFilter === status ? { backgroundColor: "hsl(var(--exam-primary))" } : undefined}
                  >
                    {status === "all" ? "All" : status === "pending_review" ? "Pending" : status === "reviewed" ? "Reviewed" : "Graded"}
                  </button>
                ))}
              </div>
            </div>

            {/* Results list */}
            <div className="space-y-3">
              {filteredResults.map((result) => {
                const isExpanded = expandedResult === result.id
                const statusInfo = statusLabels[result.status]

                return (
                  <div
                    key={result.id}
                    className="overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
                  >
                    {/* Result header */}
                    <button
                      type="button"
                      onClick={() => setExpandedResult(isExpanded ? null : result.id)}
                      className="flex w-full items-center gap-4 p-5 text-left"
                    >
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: "hsl(var(--exam-primary))" }}
                      >
                        {result.studentName.charAt(0)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{result.studentName}</p>
                          <span
                            className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {result.examTitle} ({result.level}) - {new Date(result.completedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {result.score !== undefined && (
                        <span className="text-xl font-bold text-foreground">{result.score}%</span>
                      )}

                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="border-t border-border px-5 pb-5 pt-4">
                        {/* Feedback */}
                        {result.feedback && (
                          <div className="mb-4 rounded-lg bg-muted px-4 py-3">
                            <p className="mb-1 text-xs font-semibold text-foreground">Overall Feedback</p>
                            <p className="text-sm text-muted-foreground">{result.feedback}</p>
                          </div>
                        )}

                        {/* Recordings */}
                        <div className="mb-4 space-y-2">
                          {result.recordings.map((rec, i) => (
                            <div
                              key={`${rec.partId}-${rec.questionId}`}
                              className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3"
                            >
                              <button
                                type="button"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                                style={{ backgroundColor: "hsl(var(--exam-primary))" }}
                                aria-label={playingAudio === `${result.id}-${i}` ? "Pause" : "Play"}
                                onClick={() => setPlayingAudio(playingAudio === `${result.id}-${i}` ? null : `${result.id}-${i}`)}
                              >
                                {playingAudio === `${result.id}-${i}` ? (
                                  <Pause className="h-3.5 w-3.5" />
                                ) : (
                                  <Play className="ml-0.5 h-3.5 w-3.5" />
                                )}
                              </button>

                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-foreground">{rec.partTitle}</p>
                                <p className="truncate text-xs text-muted-foreground">{rec.questionText}</p>
                              </div>

                              {rec.score !== undefined && (
                                <span className="flex items-center gap-1 text-sm font-bold text-foreground">
                                  <Star className="h-3.5 w-3.5" style={{ color: "hsl(var(--exam-pending))" }} />
                                  {rec.score}%
                                </span>
                              )}

                              <span className="text-xs tabular-nums text-muted-foreground">
                                {Math.floor(rec.duration / 60)}:{(rec.duration % 60).toString().padStart(2, "0")}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            onClick={() => generatePdf(result)}
                            className="gap-2 text-white"
                            style={{ backgroundColor: "hsl(var(--exam-primary))" }}
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

              {filteredResults.length === 0 && (
                <div className="py-16 text-center">
                  <AlertCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No results found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Students tab */}
        {activeTab === "students" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {students.map((student) => (
              <div
                key={student.id}
                className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ backgroundColor: "hsl(var(--exam-primary))" }}
                  >
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted px-4 py-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-foreground">{student.level}</p>
                    <p className="text-xs text-muted-foreground">Level</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{student.totalExamsTaken}</p>
                    <p className="text-xs text-muted-foreground">Exams</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{student.averageScore}%</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Streak: {student.streak} days</span>
                  <span>{student.badges.length} badges</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
