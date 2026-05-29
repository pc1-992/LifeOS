import {
  SQLiteActionHistoryRepository,
  SQLiteContextRepository,
  SQLiteMemoryRepository
} from "@lifeos/adapters";
import {
  CaptureContextUseCase,
  CaptureMemoryUseCase,
  DashboardSummaryUseCase,
  GenerateDailyReflectionUseCase,
  GenerateEpisodicMemoryUseCase,
  GenerateIdentityMemoryUseCase,
  GenerateMemoryHygieneReportUseCase,
  GenerateNextBestStepUseCase,
  GeneratePersonalOperatingProfileUseCase,
  GeneratePatternInsightsUseCase,
  GenerateProceduralMemoryUseCase,
  GenerateSemanticMemoryUseCase,
  GenerateWorkingMemoryUseCase,
  GetActivityFeedUseCase,
  GenerateMemoryConsolidationUseCase,
  RecommendationFeedbackUseCase,
  RecordActionCompletionUseCase,
  RetrieveRelevantMemoriesUseCase,
  SuggestRoutineUseCase
} from "@lifeos/application";
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { config } from "./config.js";
import {
  getNumberField,
  getOptionalNumberField,
  getStringField,
  readJsonBody
} from "./request-validation.js";

type PrivacyScope = "private" | "trusted" | "shareable";
type ActionCompletionStatus = "completed" | "skipped";

interface NextBestStepBody {
  id: string;
  title: string;
  action: string;
  reason:
    | "no_context"
    | "recovery_needed"
    | "momentum_available"
    | "frequent_stress"
    | "follow_reflection";
  supportingSummary: string;
}

const memories = new SQLiteMemoryRepository(config.sqliteDatabasePath);
const contexts = new SQLiteContextRepository(config.sqliteDatabasePath);
const actionHistory = new SQLiteActionHistoryRepository(config.sqliteDatabasePath);
const captureMemory = new CaptureMemoryUseCase(memories);
const captureContext = new CaptureContextUseCase(contexts);
const suggestRoutine = new SuggestRoutineUseCase(contexts);
const dashboardSummary = new DashboardSummaryUseCase(memories, contexts);
const dailyReflection = new GenerateDailyReflectionUseCase(memories, contexts);
const activityFeed = new GetActivityFeedUseCase(memories, contexts);
const patternInsights = new GeneratePatternInsightsUseCase(memories, contexts);
const recommendationFeedback = new RecommendationFeedbackUseCase(actionHistory);
const workingMemory = new GenerateWorkingMemoryUseCase(
  memories,
  contexts,
  actionHistory
);
const episodicMemory = new GenerateEpisodicMemoryUseCase(
  memories,
  contexts,
  actionHistory
);
const semanticMemory = new GenerateSemanticMemoryUseCase(
  memories,
  contexts,
  actionHistory
);
const identityMemory = new GenerateIdentityMemoryUseCase(
  memories,
  contexts,
  actionHistory
);
const proceduralMemory = new GenerateProceduralMemoryUseCase(
  contexts,
  actionHistory
);
const retrieveRelevantMemories = new RetrieveRelevantMemoriesUseCase(
  memories,
  contexts,
  actionHistory
);
const memoryHygiene = new GenerateMemoryHygieneReportUseCase(
  memories,
  contexts,
  actionHistory
);
const memoryConsolidation = new GenerateMemoryConsolidationUseCase(
  memories,
  contexts,
  actionHistory
);
const operatingProfile = new GeneratePersonalOperatingProfileUseCase(
  memories,
  contexts,
  actionHistory
);
const nextBestStep = new GenerateNextBestStepUseCase(
  memories,
  contexts,
  actionHistory
);
const recordActionCompletion = new RecordActionCompletionUseCase(actionHistory);

const privacyScopes: PrivacyScope[] = ["private", "trusted", "shareable"];

const server = createServer(
  async (request: IncomingMessage, response: ServerResponse) => {
  const requestUrl = new URL(
    request.url ?? "/",
    `http://${request.headers.host ?? "localhost"}`
  );
  const path = requestUrl.pathname;

  if (request.method === "OPTIONS") {
    sendJson(response, 204, null);
    return;
  }

  if (path === "/health") {
    sendJson(response, 200, { ok: true, service: "lifeos-api" });
    return;
  }

  if (path === "/dashboard" && request.method === "GET") {
    const requestedScope = getPrivacyScopeWithDefault(
      requestUrl.searchParams.get("scope"),
      "trusted"
    );
    const dashboard = await dashboardSummary.execute(requestedScope);
    sendJson(response, 200, dashboard);
    return;
  }

  if (path === "/daily-reflection" && request.method === "GET") {
    const reflection = await dailyReflection.execute();
    sendJson(response, 200, reflection);
    return;
  }

  if (path === "/activity-feed" && request.method === "GET") {
    const feed = await activityFeed.execute();
    sendJson(response, 200, feed);
    return;
  }

  if (path === "/pattern-insights" && request.method === "GET") {
    const insights = await patternInsights.execute();
    sendJson(response, 200, insights);
    return;
  }

  if (path === "/next-best-step" && request.method === "GET") {
    const step = await nextBestStep.execute();
    sendJson(response, 200, step);
    return;
  }

  if (path === "/recommendation-feedback" && request.method === "GET") {
    const feedback = await recommendationFeedback.execute();
    sendJson(response, 200, feedback);
    return;
  }

  if (path === "/operating-profile" && request.method === "GET") {
    const profile = await operatingProfile.execute();
    sendJson(response, 200, profile);
    return;
  }

  if (path === "/memory/working" && request.method === "GET") {
    const layer = await workingMemory.execute();
    sendJson(response, 200, layer);
    return;
  }

  if (path === "/memory/episodic" && request.method === "GET") {
    const layer = await episodicMemory.execute();
    sendJson(response, 200, layer);
    return;
  }

  if (path === "/memory/semantic" && request.method === "GET") {
    const layer = await semanticMemory.execute();
    sendJson(response, 200, layer);
    return;
  }

  if (path === "/memory/identity" && request.method === "GET") {
    const layer = await identityMemory.execute();
    sendJson(response, 200, layer);
    return;
  }

  if (path === "/memory/procedural" && request.method === "GET") {
    const layer = await proceduralMemory.execute();
    sendJson(response, 200, layer);
    return;
  }

  if (path === "/memory/retrieve" && request.method === "GET") {
    const latestContext = await contexts.latest();
    const results = await retrieveRelevantMemories.execute({
      query: requestUrl.searchParams.get("query") ?? "",
      currentContextKeywords: latestContext === null
        ? []
        : getContextKeywords(latestContext.currentSituation)
    });
    sendJson(response, 200, results);
    return;
  }

  if (path === "/memory/hygiene" && request.method === "GET") {
    const result = await memoryHygiene.execute();
    sendJson(response, 200, result);
    return;
  }

  if (path === "/memory/hygiene/report" && request.method === "GET") {
    const result = await memoryHygiene.execute();
    sendJson(response, 200, result.report);
    return;
  }

  if (path === "/memory/consolidation" && request.method === "GET") {
    const report = await memoryConsolidation.execute();
    sendJson(response, 200, report);
    return;
  }

  if (path === "/memory/stable-truths" && request.method === "GET") {
    const report = await memoryConsolidation.execute();
    sendJson(response, 200, report.stableTruths);
    return;
  }

  if (path === "/action-history" && request.method === "GET") {
    const savedActionHistory = await actionHistory.findAll();
    sendJson(response, 200, savedActionHistory);
    return;
  }

  if (path === "/action-history" && request.method === "POST") {
    try {
      const body = await readJsonBody(request);
      const entry = await recordActionCompletion.execute({
        suggestedAction: getNextBestStepBody(body.suggestedAction),
        status: getActionCompletionStatus(body.status),
        effectivenessScore: getOptionalNumberField(body, "effectivenessScore")
      });

      sendJson(response, 201, entry);
    } catch (error) {
      sendError(response, 400, error);
    }
    return;
  }

  if (path === "/memories" && request.method === "GET") {
    const savedMemories = await memories.findAll();
    sendJson(response, 200, savedMemories);
    return;
  }

  if (path === "/memories" && request.method === "POST") {
    try {
      const body = await readJsonBody(request);
      const memory = await captureMemory.execute({
        content: getStringField(body, "content"),
        tags: getTags(body.tags),
        privacyScope: getPrivacyScope(body.privacyScope)
      });

      sendJson(response, 201, memory);
    } catch (error) {
      sendError(response, 400, error);
    }
    return;
  }

  if (path === "/context/latest" && request.method === "GET") {
    const latestContext = await contexts.latest();
    sendJson(response, 200, latestContext);
    return;
  }

  if (path === "/context" && request.method === "GET") {
    const savedContexts = await contexts.findAll();
    sendJson(response, 200, savedContexts);
    return;
  }

  if (path === "/context" && request.method === "POST") {
    try {
      const body = await readJsonBody(request);
      const context = await captureContext.execute({
        mood: getStringField(body, "mood"),
        energyLevel: getNumberField(body, "energyLevel"),
        focusLevel: getNumberField(body, "focusLevel"),
        currentSituation: getStringField(body, "currentSituation"),
        privacyScope: getPrivacyScope(body.privacyScope)
      });

      sendJson(response, 201, context);
    } catch (error) {
      sendError(response, 400, error);
    }
    return;
  }

  if (
    path === "/routine-suggestions/latest" &&
    request.method === "GET"
  ) {
    const suggestion = await suggestRoutine.execute();
    sendJson(response, 200, suggestion);
    return;
  }

  sendError(response, 404, new Error("Not found"));
  }
);

server.listen(config.apiPort, () => {
  console.log(`LifeOS API listening on http://localhost:${config.apiPort}`);
  console.log(`Health check: http://localhost:${config.apiPort}/health`);
});

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown
): void {
  const origin = response.req.headers.origin;

  response.writeHead(statusCode, {
    "access-control-allow-origin":
      typeof origin === "string" && config.allowedOrigins.has(origin)
        ? origin
        : "http://localhost:5173",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "content-type": "application/json"
  });

  response.end(payload === null ? undefined : JSON.stringify(payload));
}

function sendError(
  response: ServerResponse,
  statusCode: number,
  error: unknown
): void {
  sendJson(response, statusCode, {
    error: {
      message: error instanceof Error ? error.message : "Invalid request.",
      statusCode
    }
  });
}

function getActionCompletionStatus(value: unknown): ActionCompletionStatus {
  return value === "skipped" ? "skipped" : "completed";
}

function getNextBestStepBody(value: unknown): NextBestStepBody {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Suggested action is required.");
  }

  const suggestedAction = value as Record<string, unknown>;

  return {
    id: getStringFromUnknown(suggestedAction.id),
    title: getStringFromUnknown(suggestedAction.title),
    action: getStringFromUnknown(suggestedAction.action),
    reason: getNextBestStepReason(suggestedAction.reason),
    supportingSummary: getStringFromUnknown(suggestedAction.supportingSummary)
  };
}

function getStringFromUnknown(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getNextBestStepReason(value: unknown): NextBestStepBody["reason"] {
  if (
    value === "no_context" ||
    value === "recovery_needed" ||
    value === "momentum_available" ||
    value === "frequent_stress" ||
    value === "follow_reflection"
  ) {
    return value;
  }

  return "follow_reflection";
}

function getTags(value: unknown): string[] {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function getContextKeywords(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 4)
    .slice(0, 8);
}

function getPrivacyScope(value: unknown): PrivacyScope {
  return getPrivacyScopeWithDefault(value, "private");
}

function getPrivacyScopeWithDefault(
  value: unknown,
  fallback: PrivacyScope
): PrivacyScope {
  if (
    typeof value === "string" &&
    privacyScopes.includes(value as PrivacyScope)
  ) {
    return value as PrivacyScope;
  }

  return fallback;
}
