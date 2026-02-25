"use client"

import { Suspense } from "react"
import { ExamEngine } from "@/components/exam/exam-engine"
import { sampleExam } from "@/lib/sample-exam"

function ExamContent() {
  // In production, you would fetch the exam by ID from searchParams
  // For now, use the sample exam
  return <ExamEngine exam={sampleExam} />
}

export default function ExamPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      }
    >
      <ExamContent />
    </Suspense>
  )
}
