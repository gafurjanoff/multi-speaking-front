import { NextResponse } from "next/server"
import { sampleStudentProgress } from "@/lib/sample-data"

export async function GET() {
  return NextResponse.json(sampleStudentProgress)
}
