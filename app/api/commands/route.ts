import { NextResponse } from "next/server"
import { commandDb } from "@/lib/db"
import type { Command } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tableId = searchParams.get("tableId")

    if (tableId) {
      const command = commandDb.getByTableId(tableId)
      return NextResponse.json(command)
    }

    const commands = commandDb.getAll()
    return NextResponse.json(commands)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get commands" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const command: Command = await request.json()
    commandDb.create(command)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create command" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json()
    commandDb.update(id, data)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update command" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }
    commandDb.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete command" }, { status: 500 })
  }
}
