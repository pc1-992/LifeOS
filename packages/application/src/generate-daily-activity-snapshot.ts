import type {
  DailyActivitySnapshot,
  PersonalSignal,
  PrivacyScope,
  SignalCategory
} from "@lifeos/core";
import type { PersonalSignalRepository } from "./ports.js";

export class GenerateDailyActivitySnapshotUseCase {
  constructor(private readonly signals: PersonalSignalRepository) {}

  async execute(date = getLocalDate(new Date())): Promise<DailyActivitySnapshot> {
    const daySignals = await this.signals.findByDate(date);
    const categories = [...new Set(daySignals.map((signal) => signal.category))];

    return {
      id: `daily_activity_${date}`,
      date,
      generatedAt: new Date(),
      signalCount: daySignals.length,
      categories,
      summary: summarizeDay(daySignals),
      privacyScope: getMostRestrictiveScope(daySignals),
      signals: daySignals,
      restSignalCount: countByCategory(daySignals, [
        "sleep",
        "home-presence",
        "routine"
      ]),
      workSignalCount: countByCategory(daySignals, [
        "work-presence",
        "meeting",
        "calendar-event",
        "focus"
      ]),
      communicationSignalCount: countByCategory(daySignals, [
        "phone-call",
        "social-interaction"
      ]),
      healthSignalCount: countByCategory(daySignals, [
        "heart-rate",
        "movement",
        "energy",
        "stress"
      ])
    };
  }
}

function summarizeDay(signals: PersonalSignal[]): string {
  if (signals.length === 0) {
    return "No personal signals have been recorded for this day yet.";
  }

  const workCount = countByCategory(signals, ["work-presence", "meeting"]);
  const restCount = countByCategory(signals, ["sleep", "home-presence"]);
  const healthCount = countByCategory(signals, ["heart-rate", "movement", "stress"]);

  return `${signals.length} signal${signals.length === 1 ? "" : "s"} recorded: ${workCount} work, ${restCount} rest, ${healthCount} health.`;
}

function countByCategory(
  signals: PersonalSignal[],
  categories: SignalCategory[]
): number {
  return signals.filter((signal) => categories.includes(signal.category)).length;
}

function getMostRestrictiveScope(signals: PersonalSignal[]): PrivacyScope {
  if (signals.some((signal) => signal.privacyScope === "private")) {
    return "private";
  }

  if (signals.some((signal) => signal.privacyScope === "trusted")) {
    return "trusted";
  }

  return "shareable";
}

function getLocalDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
