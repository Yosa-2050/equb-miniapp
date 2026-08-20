"use client";

import { useEffect, useState } from "react";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export interface SwapMonthOption {
  memberId: string;
  label: string;
  month: number;
}

interface SwapMonthsModalProps {
  open: boolean;
  options: SwapMonthOption[];
  periodLabel: string;
  onClose: () => void;
  onSwap: (data: { memberAId: string; memberBId: string }) => void;
  saving: boolean;
  error?: string | null;
}

export function SwapMonthsModal({
  open,
  options,
  periodLabel,
  onClose,
  onSwap,
  saving,
  error,
}: SwapMonthsModalProps) {
  const [memberAId, setMemberAId] = useState("");
  const [memberBId, setMemberBId] = useState("");

  useEffect(() => {
    if (open) {
      setMemberAId("");
      setMemberBId("");
    }
  }, [open]);

  if (!open) return null;

  const canSwap = memberAId && memberBId && memberAId !== memberBId;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/50"
        onClick={saving ? undefined : onClose}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSwap) onSwap({ memberAId, memberBId });
        }}
        className="relative z-10 flex w-full max-w-md flex-col gap-5 rounded-t-2xl border border-border bg-card p-5 shadow-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ArrowRightLeft className="size-5 text-primary" /> Swap Months
          </h2>
          <Button type="submit" size="sm" disabled={!canSwap || saving}>
            {saving ? <Loader2 className="animate-spin" /> : "Swap"}
          </Button>
        </div>

        {error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="swap-member-a">First member or group</Label>
          <Select
            id="swap-member-a"
            value={memberAId}
            onChange={(e) => setMemberAId(e.target.value)}
            disabled={saving}
          >
            <option value="">Select member</option>
            {options.map((option) => (
              <option key={option.memberId} value={option.memberId}>
                {option.label} - {periodLabel} {option.month}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="swap-member-b">Second member or group</Label>
          <Select
            id="swap-member-b"
            value={memberBId}
            onChange={(e) => setMemberBId(e.target.value)}
            disabled={saving}
          >
            <option value="">Select member</option>
            {options.map((option) => (
              <option key={option.memberId} value={option.memberId}>
                {option.label} - {periodLabel} {option.month}
              </option>
            ))}
          </Select>
        </div>
      </form>
    </div>
  );
}
