"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getApiUrl } from "@/lib/api-client"

export function OtpLoginClient() {
  const [step, setStep] = useState<"phone" | "code">("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { loginWithOtp } = useAuth()
  const router = useRouter()
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME

  const handleRequestCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    const phone = phoneNumber.trim().replace(/\s/g, "")
    if (!phone.startsWith("+")) {
      setError("Phone must start with + (e.g. +998901234567)")
      return
    }
    if (phone.length < 12) {
      setError("Enter a valid phone number")
      return
    }
    setIsSubmitting(true)
    try {
      const url = getApiUrl("/api/auth/otp/request")
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone }),
      })
      const data = await res.json()
      if (!res.ok) {
        const message = (() => {
          const d = data.detail
          if (typeof d === "string") return d
          if (Array.isArray(d) && d.length > 0) {
            const first = d[0]
            return typeof first === "object" && first !== null && "msg" in first
              ? String(first.msg)
              : JSON.stringify(d)
          }
          return "Could not send code. Start the Telegram bot first and share your phone."
        })()
        const isUserNotFound = typeof message === "string" && (
          message.toLowerCase().includes("user not found") ||
          message.toLowerCase().includes("not found")
        )
        setError(isUserNotFound ? "USER_NOT_FOUND" : message)
        setIsSubmitting(false)
        return
      }
      setStep("code")
    } catch {
      setError("Network error. Please try again.")
    }
    setIsSubmitting(false)
  }

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    if (code.length !== 6) {
      setError("Enter the 6-digit code")
      return
    }
    setIsSubmitting(true)
    const phone = phoneNumber.trim().replace(/\s/g, "")
    const result = await loginWithOtp(phone, code)
    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error ?? "Invalid code")
    }
    setIsSubmitting(false)
  }

  return (
    <div className="otp-page">
      <div className="login-container">
        <a href="/" className="back-link">
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to home
        </a>

        <div className="brand">
          <div className="brand-icon">
            <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <span className="brand-name">SpeakExam</span>
        </div>

        <div className="card">
          <div className="card-glow" />

          <div className="step-indicator">
            <div className={`step-dot ${step === "phone" ? "active" : "done"}`} />
            <div className="step-line" />
            <div className={`step-dot ${step === "code" ? "active" : ""}`} />
            <span className="step-text">
              {step === "phone" ? "Enter phone" : "Verify code"}
            </span>
          </div>

          {step === "phone" ? (
            <>
              <div className="card-heading">Sign in</div>
              <p className="card-subheading">
                We&apos;ll send a one-time code via Telegram. Use the number you
                registered in the bot.
              </p>

              <div className="bot-callout">
                <strong>First time?</strong> Open our{" "}
                {botUsername ? (
                  <a
                    href={`https://t.me/${botUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bot-link"
                  >
                    @{botUsername}
                  </a>
                ) : (
                  "Telegram bot"
                )}{" "}
                → tap <strong>Start</strong> → share your phone number. Then come back here.
              </div>

              <div className="heading-divider" />

              <form onSubmit={handleRequestCode}>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    className="form-input"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+998901234567"
                    required
                  />
                  <p className="form-hint">
                    Format: +998XXXXXXXXX — Must match the number you shared in the bot
                  </p>
                </div>

                {error && (
                  <div className={`error-box ${error === "USER_NOT_FOUND" ? "error-user-not-found" : ""}`}>
                    <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                    <div>
                      {error === "USER_NOT_FOUND" ? (
                        <>
                          <strong>Account not found.</strong> To sign in, you must first register via our Telegram bot:
                          <ol className="error-steps">
                            <li>Open {botUsername ? <a href={`https://t.me/${botUsername}`} target="_blank" rel="noopener noreferrer">@{botUsername}</a> : "our Telegram bot"}</li>
                            <li>Tap <strong>Start</strong></li>
                            <li>Share your phone number when asked</li>
                            <li>Return here and enter the same number</li>
                          </ol>
                        </>
                      ) : (
                        error
                      )}
                    </div>
                  </div>
                )}

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="spinner" /> Sending code&hellip;
                    </>
                  ) : (
                    <>
                      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                        />
                      </svg>
                      Send code to Telegram
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="card-heading">Check Telegram</div>
              <p className="card-subheading">
                Enter the 6-digit code we just sent you.
              </p>
              <div className="heading-divider" />

              <div className="code-banner">
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
                Code sent to <strong>&nbsp;{phoneNumber}</strong>
              </div>

              <form onSubmit={handleVerifyCode}>
                <div className="form-group">
                  <label className="form-label" htmlFor="code">
                    6-digit code
                  </label>
                  <input
                    id="code"
                    className="form-input code-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="——————"
                    required
                  />
                </div>

                {error && (
                  <div className="error-box">
                    <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374H16.34c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting || code.length !== 6}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner" /> Signing in&hellip;
                    </>
                  ) : (
                    <>
                      <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                        />
                      </svg>
                      Sign in
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => setStep("phone")}
                >
                  Use a different number
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
