"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { UserCog, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MemberRow } from "@/lib/api";

interface MemberEditModalProps {
  open: boolean;
  member: MemberRow | null;
  onClose: () => void;
  onSave: (data: {
    fullName?: string;
    phone?: string;
    accountProvider?: string;
    accountNumber?: string;
    accountHolderName?: string;
    contributionAmount?: number;
  }) => void;
  saving: boolean;
}

export function MemberEditModal({ open, member, onClose, onSave, saving }: MemberEditModalProps) {
  const t = useTranslations("memberEdit");
  const tc = useTranslations("common");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [accountProvider, setAccountProvider] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");

  useEffect(() => {
    if (open && member) {
      setFullName(member.fullName ?? "");
      setPhone(member.phone ?? "");
      setAccountProvider(member.account.provider ?? "");
      setAccountNumber(member.account.number ?? "");
      setAccountHolderName(member.account.holderName ?? "");
      setContributionAmount(
        member.contributionAmount != null ? String(member.contributionAmount) : "",
      );
    }
  }, [open, member]);

  if (!open || !member) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      fullName: fullName.trim() || undefined,
      phone: phone.trim() || undefined,
      accountProvider: accountProvider.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      accountHolderName: accountHolderName.trim() || undefined,
      contributionAmount: contributionAmount.trim()
        ? Number(contributionAmount)
        : undefined,
    });
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
            <UserCog className="size-5 text-primary" /> {t("title")}
          </h2>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : tc("save")}
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="member-fullname">{t("fullNameLabel")}</Label>
          <Input
            id="member-fullname"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="member-phone">{t("phoneLabel")}</Label>
          <Input
            id="member-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+251 9xx xxx xxx"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="member-provider">{t("providerLabel")}</Label>
          <Input
            id="member-provider"
            value={accountProvider}
            onChange={(e) => setAccountProvider(e.target.value)}
            placeholder={t("providerPlaceholder")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="member-account">{t("accountNumberLabel")}</Label>
          <Input
            id="member-account"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="member-holder">{t("holderNameLabel")}</Label>
          <Input
            id="member-holder"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
            placeholder={t("holderNamePlaceholder")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="member-contribution">{t("contributionLabel")}</Label>
          <Input
            id="member-contribution"
            type="number"
            min="1"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            placeholder={t("contributionPlaceholder")}
          />
        </div>
      </form>
    </div>
  );
}
