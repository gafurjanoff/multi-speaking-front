import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="border-t border-border px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
          Ready to improve your speaking?
        </h2>
        <p className="mb-8 text-base text-muted-foreground">
          Join hundreds of students already preparing for their exams on
          SpeakExam.
        </p>
        <Link href="/dashboard">
          <Button
            size="lg"
            className="gap-2 rounded-xl px-10 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
            style={{ backgroundColor: "hsl(var(--exam-primary))" }}
          >
            Start Practicing
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
