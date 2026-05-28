import type {
  ActionHistoryEntry,
  ContextSnapshot,
  Memory,
  PrivacyScope
} from "@lifeos/core";

export interface MemoryRepository {
  save(memory: Memory): Promise<void>;
  findAll(): Promise<Memory[]>;
  findByPrivacyScope(scope: PrivacyScope): Promise<Memory[]>;
}

export interface ContextRepository {
  save(snapshot: ContextSnapshot): Promise<void>;
  latest(): Promise<ContextSnapshot | null>;
  findAll(): Promise<ContextSnapshot[]>;
}

export interface ActionHistoryRepository {
  save(entry: ActionHistoryEntry): Promise<void>;
  findAll(): Promise<ActionHistoryEntry[]>;
  findRecentCompleted(limit: number): Promise<ActionHistoryEntry[]>;
}
