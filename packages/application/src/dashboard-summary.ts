import type { DashboardSummary, Memory, PrivacyScope } from "@lifeos/core";
import type { ContextRepository, MemoryRepository } from "./ports.js";
import { PrivacyGuard } from "./privacy-guard.js";
import { SuggestRoutineUseCase } from "./suggest-routine.js";

export class DashboardSummaryUseCase {
  private readonly privacyGuard = new PrivacyGuard();
  private readonly suggestRoutine: SuggestRoutineUseCase;

  constructor(
    private readonly memories: MemoryRepository,
    private readonly contexts: ContextRepository
  ) {
    this.suggestRoutine = new SuggestRoutineUseCase(contexts);
  }

  async execute(requestedScope: PrivacyScope = "trusted"): Promise<DashboardSummary> {
    const [allMemories, latestContext, suggestedRoutine] = await Promise.all([
      this.memories.findAll(),
      this.contexts.latest(),
      this.suggestRoutine.execute()
    ]);

    const latestMemory = getLatestMemory(allMemories);
    const visibleMemory =
      latestMemory === null
        ? null
        : this.privacyGuard.redactMemory(latestMemory, requestedScope);
    const visibleContext =
      latestContext === null
        ? null
        : this.privacyGuard.redactContext(latestContext, requestedScope);
    const visibleRoutine = this.privacyGuard.redactRoutineSuggestion(
      suggestedRoutine,
      requestedScope
    );

    return {
      whatMattersNow: getWhatMattersNow(visibleContext, visibleRoutine.name),
      latestMemory: visibleMemory,
      latestContext: visibleContext,
      suggestedRoutine: visibleRoutine
    };
  }
}

function getLatestMemory(memories: Memory[]): Memory | null {
  if (memories.length === 0) {
    return null;
  }

  return memories[memories.length - 1] ?? null;
}

function getWhatMattersNow(
  latestContext: DashboardSummary["latestContext"],
  routineName: string
): string {
  if (latestContext === null) {
    return "Capture your current context so LifeOS can orient the day.";
  }

  return `${latestContext.currentSituation} Start with: ${routineName}.`;
}
