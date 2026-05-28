import type {
  ActivityFeedItem,
  ContextSnapshot,
  Memory,
  PatternInsight
} from "@lifeos/core";
import type { ContextRepository, MemoryRepository } from "./ports.js";
import { GetActivityFeedUseCase } from "./get-activity-feed.js";
import { SuggestRoutineUseCase } from "./suggest-routine.js";

export class GeneratePatternInsightsUseCase {
  private readonly getActivityFeed: GetActivityFeedUseCase;
  private readonly suggestRoutine: SuggestRoutineUseCase;

  constructor(
    private readonly memories: MemoryRepository,
    private readonly contexts: ContextRepository
  ) {
    this.getActivityFeed = new GetActivityFeedUseCase(memories, contexts);
    this.suggestRoutine = new SuggestRoutineUseCase(contexts);
  }

  async execute(): Promise<PatternInsight[]> {
    const [allMemories, allContexts, routine, activityFeed] = await Promise.all([
      this.memories.findAll(),
      this.contexts.findAll(),
      this.suggestRoutine.execute(),
      this.getActivityFeed.execute()
    ]);

    return [
      getEnergyFocusInsight(allContexts),
      getMoodInsight(allContexts),
      getRoutineInsight(routine.name),
      getTagInsight(allMemories),
      getActivityMixInsight(activityFeed)
    ];
  }
}

function getEnergyFocusInsight(contexts: ContextSnapshot[]): PatternInsight {
  const lowEnergyContexts = contexts.filter((context) => context.energyLevel <= 3);
  const lowEnergyAndFocus = lowEnergyContexts.filter(
    (context) => context.focusLevel <= 4
  );

  if (lowEnergyContexts.length === 0) {
    return {
      id: "insight_energy_focus",
      type: "energy_focus",
      title: "Energy and focus",
      summary: "No low-energy pattern is visible yet."
    };
  }

  return {
    id: "insight_energy_focus",
    type: "energy_focus",
    title: "Energy and focus",
    summary: `${lowEnergyAndFocus.length} of ${lowEnergyContexts.length} low-energy snapshots also had low focus.`
  };
}

function getMoodInsight(contexts: ContextSnapshot[]): PatternInsight {
  const stressedCount = contexts.filter((context) =>
    ["stressed", "anxious", "overwhelmed", "tense"].some((word) =>
      context.mood.toLowerCase().includes(word)
    )
  ).length;

  return {
    id: "insight_mood_frequency",
    type: "mood_frequency",
    title: "Mood pattern",
    summary:
      stressedCount === 0
        ? "Stressed mood has not appeared often yet."
        : `Stressed mood appears in ${stressedCount} context snapshot${
            stressedCount === 1 ? "" : "s"
          }.`
  };
}

function getRoutineInsight(routineName: string): PatternInsight {
  return {
    id: "insight_routine_frequency",
    type: "routine_frequency",
    title: "Routine pattern",
    summary: `${routineName} is the current routine pattern based on the latest context.`
  };
}

function getTagInsight(memories: Memory[]): PatternInsight {
  const tagCounts = new Map<string, number>();

  for (const memory of memories) {
    for (const tag of memory.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const topTag = [...tagCounts.entries()].sort(
    (left, right) => right[1] - left[1]
  )[0];

  return {
    id: "insight_memory_tags",
    type: "memory_tags",
    title: "Memory tags",
    summary: topTag
      ? `Most tagged memories currently point to "${topTag[0]}".`
      : "No memory tags have been captured yet."
  };
}

function getActivityMixInsight(activityFeed: ActivityFeedItem[]): PatternInsight {
  const contextCount = activityFeed.filter((item) => item.type === "context").length;
  const memoryCount = activityFeed.filter((item) => item.type === "memory").length;

  return {
    id: "insight_activity_mix",
    type: "activity_mix",
    title: "Activity mix",
    summary: `The feed currently includes ${contextCount} context item${
      contextCount === 1 ? "" : "s"
    } and ${memoryCount} memory item${memoryCount === 1 ? "" : "s"}.`
  };
}
