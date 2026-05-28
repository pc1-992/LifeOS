import type { DashboardSummary, Memory } from "@lifeos/core";
import type { ContextRepository, MemoryRepository } from "./ports.js";
import { SuggestRoutineUseCase } from "./suggest-routine.js";

export class DashboardSummaryUseCase {
  private readonly suggestRoutine: SuggestRoutineUseCase;

  constructor(
    private readonly memories: MemoryRepository,
    private readonly contexts: ContextRepository
  ) {
    this.suggestRoutine = new SuggestRoutineUseCase(contexts);
  }

  async execute(): Promise<DashboardSummary> {
    const [allMemories, latestContext, suggestedRoutine] = await Promise.all([
      this.memories.findAll(),
      this.contexts.latest(),
      this.suggestRoutine.execute()
    ]);

    const latestMemory = getLatestMemory(allMemories);

    return {
      whatMattersNow: getWhatMattersNow(latestContext, suggestedRoutine.name),
      latestMemory,
      latestContext,
      suggestedRoutine
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
