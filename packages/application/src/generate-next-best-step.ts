import type {
  ContextSnapshot,
  DailyReflection,
  NextBestStep,
  PatternInsight,
  RecommendationFeedback,
  RoutineSuggestion
} from "@lifeos/core";
import type {
  ActionHistoryRepository,
  ContextRepository,
  MemoryRepository
} from "./ports.js";
import { GenerateDailyReflectionUseCase } from "./generate-daily-reflection.js";
import { GeneratePatternInsightsUseCase } from "./generate-pattern-insights.js";
import { RecommendationFeedbackUseCase } from "./recommendation-feedback.js";
import { SuggestRoutineUseCase } from "./suggest-routine.js";

export class GenerateNextBestStepUseCase {
  private readonly generateDailyReflection: GenerateDailyReflectionUseCase;
  private readonly generatePatternInsights: GeneratePatternInsightsUseCase;
  private readonly recommendationFeedback?: RecommendationFeedbackUseCase;
  private readonly suggestRoutine: SuggestRoutineUseCase;

  constructor(
    memories: MemoryRepository,
    private readonly contexts: ContextRepository,
    actionHistory?: ActionHistoryRepository
  ) {
    this.generateDailyReflection = new GenerateDailyReflectionUseCase(
      memories,
      contexts
    );
    this.generatePatternInsights = new GeneratePatternInsightsUseCase(
      memories,
      contexts
    );
    this.recommendationFeedback =
      actionHistory === undefined
        ? undefined
        : new RecommendationFeedbackUseCase(actionHistory);
    this.suggestRoutine = new SuggestRoutineUseCase(contexts);
  }

  async execute(): Promise<NextBestStep> {
    const [latestContext, routine, reflection, insights, feedback] = await Promise.all([
      this.contexts.latest(),
      this.suggestRoutine.execute(),
      this.generateDailyReflection.execute(),
      this.generatePatternInsights.execute(),
      this.recommendationFeedback?.execute() ?? Promise.resolve(null)
    ]);

    if (latestContext === null) {
      return {
        id: "next_best_step_no_context",
        title: "Capture context first",
        action: "Save a context snapshot so LifeOS can recommend a grounded next step.",
        reason: "no_context",
        supportingSummary: reflection.suggestedNextStep
      };
    }

    const contextBasedStep = chooseStep(latestContext, routine, reflection, insights);

    return preferHighScoringStep(contextBasedStep, latestContext, feedback);
  }
}

function chooseStep(
  context: ContextSnapshot,
  routine: RoutineSuggestion,
  reflection: DailyReflection,
  insights: PatternInsight[]
): NextBestStep {
  const mood = context.mood.toLowerCase();
  const stressed = ["stressed", "anxious", "overwhelmed", "tense"].some(
    (word) => mood.includes(word)
  );

  if (stressed && context.energyLevel <= 3) {
    return {
      id: `next_best_step_${context.id}`,
      title: "Choose recovery",
      action: "Pause active work, drink water, and take five quiet minutes before deciding what comes next.",
      reason: "recovery_needed",
      supportingSummary: "Stress and low energy are both present in the latest context."
    };
  }

  if (hasFrequentStress(insights)) {
    return {
      id: `next_best_step_${context.id}`,
      title: "Slow the pace",
      action: "Reduce the next task to one small action and leave room to recover afterward.",
      reason: "frequent_stress",
      supportingSummary: getInsightSummary(insights, "mood_frequency")
    };
  }

  if (context.focusLevel >= 7 && context.energyLevel >= 7) {
    return {
      id: `next_best_step_${context.id}`,
      title: "Continue momentum",
      action: "Pick one meaningful task and work on it for the next twenty minutes.",
      reason: "momentum_available",
      supportingSummary: "The latest context shows strong focus and energy."
    };
  }

  return {
    id: `next_best_step_${context.id}`,
    title: routine.name,
    action: reflection.suggestedNextStep,
    reason: "follow_reflection",
    supportingSummary: `Current routine recommendation: ${routine.name}.`
  };
}

function hasFrequentStress(insights: PatternInsight[]): boolean {
  const moodInsight = insights.find((insight) => insight.type === "mood_frequency");

  return moodInsight !== undefined && !moodInsight.summary.includes("not appeared");
}

function getInsightSummary(
  insights: PatternInsight[],
  type: PatternInsight["type"]
): string {
  return insights.find((insight) => insight.type === type)?.summary ?? "";
}

function preferHighScoringStep(
  contextBasedStep: NextBestStep,
  context: ContextSnapshot,
  feedback: RecommendationFeedback | null
): NextBestStep {
  const bestRecommendation = feedback?.highlyEffectiveRecommendations[0];

  if (bestRecommendation === undefined) {
    return contextBasedStep;
  }

  return {
    id: `next_best_step_feedback_${context.id}`,
    title: bestRecommendation.title,
    action: bestRecommendation.action,
    reason: bestRecommendation.reason,
    supportingSummary: `This recommendation has worked well before with a score of ${bestRecommendation.score.toFixed(
      1
    )}.`
  };
}
