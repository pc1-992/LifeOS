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

export interface KnowledgeGraph {
  generatedAt: Date;
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export interface KnowledgeGraphReport {
  generatedAt: Date;
  nodeCount: number;
  edgeCount: number;
  strongestConnections: KnowledgeEdge[];
  isolatedNodes: KnowledgeNode[];
  contradictionCandidates: KnowledgeEdge[];
}
