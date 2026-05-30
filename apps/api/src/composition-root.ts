import {
  SQLiteActionHistoryRepository,
  SQLiteContextRepository,
  SQLiteMemoryRepository,
  SQLitePersonalSignalRepository
} from "@lifeos/adapters";
import {
  BuildKnowledgeGraphUseCase,
  CaptureContextUseCase,
  CaptureMemoryUseCase,
  DashboardSummaryUseCase,
  GenerateDailyReflectionUseCase,
  GenerateMemoryConsolidationUseCase,
  GenerateMemoryHygieneReportUseCase,
  GenerateNextBestStepUseCase,
  GenerateDailyActivitySnapshotUseCase,
  GeneratePersonalOperatingProfileUseCase,
  GeneratePatternInsightsUseCase,
  GenerateSignalInsightsUseCase,
  GenerateTemporalIntelligenceUseCase,
  GetActivityFeedUseCase,
  MemoryLayerProvider,
  RecommendationFeedbackUseCase,
  RecordActionCompletionUseCase,
  RecordPersonalSignalUseCase,
  RetrieveRelevantMemoriesUseCase,
  SuggestRoutineUseCase
} from "@lifeos/application";
import { config } from "./config.js";

export function createAppContext() {
  const memories = new SQLiteMemoryRepository(config.sqliteDatabasePath);
  const contexts = new SQLiteContextRepository(config.sqliteDatabasePath);
  const actionHistory = new SQLiteActionHistoryRepository(
    config.sqliteDatabasePath
  );
  const personalSignals = new SQLitePersonalSignalRepository(
    config.sqliteDatabasePath
  );
  const memoryLayers = new MemoryLayerProvider(memories, contexts, actionHistory);

  return {
    repositories: {
      memories,
      contexts,
      actionHistory,
      personalSignals
    },
    useCases: {
      captureMemory: new CaptureMemoryUseCase(memories),
      captureContext: new CaptureContextUseCase(contexts),
      suggestRoutine: new SuggestRoutineUseCase(contexts),
      dashboardSummary: new DashboardSummaryUseCase(memories, contexts),
      dailyReflection: new GenerateDailyReflectionUseCase(memories, contexts),
      activityFeed: new GetActivityFeedUseCase(memories, contexts),
      patternInsights: new GeneratePatternInsightsUseCase(memories, contexts),
      recommendationFeedback: new RecommendationFeedbackUseCase(actionHistory),
      memoryLayers,
      retrieveRelevantMemories: new RetrieveRelevantMemoriesUseCase(
        memories,
        contexts,
        actionHistory
      ),
      memoryHygiene: new GenerateMemoryHygieneReportUseCase(
        memories,
        contexts,
        actionHistory
      ),
      memoryConsolidation: new GenerateMemoryConsolidationUseCase(
        memories,
        contexts,
        actionHistory
      ),
      knowledgeGraph: new BuildKnowledgeGraphUseCase(
        memories,
        contexts,
        actionHistory
      ),
      temporalIntelligence: new GenerateTemporalIntelligenceUseCase(
        memories,
        contexts,
        actionHistory
      ),
      operatingProfile: new GeneratePersonalOperatingProfileUseCase(
        memories,
        contexts,
        actionHistory
      ),
      nextBestStep: new GenerateNextBestStepUseCase(
        memories,
        contexts,
        actionHistory
      ),
      recordActionCompletion: new RecordActionCompletionUseCase(actionHistory),
      recordPersonalSignal: new RecordPersonalSignalUseCase(personalSignals),
      dailyActivity: new GenerateDailyActivitySnapshotUseCase(personalSignals),
      signalInsights: new GenerateSignalInsightsUseCase(personalSignals)
    }
  };
}

export type AppContext = ReturnType<typeof createAppContext>;
