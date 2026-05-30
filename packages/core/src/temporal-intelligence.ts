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

export type TemporalInsightType = "trend" | "forecast" | "risk";

export interface TemporalTimeWindow {
  startedAt: Date | null;
  endedAt: Date | null;
  label: string;
}

export interface TemporalSignal {
  id: string;
  type: TemporalSignalType;
  sourceId: string;
  recordedAt: Date | null;
  label: string;
  summary: string;
  value?: number;
}

export interface TemporalEvidence {
  explanation: string;
  evidenceCount: number;
  confidenceScore: number;
  timeWindowAnalyzed: TemporalTimeWindow;
  sourceSignals: TemporalSignal[];
}

export interface TemporalTrend extends TemporalEvidence {
  id: string;
  metric: TemporalMetric;
  direction: TemporalTrendDirection;
  earlierValue: number | null;
  recentValue: number | null;
}

export interface TemporalForecast extends TemporalEvidence {
  id: string;
  metric: Exclude<TemporalMetric, "action_completion">;
  direction: TemporalForecastDirection;
}

export interface TemporalRisk extends TemporalEvidence {
  id: string;
  type: TemporalRiskType;
  level: TemporalRiskLevel;
}

export interface TemporalInsight extends TemporalEvidence {
  id: string;
  type: TemporalInsightType;
  title: string;
}

export interface TemporalReport {
  generatedAt: Date;
  timeWindowAnalyzed: TemporalTimeWindow;
  signalCount: number;
  trends: TemporalTrend[];
  forecasts: TemporalForecast[];
  risks: TemporalRisk[];
  insights: TemporalInsight[];
  supportingEvidence: TemporalSignal[];
  summary: string;
}
