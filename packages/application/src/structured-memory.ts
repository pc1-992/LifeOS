import type {
  ActionHistoryEntry,
  ActivityFeedItem,
  EpisodicMemory,
  IdentityMemory,
  Memory,
  ProceduralMemory,
  RecommendationFeedback,
  SemanticMemory,
  StructuredMemoryItem,
  WorkingMemory
} from "@lifeos/core";
import type {
  ActionHistoryRepository,
  ContextRepository,
  MemoryRepository
} from "./ports.js";
import { GenerateDailyReflectionUseCase } from "./generate-daily-reflection.js";
import { GenerateNextBestStepUseCase } from "./generate-next-best-step.js";
import { GeneratePatternInsightsUseCase } from "./generate-pattern-insights.js";
import { GeneratePersonalOperatingProfileUseCase } from "./generate-personal-operating-profile.js";
import { GetActivityFeedUseCase } from "./get-activity-feed.js";
import { RecommendationFeedbackUseCase } from "./recommendation-feedback.js";
import { SuggestRoutineUseCase } from "./suggest-routine.js";

export class GenerateWorkingMemoryUseCase {
  private readonly suggestRoutine: SuggestRoutineUseCase;
  private readonly generateNextBestStep: GenerateNextBestStepUseCase;

  constructor(
    memories: MemoryRepository,
    private readonly contexts: ContextRepository,
    actionHistory: ActionHistoryRepository
  ) {
    this.suggestRoutine = new SuggestRoutineUseCase(contexts);
    this.generateNextBestStep = new GenerateNextBestStepUseCase(
      memories,
      contexts,
      actionHistory
    );
  }

  async execute(): Promise<WorkingMemory> {
    const [latestContext, currentRoutine, nextBestStep] = await Promise.all([
      this.contexts.latest(),
      this.suggestRoutine.execute(),
      this.generateNextBestStep.execute()
    ]);

    return {
      layer: "Working Memory",
      description:
        "The live operating state: current context, current routine, and the next best step.",
      items: [
        ...(latestContext === null
          ? []
          : [
              {
                id: `working_context_${latestContext.id}`,
                title: "Current context",
                summary: latestContext.summary,
                sourceType: "context",
                why: "Working memory holds the current situation LifeOS is actively using."
              } satisfies StructuredMemoryItem
            ]),
        {
          id: `working_routine_${currentRoutine.id}`,
          title: "Current routine",
          summary: currentRoutine.name,
          sourceType: "routine",
          why: "The current routine guides what should happen next in the active moment."
        },
        {
          id: `working_next_step_${nextBestStep.id}`,
          title: "Next best step",
          summary: nextBestStep.action,
          sourceType: "recommendation",
          why: "The next best step is the immediate action candidate in working memory."
        }
      ]
    };
  }
}

export class GenerateEpisodicMemoryUseCase {
  private readonly generateDailyReflection: GenerateDailyReflectionUseCase;
  private readonly getActivityFeed: GetActivityFeedUseCase;

  constructor(
    private readonly memories: MemoryRepository,
    contexts: ContextRepository,
    private readonly actionHistory: ActionHistoryRepository
  ) {
    this.generateDailyReflection = new GenerateDailyReflectionUseCase(
      memories,
      contexts
    );
    this.getActivityFeed = new GetActivityFeedUseCase(memories, contexts);
  }

  async execute(): Promise<EpisodicMemory> {
    const [memories, reflection, actionHistory, activityFeed] = await Promise.all([
      this.memories.findAll(),
      this.generateDailyReflection.execute(),
      this.actionHistory.findAll(),
      this.getActivityFeed.execute()
    ]);

    return {
      layer: "Episodic Memory",
      description:
        "The event record: captured memories, reflections, completed/skipped actions, and timeline events.",
      items: [
        ...memories.slice(-5).map(toMemoryItem),
        {
          id: "episodic_daily_reflection",
          title: "Latest daily reflection",
          summary: reflection.suggestedNextStep,
          sourceType: "reflection",
          why: "Reflections summarize what happened and what mattered in lived experience."
        },
        ...actionHistory.slice(0, 5).map(toActionHistoryItem),
        ...activityFeed.slice(-5).map(toTimelineItem)
      ]
    };
  }
}

export class GenerateSemanticMemoryUseCase {
  private readonly generatePatternInsights: GeneratePatternInsightsUseCase;
  private readonly recommendationFeedback: RecommendationFeedbackUseCase;

  constructor(
    memories: MemoryRepository,
    contexts: ContextRepository,
    actionHistory: ActionHistoryRepository
  ) {
    this.generatePatternInsights = new GeneratePatternInsightsUseCase(
      memories,
      contexts
    );
    this.recommendationFeedback = new RecommendationFeedbackUseCase(actionHistory);
  }

  async execute(): Promise<SemanticMemory> {
    const [patternInsights, feedback] = await Promise.all([
      this.generatePatternInsights.execute(),
      this.recommendationFeedback.execute()
    ]);

    return {
      layer: "Semantic Memory",
      description:
        "Stable meaning extracted from repeated local data: truths, patterns, and recurring behaviors.",
      items: [
        ...patternInsights.map((insight) => ({
          id: `semantic_${insight.id}`,
          title: insight.title,
          summary: insight.summary,
          sourceType: "pattern" as const,
          why: "Pattern insights belong in semantic memory because they summarize repeated signals."
        })),
        ...feedback.highlyEffectiveRecommendations.map((recommendation) => ({
          id: `semantic_effective_${recommendation.recommendationKey}`,
          title: "Repeated successful pattern",
          summary: recommendation.action,
          sourceType: "pattern" as const,
          why: "A recommendation that repeatedly works becomes a stable behavioral truth."
        })),
        ...feedback.frequentlySkippedRecommendations.map((recommendation) => ({
          id: `semantic_skipped_${recommendation.recommendationKey}`,
          title: "Recurring skipped behavior",
          summary: recommendation.action,
          sourceType: "pattern" as const,
          why: "Frequently skipped recommendations reveal behavior LifeOS should understand."
        }))
      ]
    };
  }
}

export class GenerateIdentityMemoryUseCase {
  private readonly generateProfile: GeneratePersonalOperatingProfileUseCase;

  constructor(
    memories: MemoryRepository,
    contexts: ContextRepository,
    actionHistory: ActionHistoryRepository
  ) {
    this.generateProfile = new GeneratePersonalOperatingProfileUseCase(
      memories,
      contexts,
      actionHistory
    );
  }

  async execute(): Promise<IdentityMemory> {
    const profile = await this.generateProfile.execute();

    return {
      layer: "Identity Memory",
      description:
        "The long-term personal operating profile: LifeOS DNA and stable behavioral tendencies.",
      items: profile.traits.map((trait) => ({
        id: `identity_${trait.type}`,
        title: trait.title,
        summary: trait.summary,
        sourceType: "profile_trait",
        why: "LifeOS DNA traits belong in identity memory because they describe longer-term behavior."
      }))
    };
  }
}

export class GenerateProceduralMemoryUseCase {
  private readonly recommendationFeedback: RecommendationFeedbackUseCase;
  private readonly suggestRoutine: SuggestRoutineUseCase;

  constructor(
    contexts: ContextRepository,
    actionHistory: ActionHistoryRepository
  ) {
    this.recommendationFeedback = new RecommendationFeedbackUseCase(actionHistory);
    this.suggestRoutine = new SuggestRoutineUseCase(contexts);
  }

  async execute(): Promise<ProceduralMemory> {
    const [feedback, currentRoutine] = await Promise.all([
      this.recommendationFeedback.execute(),
      this.suggestRoutine.execute()
    ]);

    return {
      layer: "Procedural Memory",
      description:
        "The operational playbook: successful routines, preferences, and deterministic adaptive rules.",
      items: [
        {
          id: `procedural_current_routine_${currentRoutine.id}`,
          title: "Current operating routine",
          summary: currentRoutine.name,
          sourceType: "routine",
          why: "A routine is procedural memory because it describes how to act."
        },
        ...feedback.mostSuccessfulRoutines.map(toSuccessfulRoutineItem),
        ...getAdaptiveRuleItems(feedback)
      ]
    };
  }
}

function toMemoryItem(memory: Memory): StructuredMemoryItem {
  return {
    id: `episodic_memory_${memory.id}`,
    title: "Captured memory",
    summary: memory.content,
    sourceType: "memory",
    why: "Captured memories are episodic because they record something that happened."
  };
}

function toActionHistoryItem(entry: ActionHistoryEntry): StructuredMemoryItem {
  return {
    id: `episodic_action_${entry.id}`,
    title: `Action ${entry.status}`,
    summary: entry.suggestedAction.action,
    sourceType: "action_history",
    why: "Action history is episodic because it records whether a specific recommendation was followed."
  };
}

function toTimelineItem(item: ActivityFeedItem): StructuredMemoryItem {
  return {
    id: `episodic_timeline_${item.id}`,
    title: "Timeline event",
    summary: item.summary,
    sourceType: "timeline_event",
    why: "Timeline events are episodic because they preserve sequence and context over time."
  };
}

function toSuccessfulRoutineItem(
  routine: RecommendationFeedback["mostSuccessfulRoutines"][number]
): StructuredMemoryItem {
  return {
    id: `procedural_successful_routine_${routine.routineName}`,
    title: "Successful routine",
    summary: `${routine.routineName} has a ${Math.round(
      routine.completionRate * 100
    )}% completion rate.`,
    sourceType: "routine",
    why: "Successful routines belong in procedural memory because they can guide future action."
  };
}

function getAdaptiveRuleItems(
  feedback: RecommendationFeedback
): StructuredMemoryItem[] {
  return feedback.highlyEffectiveRecommendations.map((recommendation) => ({
    id: `procedural_rule_${recommendation.recommendationKey}`,
    title: "Adaptive rule",
    summary: `Prefer "${recommendation.title}" when similar context appears.`,
    sourceType: "adaptive_rule",
    why: "Deterministic adaptive rules belong in procedural memory because they change how LifeOS chooses actions."
  }));
}
