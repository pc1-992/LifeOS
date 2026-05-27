import type { PrivacyScope } from "./privacy.js";

export interface Memory {
  id: string;
  createdAt: Date;
  content: string;
  source: "user" | "system" | "agent";
  tags: string[];
  privacyScope: PrivacyScope;
}
