import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const memoriesTable = sqliteTable("memories", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
  content: text("content").notNull(),
  source: text("source").notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
  privacyScope: text("privacy_scope").notNull()
});
