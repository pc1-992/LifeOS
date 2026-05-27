import type { Memory, PrivacyScope } from "@lifeos/core";
import type { MemoryRepository } from "@lifeos/application";

export class InMemoryMemoryRepository implements MemoryRepository {
  private readonly memories = new Map<string, Memory>();

  async save(memory: Memory): Promise<void> {
    this.memories.set(memory.id, memory);
  }

  async findAll(): Promise<Memory[]> {
    return [...this.memories.values()];
  }

  async findByPrivacyScope(scope: PrivacyScope): Promise<Memory[]> {
    return [...this.memories.values()].filter(
      (memory) => memory.privacyScope === scope
    );
  }
}
