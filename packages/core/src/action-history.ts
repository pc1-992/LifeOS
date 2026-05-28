import type { NextBestStep } from "./next-best-step.js";

export type ActionCompletionStatus = "completed" | "skipped";

export interface ActionHistoryEntry {
  id: string;
  suggestedAction: NextBestStep;
  status: ActionCompletionStatus;
  timestamp: Date;
  effectivenessScore?: number;
}
