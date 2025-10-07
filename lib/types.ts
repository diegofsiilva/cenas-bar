export interface License {
  activationCode: string
  expirationDate: string
  activatedAt: string
}

export interface Table {
  id: string
  name: string
  createdAt: string
}

export interface CommandItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Command {
  id: string
  tableId: string
  items: CommandItem[]
  total: number
  status: "open" | "closed"
  openedAt: string
  closedAt?: string | null
}

export interface Category {
  id: string
  name: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  categoryId: string
  price: number
  stock: number
  createdAt: string
}

export interface Sale {
  id: string
  commandId: string
  tableId: string
  items: CommandItem[]
  total: number
  paymentMethod: "cash" | "card" | "pix"
  createdAt: string
}

export interface InventoryMovement {
  id: string
  productId: string
  type: "in" | "out" | "adjustment" | "sale"
  quantity: number
  reason?: string | null
  createdAt: string
}

export type StockMovement = InventoryMovement
