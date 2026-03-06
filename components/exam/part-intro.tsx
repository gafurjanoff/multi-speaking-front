"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Volume2, Loader2 } from "lucide-react"

interface PartIntroProps {
  partNumber: number
  title: string
  instruction: string
  instructionAudio?: string | null
  autoStart?: boolean
  onStart: () => void
}

function playBeepSound() {
  try {
    const ctx = new AudioContext()
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

    setTimeout(() => ctx.close(), 1500)
  } catch {
    // audio not available
  }
}

export function PartIntro({ partNumber, title, instruction, instructionAudio, autoStart = false, onStart }: PartIntroProps) {
  const partLabel = title.includes("Photo") ? "PART 1.2" : `PART ${partNumber}`
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)
  const [audioFinished, setAudioFinished] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const hasAutoStarted = useRef(false)

  const startCountdownThenBegin = useCallback(() => {
    if (hasAutoStarted.current) return
    hasAutoStarted.current = true
    setCountdown(3)
  }, [])

  useEffect(() => {
    if (countdown === null) return
    if (countdown <= 0) {
      onStart()
      return
    }
    const t = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, onStart])

  useEffect(() => {
    if (!instructionAudio) {
      if (autoStart) {
        const t = setTimeout(startCountdownThenBegin, 2000)
        return () => clearTimeout(t)
      }
      return
    }

    const audio = new Audio(instructionAudio)
    audioRef.current = audio

    setAudioLoading(true)
    audio.addEventListener("canplaythrough", () => {
      setAudioLoading(false)
      audio.play().catch(() => {})
      setAudioPlaying(true)
    })
    audio.addEventListener("ended", () => {
      setAudioPlaying(false)
      setAudioFinished(true)
      playBeepSound()
      if (autoStart) {
        setTimeout(startCountdownThenBegin, 800)
      }
    })
    audio.addEventListener("error", () => {
      setAudioLoading(false)
      setAudioPlaying(false)
      if (autoStart) {
        startCountdownThenBegin()
      }
    })
    audio.load()

    return () => {
      audio.pause()
      audio.removeAttribute("src")
    }
  }, [instructionAudio, autoStart, startCountdownThenBegin])

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
      setAudioPlaying(true)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-12">
      <div className="flex-1 rounded-2xl border-2 p-6 md:p-8 transition-all duration-300 hover:shadow-lg" style={{ borderColor: "hsl(var(--exam-card-border))" }}>
        <div className="mb-4 flex items-center gap-2">
          {audioLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <button
              type="button"
              onClick={handleReplay}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Play instruction audio"
            >
              <Volume2 className={`h-4 w-4 ${audioPlaying ? "text-primary animate-pulse" : ""}`} />
              <span className="text-xs font-medium">
                {instructionAudio
                  ? audioPlaying ? "Playing..." : "Replay"
                  : "Instructions"
                }
              </span>
            </button>
          )}
        </div>
        <p className="text-base leading-relaxed text-foreground md:text-lg">
          {instruction}
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div
          className="flex items-center justify-center rounded-2xl px-10 py-5 text-2xl font-bold text-white shadow-lg transition-transform hover:scale-105 md:text-3xl"
          style={{ backgroundColor: "hsl(var(--exam-primary))" }}
        >
          {partLabel}
        </div>

        {countdown !== null ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold text-white animate-pulse"
              style={{ backgroundColor: "hsl(var(--exam-primary))" }}
            >
              {countdown}
            </div>
            <span className="text-sm font-medium text-muted-foreground">Starting...</span>
          </div>
        ) : autoStart ? (
          <div className="flex flex-col items-center gap-2">
            {audioPlaying && (
              <span className="text-sm text-muted-foreground animate-pulse">Listen to the instructions...</span>
            )}
            {audioFinished && !countdown && (
              <span className="text-sm text-muted-foreground">Preparing...</span>
            )}
          </div>
        ) : (
          <Button
            size="lg"
            onClick={onStart}
            className="gap-2 rounded-xl px-8 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
            style={{ backgroundColor: "hsl(var(--exam-primary))" }}
          >
            Begin
            <ArrowRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
