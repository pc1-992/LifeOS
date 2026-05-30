import type {
  ActionHistoryEntry,
  ContextSnapshot,
  KnowledgeGraph,
  PatternInsight,
  PersonalOperatingProfile,
  RecommendationFeedback,
  StableTruth,
  TemporalForecast,
  TemporalForecastDirection,
  TemporalInsight,
  TemporalMetric,
  TemporalReport,
  TemporalRisk,
  TemporalRiskLevel,
  TemporalSignal,
  TemporalTimeWindow,
  TemporalTrend,
  TemporalTrendDirection
} from "@lifeos/core";
import type {
  ActionHistoryRepository,
  ContextRepository,
  MemoryRepository
} from "./ports.js";
import { BuildKnowledgeGraphUseCase } from "./build-knowledge-graph.js";
import { GenerateMemoryConsolidationUseCase } from "./generate-memory-consolidation.js";
import { GeneratePatternInsightsUseCase } from "./generate-pattern-insights.js";
import { GeneratePersonalOperatingProfileUseCase } from "./generate-personal-operating-profile.js";
import { RecommendationFeedbackUseCase } from "./recommendation-feedback.js";

type ForecastMetric = Exclude<TemporalMetric, "action_completion">;

interface TrendInput {
  contexts: ContextSnapshot[];
  actions: ActionHistoryEntry[];
  insights: PatternInsight[];
  feedback: RecommendationFeedback;
  stableTruths: StableTruth[];
  profile: PersonalOperatingProfile;
  graph: KnowledgeGraph;
  timeWindow: TemporalTimeWindow;
}

interface SplitScore {
  earlierValue: number | null;
  recentValue: number | null;
  earlierCount: number;
  recentCount: number;
}

export class GenerateTemporalIntelligenceUseCase {
  private readonly patternInsights: GeneratePatternInsightsUseCase;
  private readonly recommendationFeedback: RecommendationFeedbackUseCase;
  private readonly memoryConsolidation: GenerateMemoryConsolidationUseCase;
  private readonly operatingProfile: GeneratePersonalOperatingProfileUseCase;
  private readonly knowledgeGraph: BuildKnowledgeGraphUseCase;

  constructor(
    private readonly memories: MemoryRepository,
    private readonly contexts: ContextRepository,
    private readonly actionHistory: ActionHistoryRepository
  ) {
    this.patternInsights = new GeneratePatternInsightsUseCase(memories, contexts);
    this.recommendationFeedback = new RecommendationFeedbackUseCase(actionHistory);
    this.memoryConsolidation = new GenerateMemoryConsolidationUseCase(
      memories,
      contexts,
      actionHistory
    );
    this.operatingProfile = new GeneratePersonalOperatingProfileUseCase(
      memories,
      contexts,
      actionHistory
    );
    this.knowledgeGraph = new BuildKnowledgeGraphUseCase(
      memories,
      contexts,
      actionHistory
    );
  }

  async execute(): Promise<TemporalReport> {
    const [
      contexts,
      actions,
      insights,
      feedback,
      consolidation,
      profile,
      graph
    ] = await Promise.all([
      this.contexts.findAll(),
      this.actionHistory.findAll(),
      this.patternInsights.execute(),
      this.recommendationFeedback.execute(),
      this.memoryConsolidation.execute(),
      this.operatingProfile.execute(),
      this.knowledgeGraph.execute()
    ]);
    const sortedContexts = sortByDate(contexts, (context) => context.capturedAt);
    const sortedActions = sortByDate(actions, (action) => action.timestamp);
    const timeWindow = getTimeWindow(sortedContexts, sortedActions);
    const input: TrendInput = {
      contexts: sortedContexts,
      actions: sortedActions,
      insights,
      feedback,
      stableTruths: consolidation.stableTruths,
      profile,
      graph,
      timeWindow
    };
    const supportingEvidence = buildSignals(input);
    const trends = buildTrends(input, supportingEvidence);
    const forecasts = buildForecasts(trends, supportingEvidence, timeWindow);
    const risks = buildRisks(input, trends, supportingEvidence);
    const insightsList = buildInsights(trends, forecasts, risks);

    return {
      generatedAt: new Date(),
      timeWindowAnalyzed: timeWindow,
      signalCount: supportingEvidence.length,
      trends,
      forecasts,
      risks,
      insights: insightsList,
      supportingEvidence: supportingEvidence.slice(0, 12),
      summary: summarizeReport(trends, risks)
    };
  }

  async report(): Promise<TemporalReport> {
    return this.execute();
  }
}

function buildTrends(
  input: TrendInput,
  signals: TemporalSignal[]
): TemporalTrend[] {
  return [
    makeNumericTrend(
      "energy",
      "energy",
      splitContexts(input.contexts, (context) => context.energyLevel),
      input.timeWindow,
      signals.filter((signal) => signal.id.startsWith("temporal_context_"))
    ),
    makeNumericTrend(
      "focus",
      "focus",
      splitContexts(input.contexts, (context) => context.focusLevel),
      input.timeWindow,
      signals.filter((signal) => signal.id.startsWith("temporal_context_"))
    ),
    makeStressTrend(
      splitContexts(input.contexts, getStressScore),
      input.timeWindow,
      signals.filter((signal) => signal.id.startsWith("temporal_context_"))
    ),
    makeRateTrend(
      "routine_effectiveness",
      splitActions(input.actions, getRoutineEffectivenessScore),
      input.timeWindow,
      [
        ...signals.filter((signal) => signal.id.startsWith("temporal_action_")),
        ...signals.filter(
          (signal) => signal.type === "recommendation_feedback"
        )
      ]
    ),
    makeRateTrend(
      "action_completion",
      splitActions(input.actions, (action) =>
        action.status === "completed" ? 1 : 0
      ),
      input.timeWindow,
      signals.filter((signal) => signal.id.startsWith("temporal_action_"))
    )
  ];
}

function makeNumericTrend(
  id: string,
  metric: Extract<TemporalMetric, "energy" | "focus">,
  score: SplitScore,
  timeWindow: TemporalTimeWindow,
  sourceSignals: TemporalSignal[]
): TemporalTrend {
  const difference = getDifference(score);
  const direction = getChangeDirection(difference, 0.75);

  return {
    id: `temporal_trend_${id}`,
    metric,
    direction,
    earlierValue: score.earlierValue,
    recentValue: score.recentValue,
    explanation: explainNumericTrend(metric, direction, score),
    evidenceCount: score.earlierCount + score.recentCount,
    confidenceScore: getTrendConfidence(score, difference),
    timeWindowAnalyzed: timeWindow,
    sourceSignals: sourceSignals.slice(-6)
  };
}

function makeStressTrend(
  score: SplitScore,
  timeWindow: TemporalTimeWindow,
  sourceSignals: TemporalSignal[]
): TemporalTrend {
  const difference = getDifference(score);
  const direction =
    difference === null
      ? "stable"
      : difference >= 0.2
        ? "increasing"
        : difference <= -0.2
          ? "decreasing"
          : "stable";

  return {
    id: "temporal_trend_stress",
    metric: "stress",
    direction,
    earlierValue: score.earlierValue,
    recentValue: score.recentValue,
    explanation: explainStressTrend(direction, score),
    evidenceCount: score.earlierCount + score.recentCount,
    confidenceScore: getTrendConfidence(score, difference),
    timeWindowAnalyzed: timeWindow,
    sourceSignals: sourceSignals.slice(-6)
  };
}

function makeRateTrend(
  metric: Extract<
    TemporalMetric,
    "routine_effectiveness" | "action_completion"
  >,
  score: SplitScore,
  timeWindow: TemporalTimeWindow,
  sourceSignals: TemporalSignal[]
): TemporalTrend {
  const difference = getDifference(score);
  const direction = getChangeDirection(difference, 0.15);

  return {
    id: `temporal_trend_${metric}`,
    metric,
    direction,
    earlierValue: score.earlierValue,
    recentValue: score.recentValue,
    explanation: explainRateTrend(metric, direction, score),
    evidenceCount: score.earlierCount + score.recentCount,
    confidenceScore: getTrendConfidence(score, difference),
    timeWindowAnalyzed: timeWindow,
    sourceSignals: sourceSignals.slice(-6)
  };
}

function buildForecasts(
  trends: TemporalTrend[],
  signals: TemporalSignal[],
  timeWindow: TemporalTimeWindow
): TemporalForecast[] {
  return trends
    .filter((trend): trend is TemporalTrend & { metric: ForecastMetric } =>
      trend.metric !== "action_completion"
    )
    .map((trend) => ({
      id: `temporal_forecast_${trend.metric}`,
      metric: trend.metric,
      direction: toForecastDirection(trend.metric, trend.direction),
      explanation: `The forecast follows the deterministic ${formatMetric(
        trend.metric
      )} trend from the analyzed window.`,
      evidenceCount: trend.evidenceCount,
      confidenceScore: clampConfidence(trend.confidenceScore - 0.06),
      timeWindowAnalyzed: timeWindow,
      sourceSignals: mergeSignals(trend.sourceSignals, signals).slice(0, 6)
    }));
}

function buildRisks(
  input: TrendInput,
  trends: TemporalTrend[],
  signals: TemporalSignal[]
): TemporalRisk[] {
  const energy = findTrend(trends, "energy");
  const focus = findTrend(trends, "focus");
  const stress = findTrend(trends, "stress");
  const routine = findTrend(trends, "routine_effectiveness");
  const actions = findTrend(trends, "action_completion");
  const stressEvidence = input.contexts.filter((context) => getStressScore(context) > 0);
  const recentCompletion = actions?.recentValue ?? null;

  return [
    makeRisk({
      type: "burnout",
      level:
        stress?.direction === "increasing" &&
        energy?.direction === "declining" &&
        focus?.direction === "declining"
          ? "high"
          : stressEvidence.length >= 2 && (energy?.recentValue ?? 10) <= 4
            ? "moderate"
            : "low",
      explanation:
        "Burnout risk is based on stress movement together with recent energy and focus.",
      evidenceCount: stressEvidence.length + (energy?.evidenceCount ?? 0),
      timeWindow: input.timeWindow,
      signals: signals.filter(isStressOrEnergySignal)
    }),
    makeRisk({
      type: "overload",
      level:
        stress?.direction === "increasing" ||
        hasOverloadLanguage(input, signals)
          ? "moderate"
          : "low",
      explanation:
        "Overload risk rises when stress language or skipped recovery signals repeat.",
      evidenceCount:
        stressEvidence.length +
        input.feedback.frequentlySkippedRecommendations.length +
        countMatchingSignals(signals, ["overload", "overwhelmed", "stress"]),
      timeWindow: input.timeWindow,
      signals: signals.filter(isStressSignal)
    }),
    makeRisk({
      type: "inconsistency",
      level:
        actions?.direction === "declining" || (recentCompletion !== null && recentCompletion < 0.5)
          ? "moderate"
          : "low",
      explanation:
        "Inconsistency risk is based on completion-rate movement across action history.",
      evidenceCount: actions?.evidenceCount ?? input.actions.length,
      timeWindow: input.timeWindow,
      signals: signals.filter((signal) => signal.type === "action_history")
    }),
    makeRisk({
      type: "stagnation",
      level:
        routine?.direction === "declining" &&
        energy?.direction !== "improving" &&
        focus?.direction !== "improving"
          ? "moderate"
          : "low",
      explanation:
        "Stagnation risk appears when routine effectiveness weakens without improving energy or focus.",
      evidenceCount:
        (routine?.evidenceCount ?? 0) +
        input.stableTruths.length +
        input.profile.traits.length,
      timeWindow: input.timeWindow,
      signals: signals.filter(
        (signal) =>
          signal.type === "action_history" ||
          signal.type === "stable_truth" ||
          signal.type === "personal_operating_profile"
      )
    })
  ];
}

function makeRisk(input: {
  type: TemporalRisk["type"];
  level: TemporalRiskLevel;
  explanation: string;
  evidenceCount: number;
  timeWindow: TemporalTimeWindow;
  signals: TemporalSignal[];
}): TemporalRisk {
  return {
    id: `temporal_risk_${input.type}`,
    type: input.type,
    level: input.level,
    explanation: input.explanation,
    evidenceCount: input.evidenceCount,
    confidenceScore: clampConfidence(0.48 + Math.min(input.evidenceCount, 10) * 0.04),
    timeWindowAnalyzed: input.timeWindow,
    sourceSignals: input.signals.slice(-6)
  };
}

function buildInsights(
  trends: TemporalTrend[],
  forecasts: TemporalForecast[],
  risks: TemporalRisk[]
): TemporalInsight[] {
  return [
    ...trends.map((trend) => ({
      id: `temporal_insight_${trend.id}`,
      type: "trend" as const,
      title: `${formatMetric(trend.metric)} trend`,
      explanation: trend.explanation,
      evidenceCount: trend.evidenceCount,
      confidenceScore: trend.confidenceScore,
      timeWindowAnalyzed: trend.timeWindowAnalyzed,
      sourceSignals: trend.sourceSignals
    })),
    ...forecasts.map((forecast) => ({
      id: `temporal_insight_${forecast.id}`,
      type: "forecast" as const,
      title: `${formatMetric(forecast.metric)} forecast`,
      explanation: forecast.explanation,
      evidenceCount: forecast.evidenceCount,
      confidenceScore: forecast.confidenceScore,
      timeWindowAnalyzed: forecast.timeWindowAnalyzed,
      sourceSignals: forecast.sourceSignals
    })),
    ...risks.map((risk) => ({
      id: `temporal_insight_${risk.id}`,
      type: "risk" as const,
      title: `${formatRisk(risk.type)} risk`,
      explanation: risk.explanation,
      evidenceCount: risk.evidenceCount,
      confidenceScore: risk.confidenceScore,
      timeWindowAnalyzed: risk.timeWindowAnalyzed,
      sourceSignals: risk.sourceSignals
    }))
  ];
}

function buildSignals(input: TrendInput): TemporalSignal[] {
  return [
    ...input.contexts.map((context) => ({
      id: `temporal_context_${context.id}`,
      type: "context_history" as const,
      sourceId: context.id,
      recordedAt: context.capturedAt,
      label: "Context snapshot",
      summary: context.summary,
      value: (context.energyLevel + context.focusLevel) / 2
    })),
    ...input.actions.map((action) => ({
      id: `temporal_action_${action.id}`,
      type: "action_history" as const,
      sourceId: action.id,
      recordedAt: action.timestamp,
      label: `Action ${action.status}`,
      summary: action.suggestedAction.action,
      value: action.status === "completed" ? 1 : 0
    })),
    ...input.insights.map((insight) => ({
      id: `temporal_pattern_${insight.id}`,
      type: "pattern_insight" as const,
      sourceId: insight.id,
      recordedAt: null,
      label: insight.title,
      summary: insight.summary
    })),
    ...input.feedback.highlyEffectiveRecommendations.map((recommendation) => ({
      id: `temporal_feedback_${recommendation.recommendationKey}`,
      type: "recommendation_feedback" as const,
      sourceId: recommendation.recommendationKey,
      recordedAt: input.feedback.generatedAt,
      label: recommendation.title,
      summary: recommendation.action,
      value: recommendation.completionRate
    })),
    ...input.stableTruths.map((truth) => ({
      id: `temporal_truth_${truth.id}`,
      type: "stable_truth" as const,
      sourceId: truth.id,
      recordedAt: null,
      label: "Stable truth",
      summary: truth.statement,
      value: truth.confidenceScore
    })),
    ...input.profile.traits.map((trait) => ({
      id: `temporal_profile_${trait.type}`,
      type: "personal_operating_profile" as const,
      sourceId: trait.type,
      recordedAt: input.profile.generatedAt,
      label: trait.title,
      summary: trait.summary
    })),
    ...input.graph.edges.slice(0, 12).map((edge) => ({
      id: `temporal_graph_${edge.id}`,
      type: "knowledge_graph" as const,
      sourceId: edge.id,
      recordedAt: input.graph.generatedAt,
      label: edge.type,
      summary: edge.explanation,
      value: edge.confidenceScore
    }))
  ];
}

function splitContexts(
  contexts: ContextSnapshot[],
  getValue: (context: ContextSnapshot) => number
): SplitScore {
  return splitValues(contexts.map(getValue));
}

function splitActions(
  actions: ActionHistoryEntry[],
  getValue: (action: ActionHistoryEntry) => number
): SplitScore {
  return splitValues(actions.map(getValue));
}

function splitValues(values: number[]): SplitScore {
  if (values.length === 0) {
    return {
      earlierValue: null,
      recentValue: null,
      earlierCount: 0,
      recentCount: 0
    };
  }

  if (values.length === 1) {
    return {
      earlierValue: values[0],
      recentValue: values[0],
      earlierCount: 0,
      recentCount: 1
    };
  }

  const midpoint = Math.ceil(values.length / 2);
  const earlier = values.slice(0, midpoint);
  const recent = values.slice(midpoint);

  return {
    earlierValue: average(earlier),
    recentValue: average(recent),
    earlierCount: earlier.length,
    recentCount: recent.length
  };
}

function getStressScore(context: ContextSnapshot): number {
  const text = normalize(`${context.mood} ${context.currentSituation}`);
  const stressWords = ["stress", "stressed", "anxious", "overwhelmed", "tense", "overload"];

  return stressWords.some((word) => text.includes(word)) ? 1 : 0;
}

function getRoutineEffectivenessScore(action: ActionHistoryEntry): number {
  if (action.effectivenessScore !== undefined) {
    return action.effectivenessScore / 5;
  }

  return action.status === "completed" ? 1 : 0;
}

function getChangeDirection(
  difference: number | null,
  threshold: number
): Extract<TemporalTrendDirection, "improving" | "declining" | "stable"> {
  if (difference === null || Math.abs(difference) < threshold) {
    return "stable";
  }

  return difference > 0 ? "improving" : "declining";
}

function toForecastDirection(
  metric: ForecastMetric,
  direction: TemporalTrendDirection
): TemporalForecastDirection {
  if (metric === "stress") {
    if (direction === "increasing") {
      return "likely_increasing";
    }

    if (direction === "decreasing") {
      return "likely_decreasing";
    }

    return "likely_stable";
  }

  if (direction === "improving") {
    return "likely_improving";
  }

  if (direction === "declining") {
    return "likely_declining";
  }

  return "likely_stable";
}

function getTrendConfidence(score: SplitScore, difference: number | null): number {
  const evidenceCount = score.earlierCount + score.recentCount;
  const movement = difference === null ? 0 : Math.min(Math.abs(difference), 2) * 0.08;

  return clampConfidence(0.42 + Math.min(evidenceCount, 10) * 0.04 + movement);
}

function getDifference(score: SplitScore): number | null {
  if (score.earlierValue === null || score.recentValue === null) {
    return null;
  }

  return score.recentValue - score.earlierValue;
}

function explainNumericTrend(
  metric: "energy" | "focus",
  direction: TemporalTrendDirection,
  score: SplitScore
): string {
  if (score.earlierValue === null || score.recentValue === null) {
    return `No ${metric} history is available yet.`;
  }

  return `${formatMetric(metric)} is ${direction}; earlier average was ${score.earlierValue.toFixed(
    1
  )}, recent average was ${score.recentValue.toFixed(1)}.`;
}

function explainStressTrend(
  direction: TemporalTrendDirection,
  score: SplitScore
): string {
  if (score.earlierValue === null || score.recentValue === null) {
    return "No stress history is available yet.";
  }

  return `Stress is ${direction}; earlier stress signal rate was ${formatRatio(
    score.earlierValue
  )}, recent rate was ${formatRatio(score.recentValue)}.`;
}

function explainRateTrend(
  metric: "routine_effectiveness" | "action_completion",
  direction: TemporalTrendDirection,
  score: SplitScore
): string {
  if (score.earlierValue === null || score.recentValue === null) {
    return `No ${formatMetric(metric)} history is available yet.`;
  }

  return `${formatMetric(metric)} is ${direction}; earlier rate was ${formatRatio(
    score.earlierValue
  )}, recent rate was ${formatRatio(score.recentValue)}.`;
}

function getTimeWindow(
  contexts: ContextSnapshot[],
  actions: ActionHistoryEntry[]
): TemporalTimeWindow {
  const dates = [
    ...contexts.map((context) => context.capturedAt),
    ...actions.map((action) => action.timestamp)
  ].sort((left, right) => left.getTime() - right.getTime());
  const startedAt = dates[0] ?? null;
  const endedAt = dates[dates.length - 1] ?? null;

  return {
    startedAt,
    endedAt,
    label:
      startedAt === null || endedAt === null
        ? "No history captured yet"
        : `${startedAt.toISOString()} to ${endedAt.toISOString()}`
  };
}

function summarizeReport(trends: TemporalTrend[], risks: TemporalRisk[]): string {
  const highOrModerateRisks = risks.filter((risk) => risk.level !== "low");
  const movingTrends = trends.filter((trend) => trend.direction !== "stable");

  if (movingTrends.length === 0 && highOrModerateRisks.length === 0) {
    return "Temporal signals are stable or still emerging.";
  }

  return `${movingTrends.length} moving trend${
    movingTrends.length === 1 ? "" : "s"
  } and ${highOrModerateRisks.length} elevated risk${
    highOrModerateRisks.length === 1 ? "" : "s"
  } detected.`;
}

function hasOverloadLanguage(input: TrendInput, signals: TemporalSignal[]): boolean {
  return (
    input.feedback.frequentlySkippedRecommendations.length >= 2 ||
    countMatchingSignals(signals, ["overload", "overwhelmed"]) > 0
  );
}

function countMatchingSignals(signals: TemporalSignal[], words: string[]): number {
  return signals.filter((signal) =>
    words.some((word) => normalize(signal.summary).includes(word))
  ).length;
}

function isStressOrEnergySignal(signal: TemporalSignal): boolean {
  const summary = normalize(`${signal.label} ${signal.summary}`);

  return (
    signal.type === "context_history" ||
    summary.includes("stress") ||
    summary.includes("energy") ||
    summary.includes("focus")
  );
}

function isStressSignal(signal: TemporalSignal): boolean {
  const summary = normalize(`${signal.label} ${signal.summary}`);

  return (
    summary.includes("stress") ||
    summary.includes("anxious") ||
    summary.includes("overwhelm") ||
    summary.includes("overload")
  );
}

function findTrend(
  trends: TemporalTrend[],
  metric: TemporalMetric
): TemporalTrend | undefined {
  return trends.find((trend) => trend.metric === metric);
}

function mergeSignals(
  left: TemporalSignal[],
  right: TemporalSignal[]
): TemporalSignal[] {
  return [...new Map([...left, ...right].map((signal) => [signal.id, signal])).values()];
}

function sortByDate<T>(items: T[], getDate: (item: T) => Date): T[] {
  return [...items].sort((left, right) => getDate(left).getTime() - getDate(right).getTime());
}

function formatMetric(metric: TemporalMetric): string {
  return metric.replaceAll("_", " ");
}

function formatRisk(type: TemporalRisk["type"]): string {
  return type.replaceAll("_", " ");
}

function formatRatio(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}
