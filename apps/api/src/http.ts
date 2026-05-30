import type { IncomingMessage, ServerResponse } from "node:http";
import { config } from "./config.js";

export function sendJson(
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

export function sendError(
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

export function getRequestUrl(request: IncomingMessage): URL {
  return new URL(
    request.url ?? "/",
    `http://${request.headers.host ?? "localhost"}`
  );
}
