import React from "react";
import type {
  ActivityFeedItem,
  NextBestStep,
  PrivacyScope,
  RoutineSuggestion,
  StructuredMemoryLayerName,
  StructuredMemorySourceType,
  TemporalForecastDirection,
  TemporalMetric,
  TemporalRiskLevel,
  TemporalRiskType,
  TemporalSignalType,
  TemporalTrendDirection
} from "./types.js";

export type Language = "en" | "he";
type DeepStringValues<T> = T extends string
  ? string
  : { [Key in keyof T]: DeepStringValues<T[Key]> };

const languageStorageKey = "lifeos.language";

export const translations = {
  en: {
    language: {
      label: "Language",
      english: "English",
      hebrew: "Hebrew"
    },
    common: {
      evidence: "evidence",
      confidence: "confidence",
      score: "score",
      completed: "completed",
      skipped: "skipped",
      current: "current",
      noSourceLayer: "No source layer"
    },
    status: {
      savingCompletion: "Saving completion...",
      savingSkip: "Saving skip...",
      actionSaveError: "Could not save action.",
      markedCompleted: "Marked completed.",
      markedSkipped: "Skipped.",
      savingMemory: "Saving memory...",
      memorySaveError: "Could not save memory.",
      memorySaved: "Memory saved.",
      savingContext: "Saving context...",
      contextSaveError: "Could not save context.",
      contextSaved: "Context saved."
    },
    dashboard: {
      eyebrow: "Daily Dashboard",
      title: "What matters now",
      loading: "Loading today's summary.",
      latestContext: "Latest Context",
      noContext: "No context snapshot yet.",
      suggestedRoutine: "Suggested Routine",
      latestMemory: "Latest Memory",
      noMemory: "No memory captured yet."
    },
    nextStep: {
      eyebrow: "Next Best Step",
      title: "One clear action",
      loading: "Loading next step.",
      completed: "Completed",
      skipped: "Skipped"
    },
    actionHistory: {
      eyebrow: "Action History",
      title: "Recent completions",
      empty: "No completed actions yet."
    },
    feedback: {
      eyebrow: "Recommendation Feedback",
      title: "What works best",
      empty: "Complete or skip actions to build feedback.",
      workingWell: "Working Well",
      noClearPattern: "No clear pattern yet.",
      oftenSkipped: "Often Skipped",
      noRepeatedSkips: "No repeated skips yet.",
      successfulRoutines: "Successful Routines",
      noRoutinePattern: "No routine pattern yet."
    },
    profile: {
      eyebrow: "LifeOS DNA",
      title: "Operating profile",
      loading: "Loading operating profile.",
      basedOn: "Based on",
      contextSnapshot: "context snapshot",
      contextSnapshots: "context snapshots",
      and: "and",
      actionRecord: "action record",
      actionRecords: "action records"
    },
    memoryArchitecture: {
      eyebrow: "Memory Architecture",
      title: "Memory OS layers",
      loading: "Loading memory architecture.",
      empty: "No related items yet."
    },
    retrieval: {
      eyebrow: "Relevant Memories",
      title: "Context retrieval",
      controlsLabel: "Retrieval queries",
      empty: "No relevant memories found yet.",
      relevanceScore: "Relevance score",
      queries: {
        current: "current",
        focus: "focus",
        stress: "stress",
        energy: "energy"
      }
    },
    memoryHealth: {
      eyebrow: "Memory Health",
      title: "Quality check",
      loading: "Loading memory health.",
      qualityScore: "memory quality score",
      active: "Active",
      stale: "Stale",
      conflicting: "Conflicting",
      lowConfidence: "Low confidence",
      noCleanup: "No cleanup actions suggested."
    },
    stableTruths: {
      eyebrow: "Stable Truths",
      title: "Durable knowledge",
      empty: "No stable truths consolidated yet."
    },
    knowledgeGraph: {
      eyebrow: "Knowledge Graph",
      title: "Relationship map",
      loading: "Loading knowledge graph.",
      nodes: "Nodes",
      edges: "Edges",
      strongestConnections: "Strongest Connections",
      noStrongConnections: "No strong connections yet.",
      isolatedNodes: "Isolated Nodes",
      noIsolatedNodes: "No isolated nodes detected.",
      contradictionCandidates: "Contradiction Candidates",
      noContradictions: "No contradiction candidates found."
    },
    temporal: {
      eyebrow: "Temporal Intelligence",
      title: "Change over time",
      loading: "Loading temporal intelligence.",
      trends: "Trends",
      risks: "Risks",
      forecasts: "Forecasts",
      supportingEvidence: "Supporting Evidence"
    },
    reflection: {
      eyebrow: "Daily Reflection",
      title: "Session review",
      loading: "Loading reflection.",
      emotionalState: "Today's Emotional State",
      whatMatteredMost: "What Mattered Most",
      suggestedNextStep: "Suggested Next Step",
      currentRoutineRecommendation: "Current Routine Recommendation"
    },
    insights: {
      eyebrow: "Insights",
      title: "Patterns",
      empty: "No insights yet."
    },
    timeline: {
      eyebrow: "Activity Feed",
      title: "Timeline",
      empty: "No activity yet."
    },
    contextCapture: {
      eyebrow: "LifeOS",
      title: "Context Snapshot",
      intro: "Capture the current moment in a small, private-by-default snapshot.",
      mood: "Mood",
      moodPlaceholder: "calm, tired, focused",
      energy: "Energy level",
      focus: "Focus level",
      situation: "Current situation",
      situationPlaceholder: "What is happening right now?",
      privacy: "Privacy scope",
      save: "Save context"
    },
    latestContext: {
      title: "Latest Context",
      empty: "No context snapshot saved yet.",
      mood: "Mood",
      energy: "Energy",
      focus: "Focus",
      privacy: "Privacy"
    },
    routine: {
      title: "Suggested Routine",
      empty: "No routine suggestion loaded yet."
    },
    memoryCapture: {
      eyebrow: "LifeOS",
      title: "Memory Capture",
      intro:
        "Capture a simple memory with visible privacy context. This first slice keeps storage temporary and local to the running API process.",
      memory: "Memory",
      memoryPlaceholder: "What should LifeOS remember?",
      privacy: "Privacy scope",
      tags: "Tags",
      tagsPlaceholder: "routine, health, idea",
      save: "Save memory"
    },
    memoryList: {
      title: "Saved Memories",
      empty: "No memories saved yet."
    },
    privacy: {
      private: "private",
      trusted: "trusted",
      shareable: "shareable"
    },
    actions: {
      no_context: "no context",
      recovery_needed: "recovery needed",
      momentum_available: "momentum available",
      frequent_stress: "frequent stress",
      follow_reflection: "follow reflection"
    },
    routines: {
      low_energy: "low energy",
      low_focus: "low focus",
      stressed_mood: "stressed mood",
      steady_state: "steady state",
      no_context: "no context"
    },
    activityTypes: {
      memory: "memory",
      context: "context",
      routine_suggestion: "routine suggestion",
      daily_reflection: "daily reflection"
    },
    sourceTypes: {
      context: "context",
      routine: "routine",
      recommendation: "recommendation",
      memory: "memory",
      reflection: "reflection",
      action_history: "action history",
      timeline_event: "timeline event",
      pattern: "pattern",
      profile_trait: "profile trait",
      adaptive_rule: "adaptive rule"
    },
    temporalMetric: {
      energy: "energy",
      focus: "focus",
      stress: "stress",
      routine_effectiveness: "routine effectiveness",
      action_completion: "action completion"
    },
    temporalTrend: {
      improving: "improving",
      declining: "declining",
      stable: "stable",
      increasing: "increasing",
      decreasing: "decreasing"
    },
    temporalForecast: {
      likely_improving: "likely improving",
      likely_declining: "likely declining",
      likely_stable: "likely stable",
      likely_increasing: "likely increasing",
      likely_decreasing: "likely decreasing"
    },
    temporalRisk: {
      burnout: "burnout",
      overload: "overload",
      inconsistency: "inconsistency",
      stagnation: "stagnation"
    },
    temporalRiskLevel: {
      low: "low",
      moderate: "moderate",
      high: "high"
    },
    temporalSignal: {
      context_history: "context history",
      action_history: "action history",
      pattern_insight: "pattern insight",
      recommendation_feedback: "recommendation feedback",
      stable_truth: "stable truth",
      personal_operating_profile: "personal operating profile",
      knowledge_graph: "knowledge graph"
    },
    memoryLayers: {
      "Working Memory": "Working Memory",
      "Episodic Memory": "Episodic Memory",
      "Semantic Memory": "Semantic Memory",
      "Identity Memory": "Identity Memory",
      "Procedural Memory": "Procedural Memory"
    }
  },
  he: {
    language: {
      label: "שפה",
      english: "English",
      hebrew: "עברית"
    },
    common: {
      evidence: "עדויות",
      confidence: "ביטחון",
      score: "ציון",
      completed: "הושלם",
      skipped: "דולג",
      current: "נוכחי",
      noSourceLayer: "אין שכבת מקור"
    },
    status: {
      savingCompletion: "שומר השלמה...",
      savingSkip: "שומר דילוג...",
      actionSaveError: "לא ניתן לשמור את הפעולה.",
      markedCompleted: "סומן כהושלם.",
      markedSkipped: "דולג.",
      savingMemory: "שומר זיכרון...",
      memorySaveError: "לא ניתן לשמור את הזיכרון.",
      memorySaved: "הזיכרון נשמר.",
      savingContext: "שומר הקשר...",
      contextSaveError: "לא ניתן לשמור את ההקשר.",
      contextSaved: "ההקשר נשמר."
    },
    dashboard: {
      eyebrow: "לוח יומי",
      title: "מה חשוב עכשיו",
      loading: "טוען סיכום יומי.",
      latestContext: "הקשר אחרון",
      noContext: "אין עדיין צילום הקשר.",
      suggestedRoutine: "שגרה מוצעת",
      latestMemory: "זיכרון אחרון",
      noMemory: "עוד לא נשמר זיכרון."
    },
    nextStep: {
      eyebrow: "הצעד הבא",
      title: "פעולה אחת ברורה",
      loading: "טוען את הצעד הבא.",
      completed: "הושלם",
      skipped: "דלג"
    },
    actionHistory: {
      eyebrow: "היסטוריית פעולות",
      title: "השלמות אחרונות",
      empty: "אין עדיין פעולות שהושלמו."
    },
    feedback: {
      eyebrow: "משוב המלצות",
      title: "מה עובד טוב",
      empty: "כדאי להשלים או לדלג על פעולות כדי לבנות משוב.",
      workingWell: "עובד טוב",
      noClearPattern: "אין עדיין דפוס ברור.",
      oftenSkipped: "מדולג לעיתים קרובות",
      noRepeatedSkips: "אין עדיין דילוגים חוזרים.",
      successfulRoutines: "שגרות מצליחות",
      noRoutinePattern: "אין עדיין דפוס שגרה."
    },
    profile: {
      eyebrow: "DNA של LifeOS",
      title: "פרופיל עבודה אישי",
      loading: "טוען פרופיל עבודה.",
      basedOn: "מבוסס על",
      contextSnapshot: "צילום הקשר",
      contextSnapshots: "צילומי הקשר",
      and: "ו",
      actionRecord: "רישום פעולה",
      actionRecords: "רישומי פעולה"
    },
    memoryArchitecture: {
      eyebrow: "ארכיטקטורת זיכרון",
      title: "שכבות הזיכרון",
      loading: "טוען את ארכיטקטורת הזיכרון.",
      empty: "אין עדיין פריטים קשורים."
    },
    retrieval: {
      eyebrow: "זיכרונות רלוונטיים",
      title: "שליפה לפי הקשר",
      controlsLabel: "שאילתות שליפה",
      empty: "לא נמצאו עדיין זיכרונות רלוונטיים.",
      relevanceScore: "ציון רלוונטיות",
      queries: {
        current: "נוכחי",
        focus: "מיקוד",
        stress: "לחץ",
        energy: "אנרגיה"
      }
    },
    memoryHealth: {
      eyebrow: "בריאות הזיכרון",
      title: "בדיקת איכות",
      loading: "טוען בדיקת זיכרון.",
      qualityScore: "ציון איכות זיכרון",
      active: "פעיל",
      stale: "מיושן",
      conflicting: "סותר",
      lowConfidence: "ביטחון נמוך",
      noCleanup: "אין פעולות ניקוי מוצעות."
    },
    stableTruths: {
      eyebrow: "אמיתות יציבות",
      title: "ידע עמיד",
      empty: "אין עדיין אמיתות יציבות."
    },
    knowledgeGraph: {
      eyebrow: "גרף ידע",
      title: "מפת קשרים",
      loading: "טוען גרף ידע.",
      nodes: "צמתים",
      edges: "קשרים",
      strongestConnections: "הקשרים החזקים ביותר",
      noStrongConnections: "אין עדיין קשרים חזקים.",
      isolatedNodes: "צמתים מבודדים",
      noIsolatedNodes: "לא נמצאו צמתים מבודדים.",
      contradictionCandidates: "סתירות אפשריות",
      noContradictions: "לא נמצאו סתירות אפשריות."
    },
    temporal: {
      eyebrow: "אינטליגנציה בזמן",
      title: "שינוי לאורך זמן",
      loading: "טוען תובנות זמן.",
      trends: "מגמות",
      risks: "סיכונים",
      forecasts: "תחזיות",
      supportingEvidence: "עדויות תומכות"
    },
    reflection: {
      eyebrow: "רפלקציה יומית",
      title: "סקירת מפגש",
      loading: "טוען רפלקציה.",
      emotionalState: "מצב רגשי היום",
      whatMatteredMost: "מה היה חשוב",
      suggestedNextStep: "צעד הבא מוצע",
      currentRoutineRecommendation: "המלצת שגרה נוכחית"
    },
    insights: {
      eyebrow: "תובנות",
      title: "דפוסים",
      empty: "אין עדיין תובנות."
    },
    timeline: {
      eyebrow: "ציר פעילות",
      title: "ציר זמן",
      empty: "אין עדיין פעילות."
    },
    contextCapture: {
      eyebrow: "LifeOS",
      title: "צילום הקשר",
      intro: "שמור את הרגע הנוכחי בצילום קטן ופרטי כברירת מחדל.",
      mood: "מצב רוח",
      moodPlaceholder: "רגוע, עייף, ממוקד",
      energy: "רמת אנרגיה",
      focus: "רמת מיקוד",
      situation: "מה קורה עכשיו",
      situationPlaceholder: "מה קורה כרגע?",
      privacy: "רמת פרטיות",
      save: "שמור הקשר"
    },
    latestContext: {
      title: "הקשר אחרון",
      empty: "עדיין לא נשמר צילום הקשר.",
      mood: "מצב רוח",
      energy: "אנרגיה",
      focus: "מיקוד",
      privacy: "פרטיות"
    },
    routine: {
      title: "שגרה מוצעת",
      empty: "עדיין לא נטענה שגרה מוצעת."
    },
    memoryCapture: {
      eyebrow: "LifeOS",
      title: "שמירת זיכרון",
      intro:
        "שמור זיכרון פשוט עם הקשר פרטיות ברור. בשלב הזה האחסון זמני ומקומי לתהליך ה-API שרץ עכשיו.",
      memory: "זיכרון",
      memoryPlaceholder: "מה חשוב ש-LifeOS יזכור?",
      privacy: "רמת פרטיות",
      tags: "תגיות",
      tagsPlaceholder: "שגרה, בריאות, רעיון",
      save: "שמור זיכרון"
    },
    memoryList: {
      title: "זיכרונות שמורים",
      empty: "אין עדיין זיכרונות שמורים."
    },
    privacy: {
      private: "פרטי",
      trusted: "אמון",
      shareable: "ניתן לשיתוף"
    },
    actions: {
      no_context: "אין הקשר",
      recovery_needed: "נדרשת התאוששות",
      momentum_available: "יש מומנטום",
      frequent_stress: "לחץ חוזר",
      follow_reflection: "בהמשך לרפלקציה"
    },
    routines: {
      low_energy: "אנרגיה נמוכה",
      low_focus: "מיקוד נמוך",
      stressed_mood: "מצב רוח לחוץ",
      steady_state: "מצב יציב",
      no_context: "אין הקשר"
    },
    activityTypes: {
      memory: "זיכרון",
      context: "הקשר",
      routine_suggestion: "שגרה מוצעת",
      daily_reflection: "רפלקציה יומית"
    },
    sourceTypes: {
      context: "הקשר",
      routine: "שגרה",
      recommendation: "המלצה",
      memory: "זיכרון",
      reflection: "רפלקציה",
      action_history: "היסטוריית פעולות",
      timeline_event: "אירוע בציר זמן",
      pattern: "דפוס",
      profile_trait: "מאפיין פרופיל",
      adaptive_rule: "כלל הסתגלות"
    },
    temporalMetric: {
      energy: "אנרגיה",
      focus: "מיקוד",
      stress: "לחץ",
      routine_effectiveness: "יעילות שגרה",
      action_completion: "השלמת פעולות"
    },
    temporalTrend: {
      improving: "משתפרת",
      declining: "נחלשת",
      stable: "יציבה",
      increasing: "עולה",
      decreasing: "יורדת"
    },
    temporalForecast: {
      likely_improving: "כנראה משתפרת",
      likely_declining: "כנראה נחלשת",
      likely_stable: "כנראה יציבה",
      likely_increasing: "כנראה עולה",
      likely_decreasing: "כנראה יורדת"
    },
    temporalRisk: {
      burnout: "שחיקה",
      overload: "עומס יתר",
      inconsistency: "חוסר עקביות",
      stagnation: "תקיעות"
    },
    temporalRiskLevel: {
      low: "נמוך",
      moderate: "בינוני",
      high: "גבוה"
    },
    temporalSignal: {
      context_history: "היסטוריית הקשר",
      action_history: "היסטוריית פעולות",
      pattern_insight: "תובנת דפוס",
      recommendation_feedback: "משוב המלצה",
      stable_truth: "אמת יציבה",
      personal_operating_profile: "פרופיל עבודה אישי",
      knowledge_graph: "גרף ידע"
    },
    memoryLayers: {
      "Working Memory": "זיכרון עבודה",
      "Episodic Memory": "זיכרון אפיזודי",
      "Semantic Memory": "זיכרון סמנטי",
      "Identity Memory": "זיכרון זהות",
      "Procedural Memory": "זיכרון תהליכי"
    }
  }
} as const;

export type Translations = DeepStringValues<(typeof translations)["en"]>;

const englishTranslations: Translations = translations.en;
const hebrewTranslations: Translations = translations.he;

void englishTranslations;
void hebrewTranslations;

export function useLanguage() {
  const [language, setLanguageState] = React.useState<Language>(() =>
    getStoredLanguage()
  );

  React.useEffect(() => {
    window.localStorage.setItem(languageStorageKey, language);
    document.documentElement.lang = language;
    if (language === "he") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.removeAttribute("dir");
    }
  }, [language]);

  function setLanguage(nextLanguage: Language): void {
    setLanguageState(nextLanguage);
  }

  return {
    language,
    direction: getDirection(language),
    translations: translations[language],
    setLanguage
  };
}

export function getDirection(language: Language): "ltr" | "rtl" {
  return language === "he" ? "rtl" : "ltr";
}

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") {
    return "en";
  }

  return window.localStorage.getItem(languageStorageKey) === "he" ? "he" : "en";
}

export function getPrivacyLabel(
  translationsForLanguage: Translations,
  scope: PrivacyScope
): string {
  return translationsForLanguage.privacy[scope];
}

export function getActionReasonLabel(
  translationsForLanguage: Translations,
  reason: NextBestStep["reason"]
): string {
  return translationsForLanguage.actions[reason];
}

export function getRoutineReasonLabel(
  translationsForLanguage: Translations,
  reason: RoutineSuggestion["reason"]
): string {
  return translationsForLanguage.routines[reason];
}

export function getActivityTypeLabel(
  translationsForLanguage: Translations,
  type: ActivityFeedItem["type"]
): string {
  return translationsForLanguage.activityTypes[type];
}

export function getSourceTypeLabel(
  translationsForLanguage: Translations,
  type: StructuredMemorySourceType
): string {
  return translationsForLanguage.sourceTypes[type];
}

export function getMemoryLayerLabel(
  translationsForLanguage: Translations,
  layer: StructuredMemoryLayerName
): string {
  return translationsForLanguage.memoryLayers[layer];
}

export function getTemporalMetricLabel(
  translationsForLanguage: Translations,
  metric: TemporalMetric
): string {
  return translationsForLanguage.temporalMetric[metric];
}

export function getTemporalTrendLabel(
  translationsForLanguage: Translations,
  direction: TemporalTrendDirection
): string {
  return translationsForLanguage.temporalTrend[direction];
}

export function getTemporalForecastLabel(
  translationsForLanguage: Translations,
  direction: TemporalForecastDirection
): string {
  return translationsForLanguage.temporalForecast[direction];
}

export function getTemporalRiskLabel(
  translationsForLanguage: Translations,
  type: TemporalRiskType
): string {
  return translationsForLanguage.temporalRisk[type];
}

export function getTemporalRiskLevelLabel(
  translationsForLanguage: Translations,
  level: TemporalRiskLevel
): string {
  return translationsForLanguage.temporalRiskLevel[level];
}

export function getTemporalSignalLabel(
  translationsForLanguage: Translations,
  type: TemporalSignalType
): string {
  return translationsForLanguage.temporalSignal[type];
}
