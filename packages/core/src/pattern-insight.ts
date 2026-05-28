export type PatternInsightType =
  | "energy_focus"
  | "mood_frequency"
  | "routine_frequency"
  | "memory_tags"
  | "activity_mix";

export interface PatternInsight {
  id: string;
  type: PatternInsightType;
  title: string;
  summary: string;
}
