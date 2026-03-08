"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import type { Exam, RecordingSegment } from "@/lib/exam-types"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Download, Play, Pause, Home, Loader2, AlertCircle } from "lucide-react"
import { uploadRecording, submitSession } from "@/lib/api-services"

interface ExamCompleteProps {
  recordings: RecordingSegment[]
  exam: Exam
  sessionId: string | null
}

export function ExamComplete({ recordings, exam, sessionId }: ExamCompleteProps) {
  useEffect(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  const [uploading, setUploading] = useState(false)
  const [uploadDone, setUploadDone] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const startedUpload = useRef(false)

  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({})

  useEffect(() => {
    if (!sessionId || startedUpload.current || recordings.length === 0) return
    startedUpload.current = true

    async function upload() {
      setUploading(true)
      setUploadError("")

      let successCount = 0
      for (let i = 0; i < recordings.length; i++) {
        const rec = recordings[i]
        try {
          const ok = await uploadRecording(
            sessionId!,
            rec.partId,
            rec.questionId,
            rec.partOrder,
            rec.questionOrder,
            rec.blob,
            rec.duration
          )
          if (ok) successCount++
        } catch {
          // continue uploading remaining recordings
        }
        setUploadProgress(Math.round(((i + 1) / recordings.length) * 100))
      }

      const totalDuration = recordings.reduce((s, r) => s + r.duration, 0)
      await submitSession(sessionId!, totalDuration)

      if (successCount < recordings.length) {
        setUploadError(`Uploaded ${successCount}/${recordings.length} recordings. Some may have failed.`)
      }
      setUploading(false)
      setUploadDone(true)
    }

    upload()
  }, [sessionId, recordings])

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

  const getPartTitle = (partId: string) =>
    exam.parts.find((p) => p.id === partId)?.title || partId

  const getQuestionText = (partId: string, questionId: string) => {
    const part = exam.parts.find((p) => p.id === partId)
    return part?.questions.find((q) => q.id === questionId)?.text || ""
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <div className="mb-10 text-center animate-scale-in">
        <div
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full animate-part-complete-check"
          style={{ backgroundColor: "hsl(var(--exam-primary) / 0.1)" }}
        >
          <CheckCircle2 className="h-10 w-10" style={{ color: "hsl(var(--exam-primary))" }} />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Exam Completed</h1>
        <p className="text-base text-muted-foreground">
          You have completed all parts of the {exam.title}. Your recordings are being submitted for review.
        </p>
      </div>

      {/* Upload status */}
      {uploading && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Uploading recordings... {uploadProgress}%</p>
            <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%`, backgroundColor: "hsl(var(--exam-primary))" }}
              />
            </div>
          </div>
        </div>
      )}

      {uploadDone && !uploadError && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            All recordings uploaded successfully! Your exam is now pending review.
          </p>
        </div>
      )}

      {uploadError && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">{uploadError}</p>
        </div>
      )}

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

      <div className="flex flex-col gap-3 animate-fade-in sm:flex-row sm:justify-center" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
        <Button
          size="lg"
          onClick={handleDownloadAll}
          className="gap-2 rounded-xl text-white shadow-lg"
          style={{ backgroundColor: "hsl(var(--exam-primary))" }}
        >
          <Download className="h-4 w-4" />
          Download All
        </Button>
        <Link href="/dashboard">
          <Button size="lg" variant="outline" className="gap-2 rounded-xl">
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
