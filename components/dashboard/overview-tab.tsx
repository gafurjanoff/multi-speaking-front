import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExamCardItem } from "@/components/exam-card"
import type { ExamCard, ExamResult } from "@/lib/api-types"

interface OverviewTabProps {
  examCards: ExamCard[]
  latestResult: ExamResult | null
}

export function OverviewTab({ examCards, latestResult }: OverviewTabProps) {
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Available exams</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {examCards.map((exam) => (
            <ExamCardItem key={exam.id} exam={exam} />
          ))}
        </div>
      </section>

      {latestResult && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">
            Latest result
          </h2>
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {latestResult.examTitle}
              </p>
              <p className="text-xs text-muted-foreground">
                Completed on{" "}
                {new Date(latestResult.completedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Score (/75)</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(latestResult.score ?? 0)}
                </p>
              </div>
              <Link href={`/certificate/${latestResult.id}`}>
                <Button variant="outline" size="sm" className="text-xs">
                  View certificate
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
