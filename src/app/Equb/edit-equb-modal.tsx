"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import type { EqubFrequency } from "@/lib/api";
import { periodLabel, amountFieldLabel } from "@/lib/period-label";
import { ReminderScheduleFields } from "./reminder-schedule-fields";

interface EditEqubModalProps {
  open: boolean;
  initial: {
    name: string;
    monthlyAmount: number;
    durationMonths: number;
    totalAmount: number;
    frequency: EqubFrequency;
    maxMembers: number | null;
    reminderTime: string | null;
    reminderDayOfWeek: number | null;
    reminderDayOfMonth: number | null;
    isPublic: boolean;
  };
  onClose: () => void;
  onSave: (data: {
    name: string;
    monthlyAmount: number;
    durationMonths: number;
    totalAmount: number;
    frequency: EqubFrequency;
    maxMembers?: number;
    reminderTime?: string;
    reminderDayOfWeek?: number;
    reminderDayOfMonth?: number;
    isPublic: boolean;
  }) => void;
}

export function EditEqubModal({ open, initial, onClose, onSave }: EditEqubModalProps) {
  const [name, setName] = useState(initial.name);
  const [monthlyAmount, setMonthlyAmount] = useState(String(initial.monthlyAmount));
  const [durationMonths, setDurationMonths] = useState(String(initial.durationMonths));
  const [totalAmount, setTotalAmount] = useState(String(initial.totalAmount));
  const [frequency, setFrequency] = useState<EqubFrequency>(initial.frequency);
  const [maxMembers, setMaxMembers] = useState(
    initial.maxMembers != null ? String(initial.maxMembers) : "",
  );
  const [reminderTime, setReminderTime] = useState(initial.reminderTime ?? "");
  const [reminderDayOfWeek, setReminderDayOfWeek] = useState(
    initial.reminderDayOfWeek != null ? String(initial.reminderDayOfWeek) : "",
  );
  const [reminderDayOfMonth, setReminderDayOfMonth] = useState(
    initial.reminderDayOfMonth != null ? String(initial.reminderDayOfMonth) : "",
  );
  const [isPublic, setIsPublic] = useState(initial.isPublic);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setName(initial.name);
        setMonthlyAmount(String(initial.monthlyAmount));
        setDurationMonths(String(initial.durationMonths));
        setTotalAmount(String(initial.totalAmount));
        setFrequency(initial.frequency);
        setMaxMembers(initial.maxMembers != null ? String(initial.maxMembers) : "");
        setReminderTime(initial.reminderTime ?? "");
        setReminderDayOfWeek(
          initial.reminderDayOfWeek != null ? String(initial.reminderDayOfWeek) : "",
        );
        setReminderDayOfMonth(
          initial.reminderDayOfMonth != null ? String(initial.reminderDayOfMonth) : "",
        );
        setIsPublic(initial.isPublic);
      });
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      monthlyAmount: Number(monthlyAmount),
      durationMonths: Number(durationMonths),
      totalAmount: Number(totalAmount),
      frequency,
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
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Pencil className="size-5 text-primary" /> Edit Equb
          </h2>
          <Button type="submit" size="sm">
            Save
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-name">Equb Name</Label>
          <Input
            id="edit-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-frequency">Frequency</Label>
          <Select
            id="edit-frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as EqubFrequency)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-amount">{amountFieldLabel(frequency)}</Label>
          <Input
            id="edit-amount"
            required
            type="number"
            min="1"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-duration">Duration ({periodLabel(frequency).toLowerCase()}s)</Label>
          <Input
            id="edit-duration"
            required
            type="number"
            min="1"
            value={durationMonths}
            onChange={(e) => setDurationMonths(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-total">Total Amount (ETB)</Label>
          <Input
            id="edit-total"
            required
            type="number"
            min="1"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
          />
        </div>

        <ReminderScheduleFields
          frequency={frequency}
          maxMembers={maxMembers}
          onMaxMembersChange={setMaxMembers}
          reminderTime={reminderTime}
          onReminderTimeChange={setReminderTime}
          reminderDayOfWeek={reminderDayOfWeek}
          onReminderDayOfWeekChange={setReminderDayOfWeek}
          reminderDayOfMonth={reminderDayOfMonth}
          onReminderDayOfMonthChange={setReminderDayOfMonth}
        />

        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <div>
            <p className="text-sm font-medium">{isPublic ? "Public" : "Private"}</p>
            <p className="text-xs text-muted-foreground">
              {isPublic ? "Anyone with the link can join" : "Only invited members can join"}
            </p>
          </div>
          <Switch checked={isPublic} onCheckedChange={setIsPublic} />
        </div>
      </form>
    </div>
  );
}
