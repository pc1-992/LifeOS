import type {
  ActionCompletionStatus,
  ActionHistoryEntry,
  NextBestStep
} from "@lifeos/core";
import type { ActionHistoryRepository } from "./ports.js";

export interface RecordActionCompletionInput {
  suggestedAction: NextBestStep;
  status: ActionCompletionStatus;
  effectivenessScore?: number;
}

export class RecordActionCompletionUseCase {
  constructor(private readonly actionHistory: ActionHistoryRepository) {}

  async execute(input: RecordActionCompletionInput): Promise<ActionHistoryEntry> {
    const entry: ActionHistoryEntry = {
      id: createId(),
      suggestedAction: input.suggestedAction,
      status: input.status,
      timestamp: new Date(),
      effectivenessScore: input.effectivenessScore
    };

    validateEntry(entry);

    await this.actionHistory.save(entry);
    return entry;
  }
}

function validateEntry(entry: ActionHistoryEntry): void {
  if (entry.suggestedAction.action.trim().length === 0) {
    throw new Error("Suggested action cannot be empty.");
  }

  if (entry.status !== "completed" && entry.status !== "skipped") {
    throw new Error("Action status must be completed or skipped.");
  }

  if (
    entry.effectivenessScore !== undefined &&
    (!Number.isInteger(entry.effectivenessScore) ||
      entry.effectivenessScore < 1 ||
      entry.effectivenessScore > 5)
  ) {
    throw new Error("Effectiveness score must be a whole number from 1 to 5.");
  }
}

function createId(): string {
  return `act_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
