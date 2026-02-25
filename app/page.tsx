"use client"

import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { ExamCardItem } from "@/components/exam-card"
import { sampleExamCards } from "@/lib/sample-data"
import {
  Mic,
  Clock,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle2,
  Users,
  GraduationCap,
  Headphones,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Mic,
    title: "Audio Recording",
    description: "Your answers are recorded automatically. Review and download all recordings after the exam.",
  },
  {
    icon: Clock,
    title: "Timed Sections",
    description: "Each part has precise preparation and answer timers, just like the real exam experience.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Track your scores, streaks, and badges. See improvement over time with detailed analytics.",
  },
  {
    icon: Shield,
    title: "Exam Conditions",
    description: "Simulates real exam conditions with automatic transitions and audio cues.",
  },
]

const examParts = [
  {
    part: "Part 1",
    title: "Short Questions",
    description: "Answer three questions about yourself and describe photos.",
    prep: "5-10s prep",
    answer: "30-45s answer",
  },
  {
    part: "Part 2",
    title: "Picture Description",
    description: "Describe images and answer related questions in detail.",
    prep: "60s prep",
    answer: "2 min answer",
  },
  {
    part: "Part 3",
    title: "For & Against",
    description: "Present balanced arguments on a given topic.",
    prep: "60s prep",
    answer: "2 min answer",
  },
]

const stats = [
  { value: "1,200+", label: "Students", icon: Users },
  { value: "50+", label: "Exams", icon: BookOpen },
  { value: "4.8/5", label: "Rating", icon: GraduationCap },
]

export default function HomePage() {
  const freeExams = sampleExamCards.filter((e) => e.isFree)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Hero */}
      <section className="px-4 py-16 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-shadow hover:shadow-md"
            style={{ borderColor: "hsl(var(--exam-primary) / 0.3)", color: "hsl(var(--exam-primary))" }}
          >
            <Headphones className="h-4 w-4" />
            Multilevel Speaking Exam Platform
          </div>
          <h1 className="mb-5 text-balance text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
            Practice Speaking Exams with Real Confidence
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            A complete speaking exam simulator with timed sections, audio recording, and teacher grading.
            Prepare for B1, B2, and C1 level exams.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="gap-2 rounded-xl px-8 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: "hsl(var(--exam-primary))" }}
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-xl px-8 text-base bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Stats */}
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

      {/* Free Mock Exams */}
      <section className="border-t border-border px-4 py-16" style={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
              Free Mock Exams
            </h2>
            <p className="text-base text-muted-foreground">
              Start practicing with our free exams - no account required
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {freeExams.slice(0, 3).map((exam) => (
              <ExamCardItem key={exam.id} exam={exam} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2 rounded-xl bg-transparent">
                View All Exams
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground md:text-3xl">
            Everything you need for exam preparation
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "hsl(var(--exam-primary) / 0.1)" }}
                >
                  <feature.icon className="h-5 w-5" style={{ color: "hsl(var(--exam-primary))" }} />
                </div>
                <h3 className="mb-2 text-base font-bold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Structure */}
      <section className="border-t border-border px-4 py-16" style={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}>
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground md:text-3xl">
            Exam Structure
          </h2>
          <div className="space-y-4">
            {examParts.map((part, index) => (
              <div
                key={part.part}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg"
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white"
                  style={{ backgroundColor: "hsl(var(--exam-primary))" }}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: "hsl(var(--exam-primary))" }}>
                      {part.part}
                    </span>
                    <span className="text-lg font-bold text-foreground">{part.title}</span>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">{part.description}</p>
                  <div className="flex gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {part.prep}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                      style={{ backgroundColor: "hsl(var(--exam-primary))" }}
                    >
                      <Mic className="h-3 w-3" />
                      {part.answer}
                    </span>
                  </div>
                </div>
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-muted-foreground/20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            Ready to improve your speaking?
          </h2>
          <p className="mb-8 text-base text-muted-foreground">
            Join hundreds of students already preparing for their exams on SpeakExam.
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="gap-2 rounded-xl px-10 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
              style={{ backgroundColor: "hsl(var(--exam-primary))" }}
            >
              Start Practicing
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: "hsl(var(--exam-primary))" }}
            >
              <Mic className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-foreground">SpeakExam</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Multilevel Speaking Exam Platform
          </p>
        </div>
      </footer>
    </div>
  )
}
