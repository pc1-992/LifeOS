import type {
  ConsolidatedMemory,
  ConsolidationCandidate,
  ConsolidationReason,
  ConsolidationReport,
  PatternInsight,
  RecommendationFeedback,
  StableTruth,
  StructuredMemoryItem,
  StructuredMemoryLayer,
  StructuredMemoryLayerName
} from "@lifeos/core";
import type {
  ActionHistoryRepository,
  ContextRepository,
  MemoryRepository
} from "./ports.js";
import { GeneratePatternInsightsUseCase } from "./generate-pattern-insights.js";
import { RecommendationFeedbackUseCase } from "./recommendation-feedback.js";
import {
  GenerateEpisodicMemoryUseCase,
  GenerateIdentityMemoryUseCase,
  GenerateProceduralMemoryUseCase,
  GenerateSemanticMemoryUseCase
} from "./structured-memory.js";

interface CandidateDraft {
  summary: string;
  reason: ConsolidationReason;
  confidenceScore: number;
  evidenceCount: number;
  sourceMemoryIds: string[];
  sourceLayers: StructuredMemoryLayerName[];
  explanation: string;
}

export class GenerateMemoryConsolidationUseCase {
  private readonly episodicMemory: GenerateEpisodicMemoryUseCase;
  private readonly semanticMemory: GenerateSemanticMemoryUseCase;
  private readonly identityMemory: GenerateIdentityMemoryUseCase;
  private readonly proceduralMemory: GenerateProceduralMemoryUseCase;
  private readonly generatePatternInsights: GeneratePatternInsightsUseCase;
  private readonly recommendationFeedback: RecommendationFeedbackUseCase;

  constructor(
    memories: MemoryRepository,
    contexts: ContextRepository,
    actionHistory: ActionHistoryRepository
  ) {
    this.episodicMemory = new GenerateEpisodicMemoryUseCase(
      memories,
      contexts,
      actionHistory
    );
    this.semanticMemory = new GenerateSemanticMemoryUseCase(
      memories,
      contexts,
      actionHistory
    );
    this.identityMemory = new GenerateIdentityMemoryUseCase(
      memories,
      contexts,
      actionHistory
    );
    this.proceduralMemory = new GenerateProceduralMemoryUseCase(
      contexts,
      actionHistory
    );
    this.generatePatternInsights = new GeneratePatternInsightsUseCase(
      memories,
      contexts
    );
    this.recommendationFeedback = new RecommendationFeedbackUseCase(
      actionHistory
    );
  }

  async execute(): Promise<ConsolidationReport> {
    const [
      episodic,
      semantic,
      identity,
      procedural,
      patternInsights,
      feedback
    ] = await Promise.all([
      this.episodicMemory.execute(),
      this.semanticMemory.execute(),
      this.identityMemory.execute(),
      this.proceduralMemory.execute(),
      this.generatePatternInsights.execute(),
      this.recommendationFeedback.execute()
    ]);
    const layers = [episodic, semantic, identity, procedural];
    const candidates = toCandidates([
      ...getRepeatedSuccessfulBehaviorCandidates(feedback, layers),
      ...getRecurringRecommendationSuccessCandidates(feedback, layers),
      ...getRecurringEmotionalPatternCandidates(patternInsights, layers),
      ...getRecurringFocusPatternCandidates(patternInsights, layers),
      ...getRecurringEnergyPatternCandidates(patternInsights, layers)
    ]);
    const stableTruths = candidates
      .filter((candidate) => candidate.confidenceScore >= 0.6)
      .map(toStableTruth);
    const generatedAt = new Date();

    return {
      generatedAt,
      totalCandidates: candidates.length,
      candidates,
      stableTruths,
      consolidatedMemories: stableTruths.map((truth) => ({
        id: `consolidated_${truth.id}`,
        stableTruth: truth,
        generatedAt
      }))
    };
  }
}

function getRepeatedSuccessfulBehaviorCandidates(
  feedback: RecommendationFeedback,
  layers: StructuredMemoryLayer[]
): CandidateDraft[] {
  return feedback.mostSuccessfulRoutines
    .filter((routine) => routine.completedCount > 0)
    .map((routine) => {
      const sources = findSources(layers, routine.routineName);

      return {
        summary: `${routine.routineName} is a reliable routine when similar conditions appear.`,
        reason: "repeated_successful_behavior",
        confidenceScore: clampConfidence(
          0.52 + routine.completionRate * 0.3 + routine.completedCount * 0.04
        ),
        evidenceCount: routine.completedCount + routine.skippedCount,
        sourceMemoryIds: sources.map((source) => source.item.id),
        sourceLayers: getSourceLayers(sources),
        explanation: `This routine has a ${Math.round(
          routine.completionRate * 100
        )}% completion rate across ${routine.completedCount + routine.skippedCount} action record${
          routine.completedCount + routine.skippedCount === 1 ? "" : "s"
        }.`
      };
    });
}

function getRecurringRecommendationSuccessCandidates(
  feedback: RecommendationFeedback,
  layers: StructuredMemoryLayer[]
): CandidateDraft[] {
  return feedback.highlyEffectiveRecommendations.map((recommendation) => {
    const sources = findSources(layers, recommendation.action);
    const statement = getRecommendationSuccessStatement(
      recommendation.title,
      recommendation.action
    );

    return {
      summary: statement,
      reason: "recurring_recommendation_success",
      confidenceScore: clampConfidence(
        0.5 +
          recommendation.completionRate * 0.25 +
          recommendation.completedCount * 0.04 +
          (recommendation.averageEffectivenessScore ?? 0) * 0.04
      ),
      evidenceCount: recommendation.totalCount,
      sourceMemoryIds: sources.map((source) => source.item.id),
      sourceLayers: getSourceLayers(sources),
      explanation: `This recommendation completed ${recommendation.completedCount} time${
        recommendation.completedCount === 1 ? "" : "s"
      } with a score of ${recommendation.score.toFixed(1)}.`
    };
  });
}

function getRecurringEmotionalPatternCandidates(
  insights: PatternInsight[],
  layers: StructuredMemoryLayer[]
): CandidateDraft[] {
  const moodInsight = insights.find((insight) => insight.type === "mood_frequency");

  if (moodInsight === undefined || moodInsight.summary.includes("not appeared")) {
    return [];
  }

  const sources = findSources(layers, "stress");
  const evidenceCount = getFirstNumber(moodInsight.summary) ?? 1;

  return [
    {
      summary: "Stress is a recurring emotional pattern in current context history.",
      reason: "recurring_emotional_pattern",
      confidenceScore: clampConfidence(0.55 + evidenceCount * 0.06),
      evidenceCount,
      sourceMemoryIds: sources.map((source) => source.item.id),
      sourceLayers: getSourceLayers(sources),
      explanation: moodInsight.summary
    }
  ];
}

function getRecurringFocusPatternCandidates(
  insights: PatternInsight[],
  layers: StructuredMemoryLayer[]
): CandidateDraft[] {
  const energyFocusInsight = insights.find(
    (insight) => insight.type === "energy_focus"
  );
  const focusSources = [
    ...findSources(layers, "focus"),
    ...findSources(layers, "strongest focus")
  ];

  if (
    energyFocusInsight === undefined ||
    energyFocusInsight.summary.includes("No low-energy pattern")
  ) {
    return focusSources.length === 0
      ? []
      : [
          {
            summary: "Focus has an emerging stable period pattern.",
            reason: "recurring_focus_pattern",
            confidenceScore: 0.62,
            evidenceCount: focusSources.length,
            sourceMemoryIds: focusSources.map((source) => source.item.id),
            sourceLayers: getSourceLayers(focusSources),
            explanation:
              "Identity memory contains a strongest-focus trait from context history."
          }
        ];
  }

  return [
    {
      summary: "Focus and energy tend to move together during low-energy periods.",
      reason: "recurring_focus_pattern",
      confidenceScore: 0.68,
      evidenceCount: getNumberSum(energyFocusInsight.summary) || 1,
      sourceMemoryIds: focusSources.map((source) => source.item.id),
      sourceLayers: getSourceLayers(focusSources),
      explanation: energyFocusInsight.summary
    }
  ];
}

function getRecurringEnergyPatternCandidates(
  insights: PatternInsight[],
  layers: StructuredMemoryLayer[]
): CandidateDraft[] {
  const energySources = [
    ...findSources(layers, "energy"),
    ...findSources(layers, "energy stability")
  ];
  const energyInsight = insights.find((insight) => insight.type === "energy_focus");

  if (energySources.length === 0) {
    return [];
  }

  return [
    {
      summary: getEnergyStableTruth(energySources),
      reason: "recurring_energy_pattern",
      confidenceScore: clampConfidence(0.58 + Math.min(energySources.length, 5) * 0.04),
      evidenceCount: Math.max(energySources.length, 1),
      sourceMemoryIds: energySources.map((source) => source.item.id),
      sourceLayers: getSourceLayers(energySources),
      explanation:
        energyInsight?.summary ??
        "Energy-related identity and semantic memory items were present."
    }
  ];
}

function toCandidates(drafts: CandidateDraft[]): ConsolidationCandidate[] {
  return drafts.map((draft, index) => ({
    id: `consolidation_candidate_${index + 1}`,
    summary: draft.summary,
    reason: draft.reason,
    confidenceScore: draft.confidenceScore,
    evidenceCount: draft.evidenceCount,
    sourceMemoryIds: draft.sourceMemoryIds,
    sourceLayers: draft.sourceLayers,
    explanation: draft.explanation
  }));
}

function toStableTruth(candidate: ConsolidationCandidate): StableTruth {
  return {
    id: `stable_truth_${candidate.id}`,
    statement: candidate.summary,
    reason: candidate.reason,
    confidenceScore: candidate.confidenceScore,
    evidenceCount: candidate.evidenceCount,
    sourceMemoryIds: candidate.sourceMemoryIds,
    sourceLayers: candidate.sourceLayers,
    explanation: candidate.explanation
  };
}

function findSources(
  layers: StructuredMemoryLayer[],
  keyword: string
): Array<{ item: StructuredMemoryItem; layer: StructuredMemoryLayerName }> {
  const normalizedKeyword = normalize(keyword);

  return layers.flatMap((layer) =>
    layer.items
      .filter((item) =>
        normalize(`${item.title} ${item.summary} ${item.why}`).includes(
          normalizedKeyword
        )
      )
      .map((item) => ({ item, layer: layer.layer }))
  );
}

function getSourceLayers(
  sources: Array<{ layer: StructuredMemoryLayerName }>
): StructuredMemoryLayerName[] {
  return [...new Set(sources.map((source) => source.layer))];
}

function getRecommendationSuccessStatement(
  title: string,
  action: string
): string {
  const normalizedAction = normalize(action);

  if (
    normalizedAction.includes("recover") ||
    normalizedAction.includes("pause") ||
    normalizedAction.includes("slow") ||
    normalizedAction.includes("reduce")
  ) {
    return "Short recovery actions have high success rates.";
  }

  return `Recommendations like "${title}" tend to work well.`;
}

function getEnergyStableTruth(
  sources: Array<{ item: StructuredMemoryItem }>
): string {
  const combined = normalize(
    sources.map((source) => source.item.summary).join(" ")
  );

  if (combined.includes("stress") && combined.includes("lower")) {
    return "Energy tends to drop after stress periods.";
  }

  if (combined.includes("trending higher")) {
    return "Energy can recover when recent conditions improve.";
  }

  return "Energy patterns are stable enough to track over time.";
}

function getFirstNumber(value: string): number | null {
  const match = value.match(/\d+/);

  return match === null ? null : Number(match[0]);
}

function getNumberSum(value: string): number {
  const matches = value.match(/\d+/g) ?? [];

  return matches.reduce((total, match) => total + Number(match), 0);
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}
