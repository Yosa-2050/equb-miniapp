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

export function amountFieldLabel(frequency: EqubFrequency): string {
  switch (frequency) {
    case "daily":
      return "Daily Amount per member or group (ETB)";
    case "weekly":
      return "Weekly Amount per member or group (ETB)";
    case "monthly":
    default:
      return "Monthly Amount per member or group (ETB)";
  }
}
