"use client";

import { useEffect, useState } from "react";
import { Users2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MemberRow } from "@/lib/api";

interface CollabGroupModalProps {
  open: boolean;
  eligibleMembers: MemberRow[];
  monthlyAmount: number;
  onClose: () => void;
  onCreate: (data: {
    members: { memberId: string; contributionAmount: number }[];
    leaderMemberId: string;
  }) => void;
  saving: boolean;
  error: string | null;
}

export function CollabGroupModal({
  open,
  eligibleMembers,
  monthlyAmount,
  onClose,
  onCreate,
  saving,
  error,
}: CollabGroupModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [leaderId, setLeaderId] = useState<string>("");
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setLeaderId("");
      setAmounts({});
    }
  }, [open]);

  if (!open) return null;

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (!next.includes(leaderId)) setLeaderId(next[0] ?? "");
      return next;
    });
  };

  const sum = selectedIds.reduce((s, id) => s + (Number(amounts[id]) || 0), 0);
  const isValidSum = Math.abs(sum - monthlyAmount) < 0.01;
  const canSubmit = selectedIds.length >= 2 && leaderId && isValidSum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onCreate({
      members: selectedIds.map((id) => ({
        memberId: id,
        contributionAmount: Number(amounts[id]) || 0,
      })),
      leaderMemberId: leaderId,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Users2 className="size-5 text-primary" /> Create Collab Group
          </h2>
          <Button type="submit" size="sm" disabled={!canSubmit || saving}>
            {saving ? <Loader2 className="animate-spin" /> : "Save"}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Select 2+ members to share one lottery slot. Their contributions must
          sum to exactly {monthlyAmount.toLocaleString()} ETB.
        </p>

        {eligibleMembers.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No eligible members (everyone is already drawn or grouped).
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {eligibleMembers.map((m) => {
              const selected = selectedIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  className={
                    "flex items-center gap-3 rounded-xl border px-3 py-2.5 " +
                    (selected ? "border-primary bg-primary/5" : "border-border")
                  }
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleMember(m.id)}
                    className="size-4 accent-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.fullName}</p>
                  </div>
                  {selected && (
                    <>
                      <Input
                        type="number"
                        min="1"
                        placeholder="ETB"
                        value={amounts[m.id] ?? ""}
                        onChange={(e) =>
                          setAmounts((prev) => ({ ...prev, [m.id]: e.target.value }))
                        }
                        className="w-24"
                      />
                      <label className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                        <input
                          type="radio"
                          name="leader"
                          checked={leaderId === m.id}
                          onChange={() => setLeaderId(m.id)}
                          className="accent-primary"
                        />
                        Leader
                      </label>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedIds.length >= 2 && (
          <div
            className={
              "rounded-lg px-3 py-2 text-sm " +
              (isValidSum
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive")
            }
          >
            Sum: {sum.toLocaleString()} / {monthlyAmount.toLocaleString()} ETB
            {!isValidSum && " — must match exactly"}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </div>
  );
}
