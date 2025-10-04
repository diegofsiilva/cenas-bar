// Core data types for the bar/bistro management system

export interface License {
  id: string
  activatedAt: string
  expirationDate: string
  isActive: boolean
  activationCode?: string
}

export interface Table {
  id: string
  name: string
  description?: string
  createdAt: string
}

export interface Command {
  id: string
  tableId: string
  tableName: string
  openedAt: string
  closedAt?: string
  status: "open" | "closed"
  items: CommandItem[]
  total: number
}

export interface CommandItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
  addedAt: string
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
  categoryName: string
  price: number
  stockQuantity: number
  minStockAlert: number
  createdAt: string
}

export interface Sale {
  id: string
  commandId: string
  tableId: string
  tableName: string
  items: CommandItem[]
  total: number
  paymentMethod: "cash" | "card" | "pix"
  soldBy: string // username
  soldAt: string
}

export interface StockMovement {
  id: string
  productId: string
  productName: string
  type: "in" | "out" | "adjustment"
  quantity: number
  reason: string
  performedBy: string
  performedAt: string
}
