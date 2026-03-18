"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ExamEngine } from "@/components/exam/exam-engine"
import { ExamLobby } from "@/components/exam/exam-lobby"
import { PaymentRequired } from "@/components/exam/payment-required"
import { fetchExamDetail } from "@/lib/api-services"
import { fetchWithAuth } from "@/lib/api-client"
import type { Exam } from "@/lib/exam-types"

type AttemptInfo = {
  max_attempts: number
  used_attempts: number
  remaining_attempts: number
  window_expires_at?: string | null
} | null

export default function ExamByIdPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [started, setStarted] = useState(false)
  const [paymentRequired, setPaymentRequired] = useState(false)
  const [examMeta, setExamMeta] = useState<{ title: string; level: string } | null>(null)
  const [blockedMessage, setBlockedMessage] = useState("")
  const [attemptInfo, setAttemptInfo] = useState<AttemptInfo>(null)

  const examId = params?.id as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login/otp")
      return
    }
    if (!examId || !user) return

    setLoading(true)

    async function loadExam() {
      try {
        const data = await fetchExamDetail(examId)
        if (data) {
          setExam(data)
          // Auto-resume if there's saved in-progress state for this exam.
          try {
            const raw = sessionStorage.getItem(`speakexam_progress_${examId}`)
            if (raw) {
              const p = JSON.parse(raw) as any
              if (p && p.examId === examId && p.sessionId) {
                setStarted(true)
              }
            }
          } catch {
            // ignore
          }
          setLoading(false)
          return
        }
      } catch {
        // might be 403 payment_required
      }

      try {
        const accessRes = await fetchWithAuth("/api/exams/" + examId + "/access")
        if (accessRes.ok) {
          const accessData = await accessRes.json()
          if (typeof accessData?.max_attempts === "number") {
            setAttemptInfo({
              max_attempts: accessData.max_attempts,
              used_attempts: accessData.used_attempts ?? 0,
              remaining_attempts: accessData.remaining_attempts ?? 0,
              window_expires_at: accessData.window_expires_at ?? null,
            })
          }
          if (!accessData.has_access) {
            if (accessData.reason === "not_approved") {
              setExamMeta({ title: "Paid Exam", level: "" })
              setPaymentRequired(true)
              setLoading(false)
              return
            }
            if (accessData.reason === "attempt_limit_reached") {
              setBlockedMessage("Attempt limit reached for this exam.")
              setLoading(false)
              return
            }
            if (accessData.reason === "access_expired") {
              setBlockedMessage("Your access period for this paid exam has expired.")
              setLoading(false)
              return
            }
          }
        }
      } catch {
        // ignore
      }

      setError("Exam not found or you don't have access.")
      setLoading(false)
    }

    loadExam()
  }, [examId, user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    )
  }

  if (paymentRequired && examMeta) {
    return <PaymentRequired examTitle={examMeta.title} examLevel={examMeta.level} />
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-xl border border-border bg-card px-8 py-6 text-center">
          <p className="mb-4 text-lg font-semibold text-foreground">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: "hsl(var(--exam-primary))" }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (blockedMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-xl border border-border bg-card px-8 py-6 text-center">
          <p className="mb-4 text-lg font-semibold text-foreground">{blockedMessage}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: "hsl(var(--exam-primary))" }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!exam) return null

  if (!started) {
    // Some Next/TS incremental caches can lag behind prop type updates during dev.
    // Keep runtime correct while the type system catches up.
    const Lobby = ExamLobby as unknown as (p: any) => any
    return <Lobby exam={exam} attemptInfo={attemptInfo} onStart={() => setStarted(true)} />
  }

  const Engine = ExamEngine as unknown as (p: any) => any
  return <Engine exam={exam} attemptInfo={attemptInfo} />
}
