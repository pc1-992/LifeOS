import Database from "better-sqlite3";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { ActionHistoryRepository } from "@lifeos/application";
import type {
  ActionCompletionStatus,
  ActionHistoryEntry,
  NextBestStep
} from "@lifeos/core";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { actionHistoryTable } from "./schema.js";

type ActionHistoryRow = typeof actionHistoryTable.$inferSelect;

export class SQLiteActionHistoryRepository
  implements ActionHistoryRepository
{
  private readonly db;

  constructor(databasePath = "data/local/lifeos.sqlite") {
    mkdirSync(dirname(databasePath), { recursive: true });

    const sqlite = new Database(databasePath);
    this.db = drizzle(sqlite);
    this.createActionHistoryTable(sqlite);
  }

  async save(entry: ActionHistoryEntry): Promise<void> {
    await this.db.insert(actionHistoryTable).values(toRow(entry));
  }

  async findAll(): Promise<ActionHistoryEntry[]> {
    const rows = await this.db
      .select()
      .from(actionHistoryTable)
      .orderBy(desc(actionHistoryTable.timestamp));

    return rows.map(toActionHistoryEntry);
  }

  async findRecentCompleted(limit: number): Promise<ActionHistoryEntry[]> {
    const rows = await this.db
      .select()
      .from(actionHistoryTable)
      .where(eq(actionHistoryTable.status, "completed"))
      .orderBy(desc(actionHistoryTable.timestamp))
      .limit(limit);

    return rows.map(toActionHistoryEntry);
  }

  private createActionHistoryTable(sqlite: Database.Database): void {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS action_history (
        id TEXT PRIMARY KEY,
        suggested_action TEXT NOT NULL,
        status TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        effectiveness_score INTEGER
      )
    `);
  }
}

function toRow(
  entry: ActionHistoryEntry
): typeof actionHistoryTable.$inferInsert {
  return {
    id: entry.id,
    suggestedAction: entry.suggestedAction,
    status: entry.status,
    timestamp: entry.timestamp.toISOString(),
    effectivenessScore: entry.effectivenessScore
  };
}

function toActionHistoryEntry(row: ActionHistoryRow): ActionHistoryEntry {
  return {
    id: row.id,
    suggestedAction: toNextBestStep(row.suggestedAction),
    status: toActionCompletionStatus(row.status),
    timestamp: new Date(row.timestamp),
    effectivenessScore: row.effectivenessScore ?? undefined
  };
}

function toNextBestStep(value: ActionHistoryRow["suggestedAction"]): NextBestStep {
  return {
    id: value.id,
    title: value.title,
    action: value.action,
    reason: toNextBestStepReason(value.reason),
    supportingSummary: value.supportingSummary
  };
}

function toActionCompletionStatus(value: string): ActionCompletionStatus {
  return value === "skipped" ? "skipped" : "completed";
}

function toNextBestStepReason(value: string): NextBestStep["reason"] {
  if (
    value === "no_context" ||
    value === "recovery_needed" ||
    value === "momentum_available" ||
    value === "frequent_stress"
  ) {
    return value;
  }

  return "follow_reflection";
}
