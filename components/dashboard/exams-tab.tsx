"use client"

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
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-[1fr_80px_70px_90px_100px_100px] gap-2 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="text-left">Exam</span>
              <span className="text-left">Date</span>
              <span className="text-center">Score</span>
              <span className="text-center">Status</span>
              <span className="text-right">Recordings</span>
              <span className="text-right">Certificate</span>
            </div>
            {results.map((r) => {
              const score75 =
                r.score !== undefined
                  ? Math.round(r.score)
                  : null
              return (
                <div
                  key={r.id}
                  className="grid grid-cols-[1fr_80px_70px_90px_100px_100px] gap-2 border-t border-border px-4 py-3 text-sm items-center"
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
                    <Link href={`/dashboard/results/${r.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        View
                      </Button>
                    </Link>
                  </span>
                  <span className="text-right">
                    {score75 !== null ? (
                      <Link href={`/certificate/${r.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Certificate
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        —
                      </span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Mobile card view */}
          <div className="space-y-3 md:hidden">
            {results.map((r) => {
              const score75 =
                r.score !== undefined
                  ? Math.round(r.score)
                  : null
              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-border bg-card p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{r.examTitle}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(r.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-foreground">
                      {score75 !== null ? `${score75}/75` : r.status === "pending_review" ? "Pending" : "\u2014"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">
                      {r.status.replace("_", " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/results/${r.id}`}>
                        <Button variant="outline" size="sm" className="text-xs h-8 px-3">
                          View
                        </Button>
                      </Link>
                      {score75 !== null && (
                        <Link href={`/certificate/${r.id}`}>
                          <Button variant="outline" size="sm" className="text-xs h-8 px-3">
                            Certificate
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}
