import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type PrivacyScope = "private" | "trusted" | "shareable";

interface Memory {
  id: string;
  createdAt: string;
  content: string;
  source: "user" | "system" | "agent";
  tags: string[];
  privacyScope: PrivacyScope;
}

interface ContextSnapshot {
  id: string;
  capturedAt: string;
  mood: string;
  energyLevel: number;
  focusLevel: number;
  currentSituation: string;
  summary: string;
  signals: string[];
  privacyScope: PrivacyScope;
}

interface RoutineSuggestion {
  id: string;
  name: string;
  description: string;
  steps: string[];
  reason:
    | "low_energy"
    | "low_focus"
    | "stressed_mood"
    | "steady_state"
    | "no_context";
  basedOnContextId: string | null;
  privacyScope: PrivacyScope;
}

interface DashboardSummary {
  whatMattersNow: string;
  latestMemory: Memory | null;
  latestContext: ContextSnapshot | null;
  suggestedRoutine: RoutineSuggestion;
}

interface DailyReflection {
  emotionalState: string;
  whatMatteredMost: string;
  suggestedNextStep: string;
  currentRoutineRecommendation: RoutineSuggestion;
}

interface ActivityFeedItem {
  id: string;
  timestamp: string;
  type: "memory" | "context" | "routine_suggestion" | "daily_reflection";
  summary: string;
}

interface PatternInsight {
  id: string;
  type:
    | "energy_focus"
    | "mood_frequency"
    | "routine_frequency"
    | "memory_tags"
    | "activity_mix";
  title: string;
  summary: string;
}

interface NextBestStep {
  id: string;
  title: string;
  action: string;
  reason:
    | "no_context"
    | "recovery_needed"
    | "momentum_available"
    | "frequent_stress"
    | "follow_reflection";
  supportingSummary: string;
}

type ActionCompletionStatus = "completed" | "skipped";

interface ActionHistoryEntry {
  id: string;
  suggestedAction: NextBestStep;
  status: ActionCompletionStatus;
  timestamp: string;
  effectivenessScore?: number;
}

interface RecommendationScore {
  recommendationKey: string;
  title: string;
  action: string;
  reason: NextBestStep["reason"];
  completedCount: number;
  skippedCount: number;
  totalCount: number;
  completionRate: number;
  averageEffectivenessScore: number | null;
  score: number;
}

interface RoutineSuccessScore {
  routineName: string;
  completedCount: number;
  skippedCount: number;
  completionRate: number;
  score: number;
}

interface RecommendationFeedback {
  generatedAt: string;
  totalActions: number;
  highlyEffectiveRecommendations: RecommendationScore[];
  frequentlySkippedRecommendations: RecommendationScore[];
  mostSuccessfulRoutines: RoutineSuccessScore[];
}

const apiUrl = "http://localhost:4000";

function App() {
  const [content, setContent] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [privacyScope, setPrivacyScope] =
    React.useState<PrivacyScope>("private");
  const [memories, setMemories] = React.useState<Memory[]>([]);
  const [status, setStatus] = React.useState("");
  const [mood, setMood] = React.useState("");
  const [energyLevel, setEnergyLevel] = React.useState(5);
  const [focusLevel, setFocusLevel] = React.useState(5);
  const [currentSituation, setCurrentSituation] = React.useState("");
  const [contextPrivacyScope, setContextPrivacyScope] =
    React.useState<PrivacyScope>("private");
  const [latestContext, setLatestContext] =
    React.useState<ContextSnapshot | null>(null);
  const [contextStatus, setContextStatus] = React.useState("");
  const [routineSuggestion, setRoutineSuggestion] =
    React.useState<RoutineSuggestion | null>(null);
  const [dashboard, setDashboard] = React.useState<DashboardSummary | null>(
    null
  );
  const [dailyReflection, setDailyReflection] =
    React.useState<DailyReflection | null>(null);
  const [activityFeed, setActivityFeed] = React.useState<ActivityFeedItem[]>(
    []
  );
  const [patternInsights, setPatternInsights] = React.useState<
    PatternInsight[]
  >([]);
  const [nextBestStep, setNextBestStep] = React.useState<NextBestStep | null>(
    null
  );
  const [actionHistory, setActionHistory] = React.useState<ActionHistoryEntry[]>(
    []
  );
  const [actionStatus, setActionStatus] = React.useState("");
  const [recommendationFeedback, setRecommendationFeedback] =
    React.useState<RecommendationFeedback | null>(null);

  React.useEffect(() => {
    void loadDashboard();
    void loadNextBestStep();
    void loadDailyReflection();
    void loadActivityFeed();
    void loadPatternInsights();
    void loadMemories();
    void loadLatestContext();
    void loadRoutineSuggestion();
    void loadActionHistory();
    void loadRecommendationFeedback();
  }, []);

  async function loadDashboard() {
    const response = await fetch(`${apiUrl}/dashboard?scope=trusted`);
    const summary = (await response.json()) as DashboardSummary;
    setDashboard(summary);
  }

  async function loadNextBestStep() {
    const response = await fetch(`${apiUrl}/next-best-step`);
    const step = (await response.json()) as NextBestStep;
    setNextBestStep(step);
  }

  async function loadDailyReflection() {
    const response = await fetch(`${apiUrl}/daily-reflection`);
    const reflection = (await response.json()) as DailyReflection;
    setDailyReflection(reflection);
  }

  async function loadActivityFeed() {
    const response = await fetch(`${apiUrl}/activity-feed`);
    const feed = (await response.json()) as ActivityFeedItem[];
    setActivityFeed(feed);
  }

  async function loadPatternInsights() {
    const response = await fetch(`${apiUrl}/pattern-insights`);
    const insights = (await response.json()) as PatternInsight[];
    setPatternInsights(insights);
  }

  async function loadMemories() {
    const response = await fetch(`${apiUrl}/memories`);
    const savedMemories = (await response.json()) as Memory[];
    setMemories(savedMemories);
  }

  async function loadLatestContext() {
    const response = await fetch(`${apiUrl}/context/latest`);
    const savedContext = (await response.json()) as ContextSnapshot | null;
    setLatestContext(savedContext);
  }

  async function loadRoutineSuggestion() {
    const response = await fetch(`${apiUrl}/routine-suggestions/latest`);
    const suggestion = (await response.json()) as RoutineSuggestion;
    setRoutineSuggestion(suggestion);
  }

  async function loadActionHistory() {
    const response = await fetch(`${apiUrl}/action-history`);
    const history = (await response.json()) as ActionHistoryEntry[];
    setActionHistory(history);
  }

  async function loadRecommendationFeedback() {
    const response = await fetch(`${apiUrl}/recommendation-feedback`);
    const feedback = (await response.json()) as RecommendationFeedback;
    setRecommendationFeedback(feedback);
  }

  async function recordAction(status: ActionCompletionStatus) {
    if (nextBestStep === null) {
      return;
    }

    setActionStatus(
      status === "completed" ? "Saving completion..." : "Saving skip..."
    );

    const response = await fetch(`${apiUrl}/action-history`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        suggestedAction: nextBestStep,
        status
      })
    });

    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setActionStatus(result.error ?? "Could not save action.");
      return;
    }

    setActionStatus(status === "completed" ? "Marked completed." : "Skipped.");
    await loadActionHistory();
    await loadRecommendationFeedback();
    await loadNextBestStep();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving memory...");

    const response = await fetch(`${apiUrl}/memories`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        content,
        tags,
        privacyScope
      })
    });

    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setStatus(result.error ?? "Could not save memory.");
      return;
    }

    setContent("");
    setTags("");
    setPrivacyScope("private");
    setStatus("Memory saved.");
    await loadMemories();
    await loadDashboard();
    await loadNextBestStep();
    await loadDailyReflection();
    await loadActivityFeed();
    await loadPatternInsights();
    await loadActionHistory();
    await loadRecommendationFeedback();
  }

  async function handleContextSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContextStatus("Saving context...");

    const response = await fetch(`${apiUrl}/context`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        mood,
        energyLevel,
        focusLevel,
        currentSituation,
        privacyScope: contextPrivacyScope
      })
    });

    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setContextStatus(result.error ?? "Could not save context.");
      return;
    }

    setMood("");
    setEnergyLevel(5);
    setFocusLevel(5);
    setCurrentSituation("");
    setContextPrivacyScope("private");
    setContextStatus("Context saved.");
    await loadLatestContext();
    await loadRoutineSuggestion();
    await loadDashboard();
    await loadNextBestStep();
    await loadDailyReflection();
    await loadActivityFeed();
    await loadPatternInsights();
    await loadActionHistory();
    await loadRecommendationFeedback();
  }

  return (
    <main className="shell">
      <section className="panel dashboard-panel">
        <p className="eyebrow">Daily Dashboard</p>
        <h1>What matters now</h1>
        {dashboard === null ? (
          <p className="empty-state">Loading today&apos;s summary.</p>
        ) : (
          <div className="dashboard-summary">
            <p className="what-now">{dashboard.whatMattersNow}</p>
            <div className="dashboard-grid">
              <section>
                <h2>Latest Context</h2>
                {dashboard.latestContext === null ? (
                  <p>No context snapshot yet.</p>
                ) : (
                  <p>{dashboard.latestContext.summary}</p>
                )}
              </section>

              <section>
                <h2>Suggested Routine</h2>
                <p>{dashboard.suggestedRoutine.name}</p>
              </section>

              <section>
                <h2>Latest Memory</h2>
                {dashboard.latestMemory === null ? (
                  <p>No memory captured yet.</p>
                ) : (
                  <p>{dashboard.latestMemory.content}</p>
                )}
              </section>
            </div>
          </div>
        )}
      </section>

      <section className="panel next-step-panel">
        <p className="eyebrow">Next Best Step</p>
        <h1>One clear action</h1>
        {nextBestStep === null ? (
          <p className="empty-state">Loading next step.</p>
        ) : (
          <div className="next-step-summary">
            <h2>{nextBestStep.title}</h2>
            <p>{nextBestStep.action}</p>
            <span>{nextBestStep.reason}</span>
            <p className="supporting-summary">{nextBestStep.supportingSummary}</p>
            <div className="completion-actions">
              <button type="button" onClick={() => void recordAction("completed")}>
                Completed
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => void recordAction("skipped")}
              >
                Skipped
              </button>
              <span role="status">{actionStatus}</span>
            </div>
          </div>
        )}
      </section>

      <section className="panel action-history-panel">
        <p className="eyebrow">Action History</p>
        <h1>Recent completions</h1>
        {getRecentCompletedActions(actionHistory).length === 0 ? (
          <p className="empty-state">No completed actions yet.</p>
        ) : (
          <ol className="action-history-list">
            {getRecentCompletedActions(actionHistory).map((entry) => (
              <li key={entry.id}>
                <time>{formatTimestamp(entry.timestamp)}</time>
                <p>{entry.suggestedAction.action}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="panel feedback-panel">
        <p className="eyebrow">Recommendation Feedback</p>
        <h1>What works best</h1>
        {recommendationFeedback === null ||
        recommendationFeedback.totalActions === 0 ? (
          <p className="empty-state">Complete or skip actions to build feedback.</p>
        ) : (
          <div className="feedback-summary">
            <section>
              <h2>Working Well</h2>
              {recommendationFeedback.highlyEffectiveRecommendations.length ===
              0 ? (
                <p>No clear pattern yet.</p>
              ) : (
                <ul>
                  {recommendationFeedback.highlyEffectiveRecommendations.map(
                    (recommendation) => (
                      <li key={recommendation.recommendationKey}>
                        <p>{recommendation.action}</p>
                        <span>{formatScore(recommendation.score)}</span>
                      </li>
                    )
                  )}
                </ul>
              )}
            </section>

            <section>
              <h2>Often Skipped</h2>
              {recommendationFeedback.frequentlySkippedRecommendations.length ===
              0 ? (
                <p>No repeated skips yet.</p>
              ) : (
                <ul>
                  {recommendationFeedback.frequentlySkippedRecommendations.map(
                    (recommendation) => (
                      <li key={recommendation.recommendationKey}>
                        <p>{recommendation.action}</p>
                        <span>{recommendation.skippedCount} skipped</span>
                      </li>
                    )
                  )}
                </ul>
              )}
            </section>

            <section>
              <h2>Successful Routines</h2>
              {recommendationFeedback.mostSuccessfulRoutines.length === 0 ? (
                <p>No routine pattern yet.</p>
              ) : (
                <ul>
                  {recommendationFeedback.mostSuccessfulRoutines.map(
                    (routine) => (
                      <li key={routine.routineName}>
                        <p>{routine.routineName}</p>
                        <span>{formatPercent(routine.completionRate)}</span>
                      </li>
                    )
                  )}
                </ul>
              )}
            </section>
          </div>
        )}
      </section>

      <section className="panel reflection-panel">
        <p className="eyebrow">Daily Reflection</p>
        <h1>Session review</h1>
        {dailyReflection === null ? (
          <p className="empty-state">Loading reflection.</p>
        ) : (
          <div className="reflection-summary">
            <section>
              <h2>Today&apos;s Emotional State</h2>
              <p>{dailyReflection.emotionalState}</p>
            </section>
            <section>
              <h2>What Mattered Most</h2>
              <p>{dailyReflection.whatMatteredMost}</p>
            </section>
            <section>
              <h2>Suggested Next Step</h2>
              <p>{dailyReflection.suggestedNextStep}</p>
            </section>
            <section>
              <h2>Current Routine Recommendation</h2>
              <p>{dailyReflection.currentRoutineRecommendation.name}</p>
            </section>
          </div>
        )}
      </section>

      <section className="panel insights-panel">
        <p className="eyebrow">Insights</p>
        <h1>Patterns</h1>
        {patternInsights.length === 0 ? (
          <p className="empty-state">No insights yet.</p>
        ) : (
          <ul className="insights-list">
            {patternInsights.map((insight) => (
              <li key={insight.id}>
                <h2>{insight.title}</h2>
                <p>{insight.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel timeline-panel">
        <p className="eyebrow">Activity Feed</p>
        <h1>Timeline</h1>
        {activityFeed.length === 0 ? (
          <p className="empty-state">No activity yet.</p>
        ) : (
          <ol className="timeline-list">
            {activityFeed.map((item) => (
              <li key={item.id}>
                <time>{formatTimestamp(item.timestamp)}</time>
                <span>{formatActivityType(item.type)}</span>
                <p>{item.summary}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

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
            <span role="status">{contextStatus}</span>
          </div>
        </form>
      </section>

      <section className="panel context-latest">
        <h2>Latest Context</h2>
        {latestContext === null ? (
          <p className="empty-state">No context snapshot saved yet.</p>
        ) : (
          <div className="context-summary">
            <p>{latestContext.summary}</p>
            <dl>
              <div>
                <dt>Mood</dt>
                <dd>{latestContext.mood}</dd>
              </div>
              <div>
                <dt>Energy</dt>
                <dd>{latestContext.energyLevel}/10</dd>
              </div>
              <div>
                <dt>Focus</dt>
                <dd>{latestContext.focusLevel}/10</dd>
              </div>
              <div>
                <dt>Privacy</dt>
                <dd>{latestContext.privacyScope}</dd>
              </div>
            </dl>
            <p className="situation">{latestContext.currentSituation}</p>
          </div>
        )}
      </section>

      <section className="panel routine-suggestion">
        <h2>Suggested Routine</h2>
        {routineSuggestion === null ? (
          <p className="empty-state">No routine suggestion loaded yet.</p>
        ) : (
          <div className="routine-summary">
            <p className="routine-name">{routineSuggestion.name}</p>
            <p>{routineSuggestion.description}</p>
            <ol>
              {routineSuggestion.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className="memory-meta">
              <span>{routineSuggestion.reason}</span>
              <span>{routineSuggestion.privacyScope}</span>
            </div>
          </div>
        )}
      </section>

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
            <span role="status">{status}</span>
          </div>
        </form>
      </section>

      <section className="panel memory-list">
        <h2>Saved Memories</h2>
        {memories.length === 0 ? (
          <p className="empty-state">No memories saved yet.</p>
        ) : (
          <ul>
            {memories.map((memory) => (
              <li key={memory.id}>
                <p>{memory.content}</p>
                <div className="memory-meta">
                  <span>{memory.privacyScope}</span>
                  {memory.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(timestamp));
}

function formatActivityType(type: ActivityFeedItem["type"]): string {
  return type.replace("_", " ");
}

function getRecentCompletedActions(
  actionHistory: ActionHistoryEntry[]
): ActionHistoryEntry[] {
  return actionHistory
    .filter((entry) => entry.status === "completed")
    .slice(0, 5);
}

function formatScore(score: number): string {
  return `score ${score.toFixed(1)}`;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}% completed`;
}
