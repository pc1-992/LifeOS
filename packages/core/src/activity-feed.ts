export type ActivityFeedItemType =
  | "memory"
  | "context"
  | "routine_suggestion"
  | "daily_reflection";

export interface ActivityFeedItem {
  id: string;
  timestamp: Date;
  type: ActivityFeedItemType;
  summary: string;
}
