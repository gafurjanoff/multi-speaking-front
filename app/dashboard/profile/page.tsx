"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { fetchProfile, updateProfile } from "@/lib/api-services"
import { AppHeader } from "@/components/app-header"
import { ArrowLeft, User, Save, CheckCircle2 } from "lucide-react"

export default function ProfilePage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth()
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login/otp")
      return
    }
    if (!user) return
    fetchProfile().then((p) => {
      if (p) {
        setFirstName(p.first_name ?? "")
        setLastName(p.last_name ?? "")
        setPhone(p.phone_number ?? "")
      }
      setLoading(false)
    })
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setSaving(true)
    const ok = await updateProfile({
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
    })
    setSaving(false)
    if (ok) {
      await refreshUser()
      setMessage({ type: "success", text: "Profile saved. This info will appear on your certificate." })
    } else {
      setMessage({ type: "error", text: "Could not save. Try again." })
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-xl px-4 py-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: "hsl(var(--exam-primary))" }}
          >
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">
              Edit your name. This will be used on your certificate after exams.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6">
            {message && (
              <div
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                  message.type === "success"
                    ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300"
                    : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
                }`}
              >
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {message.text}
              </div>
            )}

            <div>
              <label htmlFor="first_name" className="mb-1.5 block text-sm font-medium text-foreground">
                First name
              </label>
              <input
                id="first_name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. John"
              />
            </div>

            <div>
              <label htmlFor="last_name" className="mb-1.5 block text-sm font-medium text-foreground">
                Last name
              </label>
              <input
                id="last_name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Smith"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                readOnly
                className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Phone is set via Telegram and cannot be changed here.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "hsl(var(--exam-primary))" }}
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save profile"}
              </button>
              <Link
                href="/dashboard"
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
