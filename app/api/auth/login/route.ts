import { NextResponse } from "next/server"
import { findUserByEmail } from "@/lib/sample-data"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = findUserByEmail(email)

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Return user without password
    const { password: _, ...safeUser } = user
    return NextResponse.json({ user: safeUser, token: `mock-token-${user.id}` })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
