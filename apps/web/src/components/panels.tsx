import {
  formatActivityType,
  formatConfidence,
  formatForecastDirection,
  formatPercent,
  formatRiskType,
  formatScore,
  formatSourceLayers,
  formatSourceType,
  formatTemporalMetric,
  formatTimestamp,
  getRecentCompletedActions
} from "../format.js";
import type {
  ActionCompletionStatus,
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
  TemporalReport
} from "../types.js";

export function DashboardPanel({
  dashboard
}: {
  dashboard: DashboardSummary | null;
}) {
  return (
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
  );
}

export function NextStepPanel({
  nextBestStep,
  actionStatus,
  onRecordAction
}: {
  nextBestStep: NextBestStep | null;
  actionStatus: string;
  onRecordAction: (status: ActionCompletionStatus) => void;
}) {
  return (
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
            <button type="button" onClick={() => onRecordAction("completed")}>
              Completed
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => onRecordAction("skipped")}
            >
              Skipped
            </button>
            <span role="status" aria-live="polite">
              {actionStatus}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

export function ActionHistoryPanel({
  actionHistory
}: {
  actionHistory: ActionHistoryEntry[];
}) {
  const recentCompletedActions = getRecentCompletedActions(actionHistory);

  return (
    <section className="panel action-history-panel">
      <p className="eyebrow">Action History</p>
      <h1>Recent completions</h1>
      {recentCompletedActions.length === 0 ? (
        <p className="empty-state">No completed actions yet.</p>
      ) : (
        <ol className="action-history-list">
          {recentCompletedActions.map((entry) => (
            <li key={entry.id}>
              <time>{formatTimestamp(entry.timestamp)}</time>
              <p>{entry.suggestedAction.action}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function FeedbackPanel({
  recommendationFeedback
}: {
  recommendationFeedback: RecommendationFeedback | null;
}) {
  return (
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
                {recommendationFeedback.mostSuccessfulRoutines.map((routine) => (
                  <li key={routine.routineName}>
                    <p>{routine.routineName}</p>
                    <span>{formatPercent(routine.completionRate)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

export function OperatingProfilePanel({
  operatingProfile
}: {
  operatingProfile: PersonalOperatingProfile | null;
}) {
  return (
    <section className="panel dna-panel">
      <p className="eyebrow">LifeOS DNA</p>
      <h1>Operating profile</h1>
      {operatingProfile === null ? (
        <p className="empty-state">Loading operating profile.</p>
      ) : (
        <div className="dna-summary">
          <p>
            Based on {operatingProfile.contextSnapshotCount} context snapshot
            {operatingProfile.contextSnapshotCount === 1 ? "" : "s"} and{" "}
            {operatingProfile.actionHistoryCount} action record
            {operatingProfile.actionHistoryCount === 1 ? "" : "s"}.
          </p>
          <ul>
            {operatingProfile.traits.map((trait) => (
              <li key={trait.type}>
                <h2>{trait.title}</h2>
                <p>{trait.summary}</p>
                <span>{trait.evidence[0]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function MemoryArchitecturePanel({
  memoryLayers
}: {
  memoryLayers: StructuredMemoryLayer[];
}) {
  return (
    <section className="panel memory-architecture-panel">
      <p className="eyebrow">Memory Architecture</p>
      <h1>Memory OS layers</h1>
      {memoryLayers.length === 0 ? (
        <p className="empty-state">Loading memory architecture.</p>
      ) : (
        <div className="memory-layer-list">
          {memoryLayers.map((layer) => (
            <section key={layer.layer}>
              <h2>{layer.layer}</h2>
              <p>{layer.description}</p>
              {layer.items.length === 0 ? (
                <p className="memory-layer-empty">No related items yet.</p>
              ) : (
                <ul>
                  {layer.items.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      <div>
                        <h3>{item.title}</h3>
                        <span>{formatSourceType(item.sourceType)}</span>
                      </div>
                      <p>{item.summary}</p>
                      <small>{item.why}</small>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

export function RetrievalPanel({
  retrievalQuery,
  retrievalResults,
  onChooseQuery
}: {
  retrievalQuery: string;
  retrievalResults: RetrievalResult[];
  onChooseQuery: (query: string) => void;
}) {
  return (
    <section className="panel relevant-memory-panel">
      <p className="eyebrow">Relevant Memories</p>
      <h1>Context retrieval</h1>
      <div className="retrieval-controls" aria-label="Retrieval queries">
        {["", "focus", "stress", "energy"].map((query) => (
          <button
            key={query || "current"}
            type="button"
            className={
              retrievalQuery === query ? "query-button active" : "query-button"
            }
            aria-pressed={retrievalQuery === query}
            onClick={() => onChooseQuery(query)}
          >
            {query || "current"}
          </button>
        ))}
      </div>
      {retrievalResults.length === 0 ? (
        <p className="empty-state">No relevant memories found yet.</p>
      ) : (
        <ol className="retrieval-list">
          {retrievalResults.slice(0, 5).map((result) => (
            <li key={`${result.layer}_${result.item.id}`}>
              <div>
                <h2>{result.item.title}</h2>
                <span aria-label={`Relevance score ${result.relevance.value}`}>
                  {result.relevance.value}
                </span>
              </div>
              <p>{result.item.summary}</p>
              <small>{result.layer}</small>
              <small>{result.relevance.explanation}</small>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function MemoryHealthPanel({
  memoryQualityReport
}: {
  memoryQualityReport: MemoryQualityReport | null;
}) {
  return (
    <section className="panel memory-health-panel">
      <p className="eyebrow">Memory Health</p>
      <h1>Quality check</h1>
      {memoryQualityReport === null ? (
        <p className="empty-state">Loading memory health.</p>
      ) : (
        <div className="memory-health-summary">
          <div className="quality-score">
            <span>{memoryQualityReport.qualityScore}</span>
            <p>memory quality score</p>
          </div>
          <dl>
            <div>
              <dt>Active</dt>
              <dd>{memoryQualityReport.activeMemoryCount}</dd>
            </div>
            <div>
              <dt>Stale</dt>
              <dd>{memoryQualityReport.staleMemoryCount}</dd>
            </div>
            <div>
              <dt>Conflicting</dt>
              <dd>{memoryQualityReport.conflictingMemoryCount}</dd>
            </div>
            <div>
              <dt>Low confidence</dt>
              <dd>{memoryQualityReport.lowConfidenceMemoryCount}</dd>
            </div>
          </dl>
          {memoryQualityReport.suggestedCleanupActions.length === 0 ? (
            <p className="memory-health-empty">No cleanup actions suggested.</p>
          ) : (
            <ul>
              {memoryQualityReport.suggestedCleanupActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

export function StableTruthsPanel({
  stableTruths
}: {
  stableTruths: StableTruth[];
}) {
  return (
    <section className="panel stable-truths-panel">
      <p className="eyebrow">Stable Truths</p>
      <h1>Durable knowledge</h1>
      {stableTruths.length === 0 ? (
        <p className="empty-state">No stable truths consolidated yet.</p>
      ) : (
        <ol className="stable-truth-list">
          {stableTruths.slice(0, 5).map((truth) => (
            <li key={truth.id}>
              <p>{truth.statement}</p>
              <div>
                <span>{formatConfidence(truth.confidenceScore)}</span>
                <span>{truth.evidenceCount} evidence</span>
              </div>
              <small>{formatSourceLayers(truth.sourceLayers)}</small>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function KnowledgeGraphPanel({
  knowledgeGraphReport
}: {
  knowledgeGraphReport: KnowledgeGraphReport | null;
}) {
  return (
    <section className="panel knowledge-graph-panel">
      <p className="eyebrow">Knowledge Graph</p>
      <h1>Relationship map</h1>
      {knowledgeGraphReport === null ? (
        <p className="empty-state">Loading knowledge graph.</p>
      ) : (
        <div className="knowledge-graph-summary">
          <dl>
            <div>
              <dt>Nodes</dt>
              <dd>{knowledgeGraphReport.nodeCount}</dd>
            </div>
            <div>
              <dt>Edges</dt>
              <dd>{knowledgeGraphReport.edgeCount}</dd>
            </div>
          </dl>

          <section>
            <h2>Strongest Connections</h2>
            {knowledgeGraphReport.strongestConnections.length === 0 ? (
              <p>No strong connections yet.</p>
            ) : (
              <ul>
                {knowledgeGraphReport.strongestConnections.map((edge) => (
                  <li key={edge.id}>
                    <p>{edge.explanation}</p>
                    <span>{formatConfidence(edge.confidenceScore)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2>Isolated Nodes</h2>
            {knowledgeGraphReport.isolatedNodes.length === 0 ? (
              <p>No isolated nodes detected.</p>
            ) : (
              <ul>
                {knowledgeGraphReport.isolatedNodes.map((node) => (
                  <li key={node.id}>
                    <p>{node.label}</p>
                    <span>{node.type}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2>Contradiction Candidates</h2>
            {knowledgeGraphReport.contradictionCandidates.length === 0 ? (
              <p>No contradiction candidates found.</p>
            ) : (
              <ul>
                {knowledgeGraphReport.contradictionCandidates.map((edge) => (
                  <li key={edge.id}>
                    <p>{edge.explanation}</p>
                    <span>{formatConfidence(edge.confidenceScore)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

export function TemporalIntelligencePanel({
  temporalReport
}: {
  temporalReport: TemporalReport | null;
}) {
  return (
    <section className="panel temporal-panel">
      <p className="eyebrow">Temporal Intelligence</p>
      <h1>Change over time</h1>
      {temporalReport === null ? (
        <p className="empty-state">Loading temporal intelligence.</p>
      ) : (
        <div className="temporal-summary">
          <p>{temporalReport.summary}</p>
          <small>{temporalReport.timeWindowAnalyzed.label}</small>

          <section>
            <h2>Trends</h2>
            <ul>
              {temporalReport.trends.map((trend) => (
                <li key={trend.id}>
                  <div>
                    <strong>{formatTemporalMetric(trend.metric)}</strong>
                    <span>{trend.direction}</span>
                  </div>
                  <p>{trend.explanation}</p>
                  <small>
                    {trend.evidenceCount} evidence ·{" "}
                    {formatConfidence(trend.confidenceScore)}
                  </small>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Risks</h2>
            <ul>
              {temporalReport.risks.map((risk) => (
                <li key={risk.id}>
                  <div>
                    <strong>{formatRiskType(risk.type)}</strong>
                    <span>{risk.level}</span>
                  </div>
                  <p>{risk.explanation}</p>
                  <small>
                    {risk.evidenceCount} evidence ·{" "}
                    {formatConfidence(risk.confidenceScore)}
                  </small>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Forecasts</h2>
            <ul>
              {temporalReport.forecasts.map((forecast) => (
                <li key={forecast.id}>
                  <div>
                    <strong>{formatTemporalMetric(forecast.metric)}</strong>
                    <span>{formatForecastDirection(forecast.direction)}</span>
                  </div>
                  <p>{forecast.explanation}</p>
                  <small>
                    {forecast.evidenceCount} evidence ·{" "}
                    {formatConfidence(forecast.confidenceScore)}
                  </small>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Supporting Evidence</h2>
            <ul>
              {temporalReport.supportingEvidence.slice(0, 5).map((signal) => (
                <li key={signal.id}>
                  <div>
                    <strong>{signal.label}</strong>
                    <span>{signal.type.replaceAll("_", " ")}</span>
                  </div>
                  <p>{signal.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </section>
  );
}

export function ReflectionPanel({
  dailyReflection
}: {
  dailyReflection: DailyReflection | null;
}) {
  return (
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
  );
}

export function InsightsPanel({
  patternInsights
}: {
  patternInsights: PatternInsight[];
}) {
  return (
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
  );
}

export function TimelinePanel({
  activityFeed
}: {
  activityFeed: ActivityFeedItem[];
}) {
  return (
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
  );
}

export function LatestContextPanel({
  latestContext
}: {
  latestContext: ContextSnapshot | null;
}) {
  return (
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
  );
}

export function RoutineSuggestionPanel({
  routineSuggestion
}: {
  routineSuggestion: RoutineSuggestion | null;
}) {
  return (
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
  );
}

export function MemoryListPanel({ memories }: { memories: Memory[] }) {
  return (
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
  );
}
