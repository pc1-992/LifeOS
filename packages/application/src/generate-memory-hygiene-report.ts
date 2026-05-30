import type {
  MemoryConfidence,
  MemoryHygieneResult,
  MemoryIssue,
  MemoryIssueType,
  MemoryQualityReport,
  MemoryStatus,
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

interface MemoryQualityItem {
  item: StructuredMemoryItem;
  layer: StructuredMemoryLayerName;
  status: MemoryStatus;
  confidence: MemoryConfidence;
}

interface IssueDraft {
  type: MemoryIssueType;
  status: MemoryStatus;
  layer: StructuredMemoryLayerName;
  itemIds: string[];
  explanation: string;
  recommendedAction: string;
}

const contradictionPairs = [
  ["higher", "lower"],
  ["high", "low"],
  ["stable", "trending lower"],
  ["completed", "skipped"],
  ["successful", "skipped"],
  ["effective", "skipped"]
];

export class GenerateMemoryHygieneReportUseCase {
  private readonly memoryLayers: MemoryLayerProvider;

  constructor(
    memories: MemoryRepository,
    contexts: ContextRepository,
    actionHistory: ActionHistoryRepository
  ) {
    this.memoryLayers = new MemoryLayerProvider(memories, contexts, actionHistory);
  }

  async execute(): Promise<MemoryHygieneResult> {
    const layers = await this.memoryLayers.getDurableLayers();
    const qualityItems = layers.flatMap(toQualityItems);
    const issues = [
      ...detectDuplicateMemories(layers),
      ...detectConflictingMemories(layers),
      ...detectStaleMemories(qualityItems),
      ...detectLowConfidenceMemories(qualityItems),
      ...detectOverrepresentedPatterns(layers)
    ].map(toMemoryIssue);
    const itemsWithIssueStatuses = applyIssueStatuses(qualityItems, issues);
    const report = buildReport(itemsWithIssueStatuses, issues);

    return {
      report,
      confidenceByItem: itemsWithIssueStatuses
    };
  }
}

function toQualityItems(layer: StructuredMemoryLayer): MemoryQualityItem[] {
  return layer.items.map((item) => ({
    item,
    layer: layer.layer,
    status: "active",
    confidence: calculateConfidence(item, layer.layer)
  }));
}

function calculateConfidence(
  item: StructuredMemoryItem,
  layer: StructuredMemoryLayerName
): MemoryConfidence {
  const text = normalize(`${item.title} ${item.summary} ${item.why}`);
  let score = 0.82;
  const explanations = ["Base confidence starts from deterministic local memory."];

  if (layer === "Semantic Memory" || layer === "Identity Memory") {
    score += 0.06;
    explanations.push("Stable memory layers receive a small confidence bonus.");
  }

  if (layer === "Procedural Memory") {
    score += 0.04;
    explanations.push("Procedural rules are based on observed routine behavior.");
  }

  if (isLowConfidenceText(text)) {
    score -= 0.35;
    explanations.push("The item says there is not enough evidence yet.");
  }

  if (item.sourceType === "timeline_event" || item.sourceType === "reflection") {
    score -= 0.08;
    explanations.push("Episodic derived items can age as new activity arrives.");
  }

  return {
    score: clampScore(score),
    explanation: explanations.join(" ")
  };
}

function detectDuplicateMemories(layers: StructuredMemoryLayer[]): IssueDraft[] {
  const groups = new Map<string, Array<{ item: StructuredMemoryItem; layer: StructuredMemoryLayerName }>>();

  for (const layer of layers) {
    for (const item of layer.items) {
      const key = normalize(item.summary);
      groups.set(key, [...(groups.get(key) ?? []), { item, layer: layer.layer }]);
    }
  }

  return Array.from(groups.values())
    .filter((group) => group.length > 1)
    .map((group) => ({
      type: "duplicate",
      status: "deprecated",
      layer: group[0]?.layer ?? "Episodic Memory",
      itemIds: group.map((entry) => entry.item.id),
      explanation: "Multiple memory items have the same normalized summary.",
      recommendedAction: "Review these items later and keep the clearest version."
    }));
}

function detectConflictingMemories(layers: StructuredMemoryLayer[]): IssueDraft[] {
  const issues: IssueDraft[] = [];

  for (const layer of layers) {
    for (const [left, right] of pairItems(layer.items)) {
      if (!hasContradiction(left, right)) {
        continue;
      }

      issues.push({
        type: "conflict",
        status: "conflicting",
        layer: layer.layer,
        itemIds: [left.id, right.id],
        explanation: "Two items in the same memory layer contain opposing deterministic signals.",
        recommendedAction: "Keep both for now, but review which statement reflects the current truth."
      });
    }
  }

  return issues;
}

function detectStaleMemories(items: MemoryQualityItem[]): IssueDraft[] {
  return items
    .filter((entry) =>
      entry.layer === "Episodic Memory" &&
      (entry.item.sourceType === "timeline_event" ||
        entry.item.sourceType === "reflection")
    )
    .map((entry) => ({
      type: "stale",
      status: "stale",
      layer: entry.layer,
      itemIds: [entry.item.id],
      explanation:
        "This episodic item is derived from a moment-in-time summary and may become stale as newer activity arrives.",
      recommendedAction: "Refresh this memory by capturing a newer context or reflection."
    }));
}

function detectLowConfidenceMemories(items: MemoryQualityItem[]): IssueDraft[] {
  return items
    .filter((entry) => entry.confidence.score < 0.6)
    .map((entry) => ({
      type: "low-confidence",
      status: "low-confidence",
      layer: entry.layer,
      itemIds: [entry.item.id],
      explanation: entry.confidence.explanation,
      recommendedAction: "Capture more supporting context before relying on this memory."
    }));
}

function detectOverrepresentedPatterns(layers: StructuredMemoryLayer[]): IssueDraft[] {
  return layers.flatMap((layer) => {
    const patternItems = layer.items.filter((item) => item.sourceType === "pattern");

    if (patternItems.length <= 4) {
      return [];
    }

    return [
      {
        type: "over-represented-pattern",
        status: "low-confidence",
        layer: layer.layer,
        itemIds: patternItems.map((item) => item.id),
        explanation:
          "This layer has many pattern memories, which can make one class of signal too dominant.",
        recommendedAction:
          "Keep the strongest pattern memories and wait for more diverse evidence before consolidation."
      } satisfies IssueDraft
    ];
  });
}

function toMemoryIssue(issue: IssueDraft, index: number): MemoryIssue {
  return {
    id: `memory_issue_${index + 1}`,
    ...issue
  };
}

function applyIssueStatuses(
  items: MemoryQualityItem[],
  issues: MemoryIssue[]
): MemoryQualityItem[] {
  return items.map((entry) => {
    const issue = issues.find((candidate) =>
      candidate.itemIds.includes(entry.item.id)
    );

    return {
      ...entry,
      status: issue?.status ?? entry.status
    };
  });
}

function buildReport(
  items: MemoryQualityItem[],
  issues: MemoryIssue[]
): MemoryQualityReport {
  const activeMemoryCount = items.filter((item) => item.status === "active").length;
  const staleMemoryCount = items.filter((item) => item.status === "stale").length;
  const conflictingMemoryCount = items.filter(
    (item) => item.status === "conflicting"
  ).length;
  const lowConfidenceMemoryCount = items.filter(
    (item) => item.status === "low-confidence"
  ).length;
  const deprecatedMemoryCount = items.filter(
    (item) => item.status === "deprecated"
  ).length;
  const issuePenalty =
    staleMemoryCount * 3 +
    conflictingMemoryCount * 8 +
    lowConfidenceMemoryCount * 5 +
    deprecatedMemoryCount * 4;

  return {
    generatedAt: new Date(),
    qualityScore: Math.max(0, 100 - issuePenalty),
    activeMemoryCount,
    staleMemoryCount,
    conflictingMemoryCount,
    lowConfidenceMemoryCount,
    deprecatedMemoryCount,
    issues,
    suggestedCleanupActions: dedupe(
      issues.map((issue) => issue.recommendedAction)
    ).slice(0, 5)
  };
}

function hasContradiction(
  left: StructuredMemoryItem,
  right: StructuredMemoryItem
): boolean {
  const leftText = normalize(`${left.title} ${left.summary}`);
  const rightText = normalize(`${right.title} ${right.summary}`);

  return contradictionPairs.some(
    ([first, second]) =>
      (leftText.includes(first) && rightText.includes(second)) ||
      (leftText.includes(second) && rightText.includes(first))
  );
}

function pairItems(items: StructuredMemoryItem[]): Array<[StructuredMemoryItem, StructuredMemoryItem]> {
  const pairs: Array<[StructuredMemoryItem, StructuredMemoryItem]> = [];

  for (let leftIndex = 0; leftIndex < items.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < items.length; rightIndex += 1) {
      const left = items[leftIndex];
      const right = items[rightIndex];

      if (left !== undefined && right !== undefined) {
        pairs.push([left, right]);
      }
    }
  }

  return pairs;
}

function isLowConfidenceText(text: string): boolean {
  return [
    "no clear pattern yet",
    "not enough evidence",
    "not visible yet",
    "no repeated",
    "no preferred",
    "needed",
    "unknown"
  ].some((phrase) => text.includes(phrase));
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
