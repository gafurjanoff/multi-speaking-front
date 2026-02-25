import { NextResponse } from "next/server"
import { sampleStudents } from "@/lib/sample-data"

export async function GET() {
  return NextResponse.json(sampleStudents)
}
