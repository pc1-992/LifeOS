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

  React.useEffect(() => {
    void loadDashboard();
    void loadMemories();
    void loadLatestContext();
    void loadRoutineSuggestion();
  }, []);

  async function loadDashboard() {
    const response = await fetch(`${apiUrl}/dashboard?scope=trusted`);
    const summary = (await response.json()) as DashboardSummary;
    setDashboard(summary);
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
