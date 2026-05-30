import type {
  RetrievalQuery,
  RetrievalReason,
  RetrievalResult,
  StructuredMemoryItem,
  StructuredMemoryLayer,
  StructuredMemoryLayerName
} from "@lifeos/core";
import type {
  ActionHistoryRepository,
  ContextRepository,
  MemoryRepository
} from "./ports.js";
import { MemoryLayerProvider } from "./memory-layer-provider.js";

interface ScoreDraft {
  value: number;
  reasons: RetrievalReason[];
  matchingSignals: string[];
}

const emotionKeywords = ["stress", "stressed", "anxious", "overwhelmed", "tense"];
const routineKeywords = ["routine", "recovery", "calming", "focus", "steady"];
const recommendationKeywords = [
  "recommendation",
  "next",
  "step",
  "action",
  "recovery",
  "momentum",
  "stress",
  "focus",
  "energy"
];

export class RetrieveRelevantMemoriesUseCase {
  private readonly memoryLayers: MemoryLayerProvider;

  constructor(
    memories: MemoryRepository,
    contexts: ContextRepository,
    actionHistory: ActionHistoryRepository
  ) {
    this.memoryLayers = new MemoryLayerProvider(memories, contexts, actionHistory);
  }

  async execute(input?: Partial<RetrievalQuery>): Promise<RetrievalResult[]> {
    const query = normalizeQuery(input?.query ?? "");
    const queryTerms = getQueryTerms(query);
    const contextKeywords = input?.currentContextKeywords ?? [];
    const layers = await this.memoryLayers.getAllLayers();

    return layers
      .flatMap((layer) =>
        layer.items.map((item) => toRetrievalResult(item, layer, queryTerms, contextKeywords))
      )
      .filter((result) => result.relevance.value > 0)
      .sort(sortResults)
      .slice(0, 8);
  }
}

function toRetrievalResult(
  item: StructuredMemoryItem,
  layer: StructuredMemoryLayer,
  queryTerms: string[],
  contextKeywords: string[]
): RetrievalResult {
  const draft = scoreItem(item, layer.layer, queryTerms, contextKeywords);

  return {
    item,
    layer: layer.layer,
    relevance: {
      value: draft.value,
      reasons: draft.reasons,
      matchingSignals: draft.matchingSignals,
      explanation: explainScore(draft)
    }
  };
}

function scoreItem(
  item: StructuredMemoryItem,
  layer: StructuredMemoryLayerName,
  queryTerms: string[],
  contextKeywords: string[]
): ScoreDraft {
  const searchableText = normalizeQuery(
    `${item.title} ${item.summary} ${item.sourceType} ${item.why}`
  );
  const draft: ScoreDraft = {
    value: 0,
    reasons: [],
    matchingSignals: []
  };

  addKeywordScore(draft, queryTerms, searchableText);
  addContextKeywordScore(draft, contextKeywords, searchableText);
  addEmotionalStateScore(draft, queryTerms, searchableText);
  addRoutineTypeScore(draft, item, queryTerms, searchableText);
  addRecommendationTypeScore(draft, item, queryTerms, searchableText);
  addRecencyScore(draft, layer);
  addCompletionScore(draft, item, searchableText);
  addEffectivenessScore(draft, searchableText);

  return draft;
}

function addKeywordScore(
  draft: ScoreDraft,
  queryTerms: string[],
  searchableText: string
): void {
  const matchingTerms = queryTerms.filter((term) => searchableText.includes(term));

  if (matchingTerms.length === 0) {
    return;
  }

  draft.value += matchingTerms.length * 3;
  draft.reasons.push("matching_tags");
  draft.matchingSignals.push(...matchingTerms.map((term) => `query:${term}`));
}

function addContextKeywordScore(
  draft: ScoreDraft,
  contextKeywords: string[],
  searchableText: string
): void {
  const matches = contextKeywords
    .map(normalizeQuery)
    .filter((keyword) => keyword.length > 0 && searchableText.includes(keyword));

  if (matches.length === 0) {
    return;
  }

  draft.value += matches.length * 2;
  draft.reasons.push("matching_context_keywords");
  draft.matchingSignals.push(...matches.map((match) => `context:${match}`));
}

function addEmotionalStateScore(
  draft: ScoreDraft,
  queryTerms: string[],
  searchableText: string
): void {
  if (!hasSharedKeyword(queryTerms, emotionKeywords) || !hasAnyKeyword(searchableText, emotionKeywords)) {
    return;
  }

  draft.value += 4;
  draft.reasons.push("matching_emotional_state");
  draft.matchingSignals.push("emotional-state");
}

function addRoutineTypeScore(
  draft: ScoreDraft,
  item: StructuredMemoryItem,
  queryTerms: string[],
  searchableText: string
): void {
  if (
    item.sourceType !== "routine" ||
    (!hasSharedKeyword(queryTerms, routineKeywords) &&
      !hasAnyKeyword(searchableText, routineKeywords))
  ) {
    return;
  }

  draft.value += 3;
  draft.reasons.push("matching_routine_type");
  draft.matchingSignals.push(`routine:${item.title.toLowerCase()}`);
}

function addRecommendationTypeScore(
  draft: ScoreDraft,
  item: StructuredMemoryItem,
  queryTerms: string[],
  searchableText: string
): void {
  if (
    !["recommendation", "action_history", "adaptive_rule", "pattern"].includes(
      item.sourceType
    ) ||
    !hasSharedKeyword(queryTerms, recommendationKeywords) ||
    !hasAnyKeyword(searchableText, recommendationKeywords)
  ) {
    return;
  }

  draft.value += 3;
  draft.reasons.push("matching_recommendation_type");
  draft.matchingSignals.push(`recommendation:${item.sourceType}`);
}

function addRecencyScore(
  draft: ScoreDraft,
  layer: StructuredMemoryLayerName
): void {
  if (layer !== "Working Memory" && layer !== "Episodic Memory") {
    return;
  }

  draft.value += layer === "Working Memory" ? 3 : 1;
  draft.reasons.push("recency");
  draft.matchingSignals.push(layer === "Working Memory" ? "current-state" : "recent-event");
}

function addCompletionScore(
  draft: ScoreDraft,
  item: StructuredMemoryItem,
  searchableText: string
): void {
  if (
    !searchableText.includes("completed") &&
    !searchableText.includes("successful") &&
    !searchableText.includes("completion")
  ) {
    return;
  }

  draft.value += 3;
  draft.reasons.push("completion_success_rate");
  draft.matchingSignals.push("completion-success");
}

function addEffectivenessScore(draft: ScoreDraft, searchableText: string): void {
  if (
    !searchableText.includes("effective") &&
    !searchableText.includes("worked") &&
    !searchableText.includes("score")
  ) {
    return;
  }

  draft.value += 2;
  draft.reasons.push("effectiveness_score");
  draft.matchingSignals.push("effectiveness");
}

function explainScore(draft: ScoreDraft): string {
  if (draft.reasons.length === 0) {
    return "No deterministic retrieval signals matched.";
  }

  return `Matched ${dedupe(draft.matchingSignals).join(", ")} using ${dedupe(
    draft.reasons
  ).join(", ")}.`;
}

function sortResults(left: RetrievalResult, right: RetrievalResult): number {
  return (
    right.relevance.value - left.relevance.value ||
    left.layer.localeCompare(right.layer) ||
    left.item.title.localeCompare(right.item.title)
  );
}

function getQueryTerms(query: string): string[] {
  const terms = query
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 0);

  return terms.length === 0 ? ["context", "routine", "focus", "energy"] : terms;
}

function normalizeQuery(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_ ]/g, " ").replace(/\s+/g, " ").trim();
}

function hasSharedKeyword(left: string[], right: string[]): boolean {
  return left.some((keyword) => right.includes(keyword));
}

function hasAnyKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
