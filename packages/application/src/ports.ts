import type {
  ActionHistoryEntry,
  ContextSnapshot,
  Memory,
  PersonalSignal,
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

export interface PersonalSignalRepository {
  save(signal: PersonalSignal): Promise<void>;
  findAll(): Promise<PersonalSignal[]>;
  findByDate(date: string): Promise<PersonalSignal[]>;
}
