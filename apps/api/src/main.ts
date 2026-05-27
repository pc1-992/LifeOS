import { InMemoryMemoryRepository } from "@lifeos/adapters";
import { CaptureMemoryUseCase } from "@lifeos/application";
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";

type PrivacyScope = "private" | "trusted" | "shareable";

const memories = new InMemoryMemoryRepository();
const captureMemory = new CaptureMemoryUseCase(memories);

const port = Number(process.env.PORT ?? 4000);
const privacyScopes: PrivacyScope[] = ["private", "trusted", "shareable"];
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

const server = createServer(
  async (request: IncomingMessage, response: ServerResponse) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, null);
    return;
  }

  if (request.url === "/health") {
    sendJson(response, 200, { ok: true, service: "lifeos-api" });
    return;
  }

  if (request.url === "/memories" && request.method === "GET") {
    const savedMemories = await memories.findAll();
    sendJson(response, 200, savedMemories);
    return;
  }

  if (request.url === "/memories" && request.method === "POST") {
    try {
      const body = await readJsonBody(request);
      const memory = await captureMemory.execute({
        content: getString(body.content),
        tags: getTags(body.tags),
        privacyScope: getPrivacyScope(body.privacyScope)
      });

      sendJson(response, 201, memory);
    } catch (error) {
      sendJson(response, 400, {
        error: error instanceof Error ? error.message : "Invalid request."
      });
    }
    return;
  }

  sendJson(response, 404, { error: "Not found" });
  }
);

server.listen(port, () => {
  console.log(`LifeOS API listening on http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown
): void {
  const origin = response.req.headers.origin;

  response.writeHead(statusCode, {
    "access-control-allow-origin":
      typeof origin === "string" && allowedOrigins.has(origin)
        ? origin
        : "http://localhost:5173",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "content-type": "application/json"
  });

  response.end(payload === null ? undefined : JSON.stringify(payload));
}

async function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");

  if (rawBody.trim().length === 0) {
    return {};
  }

  const parsed = JSON.parse(rawBody);

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Request body must be a JSON object.");
  }

  return parsed as Record<string, unknown>;
}

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
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

function getPrivacyScope(value: unknown): PrivacyScope {
  if (
    typeof value === "string" &&
    privacyScopes.includes(value as PrivacyScope)
  ) {
    return value as PrivacyScope;
  }

  return "private";
}
