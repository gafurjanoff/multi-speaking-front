"use client"

import { ArrowLeft } from "lucide-react"
import type { CandidateResultDetail } from "@/lib/api-services"
import { ResultRecordingsView, type AiRecordingScore } from "@/components/result-recordings-view"

interface ResultDetailModalProps {
  result: CandidateResultDetail
  onClose: () => void
}

export function ResultDetailModal({ result, onClose }: ResultDetailModalProps) {
  const hasParts = result.parts && result.parts.length > 0

  // Parse AI assessment data from stored JSON feedback (no cost/token data)
  const aiScores = (() => {
    if (result.status !== "graded") return {}
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
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="max-h-[95vh] sm:max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h3 className="text-lg font-bold text-foreground">{result.exam_title}</h3>
          <div className="w-20" />
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">
          <p className="mb-4 text-sm text-muted-foreground">
            Your exam with all parts, questions, and your recordings.
          </p>
          {hasParts ? (
            <ResultRecordingsView parts={result.parts!} recordings={result.recordings} showScores={true} aiScores={aiScores} />
          ) : (
            <div className="space-y-4">
              {result.recordings.map((rec, idx) => (
                <div key={rec.id} className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {rec.part_label || `Part ${idx + 1}`}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground leading-snug">
                    {rec.question_text || "Question"}
                  </p>
                  <div className="mt-3">
                    {rec.file_path ? (
                      <audio controls preload="none" className="h-9 w-full" src={rec.file_path.replace(/.*uploads/, "/uploads")} />
                    ) : (
                      <span className="text-xs text-muted-foreground">No recording</span>
                    )}
                  </div>
                  {rec.score != null && (
                    <p className="mt-2 text-xs font-medium text-foreground">
                      Score: {rec.score} {rec.feedback && `— ${rec.feedback}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
