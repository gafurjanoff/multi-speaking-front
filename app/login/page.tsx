"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * This site is external-users only (OTP). /login redirects to OTP login.
 * Teacher/student (email/password) will be on a separate subdomain later.
 */
export default function LoginPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/login/otp")
  }, [router])
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  )
}
