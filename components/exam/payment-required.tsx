"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle, Phone, ArrowLeft, Shield, CreditCard } from "lucide-react"
import { getApiUrl } from "@/lib/api-client"

interface PaymentRequiredProps {
  examTitle: string
  examLevel: string
}

interface ContactInfo {
  telegram: string
  phone: string
  message: string
  bot_username: string
}

export function PaymentRequired({ examTitle, examLevel }: PaymentRequiredProps) {
  const [contact, setContact] = useState<ContactInfo | null>(null)

  useEffect(() => {
    fetch(getApiUrl("/api/exams/contact-info"))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setContact(data))
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl p-4 bg-amber-50 dark:bg-amber-950/30">
            <CreditCard className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Payment Required</h1>
          <p className="mt-2 text-base text-muted-foreground">
            <span className="font-semibold text-foreground">{examTitle}</span> ({examLevel}) is a paid exam
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "hsl(174, 42%, 51%)" }} />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {contact?.message || "To take this exam, please contact us to make payment. After payment, your access will be activated by the admin."}
            </p>
          </div>

          {contact && (
            <div className="space-y-3 pt-2">
              {contact.telegram && (
                <a
                  href={`https://t.me/${contact.telegram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3.5 transition-all hover:bg-muted hover:shadow-sm"
                >
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Telegram</p>
                    <p className="text-xs text-muted-foreground">{contact.telegram}</p>
                  </div>
                </a>
              )}

              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3.5 transition-all hover:bg-muted hover:shadow-sm"
                >
                  <Phone className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Phone</p>
                    <p className="text-xs text-muted-foreground">{contact.phone}</p>
                  </div>
                </a>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
          <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
            After making the payment, provide your phone number to the admin.
            Your access will be activated within 1 hour and you will be able to take the exam.
          </p>
        </div>

        <div className="text-center">
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="gap-2 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
