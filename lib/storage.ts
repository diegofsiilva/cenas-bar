// LocalStorage wrapper with type safety

import type { License, Table, Command, Category, Product, Sale, StockMovement } from "./types"

const STORAGE_KEYS = {
  LICENSE: "bar_license", // Changed from USERS to LICENSE
  TABLES: "bar_tables",
  COMMANDS: "bar_commands",
  CATEGORIES: "bar_categories",
  PRODUCTS: "bar_products",
  SALES: "bar_sales",
  STOCK_MOVEMENTS: "bar_stock_movements",
} as const

// Generic storage functions
function getFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

// License Storage
export const licenseStorage = {
  get: (): License | null => {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem(STORAGE_KEYS.LICENSE)
    return data ? JSON.parse(data) : null
  },
  save: (license: License) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(license))
  },
  clear: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEYS.LICENSE)
  },
}

// Tables
export const tableStorage = {
  getAll: (): Table[] => getFromStorage<Table>(STORAGE_KEYS.TABLES),
  save: (tables: Table[]) => saveToStorage(STORAGE_KEYS.TABLES, tables),
  add: (table: Table) => {
    const tables = tableStorage.getAll()
    tables.push(table)
    tableStorage.save(tables)
  },
  update: (id: string, updates: Partial<Table>) => {
    const tables = tableStorage.getAll()
    const index = tables.findIndex((t) => t.id === id)
    if (index !== -1) {
      tables[index] = { ...tables[index], ...updates }
      tableStorage.save(tables)
    }
  },
  delete: (id: string) => {
    const tables = tableStorage.getAll().filter((t) => t.id !== id)
    tableStorage.save(tables)
  },
}

// Commands
export const commandStorage = {
  getAll: (): Command[] => getFromStorage<Command>(STORAGE_KEYS.COMMANDS),
  save: (commands: Command[]) => saveToStorage(STORAGE_KEYS.COMMANDS, commands),
  add: (command: Command) => {
    const commands = commandStorage.getAll()
    commands.push(command)
    commandStorage.save(commands)
  },
  update: (id: string, updates: Partial<Command>) => {
    const commands = commandStorage.getAll()
    const index = commands.findIndex((c) => c.id === id)
    if (index !== -1) {
      commands[index] = { ...commands[index], ...updates }
      commandStorage.save(commands)
    }
  },
  delete: (id: string) => {
    const commands = commandStorage.getAll().filter((c) => c.id !== id)
    commandStorage.save(commands)
  },
  getOpenCommands: (): Command[] => {
    return commandStorage.getAll().filter((c) => c.status === "open")
  },
}

// Categories
export const categoryStorage = {
  getAll: (): Category[] => getFromStorage<Category>(STORAGE_KEYS.CATEGORIES),
  save: (categories: Category[]) => saveToStorage(STORAGE_KEYS.CATEGORIES, categories),
  add: (category: Category) => {
    const categories = categoryStorage.getAll()
    categories.push(category)
    categoryStorage.save(categories)
  },
  update: (id: string, updates: Partial<Category>) => {
    const categories = categoryStorage.getAll()
    const index = categories.findIndex((c) => c.id === id)
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates }
      categoryStorage.save(categories)
    }
  },
  delete: (id: string) => {
    const categories = categoryStorage.getAll().filter((c) => c.id !== id)
    categoryStorage.save(categories)
  },
}

// Products
export const productStorage = {
  getAll: (): Product[] => getFromStorage<Product>(STORAGE_KEYS.PRODUCTS),
  save: (products: Product[]) => saveToStorage(STORAGE_KEYS.PRODUCTS, products),
  add: (product: Product) => {
    const products = productStorage.getAll()
    products.push(product)
    productStorage.save(products)
  },
  update: (id: string, updates: Partial<Product>) => {
    const products = productStorage.getAll()
    const index = products.findIndex((p) => p.id === id)
    if (index !== -1) {
      products[index] = { ...products[index], ...updates }
      productStorage.save(products)
    }
  },
  delete: (id: string) => {
    const products = productStorage.getAll().filter((p) => p.id !== id)
    productStorage.save(products)
  },
  getLowStock: (): Product[] => {
    return productStorage.getAll().filter((p) => p.stockQuantity <= p.minStockAlert)
  },
}

// Sales
export const saleStorage = {
  getAll: (): Sale[] => getFromStorage<Sale>(STORAGE_KEYS.SALES),
  save: (sales: Sale[]) => saveToStorage(STORAGE_KEYS.SALES, sales),
  add: (sale: Sale) => {
    const sales = saleStorage.getAll()
    sales.push(sale)
    saleStorage.save(sales)
  },
  getSalesByDateRange: (startDate: string, endDate: string): Sale[] => {
    return saleStorage.getAll().filter((s) => s.soldAt >= startDate && s.soldAt <= endDate)
  },
}

// Stock Movements
export const stockMovementStorage = {
  getAll: (): StockMovement[] => getFromStorage<StockMovement>(STORAGE_KEYS.STOCK_MOVEMENTS),
  save: (movements: StockMovement[]) => saveToStorage(STORAGE_KEYS.STOCK_MOVEMENTS, movements),
  add: (movement: StockMovement) => {
    const movements = stockMovementStorage.getAll()
    movements.push(movement)
    stockMovementStorage.save(movements)
  },
}

// Initialize default data - system requires activation
export function initializeDefaultData() {
  // No default data - system requires activation
}
