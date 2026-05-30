import React from "react";
import { getErrorMessage, postJson } from "./api.js";
import {
  ActionHistoryPanel,
  DashboardPanel,
  FeedbackPanel,
  InsightsPanel,
  KnowledgeGraphPanel,
  LatestContextPanel,
  MemoryArchitecturePanel,
  MemoryHealthPanel,
  MemoryListPanel,
  NextStepPanel,
  OperatingProfilePanel,
  ReflectionPanel,
  RetrievalPanel,
  RoutineSuggestionPanel,
  StableTruthsPanel,
  TimelinePanel
} from "./components/panels.js";
import {
  useContextData,
  useDashboardData,
  useFeedbackData,
  useGraphData,
  useMemoryData,
  useRetrievalData
} from "./hooks.js";
import type { ActionCompletionStatus, PrivacyScope } from "./types.js";

export function App() {
  const [content, setContent] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [privacyScope, setPrivacyScope] =
    React.useState<PrivacyScope>("private");
  const [status, setStatus] = React.useState("");
  const [mood, setMood] = React.useState("");
  const [energyLevel, setEnergyLevel] = React.useState(5);
  const [focusLevel, setFocusLevel] = React.useState(5);
  const [currentSituation, setCurrentSituation] = React.useState("");
  const [contextPrivacyScope, setContextPrivacyScope] =
    React.useState<PrivacyScope>("private");
  const [contextStatus, setContextStatus] = React.useState("");
  const [actionStatus, setActionStatus] = React.useState("");

  const dashboardData = useDashboardData();
  const memoryData = useMemoryData();
  const contextData = useContextData();
  const retrievalData = useRetrievalData();
  const feedbackData = useFeedbackData();
  const graphData = useGraphData();

  React.useEffect(() => {
    void loadInitialData();
  }, []);

  async function loadInitialData(): Promise<void> {
    await Promise.all([
      dashboardData.loadDashboardData(),
      memoryData.loadMemoryData(),
      contextData.loadContextData(),
      retrievalData.loadRelevantMemories(),
      feedbackData.loadFeedbackData(),
      graphData.loadGraphData()
    ]);
  }

  async function refreshAfterMemoryChange(): Promise<void> {
    await Promise.all([
      dashboardData.loadDashboardData(),
      memoryData.loadMemoryData(),
      feedbackData.loadFeedbackData(),
      graphData.loadGraphData(),
      retrievalData.loadRelevantMemories()
    ]);
  }

  async function refreshAfterContextChange(): Promise<void> {
    await Promise.all([
      contextData.loadContextData(),
      dashboardData.loadDashboardData(),
      memoryData.loadMemoryData(),
      feedbackData.loadFeedbackData(),
      graphData.loadGraphData(),
      retrievalData.loadRelevantMemories()
    ]);
  }

  async function refreshAfterActionChange(): Promise<void> {
    await Promise.all([
      feedbackData.loadFeedbackData(),
      memoryData.loadMemoryData(),
      graphData.loadGraphData(),
      retrievalData.loadRelevantMemories(),
      dashboardData.loadNextBestStep()
    ]);
  }

  async function recordAction(status: ActionCompletionStatus): Promise<void> {
    if (dashboardData.nextBestStep === null) {
      return;
    }

    setActionStatus(
      status === "completed" ? "Saving completion..." : "Saving skip..."
    );

    const response = await postJson("/action-history", {
      suggestedAction: dashboardData.nextBestStep,
      status
    });

    if (!response.ok) {
      setActionStatus(await getErrorMessage(response, "Could not save action."));
      return;
    }

    setActionStatus(status === "completed" ? "Marked completed." : "Skipped.");
    await refreshAfterActionChange();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving memory...");

    const response = await postJson("/memories", {
      content,
      tags,
      privacyScope
    });

    if (!response.ok) {
      setStatus(await getErrorMessage(response, "Could not save memory."));
      return;
    }

    setContent("");
    setTags("");
    setPrivacyScope("private");
    setStatus("Memory saved.");
    await refreshAfterMemoryChange();
  }

  async function handleContextSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContextStatus("Saving context...");

    const response = await postJson("/context", {
      mood,
      energyLevel,
      focusLevel,
      currentSituation,
      privacyScope: contextPrivacyScope
    });

    if (!response.ok) {
      setContextStatus(await getErrorMessage(response, "Could not save context."));
      return;
    }

    setMood("");
    setEnergyLevel(5);
    setFocusLevel(5);
    setCurrentSituation("");
    setContextPrivacyScope("private");
    setContextStatus("Context saved.");
    await refreshAfterContextChange();
  }

  return (
    <main className="shell">
      <DashboardPanel dashboard={dashboardData.dashboard} />
      <NextStepPanel
        nextBestStep={dashboardData.nextBestStep}
        actionStatus={actionStatus}
        onRecordAction={(nextStatus) => void recordAction(nextStatus)}
      />
      <ActionHistoryPanel actionHistory={feedbackData.actionHistory} />
      <FeedbackPanel
        recommendationFeedback={feedbackData.recommendationFeedback}
      />
      <OperatingProfilePanel operatingProfile={feedbackData.operatingProfile} />
      <MemoryArchitecturePanel memoryLayers={memoryData.memoryLayers} />
      <RetrievalPanel
        retrievalQuery={retrievalData.retrievalQuery}
        retrievalResults={retrievalData.retrievalResults}
        onChooseQuery={(query) => void retrievalData.chooseRetrievalQuery(query)}
      />
      <MemoryHealthPanel
        memoryQualityReport={memoryData.memoryQualityReport}
      />
      <StableTruthsPanel stableTruths={memoryData.stableTruths} />
      <KnowledgeGraphPanel
        knowledgeGraphReport={graphData.knowledgeGraphReport}
      />
      <ReflectionPanel dailyReflection={dashboardData.dailyReflection} />
      <InsightsPanel patternInsights={dashboardData.patternInsights} />
      <TimelinePanel activityFeed={dashboardData.activityFeed} />

      <section className="panel">
        <p className="eyebrow">LifeOS</p>
        <h1>Context Snapshot</h1>
        <p className="intro">
          Capture the current moment in a small, private-by-default snapshot.
        </p>

        <form className="context-form" onSubmit={handleContextSubmit}>
          <label>
            Mood
            <input
              value={mood}
              onChange={(event) => setMood(event.target.value)}
              placeholder="calm, tired, focused"
            />
          </label>

          <label>
            Energy level
            <input
              type="number"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(event) => setEnergyLevel(Number(event.target.value))}
            />
          </label>

          <label>
            Focus level
            <input
              type="number"
              min="1"
              max="10"
              value={focusLevel}
              onChange={(event) => setFocusLevel(Number(event.target.value))}
            />
          </label>

          <label>
            Current situation
            <textarea
              value={currentSituation}
              onChange={(event) => setCurrentSituation(event.target.value)}
              placeholder="What is happening right now?"
              rows={4}
            />
          </label>

          <label>
            Privacy scope
            <select
              value={contextPrivacyScope}
              onChange={(event) =>
                setContextPrivacyScope(event.target.value as PrivacyScope)
              }
            >
              <option value="private">private</option>
              <option value="trusted">trusted</option>
              <option value="shareable">shareable</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="submit">Save context</button>
            <span role="status" aria-live="polite">
              {contextStatus}
            </span>
          </div>
        </form>
      </section>

      <LatestContextPanel latestContext={contextData.latestContext} />
      <RoutineSuggestionPanel
        routineSuggestion={contextData.routineSuggestion}
      />

      <section className="panel">
        <p className="eyebrow">LifeOS</p>
        <h1>Memory Capture</h1>
        <p className="intro">
          Capture a simple memory with visible privacy context. This first slice
          keeps storage temporary and local to the running API process.
        </p>

        <form className="memory-form" onSubmit={handleSubmit}>
          <label>
            Memory
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="What should LifeOS remember?"
              rows={5}
            />
          </label>

          <label>
            Privacy scope
            <select
              value={privacyScope}
              onChange={(event) =>
                setPrivacyScope(event.target.value as PrivacyScope)
              }
            >
              <option value="private">private</option>
              <option value="trusted">trusted</option>
              <option value="shareable">shareable</option>
            </select>
          </label>

          <label>
            Tags
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="routine, health, idea"
            />
          </label>

          <div className="form-actions">
            <button type="submit">Save memory</button>
            <span role="status" aria-live="polite">
              {status}
            </span>
          </div>
        </form>
      </section>

      <MemoryListPanel memories={memoryData.memories} />
    </main>
  );
}
