import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { ExamResult } from "@/lib/api-types"

interface ExamsTabProps {
  results: ExamResult[]
}

export function ExamsTab({ results }: ExamsTabProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Your exams</h2>
      {results.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No exams taken yet. Start your first exam from the overview tab.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-5 gap-2 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
            <span className="text-left">Exam</span>
            <span className="text-left">Date</span>
            <span className="text-center">Score (/75)</span>
            <span className="text-center">Status</span>
            <span className="text-right">Certificate</span>
          </div>
          {results.map((r) => {
            const score75 =
              r.score !== undefined
                ? Math.round((r.score / 100) * 75)
                : null
            return (
              <div
                key={r.id}
                className="grid grid-cols-5 gap-2 border-t border-border px-4 py-3 text-xs md:text-sm"
              >
                <span className="truncate font-medium text-foreground">
                  {r.examTitle}
                </span>
                <span className="text-muted-foreground">
                  {new Date(r.completedAt).toLocaleDateString()}
                </span>
                <span className="text-center text-foreground">
                  {score75 !== null
                    ? `${score75}/75`
                    : r.status === "pending_review"
                      ? "Pending"
                      : "\u2014"}
                </span>
                <span className="text-center text-muted-foreground capitalize">
                  {r.status.replace("_", " ")}
                </span>
                <span className="text-right">
                  {score75 !== null ? (
                    <Link href={`/certificate/${r.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] md:text-xs"
                      >
                        View
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">
                      No certificate
                    </span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
