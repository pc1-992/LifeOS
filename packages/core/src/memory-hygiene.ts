import type {
  StructuredMemoryItem,
  StructuredMemoryLayerName
} from "./structured-memory.js";

export interface MemoryConfidence {
  score: number;
  explanation: string;
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
  generatedAt: Date;
  qualityScore: number;
  activeMemoryCount: number;
  staleMemoryCount: number;
  conflictingMemoryCount: number;
  lowConfidenceMemoryCount: number;
  deprecatedMemoryCount: number;
  issues: MemoryIssue[];
  suggestedCleanupActions: string[];
}

export interface MemoryHygieneResult {
  report: MemoryQualityReport;
  confidenceByItem: Array<{
    item: StructuredMemoryItem;
    layer: StructuredMemoryLayerName;
    status: MemoryStatus;
    confidence: MemoryConfidence;
  }>;
}
