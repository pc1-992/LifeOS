import Database from "better-sqlite3";
import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { MemoryRepository } from "@lifeos/application";
import type { Memory, PrivacyScope } from "@lifeos/core";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { memoriesTable } from "./schema.js";

type MemoryRow = typeof memoriesTable.$inferSelect;

export class SQLiteMemoryRepository implements MemoryRepository {
  private readonly db;

  constructor(databasePath = "data/local/lifeos.sqlite") {
    mkdirSync(dirname(databasePath), { recursive: true });

    const sqlite = new Database(databasePath);
    this.db = drizzle(sqlite);
    this.createMemoriesTable(sqlite);
  }

  async save(memory: Memory): Promise<void> {
    await this.db.insert(memoriesTable).values(toRow(memory));
  }

  async findAll(): Promise<Memory[]> {
    const rows = await this.db
      .select()
      .from(memoriesTable)
      .orderBy(asc(memoriesTable.createdAt));

    return rows.map(toMemory);
  }

  async findByPrivacyScope(scope: PrivacyScope): Promise<Memory[]> {
    const rows = await this.db
      .select()
      .from(memoriesTable)
      .where(eq(memoriesTable.privacyScope, scope))
      .orderBy(asc(memoriesTable.createdAt));

    return rows.map(toMemory);
  }

  private createMemoriesTable(sqlite: Database.Database): void {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        content TEXT NOT NULL,
        source TEXT NOT NULL,
        tags TEXT NOT NULL,
        privacy_scope TEXT NOT NULL
      )
    `);
  }
}

function toRow(memory: Memory): typeof memoriesTable.$inferInsert {
  return {
    id: memory.id,
    createdAt: memory.createdAt.toISOString(),
    content: memory.content,
    source: memory.source,
    tags: memory.tags,
    privacyScope: memory.privacyScope
  };
}

function toMemory(row: MemoryRow): Memory {
  return {
    id: row.id,
    createdAt: new Date(row.createdAt),
    content: row.content,
    source: toMemorySource(row.source),
    tags: Array.isArray(row.tags) ? row.tags : [],
    privacyScope: toPrivacyScope(row.privacyScope)
  };
}

function toMemorySource(value: string): Memory["source"] {
  if (value === "system" || value === "agent") {
    return value;
  }

  return "user";
}

function toPrivacyScope(value: string): PrivacyScope {
  if (value === "trusted" || value === "shareable") {
    return value;
  }

  return "private";
}
