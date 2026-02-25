"use client"

import { CheckCircle2 } from "lucide-react"

interface PartTransitionProps {
  partName: string
}

export function PartTransition({ partName }: PartTransitionProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center animate-scale-in">
        {/* Animated check */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full animate-part-complete-check"
          style={{ backgroundColor: "hsl(var(--exam-primary) / 0.1)" }}
        >
          <CheckCircle2
            className="h-12 w-12"
            style={{ color: "hsl(var(--exam-primary))" }}
          />
        </div>

        {/* Part name */}
        <h2 className="mb-2 text-2xl font-bold text-foreground animate-fade-in"
          style={{ animationDelay: "0.3s", animationFillMode: "both" }}
        >
          {partName} Complete
        </h2>

        <p
          className="text-base text-muted-foreground animate-fade-in"
          style={{ animationDelay: "0.5s", animationFillMode: "both" }}
        >
          Moving to next part...
        </p>

        {/* Progress dots */}
        <div
          className="mt-6 flex items-center justify-center gap-2 animate-fade-in"
          style={{ animationDelay: "0.7s", animationFillMode: "both" }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2.5 w-2.5 rounded-full animate-pulse"
              style={{
                backgroundColor: "hsl(var(--exam-primary))",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
