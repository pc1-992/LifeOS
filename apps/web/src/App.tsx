import React from "react";
import { getErrorMessage, postJson } from "./api.js";
import {
  ActionHistoryPanel,
  DashboardPanel,
  FeedbackPanel,
  InsightsPanel,
  KnowledgeGraphPanel,
  LanguageSwitch,
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
  TemporalIntelligencePanel,
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
import { getPrivacyLabel, useLanguage } from "./localization.js";
import type { ActionCompletionStatus, PrivacyScope } from "./types.js";

export function App() {
  const { language, direction, translations: t, setLanguage } = useLanguage();
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
      status === "completed" ? t.status.savingCompletion : t.status.savingSkip
    );

    const response = await postJson("/action-history", {
      suggestedAction: dashboardData.nextBestStep,
      status
    });

    if (!response.ok) {
      setActionStatus(await getErrorMessage(response, t.status.actionSaveError));
      return;
    }

    setActionStatus(
      status === "completed" ? t.status.markedCompleted : t.status.markedSkipped
    );
    await refreshAfterActionChange();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(t.status.savingMemory);

    const response = await postJson("/memories", {
      content,
      tags,
      privacyScope
    });

    if (!response.ok) {
      setStatus(await getErrorMessage(response, t.status.memorySaveError));
      return;
    }

    setContent("");
    setTags("");
    setPrivacyScope("private");
    setStatus(t.status.memorySaved);
    await refreshAfterMemoryChange();
  }

  async function handleContextSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContextStatus(t.status.savingContext);

    const response = await postJson("/context", {
      mood,
      energyLevel,
      focusLevel,
      currentSituation,
      privacyScope: contextPrivacyScope
    });

    if (!response.ok) {
      setContextStatus(await getErrorMessage(response, t.status.contextSaveError));
      return;
    }

    setMood("");
    setEnergyLevel(5);
    setFocusLevel(5);
    setCurrentSituation("");
    setContextPrivacyScope("private");
    setContextStatus(t.status.contextSaved);
    await refreshAfterContextChange();
  }

  return (
    <main className="shell" dir={language === "he" ? direction : undefined}>
      <LanguageSwitch
        language={language}
        t={t}
        onChangeLanguage={setLanguage}
      />
      <DashboardPanel
        dashboard={dashboardData.dashboard}
        language={language}
        t={t}
      />
      <NextStepPanel
        nextBestStep={dashboardData.nextBestStep}
        actionStatus={actionStatus}
        onRecordAction={(nextStatus) => void recordAction(nextStatus)}
        language={language}
        t={t}
      />
      <ActionHistoryPanel
        actionHistory={feedbackData.actionHistory}
        language={language}
        t={t}
      />
      <FeedbackPanel
        recommendationFeedback={feedbackData.recommendationFeedback}
        language={language}
        t={t}
      />
      <OperatingProfilePanel
        operatingProfile={feedbackData.operatingProfile}
        language={language}
        t={t}
      />
      <MemoryArchitecturePanel
        memoryLayers={memoryData.memoryLayers}
        language={language}
        t={t}
      />
      <RetrievalPanel
        retrievalQuery={retrievalData.retrievalQuery}
        retrievalResults={retrievalData.retrievalResults}
        onChooseQuery={(query) => void retrievalData.chooseRetrievalQuery(query)}
        language={language}
        t={t}
      />
      <MemoryHealthPanel
        memoryQualityReport={memoryData.memoryQualityReport}
        language={language}
        t={t}
      />
      <StableTruthsPanel
        stableTruths={memoryData.stableTruths}
        language={language}
        t={t}
      />
      <KnowledgeGraphPanel
        knowledgeGraphReport={graphData.knowledgeGraphReport}
        language={language}
        t={t}
      />
      <TemporalIntelligencePanel
        temporalReport={graphData.temporalReport}
        language={language}
        t={t}
      />
      <ReflectionPanel
        dailyReflection={dashboardData.dailyReflection}
        language={language}
        t={t}
      />
      <InsightsPanel
        patternInsights={dashboardData.patternInsights}
        language={language}
        t={t}
      />
      <TimelinePanel
        activityFeed={dashboardData.activityFeed}
        language={language}
        t={t}
      />

      <section className="panel">
        <p className="eyebrow">{t.contextCapture.eyebrow}</p>
        <h1>{t.contextCapture.title}</h1>
        <p className="intro">{t.contextCapture.intro}</p>

        <form className="context-form" onSubmit={handleContextSubmit}>
          <label>
            {t.contextCapture.mood}
            <input
              value={mood}
              onChange={(event) => setMood(event.target.value)}
              placeholder={t.contextCapture.moodPlaceholder}
            />
          </label>

          <label>
            {t.contextCapture.energy}
            <input
              type="number"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(event) => setEnergyLevel(Number(event.target.value))}
            />
          </label>

          <label>
            {t.contextCapture.focus}
            <input
              type="number"
              min="1"
              max="10"
              value={focusLevel}
              onChange={(event) => setFocusLevel(Number(event.target.value))}
            />
          </label>

          <label>
            {t.contextCapture.situation}
            <textarea
              value={currentSituation}
              onChange={(event) => setCurrentSituation(event.target.value)}
              placeholder={t.contextCapture.situationPlaceholder}
              rows={4}
            />
          </label>

          <label>
            {t.contextCapture.privacy}
            <select
              value={contextPrivacyScope}
              onChange={(event) =>
                setContextPrivacyScope(event.target.value as PrivacyScope)
              }
            >
              <option value="private">{getPrivacyLabel(t, "private")}</option>
              <option value="trusted">{getPrivacyLabel(t, "trusted")}</option>
              <option value="shareable">{getPrivacyLabel(t, "shareable")}</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="submit">{t.contextCapture.save}</button>
            <span role="status" aria-live="polite">
              {contextStatus}
            </span>
          </div>
        </form>
      </section>

      <LatestContextPanel
        latestContext={contextData.latestContext}
        language={language}
        t={t}
      />
      <RoutineSuggestionPanel
        routineSuggestion={contextData.routineSuggestion}
        language={language}
        t={t}
      />

      <section className="panel">
        <p className="eyebrow">{t.memoryCapture.eyebrow}</p>
        <h1>{t.memoryCapture.title}</h1>
        <p className="intro">{t.memoryCapture.intro}</p>

        <form className="memory-form" onSubmit={handleSubmit}>
          <label>
            {t.memoryCapture.memory}
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={t.memoryCapture.memoryPlaceholder}
              rows={5}
            />
          </label>

          <label>
            {t.memoryCapture.privacy}
            <select
              value={privacyScope}
              onChange={(event) =>
                setPrivacyScope(event.target.value as PrivacyScope)
              }
            >
              <option value="private">{getPrivacyLabel(t, "private")}</option>
              <option value="trusted">{getPrivacyLabel(t, "trusted")}</option>
              <option value="shareable">{getPrivacyLabel(t, "shareable")}</option>
            </select>
          </label>

          <label>
            {t.memoryCapture.tags}
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder={t.memoryCapture.tagsPlaceholder}
            />
          </label>

          <div className="form-actions">
            <button type="submit">{t.memoryCapture.save}</button>
            <span role="status" aria-live="polite">
              {status}
            </span>
          </div>
        </form>
      </section>

      <MemoryListPanel memories={memoryData.memories} language={language} t={t} />
    </main>
  );
}
