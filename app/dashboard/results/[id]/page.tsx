"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { AppHeader } from "@/components/app-header"
import { fetchResultDetail, type CandidateResultDetail } from "@/lib/api-services"
import { ResultRecordingsView, type AiRecordingScore } from "@/components/result-recordings-view"
import { getRecordingUrl } from "@/lib/recording-url"
import { ArrowLeft, FileAudio, Award } from "lucide-react"

export default function ResultDetailPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const resultId = params?.id as string
  const [result, setResult] = useState<CandidateResultDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login/otp")
      return
    }
    if (!user || !resultId) return
    fetchResultDetail(resultId).then((data) => {
      setResult(data ?? null)
      setLoading(false)
    })
  }, [user, isLoading, router, resultId])

  // Parse AI assessment data from stored JSON feedback (no cost/token data)
  const aiScores = useMemo(() => {
    if (!result || result.status !== "graded") return {}
    const map: Record<string, AiRecordingScore> = {}

    for (const part of result.parts ?? []) {
      for (const q of part.questions ?? []) {
        if (!q.recording_id || !q.feedback) continue
        try {
          const p = JSON.parse(q.feedback)
          if (p && typeof p === "object" && "transcript" in p) {
            map[q.recording_id] = {
              score: q.score ?? 0,
              feedback: p.feedback,
              transcript: p.transcript,
              fluency_metrics: p.fluency_metrics,
              grammar: p.grammar,
              vocabulary: p.vocabulary,
              pronunciation: p.pronunciation,
              fluency: p.fluency,
              coherence: p.coherence,
              level_achieved: p.level_achieved,
              strengths: p.strengths,
              improvements: p.improvements,
            }
          }
        } catch {}
      }
    }

    for (const rec of result.recordings ?? []) {
      if (!rec.id || !rec.feedback || map[rec.id]) continue
      try {
        const p = JSON.parse(rec.feedback)
        if (p && typeof p === "object" && "transcript" in p) {
          map[rec.id] = {
            score: rec.score ?? 0,
            feedback: p.feedback,
            transcript: p.transcript,
            fluency_metrics: p.fluency_metrics,
            grammar: p.grammar,
            vocabulary: p.vocabulary,
            pronunciation: p.pronunciation,
            fluency: p.fluency,
            coherence: p.coherence,
            level_achieved: p.level_achieved,
            strengths: p.strengths,
            improvements: p.improvements,
          }
        }
      } catch {}
    }

    return map
  }, [result])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        </main>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">Result not found</p>
          </div>
        </main>
      </div>
    )
  }

  const hasParts = result.parts && result.parts.length > 0
  const graded = result.status === "graded"
  const score75 = result.overall_score != null ? Math.round(result.overall_score) : null

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">{result.exam_title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your exam with all parts, questions, and recordings.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <FileAudio className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recordings</p>
                <p className="text-xl font-bold text-foreground">{result.recordings.length}</p>
              </div>
            </div>
          </div>
          {graded && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Score</p>
                  <p className="text-xl font-bold text-foreground">
                    {score75 !== null ? score75 + "/75" : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Exam & Recordings
          </h2>
          {hasParts ? (
            <ResultRecordingsView parts={result.parts!} recordings={result.recordings} showScores={graded} aiScores={aiScores} />
          ) : (
            <div className="space-y-4">
              {result.recordings.map((rec, idx) => (
                <div key={rec.id} className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {rec.part_label || "Part " + (idx + 1)}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground leading-snug">
                    {rec.question_text || "Question"}
                  </p>
                  <div className="mt-3">
                    {rec.file_path ? (
                      <audio
                        controls
                        preload="none"
                        className="h-10 w-full max-w-md"
                        src={getRecordingUrl(rec.file_path)}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">No recording</span>
                    )}
                  </div>
                  {rec.score != null && (
                    <p className="mt-2 text-xs font-medium text-foreground">
                      Score: {rec.score} {rec.feedback && "— " + rec.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {result.feedback && graded && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Teacher feedback
            </h3>
            <p className="text-sm text-foreground leading-relaxed">{result.feedback}</p>
          </div>
        )}
      </main>
    </div>
  )
}
