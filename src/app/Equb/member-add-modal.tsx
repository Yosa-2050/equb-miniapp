"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MemberAddModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: {
    fullName: string;
    telegramUsername?: string;
    phone?: string;
    accountProvider?: string;
    accountNumber?: string;
    accountHolderName?: string;
    contributionAmount?: number;
  }) => void;
  saving: boolean;
  error?: string | null;
}

export function MemberAddModal({
  open,
  onClose,
  onAdd,
  saving,
  error,
}: MemberAddModalProps) {
  const t = useTranslations("memberAdd");
  const memberT = useTranslations("memberEdit");
  const [fullName, setFullName] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [accountProvider, setAccountProvider] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [contributionAmount, setContributionAmount] = useState("");

  if (!open) return null;

  const resetAndClose = () => {
    if (saving) return;
    setFullName("");
    setTelegramUsername("");
    setPhone("");
    setAccountProvider("");
    setAccountNumber("");
    setAccountHolderName("");
    setContributionAmount("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = fullName.trim();
    if (!name) return;
    onAdd({
      fullName: name,
      telegramUsername: telegramUsername.trim() || undefined,
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
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/50"
        onClick={resetAndClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <UserPlus className="size-5 text-primary" /> {t("title")}
          </h2>
          <Button type="submit" size="sm" disabled={saving || !fullName.trim()}>
            {saving ? <Loader2 className="animate-spin" /> : t("add")}
          </Button>
        </div>

        {error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-member-fullname">{memberT("fullNameLabel")}</Label>
          <Input
            id="new-member-fullname"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-member-telegram">{t("telegramLabel")}</Label>
          <Input
            id="new-member-telegram"
            value={telegramUsername}
            onChange={(e) => setTelegramUsername(e.target.value)}
            placeholder="@username"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-member-phone">{memberT("phoneLabel")}</Label>
          <Input
            id="new-member-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+251 9xx xxx xxx"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-member-provider">{memberT("providerLabel")}</Label>
          <Input
            id="new-member-provider"
            value={accountProvider}
            onChange={(e) => setAccountProvider(e.target.value)}
            placeholder={memberT("providerPlaceholder")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-member-account">
            {memberT("accountNumberLabel")}
          </Label>
          <Input
            id="new-member-account"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-member-holder">{memberT("holderNameLabel")}</Label>
          <Input
            id="new-member-holder"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
            placeholder={memberT("holderNamePlaceholder")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-member-contribution">
            {memberT("contributionLabel")}
          </Label>
          <Input
            id="new-member-contribution"
            type="number"
            min="1"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            placeholder={memberT("contributionPlaceholder")}
          />
        </div>
      </form>
    </div>
  );
}
