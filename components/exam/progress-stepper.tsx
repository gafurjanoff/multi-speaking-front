"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressStepperProps {
  totalParts: number
  currentPart: number // 0-indexed
  completedParts: number[] // 0-indexed array of completed part indices
}

export function ProgressStepper({ totalParts, currentPart, completedParts }: ProgressStepperProps) {
  const partLabels = ["Part 1", "Part 2", "Part 3"]

  return (
    <div className="flex items-center justify-center gap-0">
      {Array.from({ length: totalParts }).map((_, index) => {
        const isCompleted = completedParts.includes(index)
        const isCurrent = index === currentPart

        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              {/* Step circle */}
              <div
                className={cn(
                  "flex items-center justify-center rounded-full font-bold transition-all duration-300 text-white",
                  "h-10 w-10 text-sm md:h-12 md:w-12 md:text-base",
                  isCurrent && "shadow-lg ring-4 ring-offset-2 ring-offset-background",
                )}
                style={{
                  backgroundColor: isCompleted || isCurrent
                    ? "hsl(var(--exam-primary))"
                    : "hsl(var(--exam-pending))",
                  ...(isCurrent ? { ringColor: "hsl(var(--exam-primary) / 0.3)" } : {}),
                }}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 md:h-6 md:w-6" strokeWidth={3} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {/* Label below */}
              <span className={cn(
                "text-[10px] font-semibold transition-colors md:text-xs",
                isCurrent ? "text-foreground" : "text-muted-foreground"
              )}>
                {partLabels[index]}
              </span>
            </div>

            {/* Connector line */}
            {index < totalParts - 1 && (
              <div
                className="mb-5 h-0.5 w-12 transition-all duration-300 sm:w-16 md:w-24"
                style={{
                  backgroundColor:
                    completedParts.includes(index) && (completedParts.includes(index + 1) || index + 1 === currentPart)
                      ? "hsl(var(--exam-primary))"
                      : "hsl(var(--exam-pending) / 0.4)",
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
