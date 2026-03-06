import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExamCardItem } from "@/components/exam-card"
import type { ExamCard } from "@/lib/api-types"

interface FreeExamsSectionProps {
  exams: ExamCard[]
}

export function FreeExamsSection({ exams }: FreeExamsSectionProps) {
  return (
    <section
      className="border-t border-border px-4 py-16"
      style={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
            Free Mock Exams
          </h2>
          <p className="text-base text-muted-foreground">
            Start practicing with our free exams - no account required
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {exams.slice(0, 3).map((exam) => (
            <ExamCardItem key={exam.id} exam={exam} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="gap-2 rounded-xl bg-transparent"
            >
              View All Exams
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
