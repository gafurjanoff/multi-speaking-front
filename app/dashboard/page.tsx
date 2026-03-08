"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppHeader } from "@/components/app-header"
import { BookOpen, Trophy, Clock } from "lucide-react"
import { fetchExams, fetchMyResults, type UserResult } from "@/lib/api-services"
import type { ExamCard, ExamResult } from "@/lib/api-types"

import { ProfileHeader } from "@/components/dashboard/profile-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { DashboardTabs, type DashboardTab } from "@/components/dashboard/dashboard-tabs"
import { OverviewTab } from "@/components/dashboard/overview-tab"
import { ExamsTab } from "@/components/dashboard/exams-tab"
import { LeaderboardTab, type LeaderboardEntry } from "@/components/dashboard/leaderboard-tab"

function mapBackendResult(r: UserResult): ExamResult {
  return {
    id: r.id,
    examId: r.exam_id,
    examTitle: r.exam_title,
    studentId: "",
    studentName: "",
    studentEmail: "",
    level: "",
    completedAt: r.completed_at ?? new Date().toISOString(),
    recordings: [],
    totalDuration: 0,
    status: r.status as ExamResult["status"],
    score: r.overall_score ?? undefined,
    feedback: r.feedback ?? undefined,
  }
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAdminDenied, setShowAdminDenied] = useState(false)
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview")
  const [examCards, setExamCards] = useState<ExamCard[]>([])
  const [results, setResults] = useState<ExamResult[]>([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login/otp")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    fetchExams().then((data) => setExamCards(data))
    fetchMyResults().then((data) => setResults(data.map(mapBackendResult)))
  }, [user])

  useEffect(() => {
    if (searchParams.get("admin_denied") === "1") {
      setShowAdminDenied(true)
      const t = setTimeout(() => setShowAdminDenied(false), 5000)
      return () => clearTimeout(t)
    }
  }, [searchParams])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    )
  }

  const completedResults = results.filter((r) => r.score !== undefined)

  const examsTaken = results.length
  const bestScore75 =
    completedResults.length > 0
      ? Math.max(...completedResults.map((r) => Math.round(r.score ?? 0)))
      : 0
  const certificatesCount = completedResults.length

  const latestResult =
    completedResults.length > 0
      ? [...completedResults].sort(
          (a, b) =>
            new Date(b.completedAt).getTime() -
            new Date(a.completedAt).getTime()
        )[0]
      : null

  const userAveragePercent =
    completedResults.length > 0
      ? Math.round(
          completedResults.reduce((sum, r) => sum + (r.score ?? 0), 0) /
            completedResults.length
        )
      : 0

  const leaderboard: LeaderboardEntry[] = [
    {
      id: user.id,
      name: user.name,
      totalExamsTaken: examsTaken,
      averageScore: userAveragePercent,
    },
  ].sort((a, b) => b.averageScore - a.averageScore)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      {showAdminDenied && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
            Access denied. Admin area is restricted to administrators only.
          </div>
        </div>
      )}


      <main className="mx-auto max-w-6xl px-4 py-8">
        <ProfileHeader user={user} />

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={BookOpen} label="Exams taken" value={examsTaken} />
          <StatCard icon={Trophy} label="Best score (/75)" value={bestScore75} />
          <StatCard icon={Clock} label="Certificates" value={certificatesCount} />
        </div>

        <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "overview" && (
          <OverviewTab examCards={examCards} latestResult={latestResult} />
        )}

        {activeTab === "exams" && <ExamsTab results={results} />}

        {activeTab === "leaderboard" && (
          <LeaderboardTab entries={leaderboard} currentUserId={user.id} />
        )}
      </main>
    </div>
  )
}
