import {
  formatConfidence,
  formatPercent,
  formatScore,
  formatSourceLayers,
  formatTimestamp,
  getRecentCompletedActions
} from "../format.js";
import {
  getActionReasonLabel,
  getActivityTypeLabel,
  getMemoryLayerLabel,
  getPrivacyLabel,
  getRoutineReasonLabel,
  getSourceTypeLabel,
  getTemporalForecastLabel,
  getTemporalMetricLabel,
  getTemporalRiskLabel,
  getTemporalRiskLevelLabel,
  getTemporalSignalLabel,
  getTemporalTrendLabel
} from "../localization.js";
import type { Language, Translations } from "../localization.js";
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

interface LocalizedProps {
  language: Language;
  t: Translations;
}

export function LanguageSwitch({
  language,
  t,
  onChangeLanguage
}: LocalizedProps & {
  onChangeLanguage: (language: Language) => void;
}) {
  return (
    <div className="language-switch" aria-label={t.language.label}>
      <span>{t.language.label}</span>
      <button
        type="button"
        className={language === "en" ? "active" : ""}
        aria-pressed={language === "en"}
        onClick={() => onChangeLanguage("en")}
      >
        {t.language.english}
      </button>
      <button
        type="button"
        className={language === "he" ? "active" : ""}
        aria-pressed={language === "he"}
        onClick={() => onChangeLanguage("he")}
      >
        {t.language.hebrew}
      </button>
    </div>
  );
}

export function DashboardPanel({
  dashboard,
  t
}: LocalizedProps & {
  dashboard: DashboardSummary | null;
}) {
  return (
    <section className="panel dashboard-panel">
      <p className="eyebrow">{t.dashboard.eyebrow}</p>
      <h1>{t.dashboard.title}</h1>
      {dashboard === null ? (
        <p className="empty-state">{t.dashboard.loading}</p>
      ) : (
        <div className="dashboard-summary">
          <p className="what-now">{dashboard.whatMattersNow}</p>
          <div className="dashboard-grid">
            <section>
              <h2>{t.dashboard.latestContext}</h2>
              {dashboard.latestContext === null ? (
                <p>{t.dashboard.noContext}</p>
              ) : (
                <p>{dashboard.latestContext.summary}</p>
              )}
            </section>

            <section>
              <h2>{t.dashboard.suggestedRoutine}</h2>
              <p>{dashboard.suggestedRoutine.name}</p>
            </section>

            <section>
              <h2>{t.dashboard.latestMemory}</h2>
              {dashboard.latestMemory === null ? (
                <p>{t.dashboard.noMemory}</p>
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
  onRecordAction,
  t
}: LocalizedProps & {
  nextBestStep: NextBestStep | null;
  actionStatus: string;
  onRecordAction: (status: ActionCompletionStatus) => void;
}) {
  return (
    <section className="panel next-step-panel">
      <p className="eyebrow">{t.nextStep.eyebrow}</p>
      <h1>{t.nextStep.title}</h1>
      {nextBestStep === null ? (
        <p className="empty-state">{t.nextStep.loading}</p>
      ) : (
        <div className="next-step-summary">
          <h2>{nextBestStep.title}</h2>
          <p>{nextBestStep.action}</p>
          <span>{getActionReasonLabel(t, nextBestStep.reason)}</span>
          <p className="supporting-summary">{nextBestStep.supportingSummary}</p>
          <div className="completion-actions">
            <button type="button" onClick={() => onRecordAction("completed")}>
              {t.nextStep.completed}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => onRecordAction("skipped")}
            >
              {t.nextStep.skipped}
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
  actionHistory,
  language,
  t
}: LocalizedProps & {
  actionHistory: ActionHistoryEntry[];
}) {
  const recentCompletedActions = getRecentCompletedActions(actionHistory);

  return (
    <section className="panel action-history-panel">
      <p className="eyebrow">{t.actionHistory.eyebrow}</p>
      <h1>{t.actionHistory.title}</h1>
      {recentCompletedActions.length === 0 ? (
        <p className="empty-state">{t.actionHistory.empty}</p>
      ) : (
        <ol className="action-history-list">
          {recentCompletedActions.map((entry) => (
            <li key={entry.id}>
              <time>{formatTimestamp(entry.timestamp, language)}</time>
              <p>{entry.suggestedAction.action}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function FeedbackPanel({
  recommendationFeedback,
  t
}: LocalizedProps & {
  recommendationFeedback: RecommendationFeedback | null;
}) {
  return (
    <section className="panel feedback-panel">
      <p className="eyebrow">{t.feedback.eyebrow}</p>
      <h1>{t.feedback.title}</h1>
      {recommendationFeedback === null ||
      recommendationFeedback.totalActions === 0 ? (
        <p className="empty-state">{t.feedback.empty}</p>
      ) : (
        <div className="feedback-summary">
          <section>
            <h2>{t.feedback.workingWell}</h2>
            {recommendationFeedback.highlyEffectiveRecommendations.length ===
            0 ? (
              <p>{t.feedback.noClearPattern}</p>
            ) : (
              <ul>
                {recommendationFeedback.highlyEffectiveRecommendations.map(
                  (recommendation) => (
                    <li key={recommendation.recommendationKey}>
                      <p>{recommendation.action}</p>
                      <span>{formatScore(recommendation.score, t)}</span>
                    </li>
                  )
                )}
              </ul>
            )}
          </section>

          <section>
            <h2>{t.feedback.oftenSkipped}</h2>
            {recommendationFeedback.frequentlySkippedRecommendations.length ===
            0 ? (
              <p>{t.feedback.noRepeatedSkips}</p>
            ) : (
              <ul>
                {recommendationFeedback.frequentlySkippedRecommendations.map(
                  (recommendation) => (
                    <li key={recommendation.recommendationKey}>
                      <p>{recommendation.action}</p>
                      <span>
                        {recommendation.skippedCount} {t.common.skipped}
                      </span>
                    </li>
                  )
                )}
              </ul>
            )}
          </section>

          <section>
            <h2>{t.feedback.successfulRoutines}</h2>
            {recommendationFeedback.mostSuccessfulRoutines.length === 0 ? (
              <p>{t.feedback.noRoutinePattern}</p>
            ) : (
              <ul>
                {recommendationFeedback.mostSuccessfulRoutines.map((routine) => (
                  <li key={routine.routineName}>
                    <p>{routine.routineName}</p>
                    <span>{formatPercent(routine.completionRate, t)}</span>
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
  operatingProfile,
  t
}: LocalizedProps & {
  operatingProfile: PersonalOperatingProfile | null;
}) {
  return (
    <section className="panel dna-panel">
      <p className="eyebrow">{t.profile.eyebrow}</p>
      <h1>{t.profile.title}</h1>
      {operatingProfile === null ? (
        <p className="empty-state">{t.profile.loading}</p>
      ) : (
        <div className="dna-summary">
          <p>
            {t.profile.basedOn} {operatingProfile.contextSnapshotCount}{" "}
            {operatingProfile.contextSnapshotCount === 1
              ? t.profile.contextSnapshot
              : t.profile.contextSnapshots}{" "}
            {t.profile.and} {operatingProfile.actionHistoryCount}{" "}
            {operatingProfile.actionHistoryCount === 1
              ? t.profile.actionRecord
              : t.profile.actionRecords}
            .
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
  memoryLayers,
  t
}: LocalizedProps & {
  memoryLayers: StructuredMemoryLayer[];
}) {
  return (
    <section className="panel memory-architecture-panel">
      <p className="eyebrow">{t.memoryArchitecture.eyebrow}</p>
      <h1>{t.memoryArchitecture.title}</h1>
      {memoryLayers.length === 0 ? (
        <p className="empty-state">{t.memoryArchitecture.loading}</p>
      ) : (
        <div className="memory-layer-list">
          {memoryLayers.map((layer) => (
            <section key={layer.layer}>
              <h2>{getMemoryLayerLabel(t, layer.layer)}</h2>
              <p>{layer.description}</p>
              {layer.items.length === 0 ? (
                <p className="memory-layer-empty">
                  {t.memoryArchitecture.empty}
                </p>
              ) : (
                <ul>
                  {layer.items.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      <div>
                        <h3>{item.title}</h3>
                        <span>{getSourceTypeLabel(t, item.sourceType)}</span>
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
  onChooseQuery,
  t
}: LocalizedProps & {
  retrievalQuery: string;
  retrievalResults: RetrievalResult[];
  onChooseQuery: (query: string) => void;
}) {
  const queryLabels = {
    "": t.retrieval.queries.current,
    focus: t.retrieval.queries.focus,
    stress: t.retrieval.queries.stress,
    energy: t.retrieval.queries.energy
  };

  return (
    <section className="panel relevant-memory-panel">
      <p className="eyebrow">{t.retrieval.eyebrow}</p>
      <h1>{t.retrieval.title}</h1>
      <div className="retrieval-controls" aria-label={t.retrieval.controlsLabel}>
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
            {queryLabels[query as keyof typeof queryLabels]}
          </button>
        ))}
      </div>
      {retrievalResults.length === 0 ? (
        <p className="empty-state">{t.retrieval.empty}</p>
      ) : (
        <ol className="retrieval-list">
          {retrievalResults.slice(0, 5).map((result) => (
            <li key={`${result.layer}_${result.item.id}`}>
              <div>
                <h2>{result.item.title}</h2>
                <span
                  aria-label={`${t.retrieval.relevanceScore} ${result.relevance.value}`}
                >
                  {result.relevance.value}
                </span>
              </div>
              <p>{result.item.summary}</p>
              <small>{getMemoryLayerLabel(t, result.layer)}</small>
              <small>{result.relevance.explanation}</small>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function MemoryHealthPanel({
  memoryQualityReport,
  t
}: LocalizedProps & {
  memoryQualityReport: MemoryQualityReport | null;
}) {
  return (
    <section className="panel memory-health-panel">
      <p className="eyebrow">{t.memoryHealth.eyebrow}</p>
      <h1>{t.memoryHealth.title}</h1>
      {memoryQualityReport === null ? (
        <p className="empty-state">{t.memoryHealth.loading}</p>
      ) : (
        <div className="memory-health-summary">
          <div className="quality-score">
            <span>{memoryQualityReport.qualityScore}</span>
            <p>{t.memoryHealth.qualityScore}</p>
          </div>
          <dl>
            <div>
              <dt>{t.memoryHealth.active}</dt>
              <dd>{memoryQualityReport.activeMemoryCount}</dd>
            </div>
            <div>
              <dt>{t.memoryHealth.stale}</dt>
              <dd>{memoryQualityReport.staleMemoryCount}</dd>
            </div>
            <div>
              <dt>{t.memoryHealth.conflicting}</dt>
              <dd>{memoryQualityReport.conflictingMemoryCount}</dd>
            </div>
            <div>
              <dt>{t.memoryHealth.lowConfidence}</dt>
              <dd>{memoryQualityReport.lowConfidenceMemoryCount}</dd>
            </div>
          </dl>
          {memoryQualityReport.suggestedCleanupActions.length === 0 ? (
            <p className="memory-health-empty">{t.memoryHealth.noCleanup}</p>
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
  stableTruths,
  t
}: LocalizedProps & {
  stableTruths: StableTruth[];
}) {
  return (
    <section className="panel stable-truths-panel">
      <p className="eyebrow">{t.stableTruths.eyebrow}</p>
      <h1>{t.stableTruths.title}</h1>
      {stableTruths.length === 0 ? (
        <p className="empty-state">{t.stableTruths.empty}</p>
      ) : (
        <ol className="stable-truth-list">
          {stableTruths.slice(0, 5).map((truth) => (
            <li key={truth.id}>
              <p>{truth.statement}</p>
              <div>
                <span>{formatConfidence(truth.confidenceScore, t)}</span>
                <span>
                  {truth.evidenceCount} {t.common.evidence}
                </span>
              </div>
              <small>{formatSourceLayers(truth.sourceLayers, t)}</small>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function KnowledgeGraphPanel({
  knowledgeGraphReport,
  t
}: LocalizedProps & {
  knowledgeGraphReport: KnowledgeGraphReport | null;
}) {
  return (
    <section className="panel knowledge-graph-panel">
      <p className="eyebrow">{t.knowledgeGraph.eyebrow}</p>
      <h1>{t.knowledgeGraph.title}</h1>
      {knowledgeGraphReport === null ? (
        <p className="empty-state">{t.knowledgeGraph.loading}</p>
      ) : (
        <div className="knowledge-graph-summary">
          <dl>
            <div>
              <dt>{t.knowledgeGraph.nodes}</dt>
              <dd>{knowledgeGraphReport.nodeCount}</dd>
            </div>
            <div>
              <dt>{t.knowledgeGraph.edges}</dt>
              <dd>{knowledgeGraphReport.edgeCount}</dd>
            </div>
          </dl>

          <section>
            <h2>{t.knowledgeGraph.strongestConnections}</h2>
            {knowledgeGraphReport.strongestConnections.length === 0 ? (
              <p>{t.knowledgeGraph.noStrongConnections}</p>
            ) : (
              <ul>
                {knowledgeGraphReport.strongestConnections.map((edge) => (
                  <li key={edge.id}>
                    <p>{edge.explanation}</p>
                    <span>{formatConfidence(edge.confidenceScore, t)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2>{t.knowledgeGraph.isolatedNodes}</h2>
            {knowledgeGraphReport.isolatedNodes.length === 0 ? (
              <p>{t.knowledgeGraph.noIsolatedNodes}</p>
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
            <h2>{t.knowledgeGraph.contradictionCandidates}</h2>
            {knowledgeGraphReport.contradictionCandidates.length === 0 ? (
              <p>{t.knowledgeGraph.noContradictions}</p>
            ) : (
              <ul>
                {knowledgeGraphReport.contradictionCandidates.map((edge) => (
                  <li key={edge.id}>
                    <p>{edge.explanation}</p>
                    <span>{formatConfidence(edge.confidenceScore, t)}</span>
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
  temporalReport,
  t
}: LocalizedProps & {
  temporalReport: TemporalReport | null;
}) {
  return (
    <section className="panel temporal-panel">
      <p className="eyebrow">{t.temporal.eyebrow}</p>
      <h1>{t.temporal.title}</h1>
      {temporalReport === null ? (
        <p className="empty-state">{t.temporal.loading}</p>
      ) : (
        <div className="temporal-summary">
          <p>{temporalReport.summary}</p>
          <small>{temporalReport.timeWindowAnalyzed.label}</small>

          <section>
            <h2>{t.temporal.trends}</h2>
            <ul>
              {temporalReport.trends.map((trend) => (
                <li key={trend.id}>
                  <div>
                    <strong>{getTemporalMetricLabel(t, trend.metric)}</strong>
                    <span>{getTemporalTrendLabel(t, trend.direction)}</span>
                  </div>
                  <p>{trend.explanation}</p>
                  <small>
                    {trend.evidenceCount} {t.common.evidence} /{" "}
                    {formatConfidence(trend.confidenceScore, t)}
                  </small>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>{t.temporal.risks}</h2>
            <ul>
              {temporalReport.risks.map((risk) => (
                <li key={risk.id}>
                  <div>
                    <strong>{getTemporalRiskLabel(t, risk.type)}</strong>
                    <span>{getTemporalRiskLevelLabel(t, risk.level)}</span>
                  </div>
                  <p>{risk.explanation}</p>
                  <small>
                    {risk.evidenceCount} {t.common.evidence} /{" "}
                    {formatConfidence(risk.confidenceScore, t)}
                  </small>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>{t.temporal.forecasts}</h2>
            <ul>
              {temporalReport.forecasts.map((forecast) => (
                <li key={forecast.id}>
                  <div>
                    <strong>{getTemporalMetricLabel(t, forecast.metric)}</strong>
                    <span>
                      {getTemporalForecastLabel(t, forecast.direction)}
                    </span>
                  </div>
                  <p>{forecast.explanation}</p>
                  <small>
                    {forecast.evidenceCount} {t.common.evidence} /{" "}
                    {formatConfidence(forecast.confidenceScore, t)}
                  </small>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>{t.temporal.supportingEvidence}</h2>
            <ul>
              {temporalReport.supportingEvidence.slice(0, 5).map((signal) => (
                <li key={signal.id}>
                  <div>
                    <strong>{signal.label}</strong>
                    <span>{getTemporalSignalLabel(t, signal.type)}</span>
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
  dailyReflection,
  t
}: LocalizedProps & {
  dailyReflection: DailyReflection | null;
}) {
  return (
    <section className="panel reflection-panel">
      <p className="eyebrow">{t.reflection.eyebrow}</p>
      <h1>{t.reflection.title}</h1>
      {dailyReflection === null ? (
        <p className="empty-state">{t.reflection.loading}</p>
      ) : (
        <div className="reflection-summary">
          <section>
            <h2>{t.reflection.emotionalState}</h2>
            <p>{dailyReflection.emotionalState}</p>
          </section>
          <section>
            <h2>{t.reflection.whatMatteredMost}</h2>
            <p>{dailyReflection.whatMatteredMost}</p>
          </section>
          <section>
            <h2>{t.reflection.suggestedNextStep}</h2>
            <p>{dailyReflection.suggestedNextStep}</p>
          </section>
          <section>
            <h2>{t.reflection.currentRoutineRecommendation}</h2>
            <p>{dailyReflection.currentRoutineRecommendation.name}</p>
          </section>
        </div>
      )}
    </section>
  );
}

export function InsightsPanel({
  patternInsights,
  t
}: LocalizedProps & {
  patternInsights: PatternInsight[];
}) {
  return (
    <section className="panel insights-panel">
      <p className="eyebrow">{t.insights.eyebrow}</p>
      <h1>{t.insights.title}</h1>
      {patternInsights.length === 0 ? (
        <p className="empty-state">{t.insights.empty}</p>
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
  activityFeed,
  language,
  t
}: LocalizedProps & {
  activityFeed: ActivityFeedItem[];
}) {
  return (
    <section className="panel timeline-panel">
      <p className="eyebrow">{t.timeline.eyebrow}</p>
      <h1>{t.timeline.title}</h1>
      {activityFeed.length === 0 ? (
        <p className="empty-state">{t.timeline.empty}</p>
      ) : (
        <ol className="timeline-list">
          {activityFeed.map((item) => (
            <li key={item.id}>
              <time>{formatTimestamp(item.timestamp, language)}</time>
              <span>{getActivityTypeLabel(t, item.type)}</span>
              <p>{item.summary}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function LatestContextPanel({
  latestContext,
  t
}: LocalizedProps & {
  latestContext: ContextSnapshot | null;
}) {
  return (
    <section className="panel context-latest">
      <h2>{t.latestContext.title}</h2>
      {latestContext === null ? (
        <p className="empty-state">{t.latestContext.empty}</p>
      ) : (
        <div className="context-summary">
          <p>{latestContext.summary}</p>
          <dl>
            <div>
              <dt>{t.latestContext.mood}</dt>
              <dd>{latestContext.mood}</dd>
            </div>
            <div>
              <dt>{t.latestContext.energy}</dt>
              <dd>{latestContext.energyLevel}/10</dd>
            </div>
            <div>
              <dt>{t.latestContext.focus}</dt>
              <dd>{latestContext.focusLevel}/10</dd>
            </div>
            <div>
              <dt>{t.latestContext.privacy}</dt>
              <dd>{getPrivacyLabel(t, latestContext.privacyScope)}</dd>
            </div>
          </dl>
          <p className="situation">{latestContext.currentSituation}</p>
        </div>
      )}
    </section>
  );
}

export function RoutineSuggestionPanel({
  routineSuggestion,
  t
}: LocalizedProps & {
  routineSuggestion: RoutineSuggestion | null;
}) {
  return (
    <section className="panel routine-suggestion">
      <h2>{t.routine.title}</h2>
      {routineSuggestion === null ? (
        <p className="empty-state">{t.routine.empty}</p>
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
            <span>{getRoutineReasonLabel(t, routineSuggestion.reason)}</span>
            <span>{getPrivacyLabel(t, routineSuggestion.privacyScope)}</span>
          </div>
        </div>
      )}
    </section>
  );
}

export function MemoryListPanel({
  memories,
  t
}: LocalizedProps & {
  memories: Memory[];
}) {
  return (
    <section className="panel memory-list">
      <h2>{t.memoryList.title}</h2>
      {memories.length === 0 ? (
        <p className="empty-state">{t.memoryList.empty}</p>
      ) : (
        <ul>
          {memories.map((memory) => (
            <li key={memory.id}>
              <p>{memory.content}</p>
              <div className="memory-meta">
                <span>{getPrivacyLabel(t, memory.privacyScope)}</span>
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
