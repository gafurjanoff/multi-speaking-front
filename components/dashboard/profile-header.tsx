import Link from "next/link"
import type { User } from "@/lib/api-types"
import { UserPen } from "lucide-react"

interface ProfileHeaderProps {
  user: User
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-foreground">
          Hi, {user.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          This is your Multilevel Speaking Exam profile. Track your exams,
          scores, and certificates.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          <UserPen className="h-4 w-4" />
          Edit profile
        </Link>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: "hsl(var(--exam-primary))" }}
          >
            {user.name.charAt(0)}
          </div>
          <div className="text-xs">
            <p className="font-semibold text-foreground">{user.name}</p>
            <p className="text-muted-foreground">
              Member since {new Date(user.createdAt).getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}