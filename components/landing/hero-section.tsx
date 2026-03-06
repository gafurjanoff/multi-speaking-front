"use client"

import Link from "next/link"
import { Headphones, ArrowRight, Users, BookOpen, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/api-types"

const stats = [
  { value: "1,200+", label: "Students", icon: Users },
  { value: "50+", label: "Exams", icon: BookOpen },
  { value: "4.8/5", label: "Rating", icon: GraduationCap },
]

interface HeroSectionProps {
  user: User | null
}

export function HeroSection({ user }: HeroSectionProps) {
  return (
    <section className="px-4 py-16 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <div
          className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-shadow hover:shadow-md"
          style={{
            borderColor: "hsl(var(--exam-primary) / 0.3)",
            color: "hsl(var(--exam-primary))",
          }}
        >
          <Headphones className="h-4 w-4" />
          Multilevel Speaking Exam Platform
        </div>
        <h1 className="mb-5 text-balance text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
          Practice Speaking Exams with Real Confidence
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          A Complete Speaking Exam Simulator With Timed Sections, Audio
          Recording, And Teacher Grading. Prepare for Multilevel Speaking Exam
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="gap-2 rounded-xl px-8 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                  style={{ backgroundColor: "hsl(var(--exam-primary))" }}
                >
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl px-8 text-base bg-transparent"
                >
                  Browse Exams
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login/otp">
                <Button
                  size="lg"
                  className="gap-2 rounded-xl px-8 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                  style={{ backgroundColor: "hsl(var(--exam-primary))" }}
                >
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login/otp">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl px-8 text-base bg-transparent"
                >
                  Sign in
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="mx-auto mt-12 flex max-w-sm items-center justify-center gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
