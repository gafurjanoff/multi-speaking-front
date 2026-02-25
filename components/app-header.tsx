"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Mic, LogOut, User, LayoutDashboard } from "lucide-react"

export function AppHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: "hsl(var(--exam-primary))" }}
          >
            <Mic className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-foreground">SpeakExam</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href={user.role === "teacher" ? "/teacher" : "/dashboard"}>
                <Button variant="ghost" size="sm" className="gap-2 text-foreground">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: "hsl(var(--exam-primary))" }}
                >
                  {user.name.charAt(0)}
                </div>
                <span className="hidden text-sm font-medium text-foreground sm:inline">{user.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button
                size="sm"
                className="gap-2 text-white"
                style={{ backgroundColor: "hsl(var(--exam-primary))" }}
              >
                <User className="h-4 w-4" />
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
