import { NextResponse } from "next/server"
import { inventoryDb } from "@/lib/db"
import type { InventoryMovement } from "@/lib/types"

export async function GET() {
  try {
    const movements = inventoryDb.getAll()
    return NextResponse.json(movements)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get inventory movements" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const movement: InventoryMovement = await request.json()
    inventoryDb.create(movement)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create inventory movement" }, { status: 500 })
  }
}
