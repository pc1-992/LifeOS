import type { PersonalSignal, SignalInsight } from "@lifeos/core";
import type { PersonalSignalRepository } from "./ports.js";

export class GenerateSignalInsightsUseCase {
  constructor(private readonly signals: PersonalSignalRepository) {}

  async execute(date = new Date().toISOString().slice(0, 10)): Promise<SignalInsight[]> {
    const daySignals = await this.signals.findByDate(date);

    return [
      getRecoveryInsight(daySignals),
      getOverloadInsight(daySignals),
      getCognitiveLoadInsight(daySignals),
      getCommunicationFatigueInsight(daySignals),
      getStressBodySignalInsight(daySignals)
    ].filter((insight): insight is SignalInsight => insight !== null);
  }
}

function getRecoveryInsight(signals: PersonalSignal[]): SignalInsight | null {
  const homeSignals = find(signals, "home-presence");
  const movementSignals = find(signals, "movement");
  const lowMovementSignals = movementSignals.filter((signal) =>
    includesAny(signal.normalizedMeaning, ["low", "little", "minimal", "rest"])
  );

  if (homeSignals.length < 2 || lowMovementSignals.length === 0) {
    return null;
  }

  return insight({
    id: "signal_insight_recovery_rest",
    title: "Possible recovery or rest state",
    explanation:
      "Repeated home presence appears together with low movement signals.",
    signals: [...homeSignals, ...lowMovementSignals],
    baseConfidence: 0.62
  });
}

function getOverloadInsight(signals: PersonalSignal[]): SignalInsight | null {
  const workSignals = find(signals, "work-presence");
  const meetingSignals = find(signals, "meeting");
  const stressSignals = find(signals, "stress");

  if (workSignals.length === 0 || meetingSignals.length === 0 || stressSignals.length === 0) {
    return null;
  }

  return insight({
    id: "signal_insight_overload_risk",
    title: "Possible overload risk",
    explanation:
      "Work presence, meetings, and stress signals are present in the same day.",
    signals: [...workSignals, ...meetingSignals, ...stressSignals],
    baseConfidence: 0.68
  });
}

function getCognitiveLoadInsight(signals: PersonalSignal[]): SignalInsight | null {
  const poorSleepSignals = find(signals, "sleep").filter((signal) =>
    includesAny(signal.normalizedMeaning, ["poor", "short", "low", "interrupted"])
  );
  const lowFocusSignals = find(signals, "focus").filter((signal) =>
    includesAny(signal.normalizedMeaning, ["low", "scattered", "reduced"])
  );

  if (poorSleepSignals.length === 0 || lowFocusSignals.length === 0) {
    return null;
  }

  return insight({
    id: "signal_insight_lighter_cognitive_load",
    title: "Lighter cognitive load may fit today",
    explanation: "Poor sleep appears alongside lower focus signals.",
    signals: [...poorSleepSignals, ...lowFocusSignals],
    baseConfidence: 0.66
  });
}

function getCommunicationFatigueInsight(
  signals: PersonalSignal[]
): SignalInsight | null {
  const callSignals = find(signals, "phone-call");
  const lowEnergySignals = find(signals, "energy").filter((signal) =>
    includesAny(signal.normalizedMeaning, ["low", "tired", "drained"])
  );

  if (callSignals.length < 3 || lowEnergySignals.length === 0) {
    return null;
  }

  return insight({
    id: "signal_insight_communication_fatigue",
    title: "Possible communication fatigue",
    explanation: "Several calls appear alongside low energy.",
    signals: [...callSignals, ...lowEnergySignals],
    baseConfidence: 0.64
  });
}

function getStressBodySignalInsight(signals: PersonalSignal[]): SignalInsight | null {
  const heartSignals = find(signals, "heart-rate").filter((signal) =>
    includesAny(signal.normalizedMeaning, ["elevated", "high", "raised"])
  );
  const stressSignals = find(signals, "stress");

  if (heartSignals.length === 0 || stressSignals.length === 0) {
    return null;
  }

  return insight({
    id: "signal_insight_body_stress",
    title: "Possible body stress signal",
    explanation: "Elevated heart-rate meaning appears with stress context.",
    signals: [...heartSignals, ...stressSignals],
    baseConfidence: 0.67
  });
}

function insight(input: {
  id: string;
  title: string;
  explanation: string;
  signals: PersonalSignal[];
  baseConfidence: number;
}): SignalInsight {
  return {
    id: input.id,
    title: input.title,
    explanation: input.explanation,
    evidenceCount: input.signals.length,
    confidenceScore: clampConfidence(
      input.baseConfidence + Math.min(input.signals.length, 5) * 0.04
    ),
    privacyScope: input.signals.some((signal) => signal.privacyScope === "private")
      ? "private"
      : "trusted",
    sourceSignalIds: input.signals.map((signal) => signal.id)
  };
}

function find(
  signals: PersonalSignal[],
  category: PersonalSignal["category"]
): PersonalSignal[] {
  return signals.filter((signal) => signal.category === category);
}

function includesAny(value: string, words: string[]): boolean {
  const normalized = value.toLowerCase();

  return words.some((word) => normalized.includes(word));
}

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}
