import type { PrivacyScope } from "./privacy.js";

export type ContextSignal =
  | "location"
  | "calendar"
  | "task"
  | "conversation"
  | "device"
  | "manual";

export interface ContextSnapshot {
  id: string;
  capturedAt: Date;
  mood: string;
  energyLevel: number;
  focusLevel: number;
  currentSituation: string;
  summary: string;
  signals: ContextSignal[];
  privacyScope: PrivacyScope;
}
