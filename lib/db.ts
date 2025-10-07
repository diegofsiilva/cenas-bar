import Database from "better-sqlite3"
import path from "path"
import fs from "fs"
import type { Table, Command, Product, Category, Sale, InventoryMovement, License } from "./types"

// Database file location - stored in user's data directory
const DB_DIR = path.join(process.cwd(), "data")
const DB_PATH = path.join(DB_DIR, "bar-bistro.db")

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

// Initialize database connection
const db = new Database(DB_PATH)
db.pragma("journal_mode = WAL") // Better performance

// Initialize database schema
export function initializeDatabase() {
  db.exec(`
    -- License table
    CREATE TABLE IF NOT EXISTS license (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      activation_code TEXT NOT NULL,
      expiration_date TEXT NOT NULL,
      activated_at TEXT NOT NULL
    );

    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    -- Products table
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category_id TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    -- Tables table
    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    -- Commands table
    CREATE TABLE IF NOT EXISTS commands (
      id TEXT PRIMARY KEY,
      table_id TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'open',
      opened_at TEXT NOT NULL,
      closed_at TEXT,
      FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE
    );

    -- Sales table
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      command_id TEXT NOT NULL,
      table_id TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    -- Inventory movements table
    CREATE TABLE IF NOT EXISTS inventory_movements (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      reason TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_commands_table ON commands(table_id);
    CREATE INDEX IF NOT EXISTS idx_commands_status ON commands(status);
    CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);
    CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_movements(product_id);
  `)
}

// Initialize database on import
initializeDatabase()

// License operations
export const licenseDb = {
  get: (): License | null => {
    const row = db.prepare("SELECT * FROM license WHERE id = 1").get() as any
    if (!row) return null
    return {
      activationCode: row.activation_code,
      expirationDate: row.expiration_date,
      activatedAt: row.activated_at,
    }
  },

  set: (license: License) => {
    db.prepare(`
      INSERT OR REPLACE INTO license (id, activation_code, expiration_date, activated_at)
      VALUES (1, ?, ?, ?)
    `).run(license.activationCode, license.expirationDate, license.activatedAt)
  },

  clear: () => {
    db.prepare("DELETE FROM license WHERE id = 1").run()
  },
}

// Category operations
export const categoryDb = {
  getAll: (): Category[] => {
    return db.prepare("SELECT * FROM categories ORDER BY name").all() as Category[]
  },

  getById: (id: string): Category | null => {
    return db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as Category | null
  },

  create: (category: Category) => {
    db.prepare("INSERT INTO categories (id, name, created_at) VALUES (?, ?, ?)").run(
      category.id,
      category.name,
      category.createdAt,
    )
  },

  update: (id: string, data: Partial<Category>) => {
    if (data.name) {
      db.prepare("UPDATE categories SET name = ? WHERE id = ?").run(data.name, id)
    }
  },

  delete: (id: string) => {
    db.prepare("DELETE FROM categories WHERE id = ?").run(id)
  },
}

// Product operations
export const productDb = {
  getAll: (): Product[] => {
    return db.prepare("SELECT * FROM products ORDER BY name").all() as Product[]
  },

  getById: (id: string): Product | null => {
    return db.prepare("SELECT * FROM products WHERE id = ?").get(id) as Product | null
  },

  create: (product: Product) => {
    db.prepare(`
      INSERT INTO products (id, name, category_id, price, stock, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(product.id, product.name, product.categoryId, product.price, product.stock, product.createdAt)
  },

  update: (id: string, data: Partial<Product>) => {
    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      updates.push("name = ?")
      values.push(data.name)
    }
    if (data.categoryId !== undefined) {
      updates.push("category_id = ?")
      values.push(data.categoryId)
    }
    if (data.price !== undefined) {
      updates.push("price = ?")
      values.push(data.price)
    }
    if (data.stock !== undefined) {
      updates.push("stock = ?")
      values.push(data.stock)
    }

    if (updates.length > 0) {
      values.push(id)
      db.prepare(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`).run(...values)
    }
  },

  delete: (id: string) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(id)
  },
}

// Table operations
export const tableDb = {
  getAll: (): Table[] => {
    return db.prepare("SELECT * FROM tables ORDER BY name").all() as Table[]
  },

  getById: (id: string): Table | null => {
    return db.prepare("SELECT * FROM tables WHERE id = ?").get(id) as Table | null
  },

  create: (table: Table) => {
    db.prepare("INSERT INTO tables (id, name, created_at) VALUES (?, ?, ?)").run(table.id, table.name, table.createdAt)
  },

  update: (id: string, data: Partial<Table>) => {
    if (data.name) {
      db.prepare("UPDATE tables SET name = ? WHERE id = ?").run(data.name, id)
    }
  },

  delete: (id: string) => {
    db.prepare("DELETE FROM tables WHERE id = ?").run(id)
  },
}

// Command operations
export const commandDb = {
  getAll: (): Command[] => {
    const rows = db.prepare("SELECT * FROM commands ORDER BY opened_at DESC").all() as any[]
    return rows.map((row) => ({
      id: row.id,
      tableId: row.table_id,
      items: JSON.parse(row.items),
      total: row.total,
      status: row.status,
      openedAt: row.opened_at,
      closedAt: row.closed_at,
    }))
  },

  getById: (id: string): Command | null => {
    const row = db.prepare("SELECT * FROM commands WHERE id = ?").get(id) as any
    if (!row) return null
    return {
      id: row.id,
      tableId: row.table_id,
      items: JSON.parse(row.items),
      total: row.total,
      status: row.status,
      openedAt: row.opened_at,
      closedAt: row.closed_at,
    }
  },

  getByTableId: (tableId: string): Command | null => {
    const row = db.prepare("SELECT * FROM commands WHERE table_id = ? AND status = ?").get(tableId, "open") as any
    if (!row) return null
    return {
      id: row.id,
      tableId: row.table_id,
      items: JSON.parse(row.items),
      total: row.total,
      status: row.status,
      openedAt: row.opened_at,
      closedAt: row.closed_at,
    }
  },

  create: (command: Command) => {
    db.prepare(`
      INSERT INTO commands (id, table_id, items, total, status, opened_at, closed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      command.id,
      command.tableId,
      JSON.stringify(command.items),
      command.total,
      command.status,
      command.openedAt,
      command.closedAt || null,
    )
  },

  update: (id: string, data: Partial<Command>) => {
    const updates: string[] = []
    const values: any[] = []

    if (data.items !== undefined) {
      updates.push("items = ?")
      values.push(JSON.stringify(data.items))
    }
    if (data.total !== undefined) {
      updates.push("total = ?")
      values.push(data.total)
    }
    if (data.status !== undefined) {
      updates.push("status = ?")
      values.push(data.status)
    }
    if (data.closedAt !== undefined) {
      updates.push("closed_at = ?")
      values.push(data.closedAt)
    }

    if (updates.length > 0) {
      values.push(id)
      db.prepare(`UPDATE commands SET ${updates.join(", ")} WHERE id = ?`).run(...values)
    }
  },

  delete: (id: string) => {
    db.prepare("DELETE FROM commands WHERE id = ?").run(id)
  },
}

// Sale operations
export const saleDb = {
  getAll: (): Sale[] => {
    const rows = db.prepare("SELECT * FROM sales ORDER BY created_at DESC").all() as any[]
    return rows.map((row) => ({
      id: row.id,
      commandId: row.command_id,
      tableId: row.table_id,
      items: JSON.parse(row.items),
      total: row.total,
      paymentMethod: row.payment_method,
      createdAt: row.created_at,
    }))
  },

  create: (sale: Sale) => {
    db.prepare(`
      INSERT INTO sales (id, command_id, table_id, items, total, payment_method, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      sale.id,
      sale.commandId,
      sale.tableId,
      JSON.stringify(sale.items),
      sale.total,
      sale.paymentMethod,
      sale.createdAt,
    )
  },
}

// Inventory movement operations
export const inventoryDb = {
  getAll: (): InventoryMovement[] => {
    const rows = db.prepare("SELECT * FROM inventory_movements ORDER BY created_at DESC").all() as any[]
    return rows.map((row) => ({
      id: row.id,
      productId: row.product_id,
      type: row.type,
      quantity: row.quantity,
      reason: row.reason,
      createdAt: row.created_at,
    }))
  },

  create: (movement: InventoryMovement) => {
    db.prepare(`
      INSERT INTO inventory_movements (id, product_id, type, quantity, reason, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      movement.id,
      movement.productId,
      movement.type,
      movement.quantity,
      movement.reason || null,
      movement.createdAt,
    )
  },
}

export default db
