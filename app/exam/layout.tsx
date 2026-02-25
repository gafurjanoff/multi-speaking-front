import React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Take Exam - SpeakExam",
  description: "Complete your multilevel speaking exam with timed sections and audio recording.",
}

export default function ExamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
