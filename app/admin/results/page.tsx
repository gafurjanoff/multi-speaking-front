"use client"

import { useEffect, useState } from "react"
import {
  adminFetchResults,
  adminFetchResultDetail,
  adminGradeResult,
  adminAiAssess,
  type AdminResult,
  type AiAssessResponse,
  type AiRecordingScore,
  type AiAssessmentCost,
  type AdminResultDetail,
} from "@/lib/api-services"
import { ResultRecordingsView } from "@/components/result-recordings-view"
import { getRecordingUrl } from "@/lib/recording-url"
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  ClipboardCheck,
  Search,
  User,
  DollarSign,
  Zap,
  MessageSquare,
  BarChart2,
} from "lucide-react"

type StatusFilter = "all" | "pending_review" | "graded"

export default function AdminResultsPage() {
  const [results, setResults] = useState<AdminResult[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [detail, setDetail] = useState<AdminResultDetail | null>(null)
  const [search, setSearch] = useState("")

  const loadResults = async () => {
    setLoading(true)
    const filter = statusFilter === "all" ? undefined : statusFilter
    const data = await adminFetchResults(filter)
    setResults(data)
    setLoading(false)
  }

  useEffect(() => {
    loadResults()
  }, [statusFilter])

  const openDetail = async (resultId: string) => {
    const data = await adminFetchResultDetail(resultId)
    if (data) setDetail(data)
  }

  const refetchDetail = async () => {
    if (detail) {
      const data = await adminFetchResultDetail(detail.id)
      if (data) setDetail(data)
    }
  }

  if (detail) {
    return (
      <ResultDetail
        result={detail}
        onBack={() => {
          setDetail(null)
          loadResults()
        }}
        onRefetch={refetchDetail}
      />
    )
  }

  const filters: { key: StatusFilter; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    { key: "pending_review", label: "Pending" },
    { key: "graded", label: "Graded" },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Results & Grading</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review submissions and grade exam results
        </p>
      </div>

      <div className="mb-4 flex gap-1 rounded-xl border border-border bg-muted/50 p-1 w-fit">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              statusFilter === f.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name, exam..."
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {(() => {
        const q = search.toLowerCase()
        const filtered = results.filter((r) =>
          (r.student_name || "").toLowerCase().includes(q) ||
          (r.exam_title || "").toLowerCase().includes(q) ||
          (r.student_phone || "").includes(q)
        )
        return loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <ClipboardCheck className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No results found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Results will appear here once students complete exams
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid grid-cols-[1fr_1fr_1fr_100px_120px_100px] items-center gap-3 border-b border-border bg-muted/50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Student</span>
              <span>Exam</span>
              <span>Submitted</span>
              <span className="text-center">Score</span>
              <span className="text-center">Status</span>
              <span className="text-right">Action</span>
            </div>
            {filtered.map((r) => {
              const StatusIcon =
                r.status === "graded"
                  ? CheckCircle2
                  : r.status === "pending_review"
                    ? Clock
                    : AlertCircle
              return (
                <div
                  key={r.id}
                  className="grid grid-cols-[1fr_1fr_1fr_100px_120px_100px] items-center gap-3 border-t border-border px-5 py-3.5 transition-colors hover:bg-muted/30"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {r.student_name || "Unknown"}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {r.student_phone || ""}
                    </p>
                  </div>
                  <span className="truncate text-sm font-medium text-foreground">
                    {r.exam_title || r.exam_id.slice(0, 8) + "..."}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-center text-sm font-semibold text-foreground">
                    {r.overall_score !== null ? Math.round(r.overall_score) : "—"}
                  </span>
                  <span className="flex items-center justify-center gap-1.5">
                    <StatusIcon
                      className={`h-3.5 w-3.5 ${
                        r.status === "graded"
                          ? "text-green-500"
                          : r.status === "pending_review"
                            ? "text-amber-500"
                            : "text-blue-500"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium capitalize ${
                        r.status === "graded"
                          ? "text-green-600"
                          : r.status === "pending_review"
                            ? "text-amber-600"
                            : "text-blue-600"
                      }`}
                    >
                      {r.status.replace("_", " ")}
                    </span>
                  </span>
                  <span className="text-right">
                    <button
                      onClick={() => openDetail(r.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        r.status === "pending_review"
                          ? "bg-amber-500 text-white hover:bg-amber-600"
                          : "border border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {r.status === "pending_review" ? "Grade" : "View"}
                    </button>
                  </span>
                </div>
              )
            })}
          </div>

          {/* Mobile card view */}
          <div className="space-y-3 md:hidden">
            {filtered.map((r) => {
              const StatusIcon =
                r.status === "graded"
                  ? CheckCircle2
                  : r.status === "pending_review"
                    ? Clock
                    : AlertCircle
              return (
                <div key={r.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {r.student_name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {r.exam_title || r.exam_id.slice(0, 8) + "..."}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(r.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="shrink-0 text-lg font-bold text-foreground">
                      {r.overall_score !== null ? Math.round(r.overall_score) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5">
                      <StatusIcon
                        className={`h-3.5 w-3.5 ${
                          r.status === "graded" ? "text-green-500" : r.status === "pending_review" ? "text-amber-500" : "text-blue-500"
                        }`}
                      />
                      <span className={`text-xs font-medium capitalize ${
                        r.status === "graded" ? "text-green-600" : r.status === "pending_review" ? "text-amber-600" : "text-blue-600"
                      }`}>
                        {r.status.replace("_", " ")}
                      </span>
                    </span>
                    <button
                      onClick={() => openDetail(r.id)}
                      className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                        r.status === "pending_review"
                          ? "bg-amber-500 text-white hover:bg-amber-600"
                          : "border border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {r.status === "pending_review" ? "Grade" : "View"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )
      })()}
    </div>
  )
}

// ── Result detail + grading ──

function ResultDetail({
  result,
  onBack,
  onRefetch,
}: {
  result: AdminResultDetail
  onBack: () => void
  onRefetch?: () => Promise<void>
}) {
  const [score, setScore] = useState(result.overall_score?.toString() ?? "")
  const [feedback, setFeedback] = useState(result.feedback ?? "")
  const [notes, setNotes] = useState(result.teacher_notes ?? "")
  const [submitting, setSubmitting] = useState(false)
  const [graded, setGraded] = useState(result.status === "graded")
  const [aiAssessing, setAiAssessing] = useState(false)
  const [aiScores, setAiScores] = useState<Record<string, AiRecordingScore>>({})
  const [recordingScores, setRecordingScores] = useState<{ recording_id: string; score?: number; feedback?: string }[]>([])
  const [aiCost, setAiCost] = useState<AiAssessmentCost | null>(null)
  const [aiLevel, setAiLevel] = useState<string | null>(null)
  const [criteriaTotal, setCriteriaTotal] = useState<number | null>(null)
  const [maxCriteria, setMaxCriteria] = useState<number | null>(null)
  const [showCostDetails, setShowCostDetails] = useState(false)

  const handleAiAssess = async () => {
    setAiAssessing(true)
    setAiCost(null)
    setAiLevel(null)
    setCriteriaTotal(null)
    setMaxCriteria(null)
    const data = await adminAiAssess(result.id)
    setAiAssessing(false)
    if (!data || data.error) {
      alert(data?.error || "AI assessment failed")
      return
    }
    const map: Record<string, AiRecordingScore> = {}
    const recs: { recording_id: string; score?: number; feedback?: string }[] = []
    for (const rs of data.recording_scores) {
      map[rs.recording_id] = rs
      if (rs.score != null) {
        recs.push({ recording_id: rs.recording_id, score: rs.score, feedback: rs.feedback || undefined })
      }
    }
    setAiScores(map)
    setRecordingScores(recs)
    if (data.conversion_score != null) setScore(String(data.conversion_score))
    if (data.cost) setAiCost(data.cost)
    if (data.overall_level) setAiLevel(data.overall_level)
    if (data.criteria_total != null) setCriteriaTotal(data.criteria_total)
    if (data.max_criteria != null) setMaxCriteria(data.max_criteria)
    if (data.general_feedback) setFeedback(data.general_feedback)
    await onRefetch?.()
  }

  const handleGrade = async () => {
    const numScore = parseFloat(score)
    if (isNaN(numScore) || numScore < 0 || numScore > 75) return
    setSubmitting(true)
    const ok = await adminGradeResult(result.id, {
      overall_score: numScore,
      feedback: feedback || undefined,
      teacher_notes: notes || undefined,
      recording_scores: recordingScores.length > 0 ? recordingScores : undefined,
    })
    setSubmitting(false)
    if (ok) setGraded(true)
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to results
      </button>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* Info card */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-1">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Details
          </h3>
          <div className="space-y-3 text-sm">
            <InfoRow label="Exam" value={result.exam_title || result.exam_id.slice(0, 12)} />
            <InfoRow label="Student" value={result.student_name || "Unknown"} />
            <InfoRow label="Phone" value={result.student_phone || "—"} />
            <InfoRow
              label="Status"
              value={
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    graded
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {graded ? "Graded" : "Pending"}
                </span>
              }
            />
            <InfoRow label="Submitted" value={new Date(result.created_at).toLocaleDateString()} />
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-5 lg:col-span-1">
          {/* Recordings - full exam structure */}
          {((result.parts?.length ?? 0) > 0 || result.recordings.length > 0) && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Exam & Recordings ({result.recordings.length} recordings)
              </h3>
              {(result.parts?.length ?? 0) > 0 ? (
                <ResultRecordingsView parts={result.parts ?? []} recordings={result.recordings} showScores={graded || Object.keys(aiScores).length > 0} aiScores={aiScores} />
              ) : (
                <div className="space-y-4">
                  {result.recordings.map((rec, idx) => (
                    <div key={rec.id} className="rounded-xl border border-border bg-muted/20 p-4">
                      <p className="text-xs font-semibold text-muted-foreground">{rec.part_label || `Part ${idx + 1}`}</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{rec.question_text || "Question"}</p>
                      {rec.file_path ? (
                        <audio controls preload="none" className="h-9 w-full max-w-md mt-2" src={getRecordingUrl(rec.file_path)} />
                      ) : (
                        <span className="text-xs text-muted-foreground">No file</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Grading form */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {graded ? "Grade (submitted)" : "Grade this result"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Overall Score (0–75)
                </label>
                <input
                  type="number"
                  min={0}
                  max={75}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  disabled={graded}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  placeholder="75"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Feedback (visible to student)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={graded}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 resize-none"
                  placeholder="Good effort. Work on pronunciation..."
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Private Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={graded}
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 resize-none"
                  placeholder="Internal notes..."
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAiAssess}
                  disabled={aiAssessing}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold border border-border text-foreground hover:bg-muted transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  {aiAssessing ? "Assessing..." : graded ? "Re-run AI assessment" : "Run AI assessment"}
                </button>
                {!graded && (
                  <button
                    onClick={handleGrade}
                    disabled={submitting || !score}
                    className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: "hsl(174, 42%, 51%)" }}
                  >
                    {submitting ? "Submitting..." : "Submit Grade"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* AI Assessment Summary */}
          {(aiLevel || criteriaTotal !== null || aiCost) && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                AI Assessment Summary
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {aiLevel && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">CEFR Level</p>
                    <p className="text-2xl font-bold text-foreground">{aiLevel}</p>
                  </div>
                )}
                {criteriaTotal !== null && maxCriteria !== null && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Raw Score</p>
                    <p className="text-2xl font-bold text-foreground">
                      {criteriaTotal} <span className="text-base font-normal text-muted-foreground">/ {maxCriteria}</span>
                    </p>
                  </div>
                )}
                {score && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Converted Score</p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round(parseFloat(score))} <span className="text-base font-normal text-muted-foreground">/ 75</span>
                    </p>
                  </div>
                )}
                {aiCost && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => setShowCostDetails(!showCostDetails)}>
                    <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Assessment Cost
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {typeof aiCost.total_cost === 'number' ? `$${aiCost.total_cost.toFixed(4)}` : '-'}
                    </p>
                  </div>
                )}
              </div>

              {/* Cost breakdown */}
              {showCostDetails && aiCost && (
                <div className="mt-4 rounded-xl border border-border bg-muted/10 p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">Cost Breakdown</p>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Whisper ({typeof aiCost.whisper_minutes === 'number' ? aiCost.whisper_minutes.toFixed(2) : '-'} min)</span>
                      <span className="font-medium">{typeof aiCost.whisper_cost === 'number' ? `$${aiCost.whisper_cost.toFixed(4)}` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GPT Input ({aiCost.gpt_input_tokens?.toLocaleString?.() ?? '-'} tokens)</span>
                      <span className="font-medium">{typeof aiCost.gpt_input_cost === 'number' ? `$${aiCost.gpt_input_cost.toFixed(4)}` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GPT Output ({aiCost.gpt_output_tokens?.toLocaleString?.() ?? '-'} tokens)</span>
                      <span className="font-medium">{typeof aiCost.gpt_output_cost === 'number' ? `$${aiCost.gpt_output_cost.toFixed(4)}` : '-'}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border font-semibold">
                      <span>Total</span>
                      <span>{typeof aiCost.total_cost === 'number' ? `$${aiCost.total_cost.toFixed(4)}` : '-'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Transcriptions & Analysis */}
          {Object.keys(aiScores).length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                AI Transcriptions & Analysis
              </h3>
              <div className="space-y-4">
                {Object.entries(aiScores).map(([recId, rs], idx) => (
                  <div key={recId} className="rounded-xl border border-border bg-muted/10 p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="text-xs font-semibold text-muted-foreground">Recording {idx + 1}</p>
                      {rs.level_achieved && (
                        <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">
                          {rs.level_achieved}
                        </span>
                      )}
                    </div>
                    {rs.transcription && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Transcription</p>
                        <p className="text-sm text-foreground bg-background rounded-lg p-3 border border-border">
                          {rs.transcription || <span className="italic text-muted-foreground">No transcription available</span>}
                        </p>
                      </div>
                    )}
                    {rs.fluency_metrics && (
                      <div className="mb-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
                        <div className="text-center rounded-lg bg-background p-2 border border-border">
                          <p className="text-lg font-bold text-foreground">{rs.fluency_metrics.words_per_minute}</p>
                          <p className="text-[10px] text-muted-foreground">WPM</p>
                        </div>
                        <div className="text-center rounded-lg bg-background p-2 border border-border">
                          <p className="text-lg font-bold text-foreground">{rs.fluency_metrics.pause_count}</p>
                          <p className="text-[10px] text-muted-foreground">Pauses</p>
                        </div>
                        <div className="text-center rounded-lg bg-background p-2 border border-border">
                          <p className="text-lg font-bold text-foreground">{rs.fluency_metrics.long_pauses}</p>
                          <p className="text-[10px] text-muted-foreground">Long</p>
                        </div>
                        <div className="text-center rounded-lg bg-background p-2 border border-border">
                          <p className="text-lg font-bold text-foreground">{rs.fluency_metrics.filler_words}</p>
                          <p className="text-[10px] text-muted-foreground">Fillers</p>
                        </div>
                        <div className="text-center rounded-lg bg-background p-2 border border-border">
                          <p className="text-lg font-bold text-foreground">{typeof rs.fluency_metrics.avg_pause_duration === 'number' ? `${rs.fluency_metrics.avg_pause_duration.toFixed(1)}s` : '-'}</p>
                          <p className="text-[10px] text-muted-foreground">Avg Pause</p>
                        </div>
                        <div className="text-center rounded-lg bg-background p-2 border border-border">
                          <p className="text-xs font-bold text-foreground">{rs.fluency_metrics.speaking_rate}</p>
                          <p className="text-[10px] text-muted-foreground">Rate</p>
                        </div>
                      </div>
                    )}
                    {rs.criteria && Object.keys(rs.criteria).length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Criteria Scores</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(rs.criteria).map(([key, val]) => val !== undefined && (
                            <span key={key} className="rounded-full bg-muted px-2.5 py-1 text-xs">
                              <span className="text-muted-foreground capitalize">{key.replace("_", " ")}:</span>{" "}
                              <span className="font-semibold text-foreground">{val}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {rs.strengths && rs.strengths.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-green-600 mb-1">✓ Strengths</p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          {rs.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                        </ul>
                      </div>
                    )}
                    {rs.improvements && rs.improvements.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-amber-600 mb-1">↗ Areas for Improvement</p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          {rs.improvements.map((s, i) => <li key={i}>• {s}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}
