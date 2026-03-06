"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { AppHeader } from "@/components/app-header"
import { HeroSection } from "@/components/landing/hero-section"
import { FreeExamsSection } from "@/components/landing/free-exams-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { ExamStructureSection } from "@/components/landing/exam-structure-section"
import { CtaSection } from "@/components/landing/cta-section"
import { SiteFooter } from "@/components/landing/site-footer"
import { fetchExams } from "@/lib/api-services"
import type { ExamCard } from "@/lib/api-types"

export default function HomePage() {
  const { user } = useAuth()
  const [exams, setExams] = useState<ExamCard[]>([])

  useEffect(() => {
    fetchExams().then((data) => setExams(data))
  }, [])

  const freeExams = exams.filter((e) => e.isFree)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <HeroSection user={user} />
      <FreeExamsSection exams={freeExams} />
      <FeaturesSection />
      <ExamStructureSection firstExamId={exams[0]?.id} />
      <CtaSection />
      <SiteFooter />
    </div>
  )
}
