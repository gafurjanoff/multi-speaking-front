"use client"

import { useEffect, useState } from "react"
import { adminFetchSettings, adminUpdateSettings } from "@/lib/api-services"
import { Settings, Check, Loader2 } from "lucide-react"

const profiles = [
  {
    value: "strict" as const,
    label: "Strict",
    desc: "Conservative scoring — harder caps, more calibration penalties. Use for official exams.",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
  },
  {
    value: "normal" as const,
    label: "Normal",
    desc: "Balanced scoring — moderate calibration. Good default for most situations.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
  },
  {
    value: "lenient" as const,
    label: "Lenient",
    desc: "Relaxed scoring — minimal calibration penalties. Use for practice/mock exams.",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
  },
]

export default function AdminSettingsPage() {
  const [current, setCurrent] = useState<"strict" | "normal" | "lenient">("strict")
  const [freeUpsellText, setFreeUpsellText] = useState("")
  const [freeTelegramUpsellText, setFreeTelegramUpsellText] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    adminFetchSettings().then((s) => {
      if (s) {
        setCurrent(s.ai_scoring_profile)
        setFreeUpsellText(s.free_exam_upsell_text ?? "")
        setFreeTelegramUpsellText(s.free_exam_telegram_upsell_text ?? "")
      }
      setLoading(false)
    })
  }, [])

  const handleSelect = async (profile: "strict" | "normal" | "lenient") => {
    if (profile === current || saving) return
    setSaving(true)
    setSaved(false)
    const ok = await adminUpdateSettings({ ai_scoring_profile: profile })
    if (ok) {
      setCurrent(profile)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  const handleSaveUpsell = async () => {
    if (saving) return
    setSaving(true)
    setSaved(false)
    const ok = await adminUpdateSettings({
      free_exam_upsell_text: freeUpsellText,
      free_exam_telegram_upsell_text: freeTelegramUpsellText,
    })
    if (ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: "hsl(var(--exam-primary, 174 42% 51%))" }}
        >
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure AI scoring behavior. Changes take effect immediately.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-1 text-base font-semibold text-foreground">AI Scoring Profile</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Controls how aggressively the calibration layer adjusts AI-generated scores.
        </p>

        <div className="space-y-3">
          {profiles.map((p) => {
            const isActive = current === p.value
            return (
              <button
                key={p.value}
                onClick={() => handleSelect(p.value)}
                disabled={saving}
                className={`w-full text-left rounded-xl border-2 px-5 py-4 transition-all ${
                  isActive
                    ? `${p.bg} ring-2 ring-primary/20`
                    : "border-border bg-background hover:border-muted-foreground/30"
                } disabled:opacity-50`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isActive ? p.color : "text-foreground"}`}>
                    {p.label}
                  </span>
                  {isActive && <Check className={`h-4 w-4 ${p.color}`} />}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
              </button>
            )
          })}
        </div>

        {saved && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300">
            <Check className="h-4 w-4" />
            Scoring profile updated successfully.
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-1 text-base font-semibold text-foreground">Free Exam Upsell Copy</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          This text is shown to free-test users in web feedback and Telegram messages.
        </p>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Web Upsell Text
            </label>
            <textarea
              value={freeUpsellText}
              onChange={(e) => setFreeUpsellText(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Telegram Upsell Text
            </label>
            <textarea
              value={freeTelegramUpsellText}
              onChange={(e) => setFreeTelegramUpsellText(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={handleSaveUpsell}
            disabled={saving}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "hsl(var(--exam-primary, 174 42% 51%))" }}
          >
            {saving ? "Saving..." : "Save Upsell Text"}
          </button>
        </div>
      </div>
    </div>
  )
}
