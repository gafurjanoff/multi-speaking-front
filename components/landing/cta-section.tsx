import Link from "next/link"
import { ArrowRight, ShieldCheck, Sparkles, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="border-t border-border px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 rounded-3xl border border-border bg-card/60 p-6 md:grid-cols-2 md:p-10">
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mock exams</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">
              Get exam-ready with paid mock attempts
            </h2>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              Real timings, clean transcripts, and actionable feedback — designed to help you improve fast and feel confident on test day.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full gap-2 rounded-xl px-8 text-base font-semibold text-white shadow-sm"
                  style={{ backgroundColor: "hsl(var(--exam-primary))" }}
                >
                  View exams
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full rounded-xl px-8 text-base">
                  Try free practice
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <Shuffle className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Different questions each attempt</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Paid mocks sample from pools, so every attempt feels fresh.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Detailed AI feedback</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Transcript + strengths + improvements for each part.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Real exam conditions</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Timers run automatically — no pausing, no going back.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
