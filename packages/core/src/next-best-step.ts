export type NextBestStepReason =
  | "no_context"
  | "recovery_needed"
  | "momentum_available"
  | "frequent_stress"
  | "follow_reflection";

export interface NextBestStep {
  id: string;
  title: string;
  action: string;
  reason: NextBestStepReason;
  supportingSummary: string;
}
