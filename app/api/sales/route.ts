import { NextResponse } from "next/server"
import { saleDb } from "@/lib/db"
import type { Sale } from "@/lib/types"

export async function GET() {
  try {
    const sales = saleDb.getAll()
    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get sales" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const sale: Sale = await request.json()
    saleDb.create(sale)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
  }
}
