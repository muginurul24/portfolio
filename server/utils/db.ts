import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../database/schema'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDb() {
  if (_db) return _db

  const config = useRuntimeConfig()
  const url = (config.databaseUrl as string) || 'file:./.data/mugiew.sqlite'
  const path = url.startsWith('file:') ? url.slice(5) : url

  mkdirSync(dirname(path), { recursive: true })

  const sqlite = new Database(path)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  _db = drizzle(sqlite, { schema })
  return _db
}
