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

export interface WorkingMemory extends StructuredMemoryLayer {
  layer: "Working Memory";
}

export interface EpisodicMemory extends StructuredMemoryLayer {
  layer: "Episodic Memory";
}

export interface SemanticMemory extends StructuredMemoryLayer {
  layer: "Semantic Memory";
}

export interface IdentityMemory extends StructuredMemoryLayer {
  layer: "Identity Memory";
}

export interface ProceduralMemory extends StructuredMemoryLayer {
  layer: "Procedural Memory";
}
