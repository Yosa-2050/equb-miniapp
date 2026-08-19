"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { EqubFrequency, PaymentCollector } from "@/lib/api";

const WEEKDAY_VALUES = [0, 1, 2, 3, 4, 5, 6] as const;

interface ReminderScheduleFieldsProps {
  frequency: EqubFrequency;
  collector: PaymentCollector;
  onCollectorChange: (value: PaymentCollector) => void;
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
  collector,
  onCollectorChange,
  maxMembers,
  onMaxMembersChange,
  reminderTime,
  onReminderTimeChange,
  reminderDayOfWeek,
  onReminderDayOfWeekChange,
  reminderDayOfMonth,
  onReminderDayOfMonthChange,
}: ReminderScheduleFieldsProps) {
  const t = useTranslations("equbForm");

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label>{t("collectorLabel")}</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onCollectorChange("winner")}
            className={
              "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors " +
              (collector === "winner"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted/40")
            }
          >
            {t("collectorWinner")}
          </button>
          <button
            type="button"
            onClick={() => onCollectorChange("admin")}
            className={
              "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors " +
              (collector === "admin"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted/40")
            }
          >
            {t("collectorAdmin")}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {collector === "admin" ? t("collectorAdminHint") : t("collectorWinnerHint")}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="equb-max-members">{t("maxMembersLabel")}</Label>
        <Input
          id="equb-max-members"
          type="number"
          min="1"
          value={maxMembers}
          onChange={(e) => onMaxMembersChange(e.target.value)}
          placeholder={t("maxMembersPlaceholder")}
        />
      </div>

      <div className="rounded-lg border border-border p-3">
        <p className="mb-3 text-sm font-medium">{t("reminderScheduleTitle")}</p>
        <div className="flex flex-col gap-3">
          {frequency === "weekly" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="equb-reminder-day-week">{t("dayOfWeekLabel")}</Label>
              <Select
                id="equb-reminder-day-week"
                value={reminderDayOfWeek}
                onChange={(e) => onReminderDayOfWeekChange(e.target.value)}
              >
                <option value="">{t("selectADay")}</option>
                {WEEKDAY_VALUES.map((d) => (
                  <option key={d} value={d}>
                    {t(`weekday.${d}`)}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {frequency === "monthly" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="equb-reminder-day-month">
                {t("dayOfMonthLabel")}
              </Label>
              <Select
                id="equb-reminder-day-month"
                value={reminderDayOfMonth}
                onChange={(e) => onReminderDayOfMonthChange(e.target.value)}
              >
                <option value="">{t("selectADay")}</option>
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
              {t("reminderTimeLabel")}
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
