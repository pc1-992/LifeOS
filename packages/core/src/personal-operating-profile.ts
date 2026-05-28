export type PersonalOperatingProfileTraitType =
  | "strongest_focus_periods"
  | "common_stress_patterns"
  | "preferred_recovery_routines"
  | "most_effective_recommendation_types"
  | "energy_stability_trends";

export interface PersonalOperatingProfileTrait {
  type: PersonalOperatingProfileTraitType;
  title: string;
  summary: string;
  evidence: string[];
}

export interface PersonalOperatingProfile {
  generatedAt: Date;
  contextSnapshotCount: number;
  actionHistoryCount: number;
  traits: PersonalOperatingProfileTrait[];
}
