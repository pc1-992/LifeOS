import type { IncomingMessage } from "node:http";

const maxJsonBodyBytes = 32_768;

export async function readJsonBody(
  request: IncomingMessage
): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.byteLength;

    if (totalBytes > maxJsonBodyBytes) {
      throw new Error("Request body is too large.");
    }

    chunks.push(buffer);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");

  if (rawBody.trim().length === 0) {
    return {};
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new Error("Request body must be valid JSON.");
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Request body must be a JSON object.");
  }

  return parsed as Record<string, unknown>;
}

export function getStringField(
  body: Record<string, unknown>,
  field: string
): string {
  const value = body[field];

  return typeof value === "string" ? value : "";
}

export function getNumberField(
  body: Record<string, unknown>,
  field: string
): number {
  const value = body[field];

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return Number.NaN;
}

export function getOptionalNumberField(
  body: Record<string, unknown>,
  field: string
): number | undefined {
  const value = body[field];

  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return getNumberField(body, field);
}
