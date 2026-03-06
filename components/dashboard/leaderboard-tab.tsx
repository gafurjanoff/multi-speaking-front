import { Users } from "lucide-react"

export interface LeaderboardEntry {
  id: string
  name: string
  totalExamsTaken: number
  averageScore: number
}

interface LeaderboardTabProps {
  entries: LeaderboardEntry[]
  currentUserId: string
}

export function LeaderboardTab({ entries, currentUserId }: LeaderboardTabProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Leaderboard</h2>
      <p className="text-xs text-muted-foreground">
        Top learners on this site, sorted by average speaking score.
      </p>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {entries.map((s, index) => {
          const isCurrentUser = s.id === currentUserId
          return (
            <div
              key={s.id}
              className={`flex items-center gap-3 border-t border-border px-4 py-3 first:border-t-0 ${
                isCurrentUser ? "bg-muted/60" : "bg-card"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {s.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {s.totalExamsTaken} exams
                  </span>
                  <span>Avg score {s.averageScore}%</span>
                  {isCurrentUser && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      You
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
