import { NextResponse } from "next/server"
import { tableDb } from "@/lib/db"
import type { Table } from "@/lib/types"

export async function GET() {
  try {
    const tables = tableDb.getAll()
    return NextResponse.json(tables)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get tables" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const table: Table = await request.json()
    tableDb.create(table)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json()
    tableDb.update(id, data)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }
    tableDb.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete table" }, { status: 500 })
  }
}
