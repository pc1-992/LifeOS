import type { ContextSnapshot, PrivacyScope } from "@lifeos/core";
import type { ContextRepository } from "./ports.js";

export interface CaptureContextInput {
  mood: string;
  energyLevel: number;
  focusLevel: number;
  currentSituation: string;
  privacyScope?: PrivacyScope;
}

export class CaptureContextUseCase {
  constructor(private readonly contexts: ContextRepository) {}

  async execute(input: CaptureContextInput): Promise<ContextSnapshot> {
    const mood = input.mood.trim();
    const currentSituation = input.currentSituation.trim();
    const energyLevel = normalizeLevel(input.energyLevel);
    const focusLevel = normalizeLevel(input.focusLevel);

    if (mood.length === 0) {
      throw new Error("Mood cannot be empty.");
    }

    if (currentSituation.length === 0) {
      throw new Error("Current situation cannot be empty.");
    }

    const snapshot: ContextSnapshot = {
      id: createId(),
      capturedAt: new Date(),
      mood,
      energyLevel,
      focusLevel,
      currentSituation,
      summary: `${mood} mood, ${energyLevel}/10 energy, ${focusLevel}/10 focus: ${currentSituation}`,
      signals: ["manual"],
      privacyScope: input.privacyScope ?? "private"
    };

    await this.contexts.save(snapshot);
    return snapshot;
  }
}

function normalizeLevel(value: number): number {
  if (!Number.isFinite(value)) {
    return 5;
  }

  return Math.min(10, Math.max(1, Math.round(value)));
}

function createId(): string {
  return `ctx_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
