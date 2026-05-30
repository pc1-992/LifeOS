import Database from "better-sqlite3";
import { asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { PersonalSignalRepository } from "@lifeos/application";
import type {
  PersonalSignal,
  PrivacyScope,
  SignalCategory,
  SignalSource
} from "@lifeos/core";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { personalSignalsTable } from "./schema.js";

type PersonalSignalRow = typeof personalSignalsTable.$inferSelect;

export class SQLitePersonalSignalRepository
  implements PersonalSignalRepository
{
  private readonly db;

  constructor(databasePath = "data/local/lifeos.sqlite") {
    mkdirSync(dirname(databasePath), { recursive: true });

    const sqlite = new Database(databasePath);
    this.db = drizzle(sqlite);
    this.createPersonalSignalsTable(sqlite);
  }

  async save(signal: PersonalSignal): Promise<void> {
    await this.db.insert(personalSignalsTable).values(toRow(signal));
  }

  async findAll(): Promise<PersonalSignal[]> {
    const rows = await this.db
      .select()
      .from(personalSignalsTable)
      .orderBy(asc(personalSignalsTable.timestamp));

    return rows.map(toPersonalSignal);
  }

  async findByDate(date: string): Promise<PersonalSignal[]> {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    const signals = await this.findAll();

    return signals.filter(
      (signal) => signal.timestamp >= start && signal.timestamp < end
    );
  }

  private createPersonalSignalsTable(sqlite: Database.Database): void {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS personal_signals (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        source TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        duration_minutes INTEGER,
        confidence_score INTEGER NOT NULL,
        privacy_scope TEXT NOT NULL,
        raw_value_summary TEXT NOT NULL,
        normalized_meaning TEXT NOT NULL,
        metadata TEXT
      )
    `);
  }
}

function toRow(
  signal: PersonalSignal
): typeof personalSignalsTable.$inferInsert {
  return {
    id: signal.id,
    category: signal.category,
    source: signal.source,
    timestamp: signal.timestamp.toISOString(),
    durationMinutes: signal.durationMinutes,
    confidenceScore: Math.round(signal.confidenceScore * 100),
    privacyScope: signal.privacyScope,
    rawValueSummary: signal.rawValueSummary,
    normalizedMeaning: signal.normalizedMeaning,
    metadata: signal.metadata
  };
}

function toPersonalSignal(row: PersonalSignalRow): PersonalSignal {
  return {
    id: row.id,
    category: toSignalCategory(row.category),
    source: toSignalSource(row.source),
    timestamp: new Date(row.timestamp),
    durationMinutes: row.durationMinutes ?? undefined,
    confidenceScore: row.confidenceScore / 100,
    privacyScope: toPrivacyScope(row.privacyScope),
    rawValueSummary: row.rawValueSummary,
    normalizedMeaning: row.normalizedMeaning,
    metadata: row.metadata ?? undefined
  };
}

function toSignalCategory(value: string): SignalCategory {
  const categories: SignalCategory[] = [
    "sleep",
    "heart-rate",
    "phone-call",
    "location-presence",
    "work-presence",
    "home-presence",
    "meeting",
    "calendar-event",
    "movement",
    "routine",
    "focus",
    "energy",
    "stress",
    "social-interaction"
  ];

  return categories.includes(value as SignalCategory)
    ? (value as SignalCategory)
    : "routine";
}

function toSignalSource(value: string): SignalSource {
  const sources: SignalSource[] = [
    "manual",
    "system",
    "health",
    "calendar",
    "phone",
    "location",
    "routine"
  ];

  return sources.includes(value as SignalSource) ? (value as SignalSource) : "manual";
}

function toPrivacyScope(value: string): PrivacyScope {
  if (value === "trusted" || value === "shareable") {
    return value;
  }

  return "private";
}
