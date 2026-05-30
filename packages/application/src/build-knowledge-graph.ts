import type {
  ActionHistoryEntry,
  ActivityFeedItem,
  ContextSnapshot,
  KnowledgeEdge,
  KnowledgeEdgeType,
  KnowledgeGraph,
  KnowledgeGraphReport,
  KnowledgeNode,
  KnowledgeNodeType,
  Memory,
  PatternInsight,
  PersonalOperatingProfile,
  RecommendationFeedback,
  RoutineSuggestion,
  StableTruth
} from "@lifeos/core";
import type {
  ActionHistoryRepository,
  ContextRepository,
  MemoryRepository
} from "./ports.js";
import { GenerateMemoryConsolidationUseCase } from "./generate-memory-consolidation.js";
import { GenerateNextBestStepUseCase } from "./generate-next-best-step.js";
import { GeneratePatternInsightsUseCase } from "./generate-pattern-insights.js";
import { GeneratePersonalOperatingProfileUseCase } from "./generate-personal-operating-profile.js";
import { GetActivityFeedUseCase } from "./get-activity-feed.js";
import { MemoryLayerProvider } from "./memory-layer-provider.js";
import { RecommendationFeedbackUseCase } from "./recommendation-feedback.js";
import { SuggestRoutineUseCase } from "./suggest-routine.js";

interface GraphInput {
  memories: Memory[];
  contexts: ContextSnapshot[];
  activityFeed: ActivityFeedItem[];
  insights: PatternInsight[];
  stableTruths: StableTruth[];
  feedback: RecommendationFeedback;
  profile: PersonalOperatingProfile;
  actionHistory: ActionHistoryEntry[];
  routine: RoutineSuggestion;
  nextStep: Awaited<ReturnType<GenerateNextBestStepUseCase["execute"]>>;
}

export class BuildKnowledgeGraphUseCase {
  private readonly activityFeed: GetActivityFeedUseCase;
  private readonly patternInsights: GeneratePatternInsightsUseCase;
  private readonly consolidation: GenerateMemoryConsolidationUseCase;
  private readonly memoryLayers: MemoryLayerProvider;
  private readonly recommendationFeedback: RecommendationFeedbackUseCase;
  private readonly operatingProfile: GeneratePersonalOperatingProfileUseCase;
  private readonly suggestRoutine: SuggestRoutineUseCase;
  private readonly nextBestStep: GenerateNextBestStepUseCase;

  constructor(
    private readonly memories: MemoryRepository,
    private readonly contexts: ContextRepository,
    private readonly actionHistory: ActionHistoryRepository
  ) {
    this.activityFeed = new GetActivityFeedUseCase(memories, contexts);
    this.patternInsights = new GeneratePatternInsightsUseCase(memories, contexts);
    this.consolidation = new GenerateMemoryConsolidationUseCase(
      memories,
      contexts,
      actionHistory
    );
    this.memoryLayers = new MemoryLayerProvider(memories, contexts, actionHistory);
    this.recommendationFeedback = new RecommendationFeedbackUseCase(actionHistory);
    this.operatingProfile = new GeneratePersonalOperatingProfileUseCase(
      memories,
      contexts,
      actionHistory
    );
    this.suggestRoutine = new SuggestRoutineUseCase(contexts);
    this.nextBestStep = new GenerateNextBestStepUseCase(
      memories,
      contexts,
      actionHistory
    );
  }

  async execute(): Promise<KnowledgeGraph> {
    const input = await this.getGraphInput();
    const nodes = dedupeNodes([
      ...input.memories.map(toMemoryNode),
      ...input.contexts.map(toContextNode),
      ...input.activityFeed
        .filter((item) => item.type === "daily_reflection")
        .map(toReflectionNode),
      ...input.insights.map(toInsightNode),
      ...input.stableTruths.map(toStableTruthNode),
      ...input.profile.traits.map((trait) => ({
        id: `profile_trait_${trait.type}`,
        type: "profile-trait" as const,
        label: trait.title,
        summary: trait.summary,
        sourceId: trait.type
      })),
      ...input.actionHistory.map(toActionNode),
      {
        id: `routine_${input.routine.id}`,
        type: "routine",
        label: input.routine.name,
        summary: input.routine.description,
        sourceId: input.routine.id
      },
      {
        id: `next_step_${input.nextStep.id}`,
        type: "next-step",
        label: input.nextStep.title,
        summary: input.nextStep.action,
        sourceId: input.nextStep.id
      }
    ]);
    const edges = dedupeEdges([
      ...connectActivityFeed(input),
      ...connectInsightsToSources(input),
      ...connectStableTruths(input),
      ...connectProfileTraits(input),
      ...connectActions(input),
      ...connectRoutineAndNextStep(input),
      ...connectContradictions(nodes)
    ]);

    return {
      generatedAt: new Date(),
      nodes,
      edges: edges.filter(
        (edge) =>
          nodes.some((node) => node.id === edge.fromNodeId) &&
          nodes.some((node) => node.id === edge.toNodeId)
      )
    };
  }

  async report(): Promise<KnowledgeGraphReport> {
    const graph = await this.execute();
    const connectedNodeIds = new Set(
      graph.edges.flatMap((edge) => [edge.fromNodeId, edge.toNodeId])
    );

    return {
      generatedAt: graph.generatedAt,
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      strongestConnections: [...graph.edges]
        .sort((left, right) => right.confidenceScore - left.confidenceScore)
        .slice(0, 5),
      isolatedNodes: graph.nodes
        .filter((node) => !connectedNodeIds.has(node.id))
        .slice(0, 5),
      contradictionCandidates: graph.edges
        .filter((edge) => edge.type === "contradicts")
        .slice(0, 5)
    };
  }

  private async getGraphInput(): Promise<GraphInput> {
    const [
      memories,
      contexts,
      activityFeed,
      insights,
      layers,
      feedback,
      profile,
      actionHistory,
      routine,
      nextStep
    ] = await Promise.all([
      this.memories.findAll(),
      this.contexts.findAll(),
      this.activityFeed.execute(),
      this.patternInsights.execute(),
      this.memoryLayers.getDurableLayers(),
      this.recommendationFeedback.execute(),
      this.operatingProfile.execute(),
      this.actionHistory.findAll(),
      this.suggestRoutine.execute(),
      this.nextBestStep.execute()
    ]);

    const consolidation = this.consolidation.executeWithLayers(
      layers,
      insights,
      feedback
    );

    return {
      memories,
      contexts,
      activityFeed,
      insights,
      stableTruths: consolidation.stableTruths,
      feedback,
      profile,
      actionHistory,
      routine,
      nextStep
    };
  }
}

function toMemoryNode(memory: Memory): KnowledgeNode {
  return {
    id: `memory_${memory.id}`,
    type: "memory",
    label: "Memory",
    summary: memory.content,
    sourceId: memory.id
  };
}

function toContextNode(context: ContextSnapshot): KnowledgeNode {
  return {
    id: `context_${context.id}`,
    type: "context",
    label: "Context",
    summary: context.summary,
    sourceId: context.id
  };
}

function toReflectionNode(item: ActivityFeedItem): KnowledgeNode {
  return {
    id: `reflection_${item.id}`,
    type: "reflection",
    label: "Reflection",
    summary: item.summary,
    sourceId: item.id
  };
}

function toInsightNode(insight: PatternInsight): KnowledgeNode {
  return {
    id: `insight_${insight.id}`,
    type: "insight",
    label: insight.title,
    summary: insight.summary,
    sourceId: insight.id
  };
}

function toStableTruthNode(truth: StableTruth): KnowledgeNode {
  return {
    id: `stable_truth_${truth.id}`,
    type: "stable-truth",
    label: "Stable truth",
    summary: truth.statement,
    sourceId: truth.id
  };
}

function toActionNode(entry: ActionHistoryEntry): KnowledgeNode {
  return {
    id: `action_${entry.id}`,
    type: "action",
    label: `Action ${entry.status}`,
    summary: entry.suggestedAction.action,
    sourceId: entry.id
  };
}

function connectActivityFeed(input: GraphInput): KnowledgeEdge[] {
  return input.activityFeed.flatMap((item) => {
    const targetId =
      item.type === "memory"
        ? `memory_${item.id.replace("activity_", "")}`
        : item.type === "context"
          ? `context_${item.id.replace("activity_", "")}`
          : null;

    if (targetId === null) {
      return [];
    }

    return [
      edge({
        type: "references",
        fromNodeId: `reflection_activity_daily_reflection`,
        toNodeId: targetId,
        explanation: "The activity feed references this item in the recent life timeline.",
        confidenceScore: 0.68,
        sourceEvidenceIds: [item.id]
      })
    ];
  });
}

function connectInsightsToSources(input: GraphInput): KnowledgeEdge[] {
  const contextIds = input.contexts.map((context) => `context_${context.id}`);

  return input.insights.flatMap((insight) =>
    contextIds.slice(-3).map((contextId) =>
      edge({
        type: "derived-from",
        fromNodeId: `insight_${insight.id}`,
        toNodeId: contextId,
        explanation: "Pattern insights are deterministically derived from context history.",
        confidenceScore: 0.74,
        sourceEvidenceIds: [insight.id, contextId]
      })
    )
  );
}

function connectStableTruths(input: GraphInput): KnowledgeEdge[] {
  return input.stableTruths.flatMap((truth) =>
    truth.sourceMemoryIds.map((sourceId) =>
      edge({
        type: "supports",
        fromNodeId: `stable_truth_${truth.id}`,
        toNodeId: normalizeSourceNodeId(sourceId),
        explanation: truth.explanation,
        confidenceScore: truth.confidenceScore,
        sourceEvidenceIds: [truth.id, sourceId]
      })
    )
  );
}

function connectProfileTraits(input: GraphInput): KnowledgeEdge[] {
  return input.profile.traits.flatMap((trait) =>
    input.insights
      .filter((insight) =>
        hasSharedKeyword(trait.summary, `${insight.title} ${insight.summary}`)
      )
      .map((insight) =>
        edge({
          type: "derived-from",
          fromNodeId: `profile_trait_${trait.type}`,
          toNodeId: `insight_${insight.id}`,
          explanation: "Profile traits are derived from repeated insight patterns.",
          confidenceScore: 0.72,
          sourceEvidenceIds: [trait.type, insight.id]
        })
      )
  );
}

function connectActions(input: GraphInput): KnowledgeEdge[] {
  return input.actionHistory.flatMap((entry) => {
    const actionNodeId = `action_${entry.id}`;
    const recommendationEdges = input.feedback.highlyEffectiveRecommendations
      .filter((recommendation) =>
        normalize(entry.suggestedAction.action).includes(
          normalize(recommendation.action)
        )
      )
      .flatMap((recommendation) => {
        const matchingTruth = input.stableTruths.find((truth) =>
          hasSharedKeyword(truth.statement, recommendation.action)
        );

        if (matchingTruth === undefined) {
          return [];
        }

        return [
          edge({
          type: "supports",
          fromNodeId: actionNodeId,
          toNodeId: `stable_truth_${matchingTruth.id}`,
          explanation:
            "Completed actions support recommendation success when they match high-performing feedback.",
          confidenceScore: recommendation.completionRate,
          sourceEvidenceIds: [
            entry.id,
            recommendation.recommendationKey,
            matchingTruth.id
          ]
        })
        ];
      });

    return [
      edge({
        type: entry.status === "completed" ? "improves" : "weakens",
        fromNodeId: actionNodeId,
        toNodeId: `routine_${input.routine.id}`,
        explanation:
          entry.status === "completed"
            ? "A completed action strengthens the active routine relationship."
            : "A skipped action weakens the active routine relationship.",
        confidenceScore: entry.status === "completed" ? 0.76 : 0.6,
        sourceEvidenceIds: [entry.id, input.routine.id]
      }),
      ...recommendationEdges
    ];
  });
}

function connectRoutineAndNextStep(input: GraphInput): KnowledgeEdge[] {
  return [
    edge({
      type: "follows",
      fromNodeId: `next_step_${input.nextStep.id}`,
      toNodeId: `routine_${input.routine.id}`,
      explanation: "The next best step follows the current deterministic routine context.",
      confidenceScore: 0.7,
      sourceEvidenceIds: [input.nextStep.id, input.routine.id]
    })
  ];
}

function connectContradictions(nodes: KnowledgeNode[]): KnowledgeEdge[] {
  const edges: KnowledgeEdge[] = [];

  for (const left of nodes) {
    for (const right of nodes) {
      if (left.id >= right.id || !isContradiction(left.summary, right.summary)) {
        continue;
      }

      edges.push(
        edge({
          type: "contradicts",
          fromNodeId: left.id,
          toNodeId: right.id,
          explanation: "These nodes contain opposing deterministic language.",
          confidenceScore: 0.58,
          sourceEvidenceIds: [left.sourceId, right.sourceId]
        })
      );
    }
  }

  return edges;
}

function edge(input: Omit<KnowledgeEdge, "id">): KnowledgeEdge {
  return {
    id: `edge_${input.type}_${input.fromNodeId}_${input.toNodeId}`,
    ...input
  };
}

function normalizeSourceNodeId(sourceId: string): string {
  if (sourceId.startsWith("identity_")) {
    return `profile_trait_${sourceId.replace("identity_", "")}`;
  }

  if (sourceId.startsWith("semantic_")) {
    return sourceId.replace("semantic_", "insight_");
  }

  if (sourceId.startsWith("procedural_")) {
    return sourceId;
  }

  if (sourceId.startsWith("episodic_action_")) {
    return sourceId.replace("episodic_", "");
  }

  if (sourceId.startsWith("episodic_memory_")) {
    return sourceId.replace("episodic_", "");
  }

  return sourceId;
}

function dedupeNodes(nodes: KnowledgeNode[]): KnowledgeNode[] {
  return [...new Map(nodes.map((node) => [node.id, node])).values()];
}

function dedupeEdges(edges: KnowledgeEdge[]): KnowledgeEdge[] {
  return [...new Map(edges.map((edgeItem) => [edgeItem.id, edgeItem])).values()];
}

function hasSharedKeyword(left: string, right: string): boolean {
  const leftWords = normalize(left).split(" ").filter((word) => word.length >= 5);
  const rightText = normalize(right);

  return leftWords.some((word) => rightText.includes(word));
}

function isContradiction(left: string, right: string): boolean {
  const leftText = normalize(left);
  const rightText = normalize(right);

  return (
    (leftText.includes("higher") && rightText.includes("lower")) ||
    (leftText.includes("lower") && rightText.includes("higher")) ||
    (leftText.includes("completed") && rightText.includes("skipped")) ||
    (leftText.includes("skipped") && rightText.includes("completed"))
  );
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}
