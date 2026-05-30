import type { PrivacyScope } from "./privacy.js";

export type SignalCategory =
  | "sleep"
  | "heart-rate"
  | "phone-call"
  | "location-presence"
  | "work-presence"
  | "home-presence"
  | "meeting"
  | "calendar-event"
  | "movement"
  | "routine"
  | "focus"
  | "energy"
  | "stress"
  | "social-interaction";

export type SignalSource =
  | "manual"
  | "system"
  | "health"
  | "calendar"
  | "phone"
  | "location"
  | "routine";

export type SignalPrivacyLevel = PrivacyScope;
export type SignalConfidence = number;

export interface PersonalSignal {
  id: string;
  category: SignalCategory;
  source: SignalSource;
  timestamp: Date;
  durationMinutes?: number;
  confidenceScore: SignalConfidence;
  privacyScope: SignalPrivacyLevel;
  rawValueSummary: string;
  normalizedMeaning: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface PresenceSignal extends PersonalSignal {
  category: "location-presence" | "work-presence" | "home-presence";
}

export interface HealthSignal extends PersonalSignal {
  category: "heart-rate" | "movement" | "energy" | "stress";
}

export interface CommunicationSignal extends PersonalSignal {
  category: "phone-call" | "social-interaction";
}

export interface CalendarSignal extends PersonalSignal {
  category: "meeting" | "calendar-event";
}

export interface WorkSignal extends PersonalSignal {
  category: "work-presence" | "meeting" | "focus";
}

export interface HomeSignal extends PersonalSignal {
  category: "home-presence" | "routine";
}

export interface SleepSignal extends PersonalSignal {
  category: "sleep";
}

export interface DailyActivitySnapshot {
  id: string;
  date: string;
  generatedAt: Date;
  signalCount: number;
  categories: SignalCategory[];
  summary: string;
  privacyScope: SignalPrivacyLevel;
  signals: PersonalSignal[];
  restSignalCount: number;
  workSignalCount: number;
  communicationSignalCount: number;
  healthSignalCount: number;
}

export interface SignalInsight {
  id: string;
  title: string;
  explanation: string;
  evidenceCount: number;
  confidenceScore: SignalConfidence;
  privacyScope: SignalPrivacyLevel;
  sourceSignalIds: string[];
}
