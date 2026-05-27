import type { PrivacyScope } from "./privacy.js";

export type AgentTaskStatus = "planned" | "running" | "blocked" | "done";

export interface AgentTask {
  id: string;
  title: string;
  goal: string;
  status: AgentTaskStatus;
  privacyScope: PrivacyScope;
}
