"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface CreateEqubModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    monthlyAmount: number;
    durationMonths: number;
    totalAmount: number;
    isPublic: boolean;
  }) => void;
}

export function CreateEqubModal({ open, onClose, onCreate }: CreateEqubModalProps) {
  const [name, setName] = useState("");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name,
      monthlyAmount: Number(monthlyAmount),
      durationMonths: Number(durationMonths),
      totalAmount: Number(totalAmount),
      isPublic,
    });
    setName("");
    setMonthlyAmount("");
    setDurationMonths("");
    setTotalAmount("");
    setIsPublic(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex w-full max-w-md flex-col gap-5 rounded-t-2xl border border-border bg-card p-5 shadow-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Create Equb</h2>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose}>
            <X />
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="equb-name">Equb Name</Label>
          <Input
            id="equb-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Family Equb"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="equb-amount">Monthly Amount (ETB)</Label>
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
          <Label htmlFor="equb-duration">Duration (months)</Label>
          <Input
            id="equb-duration"
            required
            type="number"
            min="1"
            value={durationMonths}
            onChange={(e) => setDurationMonths(e.target.value)}
            placeholder="e.g. 12"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="equb-total">Total Amount (ETB)</Label>
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

        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <div>
            <p className="text-sm font-medium">{isPublic ? "Public" : "Private"}</p>
            <p className={cn("text-xs text-muted-foreground")}>
              {isPublic ? "Anyone with the link can join" : "Only invited members can join"}
            </p>
          </div>
          <Switch checked={isPublic} onCheckedChange={setIsPublic} />
        </div>

        <Button type="submit" size="lg" className="w-full">
          Create
        </Button>
      </form>
    </div>
  );
}