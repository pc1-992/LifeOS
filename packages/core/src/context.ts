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
  summary: string;
  signals: ContextSignal[];
  privacyScope: PrivacyScope;
}
