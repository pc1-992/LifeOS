import type { ContextSnapshot, Memory, PrivacyScope } from "@lifeos/core";

export interface MemoryRepository {
  save(memory: Memory): Promise<void>;
  findByPrivacyScope(scope: PrivacyScope): Promise<Memory[]>;
}

export interface ContextRepository {
  save(snapshot: ContextSnapshot): Promise<void>;
  latest(): Promise<ContextSnapshot | null>;
}
