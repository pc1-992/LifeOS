import type { NextBestStepReason } from "./next-best-step.js";

export interface RecommendationScore {
  recommendationKey: string;
  title: string;
  action: string;
  reason: NextBestStepReason;
  completedCount: number;
  skippedCount: number;
  totalCount: number;
  completionRate: number;
  averageEffectivenessScore: number | null;
  score: number;
}

export interface RoutineSuccessScore {
  routineName: string;
  completedCount: number;
  skippedCount: number;
  completionRate: number;
  score: number;
}

export interface RecommendationFeedback {
  generatedAt: Date;
  totalActions: number;
  highlyEffectiveRecommendations: RecommendationScore[];
  frequentlySkippedRecommendations: RecommendationScore[];
  mostSuccessfulRoutines: RoutineSuccessScore[];
}
