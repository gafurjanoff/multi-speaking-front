import { NextResponse } from "next/server"
import { sampleExamResults } from "@/lib/sample-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const studentId = searchParams.get("studentId")

  let results = [...sampleExamResults]

  if (status) {
    results = results.filter((r) => r.status === status)
  }

  if (studentId) {
    results = results.filter((r) => r.studentId === studentId)
  }

  return NextResponse.json(results)
}
