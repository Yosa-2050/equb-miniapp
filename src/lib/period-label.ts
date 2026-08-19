import type { EqubFrequency } from "./api";

export function periodLabel(frequency: EqubFrequency): string {
  switch (frequency) {
    case "daily":
      return "Day";
    case "weekly":
      return "Week";
    case "monthly":
    default:
      return "Month";
  }
}
