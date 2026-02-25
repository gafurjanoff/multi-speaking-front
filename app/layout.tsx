import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SpeakExam - Multilevel Speaking Exam Platform",
  description:
    "Practice speaking exams with timed sections, audio recording, and structured feedback. Prepare for B1, B2, and C1 level exams.",
}

export const viewport: Viewport = {
  themeColor: "#5ab8b0",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
