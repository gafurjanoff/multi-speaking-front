"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Users,
  FileText,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react"
import { adminFetchStats, type AdminStats } from "@/lib/api-services"

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminFetchStats()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    )
  }

  const cards = [
    {
      label: "Total Users",
      value: stats?.total_users ?? 0,
      icon: Users,
      color: "bg-blue-500/10 text-blue-600",
      iconBg: "bg-blue-500",
      href: "/admin/users",
    },
    {
      label: "Total Exams",
      value: stats?.total_exams ?? 0,
      icon: FileText,
      color: "bg-violet-500/10 text-violet-600",
      iconBg: "bg-violet-500",
      href: "/admin/exams",
    },
    {
      label: "Published",
      value: stats?.published_exams ?? 0,
      icon: TrendingUp,
      color: "bg-green-500/10 text-green-600",
      iconBg: "bg-green-500",
      href: "/admin/exams",
    },
    {
      label: "Total Sessions",
      value: stats?.total_sessions ?? 0,
      icon: ClipboardCheck,
      color: "bg-amber-500/10 text-amber-600",
      iconBg: "bg-amber-500",
      href: "/admin/results",
    },
    {
      label: "Pending Review",
      value: stats?.pending_reviews ?? 0,
      icon: Clock,
      color: "bg-orange-500/10 text-orange-600",
      iconBg: "bg-orange-500",
      href: "/admin/results",
    },
    {
      label: "Graded",
      value: stats?.graded_results ?? 0,
      icon: CheckCircle2,
      color: "bg-emerald-500/10 text-emerald-600",
      iconBg: "bg-emerald-500",
      href: "/admin/results",
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your speaking exam platform
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-border/60">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${card.iconBg}`}
                >
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
              <div
                className="absolute bottom-0 left-0 h-1 w-full opacity-0 transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: "hsl(174, 42%, 51%)" }}
              />
            </div>
          </Link>
        ))}
      </div>

      {(stats?.pending_reviews ?? 0) > 0 && (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                {stats?.pending_reviews} result{(stats?.pending_reviews ?? 0) > 1 ? "s" : ""} awaiting review
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Students are waiting for their grades.{" "}
                <Link href="/admin/results" className="underline font-medium">
                  Review now
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
