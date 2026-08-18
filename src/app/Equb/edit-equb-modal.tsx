"use client";

import { useEffect, useState } from "react";
import { X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface EditEqubModalProps {
  open: boolean;
  initial: {
    name: string;
    monthlyAmount: number;
    durationMonths: number;
    totalAmount: number;
    isPublic: boolean;
  };
  onClose: () => void;
  onSave: (data: {
    name: string;
    monthlyAmount: number;
    durationMonths: number;
    totalAmount: number;
    isPublic: boolean;
  }) => void;
}

export function EditEqubModal({ open, initial, onClose, onSave }: EditEqubModalProps) {
  const [name, setName] = useState(initial.name);
  const [monthlyAmount, setMonthlyAmount] = useState(String(initial.monthlyAmount));
  const [durationMonths, setDurationMonths] = useState(String(initial.durationMonths));
  const [totalAmount, setTotalAmount] = useState(String(initial.totalAmount));
  const [isPublic, setIsPublic] = useState(initial.isPublic);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setName(initial.name);
        setMonthlyAmount(String(initial.monthlyAmount));
        setDurationMonths(String(initial.durationMonths));
        setTotalAmount(String(initial.totalAmount));
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
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose}>
            <X />
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
          <Label htmlFor="edit-amount">Monthly Amount (ETB)</Label>
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
          <Label htmlFor="edit-duration">Duration (months)</Label>
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

        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <div>
            <p className="text-sm font-medium">{isPublic ? "Public" : "Private"}</p>
            <p className="text-xs text-muted-foreground">
              {isPublic ? "Anyone with the link can join" : "Only invited members can join"}
            </p>
          </div>
          <Switch checked={isPublic} onCheckedChange={setIsPublic} />
        </div>

        <Button type="submit" size="lg" className="w-full">
          Save Changes
        </Button>
      </form>
    </div>
  );
}