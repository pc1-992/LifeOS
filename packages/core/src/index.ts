export type { AgentTask, AgentTaskStatus } from "./agent-task.js";
export type {
  ActionCompletionStatus,
  ActionHistoryEntry
} from "./action-history.js";
export type {
  ActivityFeedItem,
  ActivityFeedItemType
} from "./activity-feed.js";
export type { ContextSignal, ContextSnapshot } from "./context.js";
export type { DashboardSummary } from "./dashboard.js";
export type { DailyReflection } from "./daily-reflection.js";
export type { Memory } from "./memory.js";
export type {
  ConsolidatedMemory,
  ConsolidationCandidate,
  ConsolidationReason,
  ConsolidationReport,
  StableTruth
} from "./memory-consolidation.js";
export type {
  MemoryConfidence,
  MemoryHygieneResult,
  MemoryIssue,
  MemoryIssueType,
  MemoryQualityReport,
  MemoryStatus
} from "./memory-hygiene.js";
export type {
  RelevanceScore,
  RetrievalQuery,
  RetrievalReason,
  RetrievalResult
} from "./memory-retrieval.js";
export type { NextBestStep, NextBestStepReason } from "./next-best-step.js";
export type { PatternInsight, PatternInsightType } from "./pattern-insight.js";
export type {
  PersonalOperatingProfile,
  PersonalOperatingProfileTrait,
  PersonalOperatingProfileTraitType
} from "./personal-operating-profile.js";
export type {
  RecommendationFeedback,
  RecommendationScore,
  RoutineSuccessScore
} from "./recommendation-feedback.js";
export type {
  Routine,
  RoutineSuggestion,
  RoutineSuggestionReason
} from "./routine.js";
export type {
  EpisodicMemory,
  IdentityMemory,
  ProceduralMemory,
  SemanticMemory,
  StructuredMemoryItem,
  StructuredMemoryLayer,
  StructuredMemoryLayerName,
  StructuredMemorySourceType,
  WorkingMemory
} from "./structured-memory.js";
export type { PrivacyDecision, PrivacyScope } from "./privacy.js";
export { canUseInContext } from "./privacy.js";
