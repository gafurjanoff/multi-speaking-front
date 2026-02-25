"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface CountdownTimerProps {
  timeRemaining: number
  totalTime: number
  isRecording: boolean
  onComplete: () => void
  onTick: (time: number) => void
}

export function CountdownTimer({
  timeRemaining,
  totalTime,
  isRecording,
  onComplete,
  onTick,
}: CountdownTimerProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeRef = useRef(timeRemaining)

  useEffect(() => {
    timeRef.current = timeRemaining
  }, [timeRemaining])

  useEffect(() => {
    if (timeRemaining <= 0) return

    intervalRef.current = setInterval(() => {
      timeRef.current -= 1
      onTick(timeRef.current)

      if (timeRef.current <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        onComplete()
      }
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [totalTime, onComplete, onTick])

  const progress = totalTime > 0 ? timeRemaining / totalTime : 0
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const isLow = timeRemaining <= 5 && timeRemaining > 0
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  const strokeColor = isRecording
    ? isLow ? "hsl(var(--exam-recording))" : "hsl(var(--exam-recording))"
    : "hsl(var(--exam-timer))"

  return (
    <div className={cn("relative flex items-center justify-center", isRecording && "animate-ring-pulse")} style={{ borderRadius: "50%" }}>
      <svg width="140" height="140" className="-rotate-90">
        {/* Background track */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="5"
        />
        {/* Progress arc */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>

      {/* Center content */}
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-sans text-4xl font-bold tabular-nums tracking-tight transition-colors",
            isLow ? "text-destructive" : "text-foreground"
          )}
        >
          {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, "0")}` : seconds}
        </span>
        {isRecording && (
          <span className="mt-1 flex items-center gap-1.5 text-xs font-bold" style={{ color: "hsl(var(--exam-recording))" }}>
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: "hsl(var(--exam-recording))" }} />
            REC
          </span>
        )}
      </div>
    </div>
  )
}
