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

const apiUrl = "http://localhost:4000";

function App() {
  const [content, setContent] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [privacyScope, setPrivacyScope] =
    React.useState<PrivacyScope>("private");
  const [memories, setMemories] = React.useState<Memory[]>([]);
  const [status, setStatus] = React.useState("");

  React.useEffect(() => {
    void loadMemories();
  }, []);

  async function loadMemories() {
    const response = await fetch(`${apiUrl}/memories`);
    const savedMemories = (await response.json()) as Memory[];
    setMemories(savedMemories);
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
  }

  return (
    <main className="shell">
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
