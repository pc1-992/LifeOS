import type {
  PersonalSignal,
  SignalCategory,
  SignalSource,
  PrivacyScope
} from "@lifeos/core";
import type { PersonalSignalRepository } from "./ports.js";

export interface RecordPersonalSignalInput {
  category: SignalCategory;
  source?: SignalSource;
  timestamp?: Date;
  durationMinutes?: number;
  confidenceScore?: number;
  privacyScope?: PrivacyScope;
  rawValueSummary: string;
  normalizedMeaning?: string;
  metadata?: Record<string, string | number | boolean>;
}

export class RecordPersonalSignalUseCase {
  constructor(private readonly signals: PersonalSignalRepository) {}

  async execute(input: RecordPersonalSignalInput): Promise<PersonalSignal> {
    const signal: PersonalSignal = {
      id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      category: input.category,
      source: input.source ?? "manual",
      timestamp: input.timestamp ?? new Date(),
      durationMinutes: normalizeDuration(input.durationMinutes),
      confidenceScore: clampConfidence(input.confidenceScore ?? 0.75),
      privacyScope: input.privacyScope ?? getDefaultPrivacyScope(input.category),
      rawValueSummary: sanitizeRawSummary(input.category, input.rawValueSummary),
      normalizedMeaning:
        input.normalizedMeaning?.trim() ||
        getDefaultMeaning(input.category, input.rawValueSummary),
      metadata: sanitizeMetadata(input.category, input.metadata)
    };

    if (signal.rawValueSummary.length === 0) {
      throw new Error("Signal summary cannot be empty.");
    }

    await this.signals.save(signal);

    return signal;
  }
}

function getDefaultPrivacyScope(category: SignalCategory): PrivacyScope {
  if (
    category === "heart-rate" ||
    category === "sleep" ||
    category === "stress" ||
    category === "phone-call" ||
    category === "location-presence"
  ) {
    return "private";
  }

  return "trusted";
}

function getDefaultMeaning(category: SignalCategory, summary: string): string {
  const normalizedSummary = summary.trim();

  if (category === "phone-call") {
    return "Communication activity occurred without storing contact details.";
  }

  if (
    category === "home-presence" ||
    category === "work-presence" ||
    category === "location-presence"
  ) {
    return `Semantic presence signal: ${normalizedSummary}.`;
  }

  return normalizedSummary;
}

function sanitizeRawSummary(category: SignalCategory, summary: string): string {
  const trimmed = summary.trim();

  if (category !== "phone-call") {
    return trimmed;
  }

  return trimmed.replace(/\+?\d[\d\s().-]{6,}\d/g, "[redacted phone]");
}

function sanitizeMetadata(
  category: SignalCategory,
  metadata: Record<string, string | number | boolean> | undefined
): Record<string, string | number | boolean> | undefined {
  if (metadata === undefined) {
    return undefined;
  }

  const sanitized = { ...metadata };

  if (category === "phone-call") {
    delete sanitized.contactName;
    delete sanitized.phoneNumber;
  }

  delete sanitized.latitude;
  delete sanitized.longitude;
  delete sanitized.gpsCoordinates;

  return sanitized;
}

function normalizeDuration(value: number | undefined): number | undefined {
  if (value === undefined || Number.isNaN(value) || value <= 0) {
    return undefined;
  }

  return Math.round(value);
}

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}
