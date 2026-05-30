import type {
  ActionHistoryEntry,
  StructuredMemoryLayerName
} from "./types.js";
import type { Language, Translations } from "./localization.js";

export function formatTimestamp(timestamp: string, language: Language): string {
  return new Intl.DateTimeFormat(language === "he" ? "he-IL" : undefined, {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(timestamp));
}

export function getRecentCompletedActions(
  actionHistory: ActionHistoryEntry[]
): ActionHistoryEntry[] {
  return actionHistory
    .filter((entry) => entry.status === "completed")
    .slice(0, 5);
}

export function formatScore(score: number, translations: Translations): string {
  return `${translations.common.score} ${score.toFixed(1)}`;
}

export function formatPercent(value: number, translations: Translations): string {
  return `${Math.round(value * 100)}% ${translations.common.completed}`;
}

export function formatConfidence(
  value: number,
  translations: Translations
): string {
  return `${Math.round(value * 100)}% ${translations.common.confidence}`;
}

export function formatSourceLayers(
  layers: StructuredMemoryLayerName[],
  translations: Translations
): string {
  return layers.length === 0
    ? translations.common.noSourceLayer
    : layers.map((layer) => translations.memoryLayers[layer]).join(", ");
}
