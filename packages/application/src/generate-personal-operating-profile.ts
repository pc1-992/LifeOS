import type {
  ActionHistoryEntry,
  ContextSnapshot,
  PatternInsight,
  PersonalOperatingProfile,
  PersonalOperatingProfileTrait,
  RecommendationFeedback
} from "@lifeos/core";
import type {
  ActionHistoryRepository,
  ContextRepository,
  MemoryRepository
} from "./ports.js";
import { GeneratePatternInsightsUseCase } from "./generate-pattern-insights.js";
import { RecommendationFeedbackUseCase } from "./recommendation-feedback.js";

type DayPeriod = "morning" | "afternoon" | "evening" | "night";

interface FocusPeriodScore {
  period: DayPeriod;
  averageFocus: number;
  snapshotCount: number;
}

export class GeneratePersonalOperatingProfileUseCase {
  private readonly generatePatternInsights: GeneratePatternInsightsUseCase;
  private readonly recommendationFeedback: RecommendationFeedbackUseCase;

  constructor(
    memories: MemoryRepository,
    private readonly contexts: ContextRepository,
    private readonly actionHistory: ActionHistoryRepository
  ) {
    this.generatePatternInsights = new GeneratePatternInsightsUseCase(
      memories,
      contexts
    );
    this.recommendationFeedback = new RecommendationFeedbackUseCase(actionHistory);
  }

  async execute(): Promise<PersonalOperatingProfile> {
    const [contextSnapshots, actionEntries, patternInsights, feedback] =
      await Promise.all([
        this.contexts.findAll(),
        this.actionHistory.findAll(),
        this.generatePatternInsights.execute(),
        this.recommendationFeedback.execute()
      ]);

    return {
      generatedAt: new Date(),
      contextSnapshotCount: contextSnapshots.length,
      actionHistoryCount: actionEntries.length,
      traits: [
        getStrongestFocusPeriodsTrait(contextSnapshots),
        getCommonStressPatternsTrait(contextSnapshots, patternInsights),
        getPreferredRecoveryRoutinesTrait(actionEntries, feedback),
        getMostEffectiveRecommendationTypesTrait(feedback),
        getEnergyStabilityTrendTrait(contextSnapshots, patternInsights)
      ]
    };
  }
}

function getStrongestFocusPeriodsTrait(
  contexts: ContextSnapshot[]
): PersonalOperatingProfileTrait {
  const focusPeriods = scoreFocusPeriods(contexts);
  const strongestPeriod = focusPeriods[0];

  if (strongestPeriod === undefined) {
    return {
      type: "strongest_focus_periods",
      title: "Strongest focus periods",
      summary: "No focus period pattern is available yet.",
      evidence: ["Capture context snapshots over time to build this trait."]
    };
  }

  return {
    type: "strongest_focus_periods",
    title: "Strongest focus periods",
    summary: `Your strongest focus currently appears in the ${strongestPeriod.period}.`,
    evidence: [
      `${strongestPeriod.snapshotCount} snapshot${
        strongestPeriod.snapshotCount === 1 ? "" : "s"
      } in this period.`,
      `Average focus was ${strongestPeriod.averageFocus.toFixed(1)} out of 10.`
    ]
  };
}

function getCommonStressPatternsTrait(
  contexts: ContextSnapshot[],
  insights: PatternInsight[]
): PersonalOperatingProfileTrait {
  const stressedContexts = contexts.filter(isStressContext);
  const lowEnergyStressCount = stressedContexts.filter(
    (context) => context.energyLevel <= 4
  ).length;
  const moodInsight = insights.find((insight) => insight.type === "mood_frequency");

  if (stressedContexts.length === 0) {
    return {
      type: "common_stress_patterns",
      title: "Common stress patterns",
      summary: "No repeated stress pattern is visible yet.",
      evidence: [moodInsight?.summary ?? "No mood insight is available yet."]
    };
  }

  return {
    type: "common_stress_patterns",
    title: "Common stress patterns",
    summary:
      lowEnergyStressCount >= stressedContexts.length / 2
        ? "Stress most often appears alongside lower energy."
        : "Stress appears, but it is not strongly tied to low energy yet.",
    evidence: [
      `${stressedContexts.length} stressed context snapshot${
        stressedContexts.length === 1 ? "" : "s"
      } found.`,
      `${lowEnergyStressCount} also had energy at 4 or below.`
    ]
  };
}

function getPreferredRecoveryRoutinesTrait(
  actionEntries: ActionHistoryEntry[],
  feedback: RecommendationFeedback
): PersonalOperatingProfileTrait {
  const completedRecoveryActions = actionEntries.filter(
    (entry) =>
      entry.status === "completed" &&
      (entry.suggestedAction.reason === "recovery_needed" ||
        entry.suggestedAction.action.toLowerCase().includes("recover") ||
        entry.suggestedAction.action.toLowerCase().includes("pause"))
  );
  const bestRoutine = feedback.mostSuccessfulRoutines[0];

  if (completedRecoveryActions.length === 0 && bestRoutine === undefined) {
    return {
      type: "preferred_recovery_routines",
      title: "Preferred recovery routines",
      summary: "No preferred recovery routine is visible yet.",
      evidence: ["Complete recovery-oriented actions to build this trait."]
    };
  }

  return {
    type: "preferred_recovery_routines",
    title: "Preferred recovery routines",
    summary:
      completedRecoveryActions[0]?.suggestedAction.action ??
      `${bestRoutine?.routineName} is the strongest routine so far.`,
    evidence: [
      `${completedRecoveryActions.length} completed recovery action${
        completedRecoveryActions.length === 1 ? "" : "s"
      } found.`,
      bestRoutine === undefined
        ? "No routine score is available yet."
        : `${bestRoutine.routineName} has a ${Math.round(
            bestRoutine.completionRate * 100
          )}% completion rate.`
    ]
  };
}

function getMostEffectiveRecommendationTypesTrait(
  feedback: RecommendationFeedback
): PersonalOperatingProfileTrait {
  const reasonCounts = new Map<string, number>();

  for (const recommendation of feedback.highlyEffectiveRecommendations) {
    reasonCounts.set(
      recommendation.reason,
      (reasonCounts.get(recommendation.reason) ?? 0) + recommendation.completedCount
    );
  }

  const strongestReason = Array.from(reasonCounts.entries()).sort(
    (left, right) => right[1] - left[1]
  )[0];

  if (strongestReason === undefined) {
    return {
      type: "most_effective_recommendation_types",
      title: "Most effective recommendation types",
      summary: "No effective recommendation type is clear yet.",
      evidence: ["Complete or score more recommendations to build this trait."]
    };
  }

  return {
    type: "most_effective_recommendation_types",
    title: "Most effective recommendation types",
    summary: `${formatReason(strongestReason[0])} recommendations are working best so far.`,
    evidence: [
      `${strongestReason[1]} completed action${
        strongestReason[1] === 1 ? "" : "s"
      } in this recommendation type.`,
      `${feedback.highlyEffectiveRecommendations.length} highly effective recommendation${
        feedback.highlyEffectiveRecommendations.length === 1 ? "" : "s"
      } detected.`
    ]
  };
}

function getEnergyStabilityTrendTrait(
  contexts: ContextSnapshot[],
  insights: PatternInsight[]
): PersonalOperatingProfileTrait {
  const energyInsight = insights.find((insight) => insight.type === "energy_focus");

  if (contexts.length < 2) {
    return {
      type: "energy_stability_trends",
      title: "Energy stability trends",
      summary: "More context snapshots are needed to see an energy trend.",
      evidence: [energyInsight?.summary ?? "No energy insight is available yet."]
    };
  }

  const midpoint = Math.ceil(contexts.length / 2);
  const earlierAverage = average(contexts.slice(0, midpoint).map((context) => context.energyLevel));
  const recentAverage = average(contexts.slice(midpoint).map((context) => context.energyLevel));
  const difference = recentAverage - earlierAverage;

  return {
    type: "energy_stability_trends",
    title: "Energy stability trends",
    summary: getEnergyTrendSummary(difference),
    evidence: [
      `Earlier average energy was ${earlierAverage.toFixed(1)} out of 10.`,
      `Recent average energy was ${recentAverage.toFixed(1)} out of 10.`,
      energyInsight?.summary ?? "No energy insight is available yet."
    ]
  };
}

function scoreFocusPeriods(contexts: ContextSnapshot[]): FocusPeriodScore[] {
  const grouped = new Map<DayPeriod, number[]>();

  for (const context of contexts) {
    const period = getDayPeriod(context.capturedAt);
    grouped.set(period, [...(grouped.get(period) ?? []), context.focusLevel]);
  }

  return Array.from(grouped.entries())
    .map(([period, focusLevels]) => ({
      period,
      averageFocus: average(focusLevels),
      snapshotCount: focusLevels.length
    }))
    .sort(
      (left, right) =>
        right.averageFocus - left.averageFocus ||
        right.snapshotCount - left.snapshotCount ||
        left.period.localeCompare(right.period)
    );
}

function getDayPeriod(date: Date): DayPeriod {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }

  if (hour >= 17 && hour < 22) {
    return "evening";
  }

  return "night";
}

function isStressContext(context: ContextSnapshot): boolean {
  const mood = context.mood.toLowerCase();

  return ["stressed", "anxious", "overwhelmed", "tense"].some((word) =>
    mood.includes(word)
  );
}

function getEnergyTrendSummary(difference: number): string {
  if (difference >= 1) {
    return "Recent energy is trending higher than earlier snapshots.";
  }

  if (difference <= -1) {
    return "Recent energy is trending lower than earlier snapshots.";
  }

  return "Energy is relatively stable across recent snapshots.";
}

function formatReason(reason: string): string {
  return reason.replaceAll("_", " ");
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}
