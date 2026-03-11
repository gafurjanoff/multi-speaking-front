"use client"

import { getRecordingUrl } from "@/lib/recording-url"

function feedbackDisplay(fb: string | null | undefined): string | null {
  if (!fb) return null
  try {
    const p = JSON.parse(fb)
    if (p && typeof p === "object" && (p.short || p.feedback)) return p.short || p.feedback
  } catch {}
  return fb
}

function recordingSrc(filePath: string | null): string {
  // Delegate to the shared helper so that `/api/.../stream` URLs from the
  // backend are used directly and legacy `/uploads/...` paths still work.
  return getRecordingUrl(filePath)
}

interface QuestionWithRecording {
  question_id: string
  question_text: string
  question_order: number
  recording_id: string | null
  file_path: string | null
  duration: number
  score: number | null
  feedback: string | null
  images?: string[] | null
  sub_questions?: string[] | null
  for_against?: { side: string; point_text: string }[]
}

interface PartWithRecordings {
  part_id: string
  part_title: string
  part_order: number
  part_type?: string
  part_images?: string[] | null
  questions: QuestionWithRecording[]
}

// Matches the backend response shape — criteria are top-level string fields,
// transcript is "transcript" (not "transcription"), score is always a number.
interface AiRecordingScore {
  score: number
  feedback?: string
  error?: boolean
  transcript?: string    
  level_achieved?: string
  fluency_metrics?: {
    words_per_minute: number
    pause_count: number
    avg_pause_duration: number
    long_pauses: number
    filler_words: number
    total_words: number
    speaking_rate: string
  }
  // Top-level string fields (not a nested criteria object with numbers)
  grammar?: string
  vocabulary?: string
  pronunciation?: string
  fluency?: string
  coherence?: string
  strengths?: string[]
  improvements?: string[]
}

interface ResultRecordingsViewProps {
  parts: PartWithRecordings[]
  recordings?: {
    id: string
    part_id: string
    question_id: string
    part_label: string
    question_text: string
    file_path: string | null
    duration: number
    score?: number | null
    feedback?: string | null
  }[]
  showScores?: boolean
  aiScores?: Record<string, AiRecordingScore>
}

export function ResultRecordingsView({
  parts,
  recordings = [],
  showScores = false,
  aiScores = {},
}: ResultRecordingsViewProps) {
  const recByPartQuestion = new Map<
    string,
    { file_path: string | null; duration: number; score?: number | null; feedback?: string | null }
  >()
  const recsByPartOrder: typeof recordings[] = []
  let prevPartId: string | null = null

  for (const r of recordings) {
    const key = `${String(r.part_id).trim().toLowerCase()}:${String(r.question_id).trim().toLowerCase()}`
    const ai = aiScores[r.id]
    recByPartQuestion.set(key, {
      file_path: r.file_path,
      duration: r.duration,
      score: ai?.score ?? r.score,
      feedback: feedbackDisplay(ai?.feedback ?? r.feedback) ?? ai?.feedback ?? r.feedback ?? undefined,
    })
    const pid = String(r.part_id).trim().toLowerCase()
    if (pid !== prevPartId) {
      recsByPartOrder.push([])
      prevPartId = pid
    }
    recsByPartOrder[recsByPartOrder.length - 1].push(r)
  }

  if (parts.length === 0 && recordings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-12 text-center">
        <p className="text-sm text-muted-foreground">No exam structure available</p>
      </div>
    )
  }

  if (parts.length === 0 && recordings.length > 0) {
    return (
      <div className="space-y-4">
        {recordings.map((rec, idx) => (
          <div key={rec.id} className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {rec.part_label || `Part ${idx + 1}`}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {rec.question_text || "Question"}
            </p>
            <div className="mt-3">
              {rec.file_path ? (
                <audio controls preload="none" className="h-10 w-full max-w-md" src={recordingSrc(rec.file_path)} />
              ) : (
                <span className="text-xs text-muted-foreground">No recording</span>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {parts.map((part, partIdx) => (
        <div key={part.part_id} className="rounded-2xl border border-border bg-muted/5 overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Part {part.part_order || partIdx + 1}
            </span>
            <h4 className="mt-0.5 text-lg font-bold text-foreground">{part.part_title}</h4>
          </div>

          {part.part_type === "part1_photos" &&
            part.part_images &&
            part.part_images.length > 0 && (
              <div
                className={`border-b border-border p-6 grid gap-4 ${
                  part.part_images.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                }`}
              >
                {part.part_images.map((img, idx) => (
                  <div key={idx} className="overflow-hidden rounded-lg">
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`Part images ${idx + 1}`}
                      className="h-48 w-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                ))}
              </div>
            )}

          <div className="divide-y divide-border">
            {part.questions.map((q, qIdx) => {
              const isPart1Photos = part.part_type === "part1_photos"
              const images = isPart1Photos
                ? []
                : ((part.part_images && part.part_images.length > 0
                    ? part.part_images
                    : q.images) ?? [])
              const forPoints = (q.for_against ?? []).filter((p) => p.side === "for")
              const againstPoints = (q.for_against ?? []).filter((p) => p.side === "against")
              const hasForAgainst = forPoints.length > 0 || againstPoints.length > 0

              let fallbackRec = recByPartQuestion.get(
                `${String(part.part_id).trim().toLowerCase()}:${String(q.question_id).trim().toLowerCase()}`
              )
              if (!fallbackRec && partIdx < recsByPartOrder.length) {
                const partRecs = recsByPartOrder[partIdx]
                if (partRecs && qIdx < partRecs.length) {
                  const r = partRecs[qIdx]
                  const ai = aiScores[r.id]
                  fallbackRec = {
                    file_path: r.file_path,
                    duration: r.duration,
                    score: ai?.score ?? r.score,
                    feedback: ai?.feedback ?? r.feedback,
                  }
                }
              }

              const filePath = q.file_path ?? fallbackRec?.file_path ?? null
              const duration = q.duration || fallbackRec?.duration || 0
              const fallbackScore = fallbackRec?.score ?? q.score
              const fallbackFeedback =
                feedbackDisplay(fallbackRec?.feedback ?? q.feedback) ??
                fallbackRec?.feedback ??
                q.feedback

              return (
                <div key={q.question_id} className="p-6">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Question {q.question_order || qIdx + 1}
                  </p>

                  {!isPart1Photos && images.length > 0 && (
                    <div
                      className={`mb-4 grid gap-4 ${
                        images.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                      }`}
                    >
                      {images.map((img, idx) => (
                        <div key={idx} className="overflow-hidden rounded-lg">
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`Question ${qIdx + 1} image ${idx + 1}`}
                            className="h-48 w-full object-cover"
                            crossOrigin="anonymous"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-sm font-medium text-foreground leading-relaxed mb-4">
                    {q.question_text || "Question"}
                  </p>

                  {q.sub_questions && q.sub_questions.length > 0 && (
                    <div className="mb-4 rounded-lg border border-border bg-muted/20 p-4">
                      <ul className="space-y-2">
                        {q.sub_questions.map((sub, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white bg-primary">
                              {idx + 1}
                            </span>
                            {sub}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {hasForAgainst && (
                    <div className="mb-4 overflow-hidden rounded-lg border border-border">
                      <div className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="border-b sm:border-b-0 sm:border-r border-border p-4">
                          <h4 className="mb-3 text-sm font-bold text-primary">FOR</h4>
                          <ul className="space-y-2">
                            {forPoints.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                {point.point_text}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-4">
                          <h4 className="mb-3 text-sm font-bold text-amber-600">AGAINST</h4>
                          <ul className="space-y-2">
                            {againstPoints.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                                {point.point_text}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    {filePath ? (
                      <audio
                        controls
                        preload="none"
                        className="h-12 w-full max-w-2xl"
                        src={recordingSrc(filePath)}
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No recording</span>
                    )}
                    {duration > 0 && (
                      <span className="text-xs text-muted-foreground">{duration}s</span>
                    )}
                  </div>

                  {showScores && (fallbackScore != null || fallbackFeedback) && (
                    <div className="mt-4 rounded-lg bg-muted/30 px-4 py-2 text-sm">
                      {fallbackScore != null && (
                        <span className="font-medium text-foreground">Score: {fallbackScore}</span>
                      )}
                      {fallbackFeedback && (
                        <span className="text-muted-foreground ml-2">— {fallbackFeedback}</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}