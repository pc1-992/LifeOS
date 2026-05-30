import type {
  ActionHistoryEntry,
  ActivityFeedItem,
  StructuredMemoryLayerName,
  StructuredMemorySourceType,
  TemporalForecastDirection,
  TemporalMetric,
  TemporalRiskType
} from "./types.js";

export function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(timestamp));
}

export function formatActivityType(type: ActivityFeedItem["type"]): string {
  return type.replace("_", " ");
}

export function getRecentCompletedActions(
  actionHistory: ActionHistoryEntry[]
): ActionHistoryEntry[] {
  return actionHistory
    .filter((entry) => entry.status === "completed")
    .slice(0, 5);
}

export function formatScore(score: number): string {
  return `score ${score.toFixed(1)}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}% completed`;
}

export function formatSourceType(type: StructuredMemorySourceType): string {
  return type.replaceAll("_", " ");
}

export function formatConfidence(value: number): string {
  return `${Math.round(value * 100)}% confidence`;
}

export function formatSourceLayers(layers: StructuredMemoryLayerName[]): string {
  return layers.length === 0 ? "No source layer" : layers.join(", ");
}

export function formatTemporalMetric(metric: TemporalMetric): string {
  return metric.replaceAll("_", " ");
}

export function formatForecastDirection(
  direction: TemporalForecastDirection
): string {
  return direction.replaceAll("_", " ");
}

export function formatRiskType(type: TemporalRiskType): string {
  return type.replaceAll("_", " ");
}
