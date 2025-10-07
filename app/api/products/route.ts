import { NextResponse } from "next/server"
import { productDb } from "@/lib/db"
import type { Product } from "@/lib/types"

export async function GET() {
  try {
    const products = productDb.getAll()
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const product: Product = await request.json()
    productDb.create(product)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json()
    productDb.update(id, data)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }
    productDb.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
