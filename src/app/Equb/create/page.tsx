"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { createEqub } from "@/lib/api";

export default function CreateEqubPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    createEqub({
      name,
      monthlyAmount: Number(monthlyAmount),
      durationMonths: Number(durationMonths),
      totalAmount: Number(totalAmount),
      isPublic,
      description: description.trim() ? description.trim() : undefined,
    })
      .then((equb) => {
        router.push(`/Equb/${equb.id}`);
      })
      .catch((err) => {
        console.error("Failed to create equb", err);
        setError(err instanceof Error ? err.message : "Failed to create equb");
        setSubmitting(false);
      });
  };

  return (
    <div className="pb-4">
      <header className="flex items-center gap-2 border-b border-border bg-background px-2 py-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="flex-1 truncate text-lg font-bold">Create Equb</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="equb-description">Description (optional)</Label>
          <Input
            id="equb-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Monthly rotating savings for the family"
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

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin" /> Creating…
            </>
          ) : (
            "Create Equb"
          )}
        </Button>
      </form>
    </div>
  );
}
