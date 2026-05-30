export type PrivacyScope = "private" | "trusted" | "shareable";

export interface Memory {
  id: string;
  createdAt: string;
  content: string;
  source: "user" | "system" | "agent";
  tags: string[];
  privacyScope: PrivacyScope;
}

export interface ContextSnapshot {
  id: string;
  capturedAt: string;
  mood: string;
  energyLevel: number;
  focusLevel: number;
  currentSituation: string;
  summary: string;
  signals: string[];
  privacyScope: PrivacyScope;
}

export interface RoutineSuggestion {
  id: string;
  name: string;
  description: string;
  steps: string[];
  reason:
    | "low_energy"
    | "low_focus"
    | "stressed_mood"
    | "steady_state"
    | "no_context";
  basedOnContextId: string | null;
  privacyScope: PrivacyScope;
}

export interface DashboardSummary {
  whatMattersNow: string;
  latestMemory: Memory | null;
  latestContext: ContextSnapshot | null;
  suggestedRoutine: RoutineSuggestion;
}

export interface DailyReflection {
  emotionalState: string;
  whatMatteredMost: string;
  suggestedNextStep: string;
  currentRoutineRecommendation: RoutineSuggestion;
}

export interface ActivityFeedItem {
  id: string;
  timestamp: string;
  type: "memory" | "context" | "routine_suggestion" | "daily_reflection";
  summary: string;
}

export interface PatternInsight {
  id: string;
  type:
    | "energy_focus"
    | "mood_frequency"
    | "routine_frequency"
    | "memory_tags"
    | "activity_mix";
  title: string;
  summary: string;
}

export interface NextBestStep {
  id: string;
  title: string;
  action: string;
  reason:
    | "no_context"
    | "recovery_needed"
    | "momentum_available"
    | "frequent_stress"
    | "follow_reflection";
  supportingSummary: string;
}

export type ActionCompletionStatus = "completed" | "skipped";

export interface ActionHistoryEntry {
  id: string;
  suggestedAction: NextBestStep;
  status: ActionCompletionStatus;
  timestamp: string;
  effectivenessScore?: number;
}

export interface RecommendationScore {
  recommendationKey: string;
  title: string;
  action: string;
  reason: NextBestStep["reason"];
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
  generatedAt: string;
  totalActions: number;
  highlyEffectiveRecommendations: RecommendationScore[];
  frequentlySkippedRecommendations: RecommendationScore[];
  mostSuccessfulRoutines: RoutineSuccessScore[];
}

export type PersonalOperatingProfileTraitType =
  | "strongest_focus_periods"
  | "common_stress_patterns"
  | "preferred_recovery_routines"
  | "most_effective_recommendation_types"
  | "energy_stability_trends";

export interface PersonalOperatingProfileTrait {
  type: PersonalOperatingProfileTraitType;
  title: string;
  summary: string;
  evidence: string[];
}

export interface PersonalOperatingProfile {
  generatedAt: string;
  contextSnapshotCount: number;
  actionHistoryCount: number;
  traits: PersonalOperatingProfileTrait[];
}

export type StructuredMemoryLayerName =
  | "Working Memory"
  | "Episodic Memory"
  | "Semantic Memory"
  | "Identity Memory"
  | "Procedural Memory";

export type StructuredMemorySourceType =
  | "context"
  | "routine"
  | "recommendation"
  | "memory"
  | "reflection"
  | "action_history"
  | "timeline_event"
  | "pattern"
  | "profile_trait"
  | "adaptive_rule";

export interface StructuredMemoryItem {
  id: string;
  title: string;
  summary: string;
  sourceType: StructuredMemorySourceType;
  why: string;
}

export interface StructuredMemoryLayer {
  layer: StructuredMemoryLayerName;
  description: string;
  items: StructuredMemoryItem[];
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

export type MemoryStatus =
  | "active"
  | "stale"
  | "deprecated"
  | "conflicting"
  | "low-confidence";

export type MemoryIssueType =
  | "duplicate"
  | "conflict"
  | "stale"
  | "low-confidence"
  | "over-represented-pattern";

export interface MemoryIssue {
  id: string;
  type: MemoryIssueType;
  status: MemoryStatus;
  layer: StructuredMemoryLayerName;
  itemIds: string[];
  explanation: string;
  recommendedAction: string;
}

export interface MemoryQualityReport {
  generatedAt: string;
  qualityScore: number;
  activeMemoryCount: number;
  staleMemoryCount: number;
  conflictingMemoryCount: number;
  lowConfidenceMemoryCount: number;
  deprecatedMemoryCount: number;
  issues: MemoryIssue[];
  suggestedCleanupActions: string[];
}

export type ConsolidationReason =
  | "repeated_successful_behavior"
  | "recurring_emotional_pattern"
  | "recurring_focus_pattern"
  | "recurring_energy_pattern"
  | "recurring_recommendation_success";

export interface StableTruth {
  id: string;
  statement: string;
  reason: ConsolidationReason;
  confidenceScore: number;
  evidenceCount: number;
  sourceMemoryIds: string[];
  sourceLayers: StructuredMemoryLayerName[];
  explanation: string;
}

export type KnowledgeNodeType =
  | "memory"
  | "context"
  | "routine"
  | "action"
  | "reflection"
  | "insight"
  | "stable-truth"
  | "profile-trait"
  | "next-step";

export type KnowledgeEdgeType =
  | "caused-by"
  | "related-to"
  | "supports"
  | "contradicts"
  | "derived-from"
  | "improves"
  | "weakens"
  | "follows"
  | "references";

export interface KnowledgeNode {
  id: string;
  type: KnowledgeNodeType;
  label: string;
  summary: string;
  sourceId: string;
}

export interface KnowledgeEdge {
  id: string;
  type: KnowledgeEdgeType;
  fromNodeId: string;
  toNodeId: string;
  explanation: string;
  confidenceScore: number;
  sourceEvidenceIds: string[];
}

export interface KnowledgeGraphReport {
  generatedAt: string;
  nodeCount: number;
  edgeCount: number;
  strongestConnections: KnowledgeEdge[];
  isolatedNodes: KnowledgeNode[];
  contradictionCandidates: KnowledgeEdge[];
}

export type TemporalSignalType =
  | "context_history"
  | "action_history"
  | "pattern_insight"
  | "recommendation_feedback"
  | "stable_truth"
  | "personal_operating_profile"
  | "knowledge_graph";

export type TemporalMetric =
  | "energy"
  | "focus"
  | "stress"
  | "routine_effectiveness"
  | "action_completion";

export type TemporalTrendDirection =
  | "improving"
  | "declining"
  | "stable"
  | "increasing"
  | "decreasing";

export type TemporalForecastDirection =
  | "likely_improving"
  | "likely_declining"
  | "likely_stable"
  | "likely_increasing"
  | "likely_decreasing";

export type TemporalRiskType =
  | "burnout"
  | "overload"
  | "inconsistency"
  | "stagnation";

export type TemporalRiskLevel = "low" | "moderate" | "high";

export interface TemporalTimeWindow {
  startedAt: string | null;
  endedAt: string | null;
  label: string;
}

export interface TemporalSignal {
  id: string;
  type: TemporalSignalType;
  sourceId: string;
  recordedAt: string | null;
  label: string;
  summary: string;
  value?: number;
}

export interface TemporalTrend {
  id: string;
  metric: TemporalMetric;
  direction: TemporalTrendDirection;
  earlierValue: number | null;
  recentValue: number | null;
  explanation: string;
  evidenceCount: number;
  confidenceScore: number;
  timeWindowAnalyzed: TemporalTimeWindow;
  sourceSignals: TemporalSignal[];
}

export interface TemporalForecast {
  id: string;
  metric: Exclude<TemporalMetric, "action_completion">;
  direction: TemporalForecastDirection;
  explanation: string;
  evidenceCount: number;
  confidenceScore: number;
  timeWindowAnalyzed: TemporalTimeWindow;
  sourceSignals: TemporalSignal[];
}

export interface TemporalRisk {
  id: string;
  type: TemporalRiskType;
  level: TemporalRiskLevel;
  explanation: string;
  evidenceCount: number;
  confidenceScore: number;
  timeWindowAnalyzed: TemporalTimeWindow;
  sourceSignals: TemporalSignal[];
}

export interface TemporalInsight {
  id: string;
  type: "trend" | "forecast" | "risk";
  title: string;
  explanation: string;
  evidenceCount: number;
  confidenceScore: number;
  timeWindowAnalyzed: TemporalTimeWindow;
  sourceSignals: TemporalSignal[];
}

export interface TemporalReport {
  generatedAt: string;
  timeWindowAnalyzed: TemporalTimeWindow;
  signalCount: number;
  trends: TemporalTrend[];
  forecasts: TemporalForecast[];
  risks: TemporalRisk[];
  insights: TemporalInsight[];
  supportingEvidence: TemporalSignal[];
  summary: string;
}

export type SignalCategory =
  | "sleep"
  | "heart-rate"
  | "phone-call"
  | "location-presence"
  | "work-presence"
  | "home-presence"
  | "meeting"
  | "calendar-event"
  | "movement"
  | "routine"
  | "focus"
  | "energy"
  | "stress"
  | "social-interaction";

export type SignalSource =
  | "manual"
  | "system"
  | "health"
  | "calendar"
  | "phone"
  | "location"
  | "routine";

export interface PersonalSignal {
  id: string;
  category: SignalCategory;
  source: SignalSource;
  timestamp: string;
  durationMinutes?: number;
  confidenceScore: number;
  privacyScope: PrivacyScope;
  rawValueSummary: string;
  normalizedMeaning: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface DailyActivitySnapshot {
  id: string;
  date: string;
  generatedAt: string;
  signalCount: number;
  categories: SignalCategory[];
  summary: string;
  privacyScope: PrivacyScope;
  signals: PersonalSignal[];
  restSignalCount: number;
  workSignalCount: number;
  communicationSignalCount: number;
  healthSignalCount: number;
}

export interface SignalInsight {
  id: string;
  title: string;
  explanation: string;
  evidenceCount: number;
  confidenceScore: number;
  privacyScope: PrivacyScope;
  sourceSignalIds: string[];
}
