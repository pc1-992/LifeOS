import type {
  StructuredMemoryItem,
  StructuredMemoryLayerName
} from "./structured-memory.js";

export interface RetrievalQuery {
  query: string;
  currentContextKeywords: string[];
}

export type RetrievalReason =
  | "matching_tags"
  | "matching_context_keywords"
  | "matching_emotional_state"
  | "matching_routine_type"
  | "matching_recommendation_type"
  | "recency"
  | "completion_success_rate"
  | "effectiveness_score";

export interface RelevanceScore {
  value: number;
  reasons: RetrievalReason[];
  matchingSignals: string[];
  explanation: string;
}

export interface RetrievalResult {
  item: StructuredMemoryItem;
  layer: StructuredMemoryLayerName;
  relevance: RelevanceScore;
}
