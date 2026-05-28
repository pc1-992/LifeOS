import type { ContextSnapshot } from "./context.js";
import type { Memory } from "./memory.js";
import type { RoutineSuggestion } from "./routine.js";

export interface DashboardSummary {
  whatMattersNow: string;
  latestMemory: Memory | null;
  latestContext: ContextSnapshot | null;
  suggestedRoutine: RoutineSuggestion;
}
