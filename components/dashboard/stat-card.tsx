import React from "react"

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: "hsl(var(--exam-primary) / 0.1)" }}
      >
        <Icon
          className="h-5 w-5"
          style={{ color: "hsl(var(--exam-primary))" }}
        />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
