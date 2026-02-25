import { NextResponse } from "next/server"
import { sampleExamCards } from "@/lib/sample-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const level = searchParams.get("level")
  const free = searchParams.get("free")

  let exams = [...sampleExamCards]

  if (level) {
    exams = exams.filter((e) => e.level === level)
  }

  if (free === "true") {
    exams = exams.filter((e) => e.isFree)
  }

  return NextResponse.json(exams)
}
