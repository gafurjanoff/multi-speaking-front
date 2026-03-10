"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { Exam, RecordingSegment } from "@/lib/exam-types"

type ExamPhase = "intro" | "prep" | "answer" | "complete"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { ProgressStepper } from "./progress-stepper"
import { CountdownTimer } from "./countdown-timer"
import { PartIntro } from "./part-intro"
import { QuestionCard } from "./question-card"
import { ForAgainstCard } from "./for-against-card"
import { ExamComplete } from "./exam-complete"
import { PartTransition } from "./part-transition"
import { startSession } from "@/lib/api-services"
import { Mic, Clock, Volume2, AlertCircle } from "lucide-react"

interface ExamEngineProps {
  exam: Exam
}

function getDisplayPart(partIndex: number, exam: Exam): number {
  const part = exam.parts[partIndex]
  if (!part) return 0
  if (part.type === "part1" || part.type === "part1_photos") return 0
  if (part.type === "part2") return 1
  if (part.type === "part3") return 2
  return partIndex
}

function getCompletedDisplayParts(currentPartIndex: number, exam: Exam): number[] {
  const completed: Set<number> = new Set()
  for (let i = 0; i < currentPartIndex; i++) {
    completed.add(getDisplayPart(i, exam))
  }
  return Array.from(completed)
}

export function ExamEngine({ exam }: ExamEngineProps) {
  const [currentPartIndex, setCurrentPartIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [phase, setPhase] = useState<ExamPhase>("intro")
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [recordings, setRecordings] = useState<RecordingSegment[]>([])
  const [timerKey, setTimerKey] = useState(0)
  const [showTransition, setShowTransition] = useState(false)
  const [transitionPartName, setTransitionPartName] = useState("")
  const [animateContent, setAnimateContent] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const { isRecording, startRecording, stopRecording, error: recorderError } = useAudioRecorder()
  const totalTimeRef = useRef(0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const isProcessingRef = useRef(false)

  const currentPart = exam.parts[currentPartIndex]
  const currentQuestion = currentPart?.questions[currentQuestionIndex]

  // Prevent page reload / tab close during active exam
  useEffect(() => {
    if (phase === "complete") return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [phase])

  // Push a history entry so back button doesn't leave the exam
  useEffect(() => {
    if (phase === "complete") return
    window.history.pushState(null, "", window.location.href)
    const onPopState = () => {
      window.history.pushState(null, "", window.location.href)
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [phase])

  // Re-enter fullscreen if user exits it during the exam
  useEffect(() => {
    if (phase === "complete") return
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {})
      }
    }
    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange)
  }, [phase])

  // Start session on mount
  useEffect(() => {
    startSession(exam.id).then((session) => {
      if (session) setSessionId(session.id)
    })
  }, [exam.id])

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    return audioCtxRef.current
  }, [])

  const playStartBeep = useCallback(() => {
    try {
      const ctx = getAudioCtx()
      const t = ctx.currentTime

      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.frequency.value = 800
      osc1.type = "sine"
      gain1.gain.setValueAtTime(0.8, t)
      gain1.gain.setValueAtTime(0.8, t + 0.15)
      gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.25)
      osc1.start(t)
      osc1.stop(t + 0.25)

      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.frequency.value = 1200
      osc2.type = "sine"
      gain2.gain.setValueAtTime(0.9, t + 0.3)
      gain2.gain.setValueAtTime(0.9, t + 0.55)
      gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.7)
      osc2.start(t + 0.3)
      osc2.stop(t + 0.7)
    } catch {
      // audio not available
    }
  }, [getAudioCtx])

  const playWarningBeep = useCallback(() => {
    try {
      const ctx = getAudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 440
      osc.type = "triangle"
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.15)
    } catch {
      // audio not available
    }
  }, [getAudioCtx])

  const playCompleteSound = useCallback(() => {
    try {
      const ctx = getAudioCtx()
      const notes = [523, 659, 784, 1047]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = freq
        osc.type = "sine"
        const startTime = ctx.currentTime + i * 0.12
        gain.gain.setValueAtTime(0.4, startTime)
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)
        osc.start(startTime)
        osc.stop(startTime + 0.4)
      })
    } catch {
      // audio not available
    }
  }, [getAudioCtx])

  const triggerAnimation = useCallback(() => {
    setAnimateContent(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimateContent(true)
      })
    })
  }, [])

  const handleStartPart = useCallback(() => {
    if (!currentPart) return
    triggerAnimation()
    setPhase("prep")
    const prepTime = currentPart.prepTime
    totalTimeRef.current = prepTime
    setTimeRemaining(prepTime)
    setTimerKey((k) => k + 1)
  }, [currentPart, triggerAnimation])

  const handlePrepComplete = useCallback(async () => {
    if (!currentPart) return
    playStartBeep()
    triggerAnimation()
    setPhase("answer")
    const answerTime = currentPart.answerTime
    totalTimeRef.current = answerTime
    setTimeRemaining(answerTime)
    setTimerKey((k) => k + 1)
    await startRecording()
  }, [currentPart, startRecording, playStartBeep, triggerAnimation])

  const handleAnswerComplete = useCallback(async () => {
    // Prevent double execution from React StrictMode or timer race conditions
    if (isProcessingRef.current) return
    isProcessingRef.current = true

    if (!currentPart || !currentQuestion) {
      isProcessingRef.current = false
      return
    }

    const blob = await stopRecording()

    if (blob) {
      setRecordings((prev) => [
        ...prev,
        {
          partId: currentPart.id,
          questionId: currentQuestion.id,
          partOrder: currentPartIndex,
          questionOrder: currentQuestionIndex,
          blob,
          duration: currentPart.answerTime - timeRemaining,
        },
      ])
    }

    const hasMoreQuestions = currentQuestionIndex < currentPart.questions.length - 1
    const hasMoreParts = currentPartIndex < exam.parts.length - 1

    if (hasMoreQuestions) {
      triggerAnimation()
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setPhase("prep")
      const prepTime = currentPart.prepTime
      totalTimeRef.current = prepTime
      setTimeRemaining(prepTime)
      setTimerKey((k) => k + 1)
      isProcessingRef.current = false
    } else if (hasMoreParts) {
      const nextIdx = currentPartIndex + 1
      const nextPart = exam.parts[nextIdx]
      const currentDisplay = getDisplayPart(currentPartIndex, exam)
      const nextDisplay = getDisplayPart(nextIdx, exam)

      if (currentDisplay === nextDisplay) {
        // Same display part (e.g. part1 → part1_photos) – skip transition
        setCurrentPartIndex(nextIdx)
        setCurrentQuestionIndex(0)
        setPhase("prep")
        const prepTime = nextPart!.prepTime
        totalTimeRef.current = prepTime
        setTimeRemaining(prepTime)
        setTimerKey((k) => k + 1)
        triggerAnimation()
        isProcessingRef.current = false
      } else {
        const displayPartNames = ["Part 1", "Part 2", "Part 3"]
        const completedPartName = displayPartNames[currentDisplay] || currentPart.title
        playCompleteSound()
        setTransitionPartName(completedPartName)
        setShowTransition(true)

        setTimeout(() => {
          setShowTransition(false)
          setCurrentPartIndex(nextIdx)
          setCurrentQuestionIndex(0)
          setPhase("intro")
          triggerAnimation()
          isProcessingRef.current = false
        }, 2500)
      }
    } else {
      playCompleteSound()
      setPhase("complete")
      isProcessingRef.current = false
    }
  }, [
    currentPart,
    currentQuestion,
    currentQuestionIndex,
    currentPartIndex,
    exam.parts,
    stopRecording,
    timeRemaining,
    playCompleteSound,
    triggerAnimation,
  ])

  const handleTimerTick = useCallback(
    (time: number) => {
      setTimeRemaining(time)
      if (phase === "answer" && [5, 3, 2, 1].includes(time)) {
        playWarningBeep()
      }
    },
    [phase, playWarningBeep]
  )

  const handleTimerComplete = useCallback(() => {
    if (phase === "prep") {
      handlePrepComplete()
    } else if (phase === "answer") {
      handleAnswerComplete()
    }
  }, [phase, handlePrepComplete, handleAnswerComplete])

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
      }
    }
  }, [])

  if (showTransition) {
    return <PartTransition partName={transitionPartName} />
  }

  if (phase === "complete") {
    return <ExamComplete recordings={recordings} exam={exam} sessionId={sessionId} />
  }

  // Debug logging
  console.log(`[ExamEngine] partIndex=${currentPartIndex}, questionIndex=${currentQuestionIndex}, phase=${phase}`)
  console.log(`[ExamEngine] totalParts=${exam.parts.length}, currentPart=${currentPart?.type}, currentQuestion=${currentQuestion?.text?.slice(0, 30)}`)

  if (!currentPart || !currentQuestion) {
    console.error(`[ExamEngine] BLANK SCREEN: currentPart=${!!currentPart}, currentQuestion=${!!currentQuestion}`)
    console.error(`[ExamEngine] exam.parts=`, exam.parts.map(p => p.type))
    return null
  }

  const displayPart = getDisplayPart(currentPartIndex, exam)
  const completedDisplayParts = getCompletedDisplayParts(currentPartIndex, exam)

  const displayPartNames = ["Part 1", "Part 2", "Part 3"]
  const currentDisplayLabel = displayPartNames[displayPart] || `Part ${displayPart + 1}`

  return (
    <div className="mx-auto flex min-h-screen flex-col max-w-4xl px-4 py-4 md:py-8 select-none">
      {/* Top bar: exam title + stepper */}
      <div className="mb-6 md:mb-10 space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 items-center rounded-full px-3 text-[11px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: "hsl(var(--exam-primary))" }}>
              {exam.isFree ? "Free" : "Mock"}
            </span>
            <span className="text-sm font-semibold text-foreground hidden sm:inline">{exam.title}</span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{currentDisplayLabel}</span>
        </div>
        <ProgressStepper
          totalParts={3}
          currentPart={displayPart}
          completedParts={completedDisplayParts}
        />
      </div>

      {recorderError && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 animate-scale-in">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{recorderError}</p>
        </div>
      )}

      {/* Main content area — fills remaining space */}
      <div className="flex-1 flex flex-col justify-center">
        {phase === "intro" && (
          <div className={animateContent ? "animate-slide-up" : "opacity-0"}>
            <PartIntro
              partNumber={displayPart + 1}
              title={currentPart.title}
              instruction={currentPart.instruction}
              instructionAudio={currentPart.instructionAudio}
              autoStart={!exam.isFree}
              onStart={handleStartPart}
            />
          </div>
        )}

        {(phase === "prep" || phase === "answer") && (
          <div className={`flex flex-col gap-5 md:flex-row md:gap-10 ${animateContent ? "animate-fade-in" : "opacity-0"}`}>
            {/* Timer – centered above content on mobile */}
            <div className="flex flex-col items-center gap-2 md:hidden">
              <CountdownTimer
                key={timerKey}
                timeRemaining={timeRemaining}
                totalTime={totalTimeRef.current}
                isRecording={phase === "answer"}
                onComplete={handleTimerComplete}
                onTick={handleTimerTick}
              />
              <div className="flex items-center gap-2">
                {phase === "prep" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: "hsl(var(--exam-primary) / 0.1)", color: "hsl(var(--exam-primary))" }}>
                    <Clock className="h-3 w-3" />
                    Preparation
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold animate-ring-pulse" style={{ backgroundColor: "hsl(var(--exam-recording) / 0.1)", color: "hsl(var(--exam-recording))" }}>
                    <Mic className="h-3 w-3" />
                    Recording
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-4 hidden md:flex items-center gap-3">
                {phase === "prep" ? (
                  <div className="flex items-center gap-2 rounded-full px-4 py-2" style={{ backgroundColor: "hsl(var(--exam-primary) / 0.1)" }}>
                    <Clock className="h-4 w-4" style={{ color: "hsl(var(--exam-primary))" }} />
                    <span className="text-sm font-semibold" style={{ color: "hsl(var(--exam-primary))" }}>
                      Preparation Time
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-full px-4 py-2 animate-ring-pulse" style={{ backgroundColor: "hsl(var(--exam-recording) / 0.1)" }}>
                    <Mic className="h-4 w-4" style={{ color: "hsl(var(--exam-recording))" }} />
                    <span className="text-sm font-bold" style={{ color: "hsl(var(--exam-recording))" }}>
                      Speak Now
                    </span>
                    <Volume2 className="h-4 w-4 animate-pulse" style={{ color: "hsl(var(--exam-recording))" }} />
                  </div>
                )}
              </div>

              {currentPart.type === "part3" ? (
                <ForAgainstCard question={currentQuestion} />
              ) : (
                <QuestionCard question={currentQuestion} partImages={currentPart.images} />
              )}
            </div>

            {/* Timer – sidebar on desktop */}
            <div className="hidden md:flex flex-col items-center gap-4">
              <CountdownTimer
                key={timerKey}
                timeRemaining={timeRemaining}
                totalTime={totalTimeRef.current}
                isRecording={phase === "answer"}
                onComplete={handleTimerComplete}
                onTick={handleTimerTick}
              />
              <span className="text-xs font-medium text-muted-foreground">
                {phase === "prep" ? "Get Ready..." : "Speak clearly"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
