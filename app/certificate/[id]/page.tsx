"use client"

import { useEffect, useState, use } from "react"
import { useAuth } from "@/lib/auth-context"
import { fetchWithAuth } from "@/lib/api-client"
import { CertificateClient } from "@/components/certificate/certificate-client"
import type { ExamResult, StudentProfile } from "@/lib/api-types"

export default function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { user } = useAuth()
  const [result, setResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWithAuth(`/api/sessions/results/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setResult({
            id: data.id,
            examId: data.exam_id,
            examTitle: data.exam_title ?? "Speaking Exam",
            studentId: data.user_id,
            studentName: data.student_name ?? user?.name ?? "",
            studentEmail: "",
            level: "",
            completedAt: data.created_at,
            recordings: data.recordings ?? [],
            totalDuration: 0,
            status: data.status,
            score: data.overall_score ?? undefined,
            feedback: data.feedback ?? undefined,
            parts: data.parts,
          })
        }
        setLoading(false)
      })
  }, [id, user])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-3">
        <p className="text-lg font-semibold text-foreground">Result not found</p>
        <p className="text-sm text-muted-foreground">
          This certificate doesn&apos;t exist or you don&apos;t have access.
        </p>
      </div>
    )
  }

  const student: StudentProfile | null = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: "student" as const,
        createdAt: "",
        level: "",
        totalExamsTaken: 0,
        averageScore: 0,
      }
    : null

  return <CertificateClient result={result} student={student} />
}
