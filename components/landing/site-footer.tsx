import { Mic } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-4 py-8">
      <div className="mx-auto max-w-6xl text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: "hsl(var(--exam-primary))" }}
          >
            <Mic className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-foreground">SpeakExam</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Multilevel Speaking Exam Platform
        </p>
      </div>
    </footer>
  )
}
