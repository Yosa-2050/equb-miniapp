"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createEqub, type EqubFrequency, type PaymentCollector } from "@/lib/api";
import { periodLabel } from "@/lib/period-label";
import { ReminderScheduleFields } from "../reminder-schedule-fields";

export default function CreateEqubPage() {
  const router = useRouter();
  const t = useTranslations("equbForm");

  const [name, setName] = useState("");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [frequency, setFrequency] = useState<EqubFrequency>("monthly");
  const [collector, setCollector] = useState<PaymentCollector>("winner");
  const [maxMembers, setMaxMembers] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderDayOfWeek, setReminderDayOfWeek] = useState("");
  const [reminderDayOfMonth, setReminderDayOfMonth] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    createEqub({
      name,
      monthlyAmount: Number(monthlyAmount),
      durationMonths: Number(durationMonths),
      totalAmount: Number(totalAmount),
      frequency,
      collector,
      maxMembers: maxMembers.trim() ? Number(maxMembers) : undefined,
      reminderTime: reminderTime.trim() ? reminderTime : undefined,
      reminderDayOfWeek:
        frequency === "weekly" && reminderDayOfWeek !== ""
          ? Number(reminderDayOfWeek)
          : undefined,
      reminderDayOfMonth:
        frequency === "monthly" && reminderDayOfMonth !== ""
          ? Number(reminderDayOfMonth)
          : undefined,
      isPublic,
      description: description.trim() ? description.trim() : undefined,
    })
      .then((equb) => {
        router.push(`/Equb/${equb.id}`);
      })
      .catch((err) => {
        console.error("Failed to create equb", err);
        setError(err instanceof Error ? err.message : t("createFailed"));
        setSubmitting(false);
      });
  };

  return (
    <div className="pb-4">
      <header className="flex items-center gap-2 border-b border-border bg-background px-2 py-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="flex-1 truncate text-lg font-bold">{t("createTitle")}</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="equb-name">{t("nameLabel")}</Label>
          <Input
            id="equb-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="equb-frequency">{t("frequencyLabel")}</Label>
          <Select
            id="equb-frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as EqubFrequency)}
          >
            <option value="daily">{t("frequencyDaily")}</option>
            <option value="weekly">{t("frequencyWeekly")}</option>
            <option value="monthly">{t("frequencyMonthly")}</option>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="equb-amount">{t(`amountLabel.${frequency}`)}</Label>
          <Input
            id="equb-amount"
            required
            type="number"
            min="1"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(e.target.value)}
            placeholder="e.g. 1000"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="equb-duration">
            {t("durationLabel", { period: periodLabel(frequency).toLowerCase() })}
          </Label>
          <Input
            id="equb-duration"
            required
            type="number"
            min="1"
            value={durationMonths}
            onChange={(e) => setDurationMonths(e.target.value)}
            placeholder={t("durationPlaceholder")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="equb-total">{t("totalAmountLabel")}</Label>
          <Input
            id="equb-total"
            required
            type="number"
            min="1"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="e.g. 12000"
          />
        </div>

        <ReminderScheduleFields
          frequency={frequency}
          collector={collector}
          onCollectorChange={setCollector}
          maxMembers={maxMembers}
          onMaxMembersChange={setMaxMembers}
          reminderTime={reminderTime}
          onReminderTimeChange={setReminderTime}
          reminderDayOfWeek={reminderDayOfWeek}
          onReminderDayOfWeekChange={setReminderDayOfWeek}
          reminderDayOfMonth={reminderDayOfMonth}
          onReminderDayOfMonthChange={setReminderDayOfMonth}
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="equb-description">{t("descriptionLabel")}</Label>
          <Input
            id="equb-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("descriptionPlaceholder")}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <div>
            <p className="text-sm font-medium">{isPublic ? t("publicTitle") : t("privateTitle")}</p>
            <p className={cn("text-xs text-muted-foreground")}>
              {isPublic ? t("publicHint") : t("privateHint")}
            </p>
          </div>
          <Switch checked={isPublic} onCheckedChange={setIsPublic} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin" /> {t("creating")}
            </>
          ) : (
            t("createButton")
          )}
        </Button>
      </form>
    </div>
  );
}
