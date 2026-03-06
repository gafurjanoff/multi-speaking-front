"use client"

import { useEffect, useState } from "react"
import type { ExamResult, StudentProfile } from "@/lib/api-types"
import { CertTopBar } from "./cert-top-bar"
import { CertHeader } from "./cert-header"
import { CertAwardee } from "./cert-awardee"
import { CertExamInfo } from "./cert-exam-info"
import { ScoreBandsGrid } from "./score-bands-grid"
import { CertFeedback } from "./cert-feedback"

interface CertificateClientProps {
  result: ExamResult
  student: StudentProfile | null
}

export function CertificateClient({ result, student }: CertificateClientProps) {
  const score75 =
    result.score !== undefined
      ? Math.round((result.score / 100) * 75)
      : undefined
  const fullName = student?.name ?? result.studentName

  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="cert-root">
      <div className={`page-wrapper ${visible ? "visible" : ""}`}>
        <CertTopBar />

        <div className="cert-card">
          <div className="cert-border-top" />
          <div className="cert-glow" />
          <div className="cert-inner">
            <CertHeader score75={score75} />
            <div className="cert-divider" />
            <CertAwardee
              fullName={fullName}
              dateOfBirth={student?.dateOfBirth}
            />
            <CertExamInfo
              examTitle={result.examTitle}
              completedAt={result.completedAt}
            />
            {score75 !== undefined && <ScoreBandsGrid score75={score75} />}
            {result.feedback && <CertFeedback feedback={result.feedback} />}
            <div className="cert-watermark">SpeakExam &middot; Mock Certificate</div>
          </div>
        </div>
      </div>
    </div>
  )
}
