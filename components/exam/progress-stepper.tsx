"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressStepperProps {
  totalParts: number
  currentPart: number // 0-indexed
  completedParts: number[] // 0-indexed array of completed part indices
}

export function ProgressStepper({ totalParts, currentPart, completedParts }: ProgressStepperProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {Array.from({ length: totalParts }).map((_, index) => {
        const isCompleted = completedParts.includes(index)
        const isCurrent = index === currentPart
        const isPending = !isCompleted && !isCurrent

        return (
          <div key={index} className="flex items-center">
            {/* Step circle */}
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold transition-all duration-300",
                isCompleted && "text-white",
                isCurrent && "text-white shadow-lg",
                isPending && "text-white"
              )}
              style={{
                backgroundColor: isCompleted
                  ? "hsl(var(--exam-primary))"
                  : isCurrent
                    ? "hsl(var(--exam-primary))"
                    : "hsl(var(--exam-pending))",
              }}
            >
              {isCompleted ? (
                <Check className="h-7 w-7" strokeWidth={3} />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            {/* Connector line */}
            {index < totalParts - 1 && (
              <div
                className="h-1 w-16 transition-all duration-300 md:w-24"
                style={{
                  backgroundColor:
                    completedParts.includes(index) && (completedParts.includes(index + 1) || index + 1 === currentPart)
                      ? "hsl(var(--exam-primary))"
                      : "hsl(var(--exam-pending))",
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
