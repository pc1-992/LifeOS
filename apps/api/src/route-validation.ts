type PrivacyScope = "private" | "trusted" | "shareable";
type ActionCompletionStatus = "completed" | "skipped";
type NextBestStepReason =
  | "no_context"
  | "recovery_needed"
  | "momentum_available"
  | "frequent_stress"
  | "follow_reflection";

export interface NextBestStepBody {
  id: string;
  title: string;
  action: string;
  reason: NextBestStepReason;
  supportingSummary: string;
}

const privacyScopes: PrivacyScope[] = ["private", "trusted", "shareable"];

export function getActionCompletionStatus(
  value: unknown
): ActionCompletionStatus {
  return value === "skipped" ? "skipped" : "completed";
}

export function getNextBestStepBody(value: unknown): NextBestStepBody {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Suggested action is required.");
  }

  const suggestedAction = value as Record<string, unknown>;

  return {
    id: getStringFromUnknown(suggestedAction.id),
    title: getStringFromUnknown(suggestedAction.title),
    action: getStringFromUnknown(suggestedAction.action),
    reason: getNextBestStepReason(suggestedAction.reason),
    supportingSummary: getStringFromUnknown(suggestedAction.supportingSummary)
  };
}

export function getTags(value: unknown): string[] {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export function getContextKeywords(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 4)
    .slice(0, 8);
}

export function getPrivacyScope(value: unknown): PrivacyScope {
  return getPrivacyScopeWithDefault(value, "private");
}

export function getPrivacyScopeWithDefault(
  value: unknown,
  fallback: PrivacyScope
): PrivacyScope {
  if (
    typeof value === "string" &&
    privacyScopes.includes(value as PrivacyScope)
  ) {
    return value as PrivacyScope;
  }

  return fallback;
}

function getStringFromUnknown(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getNextBestStepReason(value: unknown): NextBestStepReason {
  if (
    value === "no_context" ||
    value === "recovery_needed" ||
    value === "momentum_available" ||
    value === "frequent_stress" ||
    value === "follow_reflection"
  ) {
    return value;
  }

  return "follow_reflection";
}
