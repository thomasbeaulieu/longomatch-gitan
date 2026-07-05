import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { migrations } from './migrations'

let db: Database.Database | null = null

function runMigrations(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name        TEXT PRIMARY KEY,
      applied_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  const applied = new Set(
    database.prepare('SELECT name FROM _migrations').all().map((row: any) => row.name)
  )

  for (const migration of migrations) {
    if (applied.has(migration.name)) continue
    database.transaction(() => {
      database.exec(migration.sql)
      database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migration.name)
    })()
  }
}

export function getDb(): Database.Database {
  if (db) return db

  const dbPath = join(app.getPath('userData'), 'app.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  runMigrations(db)

  return db
}

export function getDbPath(): string {
  return join(app.getPath('userData'), 'app.db')
}
