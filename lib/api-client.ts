/**
 * Client for the real backend API (external users – OTP auth).
 * Uses Next.js rewrites: requests to /api/auth/* are proxied to the backend.
 */

const getTokens = (): { access_token: string; refresh_token: string } | null => {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem("speakexam_tokens")
  if (!raw) return null
  try {
    return JSON.parse(raw) as { access_token: string; refresh_token: string }
  } catch {
    return null
  }
}

export function getApiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`
  return p
}

export function hasStoredTokens(): boolean {
  return getTokens() !== null
}

export function setStoredTokens(access_token: string, refresh_token: string): void {
  sessionStorage.setItem("speakexam_tokens", JSON.stringify({ access_token, refresh_token }))
}

export function clearStoredTokens(): void {
  sessionStorage.removeItem("speakexam_tokens")
}

let refreshPromise: Promise<boolean> | null = null

async function tryRefreshToken(): Promise<boolean> {
  const tokens = getTokens()
  if (!tokens?.refresh_token) return false

  // Deduplicate concurrent refresh calls
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const res = await fetch(getApiUrl("/api/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: tokens.refresh_token }),
      })
      if (!res.ok) return false
      const data = await res.json()
      setStoredTokens(data.access_token, data.refresh_token)
      return true
    } catch {
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

function buildHeaders(options: RequestInit): Headers {
  const tokens = getTokens()
  const headers = new Headers(options.headers)
  if (tokens?.access_token) {
    headers.set("Authorization", `Bearer ${tokens.access_token}`)
  }
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json")
  }
  return headers
}

/** Call backend API with Bearer token. Auto-refreshes on 401. */
export async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = getApiUrl(path)
  const headers = buildHeaders(options)
  const res = await fetch(url, { ...options, headers })

  if (res.status === 401) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      const retryHeaders = buildHeaders(options)
      return fetch(url, { ...options, headers: retryHeaders })
    }
  }

  return res
}
