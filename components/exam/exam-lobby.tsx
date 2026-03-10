"use client"

import { useState, useEffect } from "react"
import type { Exam } from "@/lib/exam-types"
import { Mic, Monitor, AlertTriangle, CheckCircle2, Clock, Volume2, Shield, Lock, Unlock } from "lucide-react"

interface ExamLobbyProps {
  exam: Exam
  onStart: () => void
}

export function ExamLobby({ exam, onStart }: ExamLobbyProps) {
  const [micGranted, setMicGranted] = useState(false)
  const [micError, setMicError] = useState("")
  const [checking, setChecking] = useState(true)

  const isMock = !exam.isFree

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

  // Merge part1 and part1_photos into a single "Part 1" summary
  const rawParts = exam.parts.map((p) => {
    const label =
      p.type === "part1" || p.type === "part1_photos" ? "Part 1" :
      p.type === "part2" ? "Part 2" :
      "Part 3"
    return { label, type: p.type, title: p.title, questions: p.questions.length, prepTime: p.prepTime, answerTime: p.answerTime }
  })

  const partSummary: { label: string; title: string; questions: number; prepTime: string; answerTime: string }[] = []
  for (const rp of rawParts) {
    const existing = partSummary.find((s) => s.label === rp.label)
    if (existing) {
      existing.questions += rp.questions
      existing.prepTime += ` / ${rp.prepTime}s`
      existing.answerTime += ` / ${rp.answerTime}s`
    } else {
      partSummary.push({
        label: rp.label,
        title: rp.label === "Part 1" ? "Part 1 – Short & Photo Questions" : rp.title,
        questions: rp.questions,
        prepTime: `${rp.prepTime}s`,
        answerTime: `${rp.answerTime}s`,
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-6 md:py-8">
      <div className="w-full max-w-2xl space-y-5 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          {/* Exam type badge */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: isMock ? "hsl(174, 42%, 51%, 0.1)" : "hsl(142, 71%, 45%, 0.1)",
              color: isMock ? "hsl(174, 42%, 51%)" : "hsl(142, 71%, 45%)",
            }}
          >
            {isMock ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            {isMock ? "Mock Exam" : "Free Practice"}
          </div>

          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{exam.title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
            Level: <span className="font-semibold text-foreground">{exam.level}</span>
          </p>
        </div>

        {/* Mock vs Free info banner */}
        {isMock ? (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "hsl(174, 42%, 51%)" }} />
              <div>
                <p className="text-sm font-semibold text-foreground">Exam Conditions</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  This is a mock exam under real conditions. Audio instructions will play automatically, 
                  timers will start after the instruction ends, and you cannot pause or go back. 
                  Your recordings will be assessed by AI and results sent to you.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 dark:border-green-900/40 dark:bg-green-950/20">
            <div className="flex items-start gap-3">
              <Unlock className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">Free Practice Mode</p>
                <p className="mt-1 text-xs leading-relaxed text-green-700 dark:text-green-400">
                  You can start each part manually and take your time reading instructions.
                  This is ideal for getting familiar with the exam format.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Exam structure */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Exam Structure</h2>
          <div className="space-y-2">
            {partSummary.map((p, i) => (
              <div key={i} className="flex flex-col gap-1.5 rounded-lg bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ backgroundColor: "hsl(174, 42%, 51%)" }}>
                    {p.label.replace("Part ", "")}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.title}</p>
                    <p className="text-[11px] text-muted-foreground">{p.questions} question{p.questions !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground pl-10 sm:pl-0">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {p.prepTime} prep
                  </span>
                  <span className="flex items-center gap-1">
                    <Mic className="h-3 w-3" />
                    {p.answerTime} speak
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System checks */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Before You Begin</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg bg-muted/40 px-4 py-2.5">
              {checking ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
              ) : micGranted ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  <Mic className="mr-1 inline h-3.5 w-3.5" />
                  Microphone
                </p>
                {micError && <p className="mt-0.5 text-[11px] text-red-500">{micError}</p>}
                {micGranted && <p className="mt-0.5 text-[11px] text-green-600">Ready</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted/40 px-4 py-2.5">
              <Monitor className="h-4 w-4 shrink-0" style={{ color: "hsl(174, 42%, 51%)" }} />
              <p className="text-sm font-medium text-foreground">
                Full Screen <span className="text-[11px] font-normal text-muted-foreground">— activates on start</span>
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted/40 px-4 py-2.5">
              <Volume2 className="h-4 w-4 shrink-0" style={{ color: "hsl(174, 42%, 51%)" }} />
              <p className="text-sm font-medium text-foreground">
                Audio <span className="text-[11px] font-normal text-muted-foreground">— speakers / headphones on</span>
              </p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <ul className="space-y-0.5 text-xs text-amber-700 dark:text-amber-400">
              <li>• Find a quiet environment</li>
              <li>• Do not leave the exam once started</li>
              <li>• Speak clearly into the microphone</li>
              {isMock && <li>• Your recordings will be assessed automatically</li>}
            </ul>
          </div>
        </div>

        {/* Start button */}
        <div className="pb-4 text-center">
          <button
            onClick={handleStart}
            disabled={!micGranted}
            className="inline-flex items-center gap-3 rounded-2xl px-10 py-4 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 md:text-lg"
            style={{ backgroundColor: "hsl(174, 42%, 51%)" }}
          >
            {isMock ? "Start Mock Exam" : "Start Practice"}
          </button>
          {!micGranted && !checking && (
            <p className="mt-3 text-xs text-red-500">
              Please allow microphone access to start
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
