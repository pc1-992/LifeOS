import type { RoutineSuggestion } from "./routine.js";

export interface DailyReflection {
  emotionalState: string;
  whatMatteredMost: string;
  suggestedNextStep: string;
  currentRoutineRecommendation: RoutineSuggestion;
}
