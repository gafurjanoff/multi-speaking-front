"use client"

import { useState, useEffect } from "react"
import type { Exam } from "@/lib/exam-types"
import { Mic, Monitor, AlertTriangle, CheckCircle2, Clock, Volume2, Shield } from "lucide-react"

interface ExamLobbyProps {
  exam: Exam
  onStart: () => void
}

export function ExamLobby({ exam, onStart }: ExamLobbyProps) {
  const [micGranted, setMicGranted] = useState(false)
  const [micError, setMicError] = useState("")
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop())
        setMicGranted(true)
        setChecking(false)
      })
      .catch(() => {
        setMicError("Microphone access denied. Please allow microphone in your browser settings.")
        setChecking(false)
      })
  }, [])

  const handleStart = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
    onStart()
  }

  const partSummary = exam.parts.map((p) => {
    const label =
      p.type === "part1" ? "Part 1" :
      p.type === "part1_photos" ? "Part 1.2" :
      p.type === "part2" ? "Part 2" :
      "Part 3"
    return { label, title: p.title, questions: p.questions.length, prepTime: p.prepTime, answerTime: p.answerTime }
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl p-4" style={{ backgroundColor: "hsl(174, 42%, 51%, 0.1)" }}>
            <Shield className="h-10 w-10" style={{ color: "hsl(174, 42%, 51%)" }} />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{exam.title}</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Level: <span className="font-semibold text-foreground">{exam.level}</span>
          </p>
        </div>

        {/* Exam info card */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-bold text-foreground">Exam Structure</h2>
          <div className="space-y-3">
            {partSummary.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ backgroundColor: "hsl(174, 42%, 51%)" }}>
                    {p.label.replace("Part ", "")}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.questions} question{p.questions !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {p.prepTime}s prep
                  </span>
                  <span className="flex items-center gap-1">
                    <Mic className="h-3 w-3" />
                    {p.answerTime}s speak
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System checks */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-bold text-foreground">Before You Begin</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
              {checking ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
              ) : micGranted ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  <Mic className="mr-1.5 inline h-4 w-4" />
                  Microphone Access
                </p>
                {micError && <p className="mt-0.5 text-xs text-red-500">{micError}</p>}
                {micGranted && <p className="mt-0.5 text-xs text-green-600">Microphone is ready</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
              <Monitor className="h-5 w-5 shrink-0" style={{ color: "hsl(174, 42%, 51%)" }} />
              <div>
                <p className="text-sm font-medium text-foreground">Full Screen Mode</p>
                <p className="mt-0.5 text-xs text-muted-foreground">The exam will enter full screen when you start</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
              <Volume2 className="h-5 w-5 shrink-0" style={{ color: "hsl(174, 42%, 51%)" }} />
              <div>
                <p className="text-sm font-medium text-foreground">Audio Instructions</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Make sure your speakers/headphones are on</p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Important</p>
              <ul className="mt-1 space-y-1 text-xs text-amber-700 dark:text-amber-400">
                <li>- Ensure you are in a quiet environment</li>
                <li>- Do not leave the exam once started</li>
                <li>- Your audio will be recorded for each question</li>
                <li>- Speak clearly into the microphone</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Start button */}
        <div className="text-center">
          <button
            onClick={handleStart}
            disabled={!micGranted}
            className="inline-flex items-center gap-3 rounded-2xl px-10 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ backgroundColor: "hsl(174, 42%, 51%)" }}
          >
            Start Exam
          </button>
          {!micGranted && !checking && (
            <p className="mt-3 text-sm text-red-500">
              Please allow microphone access to start the exam
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
