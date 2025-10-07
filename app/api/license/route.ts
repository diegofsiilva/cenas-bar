import { NextResponse } from "next/server"
import { licenseDb } from "@/lib/db"

export async function GET() {
  try {
    const license = licenseDb.get()
    return NextResponse.json(license)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get license" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const license = await request.json()
    licenseDb.set(license)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save license" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    licenseDb.clear()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to clear license" }, { status: 500 })
  }
}
