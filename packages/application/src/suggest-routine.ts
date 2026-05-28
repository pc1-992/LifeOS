import type { ContextSnapshot, RoutineSuggestion } from "@lifeos/core";
import type { ContextRepository } from "./ports.js";

export class SuggestRoutineUseCase {
  constructor(private readonly contexts: ContextRepository) {}

  async execute(): Promise<RoutineSuggestion> {
    const latestContext = await this.contexts.latest();

    if (latestContext === null) {
      return {
        id: "routine_suggestion_no_context",
        name: "Capture context first",
        description:
          "LifeOS needs a recent context snapshot before it can suggest a routine.",
        steps: [
          "Save a context snapshot.",
          "Include your mood, energy, focus, and current situation.",
          "Check the routine suggestion again."
        ],
        reason: "no_context",
        basedOnContextId: null,
        privacyScope: "shareable"
      };
    }

    return suggestFromContext(latestContext);
  }
}

function suggestFromContext(context: ContextSnapshot): RoutineSuggestion {
  const mood = context.mood.toLowerCase();

  if (isStressedMood(mood)) {
    return {
      id: `routine_suggestion_${context.id}`,
      name: "Calming routine",
      description:
        "A short routine to lower pressure before choosing the next action.",
      steps: [
        "Take three slow breaths.",
        "Name the situation in one sentence.",
        "Choose one small next step that can be done in five minutes."
      ],
      reason: "stressed_mood",
      basedOnContextId: context.id,
      privacyScope: context.privacyScope
    };
  }

  if (context.energyLevel <= 3) {
    return {
      id: `routine_suggestion_${context.id}`,
      name: "Recovery routine",
      description:
        "A low-effort routine for rebuilding energy before taking on more work.",
      steps: [
        "Drink water.",
        "Step away from the screen for five minutes.",
        "Pick one light task or pause intentionally."
      ],
      reason: "low_energy",
      basedOnContextId: context.id,
      privacyScope: context.privacyScope
    };
  }

  if (context.focusLevel <= 4) {
    return {
      id: `routine_suggestion_${context.id}`,
      name: "Focus reset",
      description:
        "A simple reset to reduce distraction and return to one clear task.",
      steps: [
        "Close unrelated tabs or apps.",
        "Write the next task in one sentence.",
        "Set a ten-minute timer and start only that task."
      ],
      reason: "low_focus",
      basedOnContextId: context.id,
      privacyScope: context.privacyScope
    };
  }

  return {
    id: `routine_suggestion_${context.id}`,
    name: "Steady progress routine",
    description:
      "A maintenance routine for when energy and focus are stable enough to continue.",
    steps: [
      "Confirm the next meaningful task.",
      "Work for twenty minutes.",
      "Capture any useful memory or context change afterward."
    ],
    reason: "steady_state",
    basedOnContextId: context.id,
    privacyScope: context.privacyScope
  };
}

function isStressedMood(mood: string): boolean {
  return ["stressed", "anxious", "overwhelmed", "tense"].some((word) =>
    mood.includes(word)
  );
}
