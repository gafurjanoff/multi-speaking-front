import { Mic, Clock, BarChart3, Shield } from "lucide-react"

const features = [
  {
    icon: Mic,
    title: "Audio Recording",
    description:
      "Your answers are recorded automatically. Review and download all recordings after the exam.",
  },
  {
    icon: Clock,
    title: "Timed Sections",
    description:
      "Each part has precise preparation and answer timers, just like the real exam experience.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Track your scores, streaks, and badges. See improvement over time with detailed analytics.",
  },
  {
    icon: Shield,
    title: "Exam Conditions",
    description:
      "Simulates real exam conditions with automatic transitions and audio cues.",
  },
]

export function FeaturesSection() {
  return (
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
                style={{
                  backgroundColor: "hsl(var(--exam-primary) / 0.1)",
                }}
              >
                <feature.icon
                  className="h-5 w-5"
                  style={{ color: "hsl(var(--exam-primary))" }}
                />
              </div>
              <h3 className="mb-2 text-base font-bold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
