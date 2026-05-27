export type PrivacyScope = "private" | "trusted" | "shareable";

export function canUseInContext(
  sourceScope: PrivacyScope,
  requestedScope: PrivacyScope
): boolean {
  const rank: Record<PrivacyScope, number> = {
    private: 0,
    trusted: 1,
    shareable: 2
  };

  return rank[sourceScope] >= rank[requestedScope];
}
