"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { Exam, ExamPhase, RecordingSegment } from "@/lib/exam-types"
import { sampleForAgainst } from "@/lib/sample-exam"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { ProgressStepper } from "./progress-stepper"
import { CountdownTimer } from "./countdown-timer"
import { PartIntro } from "./part-intro"
import { QuestionCard } from "./question-card"
import { ForAgainstCard } from "./for-against-card"
import { ExamComplete } from "./exam-complete"
import { PartTransition } from "./part-transition"
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

  const { isRecording, startRecording, stopRecording, error: recorderError } = useAudioRecorder()
  const totalTimeRef = useRef(0)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const currentPart = exam.parts[currentPartIndex]
  const currentQuestion = currentPart?.questions[currentQuestionIndex]

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    return audioCtxRef.current
  }, [])

  // Louder, more distinct beep when student should start speaking
  const playStartBeep = useCallback(() => {
    try {
      const ctx = getAudioCtx()
      // Play two-tone ascending beep (louder)
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      const gain2 = ctx.createGain()

      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)

      // First tone
      osc1.frequency.value = 660
      osc1.type = "sine"
      gain1.gain.setValueAtTime(0.6, ctx.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
      osc1.start(ctx.currentTime)
      osc1.stop(ctx.currentTime + 0.25)

      // Second tone (higher, starts after first)
      osc2.frequency.value = 880
      osc2.type = "sine"
      gain2.gain.setValueAtTime(0.7, ctx.currentTime + 0.28)
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7)
      osc2.start(ctx.currentTime + 0.28)
      osc2.stop(ctx.currentTime + 0.7)
    } catch {
      // audio not available
    }
  }, [getAudioCtx])

  // Warning beep for low time
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

  // Part complete sound (triumphant)
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
    if (!currentPart || !currentQuestion) return

    const blob = await stopRecording()

    if (blob) {
      setRecordings((prev) => [
        ...prev,
        {
          partId: currentPart.id,
          questionId: currentQuestion.id,
          blob,
          duration: currentPart.answerTime - timeRemaining,
        },
      ])
    }

    const hasMoreQuestions = currentQuestionIndex < currentPart.questions.length - 1
    const hasMoreParts = currentPartIndex < exam.parts.length - 1

    if (hasMoreQuestions) {
      triggerAnimation()
      setCurrentQuestionIndex((i) => i + 1)
      setPhase("prep")
      const prepTime = currentPart.prepTime
      totalTimeRef.current = prepTime
      setTimeRemaining(prepTime)
      setTimerKey((k) => k + 1)
    } else if (hasMoreParts) {
      // Show part transition animation
      const completedPartName = currentPart.title.split(" - ")[0] || currentPart.title
      playCompleteSound()
      setTransitionPartName(completedPartName)
      setShowTransition(true)

      setTimeout(() => {
        setShowTransition(false)
        setCurrentPartIndex((i) => i + 1)
        setCurrentQuestionIndex(0)
        setPhase("intro")
        triggerAnimation()
      }, 2500)
    } else {
      playCompleteSound()
      setPhase("complete")
    }
  }, [
    currentPart,
    currentQuestion,
    currentQuestionIndex,
    currentPartIndex,
    exam.parts.length,
    stopRecording,
    timeRemaining,
    playCompleteSound,
    triggerAnimation,
  ])

  const handleTimerTick = useCallback(
    (time: number) => {
      setTimeRemaining(time)
      // Warning beep at 5, 3, 2, 1 seconds
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

  // Part transition screen
  if (showTransition) {
    return <PartTransition partName={transitionPartName} />
  }

  if (phase === "complete") {
    return <ExamComplete recordings={recordings} exam={exam} />
  }

  if (!currentPart || !currentQuestion) return null

  const displayPart = getDisplayPart(currentPartIndex, exam)
  const completedDisplayParts = getCompletedDisplayParts(currentPartIndex, exam)

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-6 md:py-10">
      {/* Progress stepper */}
      <div className="mb-8 animate-fade-in md:mb-12">
        <ProgressStepper
          totalParts={3}
          currentPart={displayPart}
          completedParts={completedDisplayParts}
        />
      </div>

      {/* Recorder error */}
      {recorderError && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 animate-scale-in">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{recorderError}</p>
        </div>
      )}

      {/* Phase content */}
      {phase === "intro" && (
        <div className={animateContent ? "animate-slide-up" : "opacity-0"}>
          <PartIntro
            partNumber={currentPart.partNumber}
            title={currentPart.title}
            instruction={currentPart.instruction}
            onStart={handleStartPart}
          />
        </div>
      )}

      {(phase === "prep" || phase === "answer") && (
        <div className={`flex flex-col gap-6 md:flex-row md:gap-10 ${animateContent ? "animate-fade-in" : "opacity-0"}`}>
          {/* Question area */}
          <div className="flex-1">
            {/* Phase indicator */}
            <div className="mb-4 flex items-center gap-3">
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

            {/* Question content */}
            {currentPart.type === "part3" ? (
              <ForAgainstCard
                data={
                  sampleForAgainst[currentQuestion.id] || {
                    topic: currentQuestion.text,
                    forPoints: [],
                    againstPoints: [],
                  }
                }
                questionNumber={currentQuestionIndex + 1}
              />
            ) : (
              <QuestionCard question={currentQuestion} questionNumber={currentQuestionIndex + 1} />
            )}
          </div>

          {/* Timer area */}
          <div className="flex flex-col items-center gap-4">
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
  )
}
