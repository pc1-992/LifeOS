import React from "react";
import {
  getActionHistory,
  getActivityFeed,
  getDashboard,
  getDailyReflection,
  getKnowledgeGraphReport,
  getLatestContext,
  getMemories,
  getMemoryLayers,
  getMemoryQualityReport,
  getNextBestStep,
  getOperatingProfile,
  getPatternInsights,
  getRecommendationFeedback,
  getRelevantMemories,
  getRoutineSuggestion,
  getStableTruths,
  getTemporalReport,
  getDailyActivity,
  getSignalInsights,
  getTodaySignals
} from "./api.js";
import type {
  ActionHistoryEntry,
  ActivityFeedItem,
  ContextSnapshot,
  DashboardSummary,
  DailyReflection,
  KnowledgeGraphReport,
  Memory,
  MemoryQualityReport,
  NextBestStep,
  PatternInsight,
  PersonalOperatingProfile,
  RecommendationFeedback,
  RetrievalResult,
  RoutineSuggestion,
  StableTruth,
  StructuredMemoryLayer,
  TemporalReport,
  DailyActivitySnapshot,
  PersonalSignal,
  SignalInsight
} from "./types.js";

export function useDashboardData() {
  const [dashboard, setDashboard] = React.useState<DashboardSummary | null>(
    null
  );
  const [dailyReflection, setDailyReflection] =
    React.useState<DailyReflection | null>(null);
  const [activityFeed, setActivityFeed] = React.useState<ActivityFeedItem[]>([]);
  const [patternInsights, setPatternInsights] = React.useState<
    PatternInsight[]
  >([]);
  const [nextBestStep, setNextBestStep] = React.useState<NextBestStep | null>(
    null
  );

  async function loadDashboardData(): Promise<void> {
    const [summary, step, reflection, feed, insights] = await Promise.all([
      getDashboard(),
      getNextBestStep(),
      getDailyReflection(),
      getActivityFeed(),
      getPatternInsights()
    ]);

    setDashboard(summary);
    setNextBestStep(step);
    setDailyReflection(reflection);
    setActivityFeed(feed);
    setPatternInsights(insights);
  }

  async function loadNextBestStep(): Promise<void> {
    setNextBestStep(await getNextBestStep());
  }

  return {
    dashboard,
    dailyReflection,
    activityFeed,
    patternInsights,
    nextBestStep,
    loadDashboardData,
    loadNextBestStep
  };
}

export function useMemoryData() {
  const [memories, setMemories] = React.useState<Memory[]>([]);
  const [memoryLayers, setMemoryLayers] = React.useState<
    StructuredMemoryLayer[]
  >([]);
  const [memoryQualityReport, setMemoryQualityReport] =
    React.useState<MemoryQualityReport | null>(null);
  const [stableTruths, setStableTruths] = React.useState<StableTruth[]>([]);

  async function loadMemoryData(): Promise<void> {
    const [savedMemories, layers, qualityReport, truths] = await Promise.all([
      getMemories(),
      getMemoryLayers(),
      getMemoryQualityReport(),
      getStableTruths()
    ]);

    setMemories(savedMemories);
    setMemoryLayers(layers);
    setMemoryQualityReport(qualityReport);
    setStableTruths(truths);
  }

  return {
    memories,
    memoryLayers,
    memoryQualityReport,
    stableTruths,
    loadMemoryData
  };
}

export function useContextData() {
  const [latestContext, setLatestContext] =
    React.useState<ContextSnapshot | null>(null);
  const [routineSuggestion, setRoutineSuggestion] =
    React.useState<RoutineSuggestion | null>(null);

  async function loadContextData(): Promise<void> {
    const [context, routine] = await Promise.all([
      getLatestContext(),
      getRoutineSuggestion()
    ]);

    setLatestContext(context);
    setRoutineSuggestion(routine);
  }

  return {
    latestContext,
    routineSuggestion,
    loadContextData
  };
}

export function useRetrievalData() {
  const [retrievalQuery, setRetrievalQuery] = React.useState("");
  const [retrievalResults, setRetrievalResults] = React.useState<
    RetrievalResult[]
  >([]);

  async function loadRelevantMemories(query = retrievalQuery): Promise<void> {
    setRetrievalResults(await getRelevantMemories(query));
  }

  async function chooseRetrievalQuery(query: string): Promise<void> {
    setRetrievalQuery(query);
    await loadRelevantMemories(query);
  }

  return {
    retrievalQuery,
    retrievalResults,
    loadRelevantMemories,
    chooseRetrievalQuery
  };
}

export function useFeedbackData() {
  const [actionHistory, setActionHistory] = React.useState<ActionHistoryEntry[]>(
    []
  );
  const [recommendationFeedback, setRecommendationFeedback] =
    React.useState<RecommendationFeedback | null>(null);
  const [operatingProfile, setOperatingProfile] =
    React.useState<PersonalOperatingProfile | null>(null);

  async function loadFeedbackData(): Promise<void> {
    const [history, feedback, profile] = await Promise.all([
      getActionHistory(),
      getRecommendationFeedback(),
      getOperatingProfile()
    ]);

    setActionHistory(history);
    setRecommendationFeedback(feedback);
    setOperatingProfile(profile);
  }

  return {
    actionHistory,
    recommendationFeedback,
    operatingProfile,
    loadFeedbackData
  };
}

export function useGraphData() {
  const [knowledgeGraphReport, setKnowledgeGraphReport] =
    React.useState<KnowledgeGraphReport | null>(null);
  const [temporalReport, setTemporalReport] =
    React.useState<TemporalReport | null>(null);

  async function loadGraphData(): Promise<void> {
    const [graphReport, timeReport] = await Promise.all([
      getKnowledgeGraphReport(),
      getTemporalReport()
    ]);

    setKnowledgeGraphReport(graphReport);
    setTemporalReport(timeReport);
  }

  return {
    knowledgeGraphReport,
    temporalReport,
    loadGraphData
  };
}

export function useSignalData() {
  const [signals, setSignals] = React.useState<PersonalSignal[]>([]);
  const [dailyActivity, setDailyActivity] =
    React.useState<DailyActivitySnapshot | null>(null);
  const [signalInsights, setSignalInsights] = React.useState<SignalInsight[]>(
    []
  );

  async function loadSignalData(): Promise<void> {
    const [todaySignals, activity, insights] = await Promise.all([
      getTodaySignals(),
      getDailyActivity(),
      getSignalInsights()
    ]);

    setSignals(todaySignals);
    setDailyActivity(activity);
    setSignalInsights(insights);
  }

  return {
    signals,
    dailyActivity,
    signalInsights,
    loadSignalData
  };
}
