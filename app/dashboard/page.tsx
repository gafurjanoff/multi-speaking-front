"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { AppHeader } from "@/components/app-header"
import { ExamCardItem } from "@/components/exam-card"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  Target,
  Flame,
  ArrowRight,
  ChevronRight,
  BarChart3,
  History,
} from "lucide-react"
import { sampleExamCards } from "@/lib/sample-data"
import { sampleStudentProgress } from "@/lib/sample-data"
import { sampleStudents } from "@/lib/sample-data"
import type { ExamCard } from "@/lib/api-types"
import type { StudentProgress } from "@/lib/api-types"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview" | "exams" | "progress">("overview")
  const [levelFilter, setLevelFilter] = useState<string>("all")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
    if (!isLoading && user && user.role === "teacher") {
      router.push("/teacher")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    )
  }

  const student = sampleStudents.find((s) => s.id === user.id) || sampleStudents[0]
  const progress = sampleStudentProgress
  const exams = sampleExamCards
  const filteredExams = levelFilter === "all" ? exams : exams.filter((e) => e.level === levelFilter)
  const freeExams = exams.filter((e) => e.isFree)

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "exams" as const, label: "Exams", icon: BookOpen },
    { id: "progress" as const, label: "Progress", icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-bold text-foreground">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your progress and practice speaking exams
          </p>
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={BookOpen} label="Exams Taken" value={student.totalExamsTaken} color="174 42% 51%" />
          <StatCard icon={Target} label="Avg Score" value={`${student.averageScore}%`} color="32 85% 55%" />
          <StatCard icon={Flame} label="Day Streak" value={student.streak} color="0 84% 60%" />
          <StatCard icon={Award} label="Badges" value={student.badges.length} color="210 11% 25%" />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl bg-muted p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Free mock exams */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Free Mock Exams</h2>
                <button
                  type="button"
                  onClick={() => { setActiveTab("exams"); setLevelFilter("all"); }}
                  className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-foreground"
                  style={{ color: "hsl(var(--exam-primary))" }}
                >
                  View all
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {freeExams.slice(0, 3).map((exam) => (
                  <ExamCardItem key={exam.id} exam={exam} />
                ))}
              </div>
            </section>

            {/* Recent activity */}
            <section>
              <h2 className="mb-4 text-lg font-bold text-foreground">Recent Activity</h2>
              <div className="space-y-3">
                {progress.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: "hsl(var(--exam-primary) / 0.1)" }}
                    >
                      {activity.type === "exam_completed" && <BookOpen className="h-5 w-5" style={{ color: "hsl(var(--exam-primary))" }} />}
                      {activity.type === "score_received" && <Target className="h-5 w-5" style={{ color: "hsl(var(--exam-primary))" }} />}
                      {activity.type === "badge_earned" && <Award className="h-5 w-5" style={{ color: "hsl(var(--exam-primary))" }} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "exams" && (
          <div>
            {/* Level filter */}
            <div className="mb-6 flex flex-wrap gap-2">
              {["all", "B1", "B2", "C1"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setLevelFilter(level)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    levelFilter === level
                      ? "text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  style={levelFilter === level ? { backgroundColor: "hsl(var(--exam-primary))" } : undefined}
                >
                  {level === "all" ? "All Levels" : level}
                </button>
              ))}
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredExams.map((exam) => (
                <ExamCardItem key={exam.id} exam={exam} />
              ))}
            </div>

            {filteredExams.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">No exams found for this level.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "progress" && (
          <div className="space-y-8">
            {/* Level progress */}
            <section>
              <h2 className="mb-4 text-lg font-bold text-foreground">Progress by Level</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {progress.progressByLevel.map((lp) => (
                  <div key={lp.level} className="rounded-xl border border-border bg-card p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground">{lp.level}</span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {lp.completed}/{lp.total}
                      </span>
                    </div>
                    <div className="mb-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(lp.completed / lp.total) * 100}%`,
                          backgroundColor: "hsl(var(--exam-primary))",
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Avg score: <span className="font-semibold text-foreground">{lp.averageScore}%</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Exam history */}
            <section>
              <h2 className="mb-4 text-lg font-bold text-foreground">Exam History</h2>
              <div className="space-y-3">
                {progress.examHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{item.examTitle}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{item.level}</span>
                        <span>{new Date(item.completedAt).toLocaleDateString()}</span>
                        <span>{Math.floor(item.duration / 60)} min</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {item.status === "graded" ? (
                        <span className="text-lg font-bold text-foreground">{item.score}%</span>
                      ) : (
                        <span
                          className="inline-flex rounded-full px-3 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: "hsl(var(--exam-pending) / 0.15)",
                            color: "hsl(var(--exam-pending))",
                          }}
                        >
                          {item.status === "pending_review" ? "Pending" : "Reviewed"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Badges */}
            <section>
              <h2 className="mb-4 text-lg font-bold text-foreground">Badges Earned</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {student.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg"
                      style={{ backgroundColor: "hsl(var(--exam-primary) / 0.1)" }}
                    >
                      {badge.icon === "trophy" && <Award className="h-6 w-6" style={{ color: "hsl(var(--exam-primary))" }} />}
                      {badge.icon === "flame" && <Flame className="h-6 w-6" style={{ color: "hsl(var(--exam-recording))" }} />}
                      {badge.icon === "star" && <Target className="h-6 w-6" style={{ color: "hsl(var(--exam-pending))" }} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `hsl(${color} / 0.1)` }}>
        <Icon className="h-5 w-5" style={{ color: `hsl(${color})` }} />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
