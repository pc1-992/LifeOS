import type {
  ActivityFeedItem,
  ContextSnapshot,
  DashboardSummary,
  DailyReflection,
  KnowledgeGraphReport,
  Memory,
  MemoryQualityReport,
  NextBestStep,
  PatternInsight,
  PersonalOperatingProfile,
  RecommendationFeedback,
  RetrievalResult,
  RoutineSuggestion,
  StableTruth,
  StructuredMemoryLayer,
  TemporalReport,
  DailyActivitySnapshot,
  PersonalSignal,
  SignalInsight
} from "./types.js";

const memoryLayerPaths = [
  "working",
  "episodic",
  "semantic",
  "identity",
  "procedural"
] as const;

export async function getDashboard(): Promise<DashboardSummary> {
  return getJson<DashboardSummary>("/dashboard?scope=trusted");
}

export async function getNextBestStep(): Promise<NextBestStep> {
  return getJson<NextBestStep>("/next-best-step");
}

export async function getDailyReflection(): Promise<DailyReflection> {
  return getJson<DailyReflection>("/daily-reflection");
}

export async function getActivityFeed(): Promise<ActivityFeedItem[]> {
  return getJson<ActivityFeedItem[]>("/activity-feed");
}

export async function getPatternInsights(): Promise<PatternInsight[]> {
  return getJson<PatternInsight[]>("/pattern-insights");
}

export async function getMemories(): Promise<Memory[]> {
  return getJson<Memory[]>("/memories");
}

export async function getLatestContext(): Promise<ContextSnapshot | null> {
  return getJson<ContextSnapshot | null>("/context/latest");
}

export async function getRoutineSuggestion(): Promise<RoutineSuggestion> {
  return getJson<RoutineSuggestion>("/routine-suggestions/latest");
}

export async function getActionHistory() {
  return getJson<import("./types.js").ActionHistoryEntry[]>("/action-history");
}

export async function getRecommendationFeedback(): Promise<RecommendationFeedback> {
  return getJson<RecommendationFeedback>("/recommendation-feedback");
}

export async function getOperatingProfile(): Promise<PersonalOperatingProfile> {
  return getJson<PersonalOperatingProfile>("/operating-profile");
}

export async function getMemoryLayers(): Promise<StructuredMemoryLayer[]> {
  return Promise.all(
    memoryLayerPaths.map((layer) =>
      getJson<StructuredMemoryLayer>(`/memory/${layer}`)
    )
  );
}

export async function getRelevantMemories(
  query: string
): Promise<RetrievalResult[]> {
  const search = query.length > 0 ? `?query=${encodeURIComponent(query)}` : "";

  return getJson<RetrievalResult[]>(`/memory/retrieve${search}`);
}

export async function getMemoryQualityReport(): Promise<MemoryQualityReport> {
  return getJson<MemoryQualityReport>("/memory/hygiene/report");
}

export async function getStableTruths(): Promise<StableTruth[]> {
  return getJson<StableTruth[]>("/memory/stable-truths");
}

export async function getKnowledgeGraphReport(): Promise<KnowledgeGraphReport> {
  return getJson<KnowledgeGraphReport>("/knowledge-graph/report");
}

export async function getTemporalReport(): Promise<TemporalReport> {
  return getJson<TemporalReport>("/temporal-intelligence/report");
}

export async function getTodaySignals(): Promise<PersonalSignal[]> {
  return getJson<PersonalSignal[]>("/signals/today");
}

export async function getDailyActivity(): Promise<DailyActivitySnapshot> {
  return getJson<DailyActivitySnapshot>("/daily-activity");
}

export async function getSignalInsights(): Promise<SignalInsight[]> {
  return getJson<SignalInsight[]>("/signal-insights");
}

export async function postJson(
  path: string,
  payload: unknown
): Promise<Response> {
  return fetch(`${getApiUrl()}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export async function getErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  const result = (await response.json()) as {
    error?: string | { message?: string };
  };

  if (typeof result.error === "string") {
    return result.error;
  }

  return result.error?.message ?? fallback;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`);

  return (await response.json()) as T;
}

function getApiUrl(): string {
  const meta = import.meta as ImportMeta & {
    env?: { VITE_LIFEOS_API_URL?: string };
  };

  return meta.env?.VITE_LIFEOS_API_URL ?? "http://localhost:4000";
}
