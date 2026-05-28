export interface Routine {
  id: string;
  name: string;
  description: string;
  trigger: string;
  enabled: boolean;
}

export type RoutineSuggestionReason =
  | "low_energy"
  | "low_focus"
  | "stressed_mood"
  | "steady_state"
  | "no_context";

export interface RoutineSuggestion {
  id: string;
  name: string;
  description: string;
  steps: string[];
  reason: RoutineSuggestionReason;
  basedOnContextId: string | null;
  privacyScope: "private";
}
