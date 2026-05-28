import type {
  ContextSnapshot,
  DailyReflection,
  Memory,
  RoutineSuggestion
} from "@lifeos/core";
import type { ContextRepository, MemoryRepository } from "./ports.js";
import { SuggestRoutineUseCase } from "./suggest-routine.js";

export class GenerateDailyReflectionUseCase {
  private readonly suggestRoutine: SuggestRoutineUseCase;

  constructor(
    private readonly memories: MemoryRepository,
    private readonly contexts: ContextRepository
  ) {
    this.suggestRoutine = new SuggestRoutineUseCase(contexts);
  }

  async execute(): Promise<DailyReflection> {
    const [allMemories, latestContext, currentRoutineRecommendation] =
      await Promise.all([
        this.memories.findAll(),
        this.contexts.latest(),
        this.suggestRoutine.execute()
      ]);

    const latestMemory = getLatestMemory(allMemories);

    if (latestContext === null) {
      return {
        emotionalState: "Unknown until context is captured.",
        whatMatteredMost:
          latestMemory?.content ?? "No memory or context has been captured yet.",
        suggestedNextStep:
          "Capture a context snapshot so LifeOS can reflect on the day.",
        currentRoutineRecommendation
      };
    }

    return {
      emotionalState: describeEmotionalState(latestContext),
      whatMatteredMost: latestMemory?.content ?? latestContext.currentSituation,
      suggestedNextStep: suggestNextStep(
        latestContext,
        currentRoutineRecommendation
      ),
      currentRoutineRecommendation
    };
  }
}

function getLatestMemory(memories: Memory[]): Memory | null {
  if (memories.length === 0) {
    return null;
  }

  return memories[memories.length - 1] ?? null;
}

function describeEmotionalState(context: ContextSnapshot): string {
  return `${context.mood} with ${context.energyLevel}/10 energy and ${context.focusLevel}/10 focus.`;
}

function suggestNextStep(
  context: ContextSnapshot,
  routine: RoutineSuggestion
): string {
  const mood = context.mood.toLowerCase();
  const isStressed = ["stressed", "anxious", "overwhelmed", "tense"].some(
    (word) => mood.includes(word)
  );

  if (isStressed && context.energyLevel <= 3) {
    return "Slow down and choose recovery before taking on more work.";
  }

  if (context.focusLevel >= 7 && context.energyLevel >= 7) {
    return "Maintain momentum with one clear task and a short work block.";
  }

  return `Follow the ${routine.name.toLowerCase()} and review again afterward.`;
}
