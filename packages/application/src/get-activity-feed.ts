import type {
  ActivityFeedItem,
  ContextSnapshot,
  Memory
} from "@lifeos/core";
import type { ContextRepository, MemoryRepository } from "./ports.js";
import { GenerateDailyReflectionUseCase } from "./generate-daily-reflection.js";
import { SuggestRoutineUseCase } from "./suggest-routine.js";

export class GetActivityFeedUseCase {
  private readonly generateDailyReflection: GenerateDailyReflectionUseCase;
  private readonly suggestRoutine: SuggestRoutineUseCase;

  constructor(
    private readonly memories: MemoryRepository,
    private readonly contexts: ContextRepository
  ) {
    this.generateDailyReflection = new GenerateDailyReflectionUseCase(
      memories,
      contexts
    );
    this.suggestRoutine = new SuggestRoutineUseCase(contexts);
  }

  async execute(): Promise<ActivityFeedItem[]> {
    const [allMemories, allContexts, latestContext, routine, reflection] =
      await Promise.all([
        this.memories.findAll(),
        this.contexts.findAll(),
        this.contexts.latest(),
        this.suggestRoutine.execute(),
        this.generateDailyReflection.execute()
      ]);

    const items: ActivityFeedItem[] = [
      ...allMemories.map(toMemoryItem),
      ...allContexts.map(toContextItem)
    ];

    const derivedTimestamp = getDerivedTimestamp(
      latestContext,
      allMemories[allMemories.length - 1] ?? null
    );

    items.push({
      id: `activity_${routine.id}`,
      timestamp: derivedTimestamp,
      type: "routine_suggestion",
      summary: routine.name
    });

    items.push({
      id: "activity_daily_reflection",
      timestamp: derivedTimestamp,
      type: "daily_reflection",
      summary: reflection.suggestedNextStep
    });

    return items.sort(
      (left, right) => left.timestamp.getTime() - right.timestamp.getTime()
    );
  }
}

function toMemoryItem(memory: Memory): ActivityFeedItem {
  return {
    id: `activity_${memory.id}`,
    timestamp: memory.createdAt,
    type: "memory",
    summary: memory.content
  };
}

function toContextItem(context: ContextSnapshot): ActivityFeedItem {
  return {
    id: `activity_${context.id}`,
    timestamp: context.capturedAt,
    type: "context",
    summary: context.summary
  };
}

function getDerivedTimestamp(
  latestContext: ContextSnapshot | null,
  latestMemory: Memory | null
): Date {
  return latestContext?.capturedAt ?? latestMemory?.createdAt ?? new Date();
}
