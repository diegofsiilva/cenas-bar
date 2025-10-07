import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

const DB_DIR = path.join(process.cwd(), "data")
const DB_PATH = path.join(DB_DIR, "bar-bistro.db")

let dbInstance: Database.Database | null = null

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance
  }

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
  }

  dbInstance = new Database(DB_PATH)
  dbInstance.pragma("journal_mode = WAL")
  dbInstance.pragma("synchronous = NORMAL")
  dbInstance.pragma("cache_size = -64000")
  dbInstance.pragma("temp_store = MEMORY")

  initializeDatabase(dbInstance)

  return dbInstance
}

function initializeDatabase(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS license (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      activation_code TEXT NOT NULL,
      expiration_date TEXT NOT NULL,
      activated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category_id TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

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

    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      command_id TEXT NOT NULL,
      table_id TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inventory_movements (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      reason TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_commands_table ON commands(table_id);
    CREATE INDEX IF NOT EXISTS idx_commands_status ON commands(status);
    CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);
    CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_movements(product_id);
  `)
}

export default getDb
