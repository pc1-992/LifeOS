import type { IncomingMessage, ServerResponse } from "node:http";
import type { AppContext } from "./composition-root.js";
import { getRequestUrl, sendError, sendJson } from "./http.js";
import {
  getNumberField,
  getOptionalNumberField,
  getStringField,
  readJsonBody
} from "./request-validation.js";
import {
  getActionCompletionStatus,
  getContextKeywords,
  getNextBestStepBody,
  getPrivacyScope,
  getPrivacyScopeWithDefault,
  getSignalCategory,
  getSignalSource,
  getTags
} from "./route-validation.js";

export async function handleRequest(
  context: AppContext,
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const requestUrl = getRequestUrl(request);
  const path = requestUrl.pathname;
  const { repositories, useCases } = context;

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
    const dashboard = await useCases.dashboardSummary.execute(requestedScope);
    sendJson(response, 200, dashboard);
    return;
  }

  if (path === "/daily-reflection" && request.method === "GET") {
    sendJson(response, 200, await useCases.dailyReflection.execute());
    return;
  }

  if (path === "/activity-feed" && request.method === "GET") {
    sendJson(response, 200, await useCases.activityFeed.execute());
    return;
  }

  if (path === "/pattern-insights" && request.method === "GET") {
    sendJson(response, 200, await useCases.patternInsights.execute());
    return;
  }

  if (path === "/next-best-step" && request.method === "GET") {
    sendJson(response, 200, await useCases.nextBestStep.execute());
    return;
  }

  if (path === "/recommendation-feedback" && request.method === "GET") {
    sendJson(response, 200, await useCases.recommendationFeedback.execute());
    return;
  }

  if (path === "/operating-profile" && request.method === "GET") {
    sendJson(response, 200, await useCases.operatingProfile.execute());
    return;
  }

  if (path === "/memory/working" && request.method === "GET") {
    sendJson(response, 200, await useCases.memoryLayers.getWorkingMemory());
    return;
  }

  if (path === "/memory/episodic" && request.method === "GET") {
    sendJson(response, 200, await useCases.memoryLayers.getEpisodicMemory());
    return;
  }

  if (path === "/memory/semantic" && request.method === "GET") {
    sendJson(response, 200, await useCases.memoryLayers.getSemanticMemory());
    return;
  }

  if (path === "/memory/identity" && request.method === "GET") {
    sendJson(response, 200, await useCases.memoryLayers.getIdentityMemory());
    return;
  }

  if (path === "/memory/procedural" && request.method === "GET") {
    sendJson(response, 200, await useCases.memoryLayers.getProceduralMemory());
    return;
  }

  if (path === "/memory/retrieve" && request.method === "GET") {
    const latestContext = await repositories.contexts.latest();
    const results = await useCases.retrieveRelevantMemories.execute({
      query: requestUrl.searchParams.get("query") ?? "",
      currentContextKeywords:
        latestContext === null
          ? []
          : getContextKeywords(latestContext.currentSituation)
    });
    sendJson(response, 200, results);
    return;
  }

  if (path === "/memory/hygiene" && request.method === "GET") {
    sendJson(response, 200, await useCases.memoryHygiene.execute());
    return;
  }

  if (path === "/memory/hygiene/report" && request.method === "GET") {
    const result = await useCases.memoryHygiene.execute();
    sendJson(response, 200, result.report);
    return;
  }

  if (path === "/memory/consolidation" && request.method === "GET") {
    sendJson(response, 200, await useCases.memoryConsolidation.execute());
    return;
  }

  if (path === "/memory/stable-truths" && request.method === "GET") {
    const report = await useCases.memoryConsolidation.execute();
    sendJson(response, 200, report.stableTruths);
    return;
  }

  if (path === "/knowledge-graph" && request.method === "GET") {
    sendJson(response, 200, await useCases.knowledgeGraph.execute());
    return;
  }

  if (path === "/knowledge-graph/report" && request.method === "GET") {
    sendJson(response, 200, await useCases.knowledgeGraph.report());
    return;
  }

  if (path === "/temporal-intelligence" && request.method === "GET") {
    sendJson(response, 200, await useCases.temporalIntelligence.execute());
    return;
  }

  if (path === "/temporal-intelligence/report" && request.method === "GET") {
    sendJson(response, 200, await useCases.temporalIntelligence.report());
    return;
  }

  if (path === "/action-history" && request.method === "GET") {
    sendJson(response, 200, await repositories.actionHistory.findAll());
    return;
  }

  if (path === "/signals" && request.method === "GET") {
    sendJson(response, 200, await repositories.personalSignals.findAll());
    return;
  }

  if (path === "/signals/today" && request.method === "GET") {
    sendJson(response, 200, await repositories.personalSignals.findByDate(getToday()));
    return;
  }

  if (path === "/signals" && request.method === "POST") {
    await handleSignalPost(context, request, response);
    return;
  }

  if (path === "/daily-activity" && request.method === "GET") {
    sendJson(response, 200, await useCases.dailyActivity.execute(getToday()));
    return;
  }

  if (path === "/signal-insights" && request.method === "GET") {
    sendJson(response, 200, await useCases.signalInsights.execute(getToday()));
    return;
  }

  if (path === "/action-history" && request.method === "POST") {
    await handleActionHistoryPost(context, request, response);
    return;
  }

  if (path === "/memories" && request.method === "GET") {
    sendJson(response, 200, await repositories.memories.findAll());
    return;
  }

  if (path === "/memories" && request.method === "POST") {
    await handleMemoryPost(context, request, response);
    return;
  }

  if (path === "/context/latest" && request.method === "GET") {
    sendJson(response, 200, await repositories.contexts.latest());
    return;
  }

  if (path === "/context" && request.method === "GET") {
    sendJson(response, 200, await repositories.contexts.findAll());
    return;
  }

  if (path === "/context" && request.method === "POST") {
    await handleContextPost(context, request, response);
    return;
  }

  if (path === "/routine-suggestions/latest" && request.method === "GET") {
    sendJson(response, 200, await useCases.suggestRoutine.execute());
    return;
  }

  sendError(response, 404, new Error("Not found"));
}

async function handleActionHistoryPost(
  context: AppContext,
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  try {
    const body = await readJsonBody(request);
    const entry = await context.useCases.recordActionCompletion.execute({
      suggestedAction: getNextBestStepBody(body.suggestedAction),
      status: getActionCompletionStatus(body.status),
      effectivenessScore: getOptionalNumberField(body, "effectivenessScore")
    });

    sendJson(response, 201, entry);
  } catch (error) {
    sendError(response, 400, error);
  }
}

async function handleMemoryPost(
  context: AppContext,
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  try {
    const body = await readJsonBody(request);
    const memory = await context.useCases.captureMemory.execute({
      content: getStringField(body, "content"),
      tags: getTags(body.tags),
      privacyScope: getPrivacyScope(body.privacyScope)
    });

    sendJson(response, 201, memory);
  } catch (error) {
    sendError(response, 400, error);
  }
}

async function handleSignalPost(
  context: AppContext,
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  try {
    const body = await readJsonBody(request);
    const signal = await context.useCases.recordPersonalSignal.execute({
      category: getSignalCategory(body.category),
      source: getSignalSource(body.source),
      timestamp: getOptionalDate(body.timestamp),
      durationMinutes: getOptionalNumberField(body, "durationMinutes"),
      confidenceScore: getOptionalNumberField(body, "confidenceScore"),
      privacyScope: getPrivacyScopeWithDefault(body.privacyScope, "private"),
      rawValueSummary: getStringField(body, "rawValueSummary"),
      normalizedMeaning: getStringField(body, "normalizedMeaning"),
      metadata: getMetadata(body.metadata)
    });

    sendJson(response, 201, signal);
  } catch (error) {
    sendError(response, 400, error);
  }
}

async function handleContextPost(
  context: AppContext,
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  try {
    const body = await readJsonBody(request);
    const snapshot = await context.useCases.captureContext.execute({
      mood: getStringField(body, "mood"),
      energyLevel: getNumberField(body, "energyLevel"),
      focusLevel: getNumberField(body, "focusLevel"),
      currentSituation: getStringField(body, "currentSituation"),
      privacyScope: getPrivacyScope(body.privacyScope)
    });

    sendJson(response, 201, snapshot);
  } catch (error) {
    sendError(response, 400, error);
  }
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getOptionalDate(value: unknown): Date | undefined {
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function getMetadata(
  value: unknown
): Record<string, string | number | boolean> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter((entry): entry is [
      string,
      string | number | boolean
    ] => ["string", "number", "boolean"].includes(typeof entry[1]))
  );
}
