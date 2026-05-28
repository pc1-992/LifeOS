import type {
  ActionHistoryEntry,
  NextBestStep,
  RecommendationFeedback,
  RecommendationScore,
  RoutineSuccessScore
} from "@lifeos/core";
import type { ActionHistoryRepository } from "./ports.js";

interface MutableRecommendationScore {
  recommendationKey: string;
  title: string;
  action: string;
  reason: NextBestStep["reason"];
  completedCount: number;
  skippedCount: number;
  effectivenessScores: number[];
}

interface MutableRoutineScore {
  routineName: string;
  completedCount: number;
  skippedCount: number;
}

export class RecommendationFeedbackUseCase {
  constructor(private readonly actionHistory: ActionHistoryRepository) {}

  async execute(): Promise<RecommendationFeedback> {
    const entries = await this.actionHistory.findAll();
    const recommendationScores = scoreRecommendations(entries);
    const routineScores = scoreRoutines(entries);

    return {
      generatedAt: new Date(),
      totalActions: entries.length,
      highlyEffectiveRecommendations: recommendationScores
        .filter(isHighlyEffective)
        .sort(sortRecommendationScores)
        .slice(0, 3),
      frequentlySkippedRecommendations: recommendationScores
        .filter(isFrequentlySkipped)
        .sort((left, right) => right.skippedCount - left.skippedCount)
        .slice(0, 3),
      mostSuccessfulRoutines: routineScores
        .sort(sortRoutineScores)
        .slice(0, 3)
    };
  }
}

function scoreRecommendations(
  entries: ActionHistoryEntry[]
): RecommendationScore[] {
  const groups = new Map<string, MutableRecommendationScore>();

  for (const entry of entries) {
    const key = getRecommendationKey(entry.suggestedAction);
    const existing = groups.get(key) ?? {
      recommendationKey: key,
      title: entry.suggestedAction.title,
      action: entry.suggestedAction.action,
      reason: entry.suggestedAction.reason,
      completedCount: 0,
      skippedCount: 0,
      effectivenessScores: []
    };

    if (entry.status === "completed") {
      existing.completedCount += 1;
    } else {
      existing.skippedCount += 1;
    }

    if (entry.effectivenessScore !== undefined) {
      existing.effectivenessScores.push(entry.effectivenessScore);
    }

    groups.set(key, existing);
  }

  return Array.from(groups.values()).map(toRecommendationScore);
}

function scoreRoutines(entries: ActionHistoryEntry[]): RoutineSuccessScore[] {
  const groups = new Map<string, MutableRoutineScore>();

  for (const entry of entries) {
    const routineName = entry.suggestedAction.title.trim();
    const existing = groups.get(routineName) ?? {
      routineName,
      completedCount: 0,
      skippedCount: 0
    };

    if (entry.status === "completed") {
      existing.completedCount += 1;
    } else {
      existing.skippedCount += 1;
    }

    groups.set(routineName, existing);
  }

  return Array.from(groups.values()).map(toRoutineSuccessScore);
}

function toRecommendationScore(
  group: MutableRecommendationScore
): RecommendationScore {
  const totalCount = group.completedCount + group.skippedCount;
  const completionRate = totalCount === 0 ? 0 : group.completedCount / totalCount;
  const averageEffectivenessScore =
    group.effectivenessScores.length === 0
      ? null
      : average(group.effectivenessScores);

  return {
    recommendationKey: group.recommendationKey,
    title: group.title,
    action: group.action,
    reason: group.reason,
    completedCount: group.completedCount,
    skippedCount: group.skippedCount,
    totalCount,
    completionRate,
    averageEffectivenessScore,
    score: calculateRecommendationScore(
      group.completedCount,
      group.skippedCount,
      averageEffectivenessScore
    )
  };
}

function toRoutineSuccessScore(group: MutableRoutineScore): RoutineSuccessScore {
  const totalCount = group.completedCount + group.skippedCount;
  const completionRate = totalCount === 0 ? 0 : group.completedCount / totalCount;

  return {
    routineName: group.routineName,
    completedCount: group.completedCount,
    skippedCount: group.skippedCount,
    completionRate,
    score: group.completedCount * 2 - group.skippedCount
  };
}

function calculateRecommendationScore(
  completedCount: number,
  skippedCount: number,
  averageEffectivenessScore: number | null
): number {
  const effectivenessBonus = averageEffectivenessScore ?? 0;

  return completedCount * 2 + effectivenessBonus - skippedCount * 2;
}

function isHighlyEffective(score: RecommendationScore): boolean {
  return (
    score.completedCount > 0 &&
    score.completionRate >= 0.6 &&
    (score.averageEffectivenessScore === null ||
      score.averageEffectivenessScore >= 4) &&
    score.score >= 2
  );
}

function isFrequentlySkipped(score: RecommendationScore): boolean {
  return score.skippedCount >= 2 || (score.totalCount >= 2 && score.completionRate < 0.5);
}

function sortRecommendationScores(
  left: RecommendationScore,
  right: RecommendationScore
): number {
  return (
    right.score - left.score ||
    right.completedCount - left.completedCount ||
    left.action.localeCompare(right.action)
  );
}

function sortRoutineScores(
  left: RoutineSuccessScore,
  right: RoutineSuccessScore
): number {
  return (
    right.score - left.score ||
    right.completedCount - left.completedCount ||
    left.routineName.localeCompare(right.routineName)
  );
}

function getRecommendationKey(step: NextBestStep): string {
  return `${step.reason}:${step.title.trim().toLowerCase()}:${step.action
    .trim()
    .toLowerCase()}`;
}

function average(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}
