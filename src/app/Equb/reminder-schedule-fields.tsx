"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { EqubFrequency } from "@/lib/api";

const WEEKDAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface ReminderScheduleFieldsProps {
  frequency: EqubFrequency;
  onFrequencyChange: (value: EqubFrequency) => void;
  maxMembers: string;
  onMaxMembersChange: (value: string) => void;
  reminderTime: string;
  onReminderTimeChange: (value: string) => void;
  reminderDayOfWeek: string;
  onReminderDayOfWeekChange: (value: string) => void;
  reminderDayOfMonth: string;
  onReminderDayOfMonthChange: (value: string) => void;
}

export function ReminderScheduleFields({
  frequency,
  onFrequencyChange,
  maxMembers,
  onMaxMembersChange,
  reminderTime,
  onReminderTimeChange,
  reminderDayOfWeek,
  onReminderDayOfWeekChange,
  reminderDayOfMonth,
  onReminderDayOfMonthChange,
}: ReminderScheduleFieldsProps) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="equb-frequency">Frequency</Label>
        <Select
          id="equb-frequency"
          value={frequency}
          onChange={(e) => onFrequencyChange(e.target.value as EqubFrequency)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="equb-max-members">Max Members (optional)</Label>
        <Input
          id="equb-max-members"
          type="number"
          min="1"
          value={maxMembers}
          onChange={(e) => onMaxMembersChange(e.target.value)}
          placeholder="Leave blank for unlimited"
        />
      </div>

      <div className="rounded-lg border border-border p-3">
        <p className="mb-3 text-sm font-medium">Reminder schedule</p>
        <div className="flex flex-col gap-3">
          {frequency === "weekly" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="equb-reminder-day-week">Day of week</Label>
              <Select
                id="equb-reminder-day-week"
                value={reminderDayOfWeek}
                onChange={(e) => onReminderDayOfWeekChange(e.target.value)}
              >
                <option value="">Select a day</option>
                {WEEKDAYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {frequency === "monthly" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="equb-reminder-day-month">
                Day of month (Ethiopian calendar)
              </Label>
              <Select
                id="equb-reminder-day-month"
                value={reminderDayOfMonth}
                onChange={(e) => onReminderDayOfMonthChange(e.target.value)}
              >
                <option value="">Select a day</option>
                {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="equb-reminder-time">
              Time (Ethiopia time, EAT)
            </Label>
            <Input
              id="equb-reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => onReminderTimeChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
