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
