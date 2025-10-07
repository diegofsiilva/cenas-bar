import { NextResponse } from "next/server"
import { categoryDb } from "@/lib/db"
import type { Category } from "@/lib/types"

export async function GET() {
  try {
    const categories = categoryDb.getAll()
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const category: Category = await request.json()
    categoryDb.create(category)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json()
    categoryDb.update(id, data)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }
    categoryDb.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
