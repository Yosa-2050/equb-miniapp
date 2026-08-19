"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
  submitPaymentWithReceipt,
  approvePaymentFor,
  rejectPaymentFor,
  remindUnpaidMembers,
} from "@/lib/api";
import { periodLabel } from "@/lib/period-label";

const statusMeta: Record<PaymentStatus, { icon: typeof Clock; className: string }> = {
  paid: { icon: CheckCircle2, className: "text-emerald-600" },
  pending: { icon: Clock, className: "text-amber-600" },
  rejected: { icon: XCircle, className: "text-destructive" },
  late: { icon: AlertTriangle, className: "text-destructive" },
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
  const t = useTranslations("thisMonth");
  const tp = useTranslations("paymentStatus");
  const tc = useTranslations("common");
  const [viewingMonth, setViewingMonth] = useState(month);
  const [data, setData] = useState<MonthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reminding, setReminding] = useState(false);
  const [reminded, setReminded] = useState<number | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isCurrentRound = viewingMonth === month;

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    getMonth(equbId, viewingMonth)
      .then(setData)
      .catch((err) => {
        console.error("Failed to load month", err);
        setError(err instanceof Error ? err.message : "Failed to load month");
      })
      .finally(() => setLoading(false));
  }, [equbId, viewingMonth]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    setViewingMonth(month);
  }, [month]);

  useEffect(() => {
    if (!receiptFile) {
      setReceiptPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(receiptFile);
    setReceiptPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [receiptFile]);

  const monthChips = Array.from({ length: month }, (_, i) => i + 1);
  const chipNav = monthChips.length > 1 && (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {monthChips.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setViewingMonth(m)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            m === viewingMonth
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-muted/60",
          )}
        >
          {label} {m}
          {m === month && ` ${t("current")}`}
        </button>
      ))}
    </div>
  );

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-4">
        {chipNav}
        <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" /> {tc("loading")}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-4">
        {chipNav}
        <p className="py-10 text-center text-sm text-muted-foreground">
          {error ?? t("loadFailed")}
        </p>
      </div>
    );
  }

  const { recipient, payments } = data;
  const isRecipient = data.isRecipient;
  const canDecide = data.canDecide;

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
    setSubmitError(null);
    const action = receiptFile
      ? submitPaymentWithReceipt(equbId, receiptFile)
      : submitPayment(equbId);
    action
      .then(() => {
        setReceiptFile(null);
        reload();
      })
      .catch((err) => {
        console.error("Failed to submit payment", err);
        setSubmitError(err instanceof Error ? err.message : t("submitFailed"));
      })
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
      {chipNav}

      {!isCurrentRound && (
        <p className="rounded-xl bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
          {t("historyBanner", { period: label.toLowerCase() })}
        </p>
      )}

      {/* Recipient header */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Crown className="size-4 text-primary" />
          {t("potGoesTo", { period: label.toLowerCase() })}
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
            t("noRecipientYet")
          )}
        </h3>

        {recipient ? (
          <div className="mt-4 rounded-xl bg-muted/60 p-4">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Banknote className="size-4" /> {t("sendTo", { amount: data.amount.toLocaleString() })}
            </p>
            <p className="mt-1.5 text-lg font-bold tracking-wide">
              {recipient.account.provider ?? t("account")}
            </p>
            <p className="font-mono text-base text-primary">
              {recipient.account.number ?? "—"}
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={handleCopy}>
              {copied ? <Check /> : <Copy />}
              {copied ? t("copied") : t("copyAccount")}
            </Button>
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
            {t("runLotteryFirst", { period: label.toLowerCase() })}
          </p>
        )}

        {/* Progress */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("collected", { paid: data.paidCount, total: data.totalMembers })}
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
              <CheckCircle2 className="size-4" />{" "}
              {t("allCollected", { total: data.totalMembers, period: label.toLowerCase() })}
            </p>
          ) : (
            <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <Clock className="size-4" />{" "}
              {t("stillNeedToPay", { count: data.totalMembers - data.paidCount })}
            </p>
          )}

          {isAdmin && isCurrentRound && !data.allCollected && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={handleRemind}
              disabled={reminding}
            >
              <Bell /> {reminding ? t("sending") : t("remindUnpaid")}
            </Button>
          )}
          {reminded !== null && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {t("reminded", { count: reminded })}
            </p>
          )}
        </div>

        {isCurrentRound && !isRecipient && recipient && (
          <div className="mt-4 flex flex-col gap-2">
            {receiptPreviewUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={receiptPreviewUrl}
                  alt={t("receiptPreviewAlt")}
                  className="max-h-48 w-full object-contain bg-muted/40"
                />
                <button
                  type="button"
                  onClick={() => setReceiptFile(null)}
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white"
                  aria-label={t("removePhoto")}
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground hover:bg-muted/40">
                <Receipt className="size-4" /> {t("attachReceipt")}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                />
              </label>
            )}

            {submitError && <p className="text-sm text-destructive">{submitError}</p>}

            <Button size="lg" className="w-full" onClick={handleMySubmit} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <Check />} {t("submitContribution")}
            </Button>
          </div>
        )}
      </section>

      {/* Payout split (collab groups only, server-gated to group members) */}
      {data.payoutSplit && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="mb-3 flex items-center gap-1.5">
            <Users2 className="size-4 text-primary" />
            <h4 className="font-semibold">{t("payoutSplitTitle")}</h4>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            {t("payoutSplitDesc", {
              period: label.toLowerCase(),
              amount: data.payoutSplit.totalPot.toLocaleString(),
            })}
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
                    {t("contributed", { amount: s.contributionAmount.toLocaleString() })}
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
          <h4 className="font-semibold">{t("memberPayments")}</h4>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="size-4" /> {payments.length}
          </span>
        </div>

        <ul className="flex flex-col gap-2">
          {payments.map((payment) => {
            const meta = statusMeta[payment.status];
            const Icon = meta.icon;
            const showPreviewButton =
              payment.receiptImageUrl ||
              (canDecide &&
                (isCurrentRound
                  ? payment.status !== "paid"
                  : payment.status === "late"));
            return (
              <li
                key={payment.id}
                className="flex items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{payment.fullName}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Icon className={cn("size-3", meta.className)} /> {tp(payment.status)}
                      {payment.receiptDate && ` · ${payment.receiptDate}`}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {showPreviewButton && (
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={t("previewAria", { name: payment.fullName })}
                      onClick={() => setPreview(payment.memberId)}
                    >
                      <Eye />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {!canDecide && recipient && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="size-3.5" />
            {isCurrentRound
              ? data.collector === "admin"
                ? t("onlyAdminCanDecide", { period: label.toLowerCase() })
                : t("onlyRecipientCanDecide", { name: recipient.fullName, period: label.toLowerCase() })
              : t("onlyLateOverride")}
          </p>
        )}
      </section>

      {/* Receipt preview modal */}
      {preview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-semibold">
                <Receipt className="size-4 text-primary" /> {t("receiptTitle")}
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
                  {payment.receiptImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={payment.receiptImageUrl}
                      alt={`${payment.fullName}'s receipt`}
                      className="max-h-[60vh] w-full rounded-xl border border-border object-contain bg-muted/60"
                    />
                  ) : (
                    <div className="flex aspect-[3/4] items-center justify-center rounded-xl bg-muted/60">
                      <Receipt className="size-16 text-muted-foreground/60" />
                    </div>
                  )}
                  <div className="mt-4 flex flex-col gap-1.5 text-sm">
                    <p>
                      <span className="text-muted-foreground">{t("member")} </span>
                      <span className="font-medium">{payment.fullName}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">{t("amount")} </span>
                      <span className="font-medium">{payment.amount.toLocaleString()} ETB</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">{t("to")} </span>
                      <span className="font-medium">
                        {recipient?.account.provider ?? "—"}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">{t("date")} </span>
                      <span className="font-medium">{payment.receiptDate ?? "—"}</span>
                    </p>
                  </div>
                  {canDecide && isCurrentRound && payment.status !== "paid" && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => {
                          decide(payment.id, true);
                          setPreview(null);
                        }}
                        disabled={busy}
                      >
                        <Check /> {t("received")}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          decide(payment.id, false);
                          setPreview(null);
                        }}
                        disabled={busy}
                      >
                        <X /> {t("reject")}
                      </Button>
                    </div>
                  )}
                  {canDecide && !isCurrentRound && payment.status === "late" && (
                    <Button
                      className="mt-4 w-full"
                      onClick={() => {
                        decide(payment.id, true);
                        setPreview(null);
                      }}
                      disabled={busy}
                    >
                      <Check /> {t("markAsPaid")}
                    </Button>
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