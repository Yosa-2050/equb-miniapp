// All feature data now comes from the real API (see src/lib/api.ts). Only
// UI-only constants/shared types that aren't backend data live here.

export const mockLotteryColors = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

// Shared type for a member row used across the Equb details / management UI.
export interface EqubMemberRow {
  id: string;
  number: number;
  fullName: string;
  username: string;
  account: { provider: string; number: string };
}
