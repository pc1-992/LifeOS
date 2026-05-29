import type { StructuredMemoryLayerName } from "./structured-memory.js";

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

export interface ConsolidationCandidate {
  id: string;
  summary: string;
  reason: ConsolidationReason;
  confidenceScore: number;
  evidenceCount: number;
  sourceMemoryIds: string[];
  sourceLayers: StructuredMemoryLayerName[];
  explanation: string;
}

export interface ConsolidatedMemory {
  id: string;
  stableTruth: StableTruth;
  generatedAt: Date;
}

export interface ConsolidationReport {
  generatedAt: Date;
  totalCandidates: number;
  candidates: ConsolidationCandidate[];
  stableTruths: StableTruth[];
  consolidatedMemories: ConsolidatedMemory[];
}
