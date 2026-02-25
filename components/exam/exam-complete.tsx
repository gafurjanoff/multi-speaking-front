"use client"

import { useState } from "react"
import Link from "next/link"
import type { Exam, RecordingSegment } from "@/lib/exam-types"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Download, Play, Pause, RotateCcw, Home } from "lucide-react"

interface ExamCompleteProps {
  recordings: RecordingSegment[]
  exam: Exam
}

export function ExamComplete({ recordings, exam }: ExamCompleteProps) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({})

  const handlePlay = (recording: RecordingSegment) => {
    const id = `${recording.partId}-${recording.questionId}`

    if (playingId === id) {
      audioElements[id]?.pause()
      setPlayingId(null)
      return
    }

    if (playingId && audioElements[playingId]) {
      audioElements[playingId].pause()
    }

    let audio = audioElements[id]
    if (!audio) {
      audio = new Audio(URL.createObjectURL(recording.blob))
      audio.onended = () => setPlayingId(null)
      setAudioElements((prev) => ({ ...prev, [id]: audio! }))
    }

    audio.play()
    setPlayingId(id)
  }

  const handleDownloadAll = () => {
    recordings.forEach((recording, index) => {
      const part = exam.parts.find((p) => p.id === recording.partId)
      const url = URL.createObjectURL(recording.blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${exam.title}-${part?.title || "part"}-q${index + 1}.webm`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  const getPartTitle = (partId: string) => {
    return exam.parts.find((p) => p.id === partId)?.title || partId
  }

  const getQuestionText = (partId: string, questionId: string) => {
    const part = exam.parts.find((p) => p.id === partId)
    return part?.questions.find((q) => q.id === questionId)?.text || ""
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      {/* Success header */}
      <div className="mb-10 text-center animate-scale-in">
        <div
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full animate-part-complete-check"
          style={{ backgroundColor: "hsl(var(--exam-primary) / 0.1)" }}
        >
          <CheckCircle2 className="h-10 w-10" style={{ color: "hsl(var(--exam-primary))" }} />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Exam Completed</h1>
        <p className="text-base text-muted-foreground">
          You have completed all parts of the {exam.title}. Your recordings are ready for review.
        </p>
      </div>

      {/* Recordings list */}
      <div className="mb-8 space-y-3">
        {recordings.map((recording, index) => {
          const id = `${recording.partId}-${recording.questionId}`
          const isPlaying = playingId === id

          return (
            <div
              key={id}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:shadow-md animate-slide-up"
              style={{ animationDelay: `${index * 0.08}s`, animationFillMode: "both" }}
            >
              <button
                type="button"
                onClick={() => handlePlay(recording)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-transform hover:scale-110"
                style={{ backgroundColor: "hsl(var(--exam-primary))" }}
                aria-label={isPlaying ? "Pause recording" : "Play recording"}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{getPartTitle(recording.partId)}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {getQuestionText(recording.partId, recording.questionId)}
                </p>
              </div>

              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, "0")}
              </span>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 animate-fade-in sm:flex-row sm:justify-center" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
        <Button
          size="lg"
          onClick={handleDownloadAll}
          className="gap-2 rounded-xl text-white shadow-lg"
          style={{ backgroundColor: "hsl(var(--exam-primary))" }}
        >
          <Download className="h-4 w-4" />
          Download All Recordings
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => window.location.reload()}
          className="gap-2 rounded-xl"
        >
          <RotateCcw className="h-4 w-4" />
          Take Again
        </Button>
        <Link href="/dashboard">
          <Button size="lg" variant="outline" className="gap-2 rounded-xl bg-transparent">
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
