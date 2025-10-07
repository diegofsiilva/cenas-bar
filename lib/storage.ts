import type { License, Table, Command, Category, Product, Sale, InventoryMovement } from "./types"

// License Storage
export const licenseStorage = {
  get: async (): Promise<License | null> => {
    try {
      const res = await fetch("/api/license")
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  },
  save: async (license: License) => {
    await fetch("/api/license", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(license),
    })
  },
  clear: async () => {
    await fetch("/api/license", { method: "DELETE" })
  },
}

// Tables
export const tableStorage = {
  getAll: async (): Promise<Table[]> => {
    try {
      const res = await fetch("/api/tables")
      if (!res.ok) return []
      return await res.json()
    } catch {
      return []
    }
  },
  add: async (table: Table) => {
    await fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(table),
    })
  },
  update: async (id: string, updates: Partial<Table>) => {
    await fetch("/api/tables", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    })
  },
  delete: async (id: string) => {
    await fetch(`/api/tables?id=${id}`, { method: "DELETE" })
  },
}

// Commands
export const commandStorage = {
  getAll: async (): Promise<Command[]> => {
    try {
      const res = await fetch("/api/commands")
      if (!res.ok) return []
      return await res.json()
    } catch {
      return []
    }
  },
  getByTableId: async (tableId: string): Promise<Command | null> => {
    try {
      const res = await fetch(`/api/commands?tableId=${tableId}`)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  },
  add: async (command: Command) => {
    await fetch("/api/commands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(command),
    })
  },
  update: async (id: string, updates: Partial<Command>) => {
    await fetch("/api/commands", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    })
  },
  delete: async (id: string) => {
    await fetch(`/api/commands?id=${id}`, { method: "DELETE" })
  },
  getOpenCommands: async (): Promise<Command[]> => {
    const commands = await commandStorage.getAll()
    return commands.filter((c) => c.status === "open")
  },
}

// Categories
export const categoryStorage = {
  getAll: async (): Promise<Category[]> => {
    try {
      const res = await fetch("/api/categories")
      if (!res.ok) return []
      return await res.json()
    } catch {
      return []
    }
  },
  add: async (category: Category) => {
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    })
  },
  update: async (id: string, updates: Partial<Category>) => {
    await fetch("/api/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    })
  },
  delete: async (id: string) => {
    await fetch(`/api/categories?id=${id}`, { method: "DELETE" })
  },
}

// Products
export const productStorage = {
  getAll: async (): Promise<Product[]> => {
    try {
      const res = await fetch("/api/products")
      if (!res.ok) return []
      return await res.json()
    } catch {
      return []
    }
  },
  add: async (product: Product) => {
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })
  },
  update: async (id: string, updates: Partial<Product>) => {
    await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    })
  },
  delete: async (id: string) => {
    await fetch(`/api/products?id=${id}`, { method: "DELETE" })
  },
  getLowStock: async (): Promise<Product[]> => {
    const products = await productStorage.getAll()
    return products.filter((p) => p.stock <= 10) // Low stock threshold
  },
}

// Sales
export const saleStorage = {
  getAll: async (): Promise<Sale[]> => {
    try {
      const res = await fetch("/api/sales")
      if (!res.ok) return []
      return await res.json()
    } catch {
      return []
    }
  },
  add: async (sale: Sale) => {
    await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sale),
    })
  },
  getSalesByDateRange: async (startDate: string, endDate: string): Promise<Sale[]> => {
    const sales = await saleStorage.getAll()
    return sales.filter((s) => s.createdAt >= startDate && s.createdAt <= endDate)
  },
}

// Inventory Movements
export const inventoryStorage = {
  getAll: async (): Promise<InventoryMovement[]> => {
    try {
      const res = await fetch("/api/inventory")
      if (!res.ok) return []
      return await res.json()
    } catch {
      return []
    }
  },
  add: async (movement: InventoryMovement) => {
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movement),
    })
  },
}

export const stockMovementStorage = inventoryStorage

// Initialize default data - system requires activation
export function initializeDefaultData() {
  // No default data - system requires activation
}
