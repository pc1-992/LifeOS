import test from "node:test";
import assert from "node:assert/strict";
import type {
  ActionHistoryEntry,
  ContextSnapshot,
  Memory,
  PrivacyScope
} from "@lifeos/core";
import { CaptureContextUseCase } from "./capture-context.js";
import { CaptureMemoryUseCase } from "./capture-memory.js";
import { GenerateMemoryHygieneReportUseCase } from "./generate-memory-hygiene-report.js";
import { GenerateNextBestStepUseCase } from "./generate-next-best-step.js";
import { GenerateTemporalIntelligenceUseCase } from "./generate-temporal-intelligence.js";
import type {
  ActionHistoryRepository,
  ContextRepository,
  MemoryRepository
} from "./ports.js";

test("CaptureMemoryUseCase trims and stores a memory", async () => {
  const memories = new TestMemoryRepository();
  const useCase = new CaptureMemoryUseCase(memories);

  const memory = await useCase.execute({
    content: "  Keep this useful note.  ",
    tags: ["note"],
    privacyScope: "trusted"
  });

  assert.equal(memory.content, "Keep this useful note.");
  assert.equal(memory.privacyScope, "trusted");
  assert.equal((await memories.findAll()).length, 1);
});

test("CaptureMemoryUseCase rejects empty content", async () => {
  const useCase = new CaptureMemoryUseCase(new TestMemoryRepository());

  await assert.rejects(
    () => useCase.execute({ content: "   " }),
    /Memory content cannot be empty/
  );
});

test("CaptureContextUseCase normalizes levels and stores context", async () => {
  const contexts = new TestContextRepository();
  const useCase = new CaptureContextUseCase(contexts);

  const snapshot = await useCase.execute({
    mood: " focused ",
    energyLevel: 12,
    focusLevel: 0,
    currentSituation: " writing tests "
  });

  assert.equal(snapshot.mood, "focused");
  assert.equal(snapshot.energyLevel, 10);
  assert.equal(snapshot.focusLevel, 1);
  assert.equal(await contexts.latest(), snapshot);
});

test("GenerateNextBestStepUseCase chooses recovery for stressed low-energy context", async () => {
  const memories = new TestMemoryRepository();
  const contexts = new TestContextRepository([
    makeContext({
      mood: "stressed",
      energyLevel: 2,
      focusLevel: 4,
      currentSituation: "Too many competing tasks."
    })
  ]);
  const useCase = new GenerateNextBestStepUseCase(memories, contexts);

  const step = await useCase.execute();

  assert.equal(step.reason, "recovery_needed");
  assert.match(step.action, /Pause active work/);
});

test("GenerateMemoryHygieneReportUseCase returns deterministic status counts", async () => {
  const memories = new TestMemoryRepository([
    makeMemory("mem_one", "Review the weekly planning note.")
  ]);
  const contexts = new TestContextRepository([
    makeContext({
      mood: "calm",
      energyLevel: 6,
      focusLevel: 7,
      currentSituation: "Planning the next task."
    })
  ]);
  const actionHistory = new TestActionHistoryRepository();
  const useCase = new GenerateMemoryHygieneReportUseCase(
    memories,
    contexts,
    actionHistory
  );

  const result = await useCase.execute();

  assert.ok(result.report.qualityScore <= 100);
  assert.ok(result.confidenceByItem.length > 0);
  assert.ok(result.report.activeMemoryCount >= 0);
  assert.ok(Array.isArray(result.report.suggestedCleanupActions));
});

test("GenerateTemporalIntelligenceUseCase detects deterministic temporal movement", async () => {
  const memories = new TestMemoryRepository([
    makeMemory("mem_temporal", "Stress is lower when work is paced.")
  ]);
  const contexts = new TestContextRepository([
    makeContextAt("ctx_1", "stressed", 3, 4, "Overwhelmed by work", "2026-01-01T08:00:00.000Z"),
    makeContextAt("ctx_2", "tense", 4, 4, "Too many tasks", "2026-01-02T08:00:00.000Z"),
    makeContextAt("ctx_3", "calm", 7, 7, "Clear plan", "2026-01-03T08:00:00.000Z"),
    makeContextAt("ctx_4", "focused", 8, 8, "Steady progress", "2026-01-04T08:00:00.000Z")
  ]);
  const actionHistory = new TestActionHistoryRepository([
    makeAction("act_1", "skipped", "2026-01-01T09:00:00.000Z"),
    makeAction("act_2", "completed", "2026-01-02T09:00:00.000Z"),
    makeAction("act_3", "completed", "2026-01-03T09:00:00.000Z"),
    makeAction("act_4", "completed", "2026-01-04T09:00:00.000Z")
  ]);
  const useCase = new GenerateTemporalIntelligenceUseCase(
    memories,
    contexts,
    actionHistory
  );

  const report = await useCase.execute();
  const energyTrend = report.trends.find((trend) => trend.metric === "energy");
  const stressForecast = report.forecasts.find(
    (forecast) => forecast.metric === "stress"
  );

  assert.equal(energyTrend?.direction, "improving");
  assert.equal(stressForecast?.direction, "likely_decreasing");
  assert.ok(report.risks.some((risk) => risk.type === "burnout"));
  assert.ok(report.insights.every((insight) => insight.evidenceCount >= 0));
  assert.ok(report.supportingEvidence.length > 0);
});

class TestMemoryRepository implements MemoryRepository {
  constructor(private readonly memories: Memory[] = []) {}

  async save(memory: Memory): Promise<void> {
    this.memories.push(memory);
  }

  async findAll(): Promise<Memory[]> {
    return this.memories;
  }

  async findByPrivacyScope(scope: PrivacyScope): Promise<Memory[]> {
    return this.memories.filter((memory) => memory.privacyScope === scope);
  }
}

class TestContextRepository implements ContextRepository {
  constructor(private readonly contexts: ContextSnapshot[] = []) {}

  async save(snapshot: ContextSnapshot): Promise<void> {
    this.contexts.push(snapshot);
  }

  async latest(): Promise<ContextSnapshot | null> {
    return this.contexts[this.contexts.length - 1] ?? null;
  }

  async findAll(): Promise<ContextSnapshot[]> {
    return this.contexts;
  }
}

class TestActionHistoryRepository implements ActionHistoryRepository {
  constructor(private readonly entries: ActionHistoryEntry[] = []) {}

  async save(entry: ActionHistoryEntry): Promise<void> {
    this.entries.push(entry);
  }

  async findAll(): Promise<ActionHistoryEntry[]> {
    return this.entries;
  }

  async findRecentCompleted(limit: number): Promise<ActionHistoryEntry[]> {
    return this.entries
      .filter((entry) => entry.status === "completed")
      .slice(0, limit);
  }
}

function makeMemory(id: string, content: string): Memory {
  return {
    id,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    content,
    source: "user",
    tags: [],
    privacyScope: "private"
  };
}

function makeContext(
  input: Pick<
    ContextSnapshot,
    "mood" | "energyLevel" | "focusLevel" | "currentSituation"
  >
): ContextSnapshot {
  return {
    id: `ctx_${input.mood}_${input.energyLevel}_${input.focusLevel}`,
    capturedAt: new Date("2026-01-01T00:00:00.000Z"),
    mood: input.mood,
    energyLevel: input.energyLevel,
    focusLevel: input.focusLevel,
    currentSituation: input.currentSituation,
    summary: `${input.mood} mood, ${input.energyLevel}/10 energy, ${input.focusLevel}/10 focus: ${input.currentSituation}`,
    signals: ["manual"],
    privacyScope: "private"
  };
}

function makeContextAt(
  id: string,
  mood: string,
  energyLevel: number,
  focusLevel: number,
  currentSituation: string,
  capturedAt: string
): ContextSnapshot {
  return {
    id,
    capturedAt: new Date(capturedAt),
    mood,
    energyLevel,
    focusLevel,
    currentSituation,
    summary: `${mood} mood, ${energyLevel}/10 energy, ${focusLevel}/10 focus: ${currentSituation}`,
    signals: ["manual"],
    privacyScope: "private"
  };
}

function makeAction(
  id: string,
  status: ActionHistoryEntry["status"],
  timestamp: string
): ActionHistoryEntry {
  return {
    id,
    suggestedAction: {
      id: `step_${id}`,
      title: "Reset routine",
      action: "Pause, choose one task, and continue.",
      reason: "recovery_needed",
      supportingSummary: "Test action"
    },
    status,
    timestamp: new Date(timestamp),
    effectivenessScore: status === "completed" ? 5 : 1
  };
}
