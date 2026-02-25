"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Volume2 } from "lucide-react"

interface PartIntroProps {
  partNumber: number
  title: string
  instruction: string
  onStart: () => void
}

export function PartIntro({ partNumber, title, instruction, onStart }: PartIntroProps) {
  const partLabel = title.includes("Photo") ? "PART 1.2" : `PART ${partNumber}`

  return (
    <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-12">
      {/* Instruction text */}
      <div className="flex-1 rounded-2xl border-2 p-6 md:p-8 transition-all duration-300 hover:shadow-lg" style={{ borderColor: "hsl(var(--exam-card-border))" }}>
        <div className="mb-4 flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Instructions</span>
        </div>
        <p className="text-base leading-relaxed text-foreground md:text-lg">
          {instruction}
        </p>
      </div>

      {/* Part badge and start button */}
      <div className="flex flex-col items-center gap-6">
        <div
          className="flex items-center justify-center rounded-2xl px-10 py-5 text-2xl font-bold text-white shadow-lg transition-transform hover:scale-105 md:text-3xl"
          style={{ backgroundColor: "hsl(var(--exam-primary))" }}
        >
          {partLabel}
        </div>

        <Button
          size="lg"
          onClick={onStart}
          className="gap-2 rounded-xl px-8 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          style={{ backgroundColor: "hsl(var(--exam-primary))" }}
        >
          Begin
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
