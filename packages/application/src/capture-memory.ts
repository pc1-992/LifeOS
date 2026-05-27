import type { Memory, PrivacyScope } from "@lifeos/core";
import type { MemoryRepository } from "./ports.js";

export interface CaptureMemoryInput {
  content: string;
  tags?: string[];
  privacyScope?: PrivacyScope;
}

export class CaptureMemoryUseCase {
  constructor(private readonly memories: MemoryRepository) {}

  async execute(input: CaptureMemoryInput): Promise<Memory> {
    const memory: Memory = {
      id: createId(),
      createdAt: new Date(),
      content: input.content.trim(),
      source: "user",
      tags: input.tags ?? [],
      privacyScope: input.privacyScope ?? "private"
    };

    if (memory.content.length === 0) {
      throw new Error("Memory content cannot be empty.");
    }

    await this.memories.save(memory);
    return memory;
  }
}

function createId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
