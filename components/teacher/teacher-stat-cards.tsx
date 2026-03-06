import { Users, Clock, CheckCircle2, FileText } from "lucide-react"

interface TeacherStatCardsProps {
  totalStudents: number
  pendingCount: number
  gradedCount: number
  totalResults: number
}

export function TeacherStatCards({
  totalStudents,
  pendingCount,
  gradedCount,
  totalResults,
}: TeacherStatCardsProps) {
  const cards = [
    {
      icon: Users,
      value: totalStudents,
      label: "Total Students",
      color: "hsl(var(--exam-primary))",
      bg: "hsl(var(--exam-primary) / 0.1)",
    },
    {
      icon: Clock,
      value: pendingCount,
      label: "Pending Review",
      color: "hsl(var(--exam-pending))",
      bg: "hsl(var(--exam-pending) / 0.1)",
    },
    {
      icon: CheckCircle2,
      value: gradedCount,
      label: "Graded",
      color: "hsl(150 40% 40%)",
      bg: "hsl(150 40% 40% / 0.1)",
    },
    {
      icon: FileText,
      value: totalResults,
      label: "Total Results",
      color: "hsl(210 11% 25%)",
      bg: "hsl(210 11% 25% / 0.1)",
    },
  ]

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: card.bg }}
          >
            <card.icon className="h-5 w-5" style={{ color: card.color }} />
          </div>
          <p className="text-2xl font-bold text-foreground">{card.value}</p>
          <p className="text-xs text-muted-foreground">{card.label}</p>
        </div>
      ))}
    </div>
  )
}
