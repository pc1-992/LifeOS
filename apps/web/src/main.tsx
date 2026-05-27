import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">LifeOS</p>
        <h1>Context-aware personal operating system</h1>
        <p>
          The first milestone is simple: capture context, store memory, suggest
          a relevant routine, and enforce privacy by context.
        </p>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
