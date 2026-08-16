"use client";

import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EqubMemberRow } from "@/lib/mock-data";

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (member: EqubMemberRow) => void;
}

export function AddMemberModal({ open, onClose, onAdd }: AddMemberModalProps) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [provider, setProvider] = useState("Telebirr");
  const [number, setNumber] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: `m${Date.now()}`,
      number: 0, 
      fullName,
      username: username.replace("@", "") || fullName.toLowerCase().split(" ")[0],
      account: { provider, number },
    });
    setFullName("");
    setUsername("");
    setProvider("Telebirr");
    setNumber("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex w-full max-w-md flex-col gap-5 rounded-t-2xl border border-border bg-card p-5 shadow-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <UserPlus className="size-5 text-primary" /> Add Member
          </h2>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose}>
            <X />
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="member-name">Full Name</Label>
          <Input
            id="member-name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Abebe Kebede"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="member-username">Telegram Username (optional)</Label>
          <Input
            id="member-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. @abebe"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="member-provider">Account Provider</Label>
          <Input
            id="member-provider"
            required
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="Telebirr, CBE, Awash Bank…"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="member-account">Account Number</Label>
          <Input
            id="member-account"
            required
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="+251 9… or bank account number"
          />
        </div>

        <Button type="submit" size="lg" className="w-full">
          Add Member
        </Button>
      </form>
    </div>
  );
}