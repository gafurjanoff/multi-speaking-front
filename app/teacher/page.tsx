"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppHeader } from "@/components/app-header"
import {
  adminFetchResults,
  adminFetchUsers,
  adminFetchStats,
  type AdminResult,
  type AdminUser,
  type AdminStats,
} from "@/lib/api-services"
import type { ExamResult, StudentProfile } from "@/lib/api-types"

import { TeacherStatCards } from "@/components/teacher/teacher-stat-cards"
import { TeacherTabs, type TeacherTab } from "@/components/teacher/teacher-tabs"
import { ResultsTab } from "@/components/teacher/results-tab"
import { StudentsTab } from "@/components/teacher/students-tab"

function mapResult(r: AdminResult): ExamResult {
  return {
    id: r.id,
    examId: r.exam_id,
    examTitle: "",
    studentId: r.user_id,
    studentName: "",
    studentEmail: "",
    level: "",
    completedAt: r.created_at,
    recordings: [],
    totalDuration: 0,
    status: r.status as ExamResult["status"],
    score: r.overall_score ?? undefined,
    feedback: r.feedback ?? undefined,
  }
}

function mapStudent(u: AdminUser): StudentProfile {
  return {
    id: u.id,
    name: [u.first_name, u.last_name].filter(Boolean).join(" ") || u.phone_number,
    email: "",
    role: "student" as const,
    createdAt: u.created_at,
    level: "",
    totalExamsTaken: 0,
    averageScore: 0,
  }
}

export default function TeacherDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TeacherTab>("results")
  const [results, setResults] = useState<ExamResult[]>([])
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login/otp")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    adminFetchResults().then((data) => setResults(data.map(mapResult)))
    adminFetchUsers().then((data) => setStudents(data.map(mapStudent)))
    adminFetchStats().then(setStats)
  }, [user])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    )
  }

  const pendingCount = results.filter((r) => r.status === "pending_review").length
  const gradedCount = results.filter((r) => r.status === "graded").length

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-bold text-foreground">
            Teacher Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Review student exams, grade results, and download reports
          </p>
        </div>

        <TeacherStatCards
          totalStudents={stats?.total_users ?? students.length}
          pendingCount={pendingCount}
          gradedCount={gradedCount}
          totalResults={results.length}
        />

        <TeacherTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "results" && <ResultsTab results={results} />}
        {activeTab === "students" && <StudentsTab students={students} />}
      </main>
    </div>
  )
}
