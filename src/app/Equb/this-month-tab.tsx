"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  XCircle,
  AlertTriangle,
  Check,
  X,
  Banknote,
  Bell,
  Crown,
  Receipt,
  Users,
  Loader2,
  Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  EqubFrequency,
  MonthData,
  PaymentStatus,
  getMonth,
  submitPayment,
  approvePaymentFor,
  rejectPaymentFor,
  remindUnpaidMembers,
} from "@/lib/api";
import { periodLabel } from "@/lib/period-label";

const paidLabel: Record<
  PaymentStatus,
  { text: string; icon: typeof Clock; className: string }
> = {
  paid: { text: "Paid", icon: CheckCircle2, className: "text-emerald-600" },
  pending: { text: "Pending", icon: Clock, className: "text-amber-600" },
  rejected: { text: "Rejected", icon: XCircle, className: "text-destructive" },
  late: { text: "Late", icon: AlertTriangle, className: "text-destructive" },
};

export function ThisMonthTab({
  equbId,
  month,
  isAdmin,
  frequency = "monthly",
}: {
  equbId: string;
  month: number;
  isAdmin: boolean;
  frequency?: EqubFrequency;
}) {
  const label = periodLabel(frequency);
  const [data, setData] = useState<MonthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reminding, setReminding] = useState(false);
  const [reminded, setReminded] = useState<number | null>(null);

  const reload = useCallback(() => {
    getMonth(equbId, month)
      .then(setData)
      .catch((err) => {
        console.error("Failed to load month", err);
        setError(err instanceof Error ? err.message : "Failed to load month");
      })
      .finally(() => setLoading(false));
  }, [equbId, month]);

  useEffect(() => {
    reload();
  }, [reload]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Loading…
      </div>
    );
  }

  if (!data) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {error ?? "Could not load this month."}
      </p>
    );
  }

  const { recipient, payments } = data;
  const isRecipient = data.isRecipient;

  const decide = (paymentId: string, approve: boolean) => {
    setBusy(true);
    const action = approve
      ? approvePaymentFor(equbId, paymentId)
      : rejectPaymentFor(equbId, paymentId);
    action
      .then(reload)
      .catch((err) => console.error("Failed to decide payment", err))
      .finally(() => setBusy(false));
  };

  const handleMySubmit = () => {
    setBusy(true);
    submitPayment(equbId)
      .then(reload)
      .catch((err) => console.error("Failed to submit payment", err))
      .finally(() => setBusy(false));
  };

  const handleRemind = () => {
    setReminding(true);
    setReminded(null);
    remindUnpaidMembers(equbId)
      .then((res) => setReminded(res.remindedCount))
      .catch((err) => console.error("Failed to send reminders", err))
      .finally(() => setReminding(false));
  };

  const handleCopy = () => {
    if (!recipient?.account.number) return;
    navigator.clipboard?.writeText(recipient.account.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const listPayment = (memberId: string) =>
    payments.find((p) => p.memberId === memberId);

  return (
    <div className="flex flex-col gap-4">
      {/* Recipient header */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Crown className="size-4 text-primary" />
          This {label.toLowerCase()}&apos;s pot goes to
        </div>
        <h3 className="text-lg font-bold">
          {recipient ? (
            <>
              {recipient.fullName}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({label} {month})
              </span>
            </>
          ) : (
            "— no recipient yet —"
          )}
        </h3>

        {recipient ? (
          <div className="mt-4 rounded-xl bg-muted/60 p-4">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Banknote className="size-4" /> Send {data.amount.toLocaleString()} ETB to
            </p>
            <p className="mt-1.5 text-lg font-bold tracking-wide">
              {recipient.account.provider ?? "Account"}
            </p>
            <p className="font-mono text-base text-primary">
              {recipient.account.number ?? "—"}
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={handleCopy}>
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy account"}
            </Button>
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
            Run the lottery first so this {label.toLowerCase()}&apos;s winner is assigned.
          </p>
        )}

        {/* Progress */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Collected {data.paidCount}/{data.totalMembers}
            </span>
            <span className="font-medium">{data.collected.toLocaleString()} ETB</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${data.totalMembers ? (data.paidCount / data.totalMembers) * 100 : 0}%`,
              }}
            />
          </div>
          {data.allCollected ? (
            <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 className="size-4" /> All {data.totalMembers} contributions
              collected for this {label.toLowerCase()}!
            </p>
          ) : (
            <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <Clock className="size-4" />{" "}
              {data.totalMembers - data.paidCount} member(s) still need to pay
            </p>
          )}

          {isAdmin && !data.allCollected && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={handleRemind}
              disabled={reminding}
            >
              <Bell /> {reminding ? "Sending…" : "Remind unpaid members"}
            </Button>
          )}
          {reminded !== null && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Reminded {reminded} member{reminded === 1 ? "" : "s"}.
            </p>
          )}
        </div>

        {!isRecipient && recipient && (
          <Button size="lg" className="mt-4 w-full" onClick={handleMySubmit} disabled={busy}>
            <Check /> I&apos;ve sent my contribution
          </Button>
        )}
      </section>

      {/* Payout split (collab groups only, server-gated to group members) */}
      {data.payoutSplit && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="mb-3 flex items-center gap-1.5">
            <Users2 className="size-4 text-primary" />
            <h4 className="font-semibold">Payout Split</h4>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            This {label.toLowerCase()}&apos;s pot of{" "}
            {data.payoutSplit.totalPot.toLocaleString()} ETB is split by
            contribution.
          </p>
          <ul className="flex flex-col gap-2">
            {data.payoutSplit.splits.map((s) => (
              <li
                key={s.memberId}
                className="flex items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-1 truncate text-sm font-medium">
                    {s.fullName}
                    {s.memberId === data.payoutSplit!.leaderMemberId && (
                      <Crown className="size-3.5 shrink-0 text-primary" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Contributed {s.contributionAmount.toLocaleString()} ETB
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-primary">
                  {s.share.toLocaleString(undefined, { maximumFractionDigits: 2 })} ETB
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Member payment checklist */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold">Member payments</h4>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="size-4" /> {payments.length}
          </span>
        </div>

        <ul className="flex flex-col gap-2">
          {payments.map((payment) => {
            const meta = paidLabel[payment.status];
            const Icon = meta.icon;
            return (
              <li
                key={payment.id}
                className="flex items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{payment.fullName}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Icon className={cn("size-3", meta.className)} /> {meta.text}
                      {payment.receiptDate && ` · ${payment.receiptDate}`}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {payment.status === "paid" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreview(payment.memberId)}
                    >
                      <Eye /> Receipt
                    </Button>
                  )}
                  {isRecipient && payment.status !== "paid" && (
                    <>
                      <Button size="sm" onClick={() => decide(payment.id, true)} disabled={busy}>
                        <Check /> Received
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => decide(payment.id, false)}
                        disabled={busy}
                      >
                        <X /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {!isRecipient && recipient && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="size-3.5" /> Only {recipient.fullName} can approve or reject
            receipts this {label.toLowerCase()}.
          </p>
        )}
      </section>

      {/* Receipt preview modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-semibold">
                <Receipt className="size-4 text-primary" /> Payment receipt
              </h4>
              <Button variant="ghost" size="icon-sm" onClick={() => setPreview(null)}>
                <X />
              </Button>
            </div>
            {(() => {
              const payment = listPayment(preview);
              if (!payment) return null;
              return (
                <>
                  <div className="flex aspect-[3/4] items-center justify-center rounded-xl bg-muted/60">
                    <Receipt className="size-16 text-muted-foreground/60" />
                  </div>
                  <div className="mt-4 flex flex-col gap-1.5 text-sm">
                    <p>
                      <span className="text-muted-foreground">Member: </span>
                      <span className="font-medium">{payment.fullName}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Amount: </span>
                      <span className="font-medium">{payment.amount.toLocaleString()} ETB</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">To: </span>
                      <span className="font-medium">
                        {recipient?.account.provider ?? "—"}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Date: </span>
                      <span className="font-medium">{payment.receiptDate ?? "—"}</span>
                    </p>
                  </div>
                  {isRecipient && payment.status !== "paid" && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => {
                          decide(payment.id, true);
                          setPreview(null);
                        }}
                        disabled={busy}
                      >
                        <Check /> Received
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          decide(payment.id, false);
                          setPreview(null);
                        }}
                        disabled={busy}
                      >
                        <X /> Reject
                      </Button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}