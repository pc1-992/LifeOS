import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const memoriesTable = sqliteTable("memories", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
  content: text("content").notNull(),
  source: text("source").notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
  privacyScope: text("privacy_scope").notNull()
});

export const contextSnapshotsTable = sqliteTable("context_snapshots", {
  id: text("id").primaryKey(),
  capturedAt: text("captured_at").notNull(),
  mood: text("mood").notNull(),
  energyLevel: integer("energy_level").notNull(),
  focusLevel: integer("focus_level").notNull(),
  currentSituation: text("current_situation").notNull(),
  summary: text("summary").notNull(),
  signals: text("signals", { mode: "json" }).$type<string[]>().notNull(),
  privacyScope: text("privacy_scope").notNull()
});

export const actionHistoryTable = sqliteTable("action_history", {
  id: text("id").primaryKey(),
  suggestedAction: text("suggested_action", { mode: "json" })
    .$type<{
      id: string;
      title: string;
      action: string;
      reason: string;
      supportingSummary: string;
    }>()
    .notNull(),
  status: text("status").notNull(),
  timestamp: text("timestamp").notNull(),
  effectivenessScore: integer("effectiveness_score")
});

export const personalSignalsTable = sqliteTable("personal_signals", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  source: text("source").notNull(),
  timestamp: text("timestamp").notNull(),
  durationMinutes: integer("duration_minutes"),
  confidenceScore: integer("confidence_score").notNull(),
  privacyScope: text("privacy_scope").notNull(),
  rawValueSummary: text("raw_value_summary").notNull(),
  normalizedMeaning: text("normalized_meaning").notNull(),
  metadata: text("metadata", { mode: "json" })
    .$type<Record<string, string | number | boolean>>()
});
