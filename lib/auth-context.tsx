"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import type { User } from "./api-types"
import {
  getApiUrl,
  setStoredTokens,
  clearStoredTokens,
  fetchWithAuth,
  hasStoredTokens,
} from "./api-client"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  /** Reload current user from API (e.g. after profile update) */
  refreshUser: () => Promise<void>
  /** Email/password login (mock – for platform teacher/student on subdomains) */
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  /** OTP login (real backend – for external users on main domain) */
  loginWithOtp: (phoneNumber: string, code: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

/** Backend /auth/me response shape */
interface UserOut {
  id: string
  phone_number: string
  first_name: string | null
  last_name: string | null
  telegram_id: number
  is_verified: boolean
  is_admin: boolean
  last_login: string | null
  created_at: string
}

function mapUserOutToUser(out: UserOut): User {
  const name = [out.first_name, out.last_name].filter(Boolean).join(" ") || out.phone_number
  return {
    id: out.id,
    name,
    email: out.phone_number,
    role: out.is_admin ? "admin" : "student",
    isAdmin: out.is_admin,
    createdAt: out.created_at,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  const loadUserFromTokens = useCallback(async () => {
    if (!hasStoredTokens()) return null
    const res = await fetchWithAuth("/api/auth/me")
    if (!res.ok) return null
    const data = (await res.json()) as UserOut
    return mapUserOutToUser(data)
  }, [])

  const refreshUser = useCallback(async () => {
    const u = await loadUserFromTokens()
    if (u) {
      setUser(u)
      sessionStorage.setItem("speakexam_user", JSON.stringify(u))
    }
  }, [loadUserFromTokens])

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      const stored = sessionStorage.getItem("speakexam_user")
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as User
          if (!cancelled) setUser(parsed)
          setIsLoading(false)
          return
        } catch {
          sessionStorage.removeItem("speakexam_user")
        }
      }
      const userFromApi = await loadUserFromTokens()
      if (!cancelled && userFromApi) {
        setUser(userFromApi)
        sessionStorage.setItem("speakexam_user", JSON.stringify(userFromApi))
      }
      if (!cancelled) setIsLoading(false)
    }
    init()
    return () => {
      cancelled = true
    }
  }, [loadUserFromTokens])

  // Re-sync user from sessionStorage on route change and focus (keeps header in sync)
  useEffect(() => {
    const sync = () => {
      const stored = sessionStorage.getItem("speakexam_user")
      if (stored) {
        try {
          setUser(JSON.parse(stored) as User)
        } catch {
          sessionStorage.removeItem("speakexam_user")
        }
      }
    }
    sync()
    window.addEventListener("focus", sync)
    return () => window.removeEventListener("focus", sync)
  }, [pathname])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" }
      }
      setUser(data.user)
      sessionStorage.setItem("speakexam_user", JSON.stringify(data.user))
      return { success: true }
    } catch {
      return { success: false, error: "Network error. Please try again." }
    }
  }, [])

  const loginWithOtp = useCallback(async (phoneNumber: string, code: string) => {
    const url = getApiUrl("/api/auth/login/verify")
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneNumber.trim(), code: code.replace(/\D/g, "").slice(0, 6) }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg =
          typeof data.detail === "string"
            ? data.detail
            : Array.isArray(data.detail) && data.detail.length > 0
              ? (data.detail[0] && typeof data.detail[0] === "object" && "msg" in data.detail[0]
                ? String((data.detail[0] as { msg: string }).msg)
                : "Invalid or expired code")
              : "Invalid or expired code"
        return { success: false, error: msg }
      }
      const { access_token, refresh_token } = data
      setStoredTokens(access_token, refresh_token)
      const meRes = await fetchWithAuth("/api/auth/me")
      if (meRes.ok) {
        const me = (await meRes.json()) as UserOut
        const u = mapUserOutToUser(me)
        setUser(u)
        sessionStorage.setItem("speakexam_user", JSON.stringify(u))
      } else {
        setUser({
          id: "external",
          name: phoneNumber,
          email: phoneNumber,
          role: "student",
          createdAt: new Date().toISOString(),
        })
      }
      return { success: true }
    } catch (e) {
      return { success: false, error: "Network error. Please try again." }
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem("speakexam_user")
    clearStoredTokens()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser, login, loginWithOtp, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
