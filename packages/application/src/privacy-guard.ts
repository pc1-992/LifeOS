import type {
  ContextSnapshot,
  Memory,
  PrivacyDecision,
  PrivacyScope,
  RoutineSuggestion
} from "@lifeos/core";
import { canUseInContext } from "@lifeos/core";

export class PrivacyGuard {
  decide(
    sourceScope: PrivacyScope,
    requestedScope: PrivacyScope
  ): PrivacyDecision {
    const allowed = canUseInContext(sourceScope, requestedScope);

    return {
      allowed,
      sourceScope,
      requestedScope,
      reason: allowed
        ? `${sourceScope} data is allowed in a ${requestedScope} view.`
        : `${sourceScope} data is not allowed in a ${requestedScope} view.`
    };
  }

  redactMemory(memory: Memory, requestedScope: PrivacyScope): Memory {
    if (this.decide(memory.privacyScope, requestedScope).allowed) {
      return memory;
    }

    return {
      id: "redacted_memory",
      createdAt: new Date(0),
      content: "Redacted because this memory is outside the requested privacy scope.",
      source: "system",
      tags: [],
      privacyScope: memory.privacyScope
    };
  }

  redactContext(
    context: ContextSnapshot,
    requestedScope: PrivacyScope
  ): ContextSnapshot {
    if (this.decide(context.privacyScope, requestedScope).allowed) {
      return context;
    }

    return {
      id: "redacted_context",
      capturedAt: new Date(0),
      mood: "redacted",
      energyLevel: 5,
      focusLevel: 5,
      currentSituation:
        "Redacted because this context is outside the requested privacy scope.",
      summary:
        "Redacted because this context is outside the requested privacy scope.",
      signals: ["manual"],
      privacyScope: context.privacyScope
    };
  }

  redactRoutineSuggestion(
    suggestion: RoutineSuggestion,
    requestedScope: PrivacyScope
  ): RoutineSuggestion {
    if (this.decide(suggestion.privacyScope, requestedScope).allowed) {
      return suggestion;
    }

    return {
      id: "redacted_routine_suggestion",
      name: "Routine redacted",
      description:
        "Redacted because this routine suggestion is based on data outside the requested privacy scope.",
      steps: ["Open a private view to see this suggestion."],
      reason: "no_context",
      basedOnContextId: null,
      privacyScope: suggestion.privacyScope
    };
  }
}
