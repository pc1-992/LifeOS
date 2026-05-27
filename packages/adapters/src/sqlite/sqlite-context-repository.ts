import Database from "better-sqlite3";
import { asc, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { ContextRepository } from "@lifeos/application";
import type { ContextSignal, ContextSnapshot, PrivacyScope } from "@lifeos/core";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { contextSnapshotsTable } from "./schema.js";

type ContextSnapshotRow = typeof contextSnapshotsTable.$inferSelect;

export class SQLiteContextRepository implements ContextRepository {
  private readonly db;

  constructor(databasePath = "data/local/lifeos.sqlite") {
    mkdirSync(dirname(databasePath), { recursive: true });

    const sqlite = new Database(databasePath);
    this.db = drizzle(sqlite);
    this.createContextSnapshotsTable(sqlite);
  }

  async save(snapshot: ContextSnapshot): Promise<void> {
    await this.db.insert(contextSnapshotsTable).values(toRow(snapshot));
  }

  async latest(): Promise<ContextSnapshot | null> {
    const rows = await this.db
      .select()
      .from(contextSnapshotsTable)
      .orderBy(desc(contextSnapshotsTable.capturedAt))
      .limit(1);

    return rows[0] ? toContextSnapshot(rows[0]) : null;
  }

  async findAll(): Promise<ContextSnapshot[]> {
    const rows = await this.db
      .select()
      .from(contextSnapshotsTable)
      .orderBy(asc(contextSnapshotsTable.capturedAt));

    return rows.map(toContextSnapshot);
  }

  private createContextSnapshotsTable(sqlite: Database.Database): void {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS context_snapshots (
        id TEXT PRIMARY KEY,
        captured_at TEXT NOT NULL,
        mood TEXT NOT NULL,
        energy_level INTEGER NOT NULL,
        focus_level INTEGER NOT NULL,
        current_situation TEXT NOT NULL,
        summary TEXT NOT NULL,
        signals TEXT NOT NULL,
        privacy_scope TEXT NOT NULL
      )
    `);
  }
}

function toRow(
  snapshot: ContextSnapshot
): typeof contextSnapshotsTable.$inferInsert {
  return {
    id: snapshot.id,
    capturedAt: snapshot.capturedAt.toISOString(),
    mood: snapshot.mood,
    energyLevel: snapshot.energyLevel,
    focusLevel: snapshot.focusLevel,
    currentSituation: snapshot.currentSituation,
    summary: snapshot.summary,
    signals: snapshot.signals,
    privacyScope: snapshot.privacyScope
  };
}

function toContextSnapshot(row: ContextSnapshotRow): ContextSnapshot {
  return {
    id: row.id,
    capturedAt: new Date(row.capturedAt),
    mood: row.mood,
    energyLevel: row.energyLevel,
    focusLevel: row.focusLevel,
    currentSituation: row.currentSituation,
    summary: row.summary,
    signals: toContextSignals(row.signals),
    privacyScope: toPrivacyScope(row.privacyScope)
  };
}

function toContextSignals(value: string[]): ContextSignal[] {
  return value.filter((signal): signal is ContextSignal =>
    ["location", "calendar", "task", "conversation", "device", "manual"].includes(
      signal
    )
  );
}

function toPrivacyScope(value: string): PrivacyScope {
  if (value === "trusted" || value === "shareable") {
    return value;
  }

  return "private";
}
