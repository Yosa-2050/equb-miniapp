"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  CheckCircle2,
  UserPlus,
  ArrowRight,
  CalendarRange,
  Wallet,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EqubDetail, getEqubByInvite, getEqubDetail, joinEqubByInvite } from "@/lib/api";
import { periodLabel } from "@/lib/period-label";
import { cn } from "@/lib/utils";

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <JoinContent />
    </Suspense>
  );
}

function JoinContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = (searchParams.get("code") ?? "").trim();

  const [equb, setEqub] = useState<EqubDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!code) {
      queueMicrotask(() => {
        setError("No invite code provided.");
        setLoading(false);
      });
      return;
    }
    getEqubByInvite(code)
      .then((found) => getEqubDetail(found.id))
      .then(setEqub)
      .catch((err) => {
        console.error("Failed to look up invite", err);
        setError(err instanceof Error ? err.message : "Invite code not found.");
      })
      .finally(() => setLoading(false));
  }, [code]);

  const handleJoin = () => {
    if (!equb) return;
    setJoining(true);
    joinEqubByInvite(equb.id)
      .then(() => setJoined(true))
      .catch((err) => {
        console.error("Failed to join", err);
        setError(err instanceof Error ? err.message : "Could not join this equb.");
        setJoining(false);
      });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Looking up invite…
      </div>
    );
  }

  if (!equb) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-xs">
          <p className="text-sm text-muted-foreground">{error ?? "Invite not found."}</p>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => router.push("/home")}
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="size-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Join Equb</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite code:{" "}
            <span className="font-mono font-semibold text-foreground">{equb.inviteCode}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-lg font-bold">{equb.name}</h2>
              <p className="text-sm text-muted-foreground">by @{equb.admin.telegramUsername}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant={equb.isPublic ? "default" : "secondary"}>
                {equb.isPublic ? "Public" : "Private"}
              </Badge>
              {equb.isFull && <Badge variant="destructive">Full</Badge>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 p-3">
              <Wallet className="size-4 text-primary" />
              <p className="text-sm font-bold">{equb.monthlyAmount.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">ETB / {periodLabel(equb.frequency).toLowerCase()}</p>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 p-3">
              <Users className="size-4 text-primary" />
              <p className="text-sm font-bold">
                {equb.membersCount}
                {equb.maxMembers != null && `/${equb.maxMembers}`}
              </p>
              <p className="text-[10px] text-muted-foreground">Members</p>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 p-3">
              <CalendarRange className="size-4 text-primary" />
              <p className="text-sm font-bold">{equb.durationMonths}</p>
              <p className="text-[10px] text-muted-foreground">{periodLabel(equb.frequency)}s</p>
            </div>
          </div>

          <div className={cn("mt-4 rounded-xl px-3 py-2.5 text-sm", "bg-muted/50 text-muted-foreground")}>
            {equb.isPublic
              ? "Anyone with this link can join this public equb."
              : "This is a private equb. The invite link grants access."}
          </div>

          {joined ? (
            <div className="mt-4 rounded-xl bg-emerald-50 px-3 py-3 text-center dark:bg-emerald-500/10">
              <CheckCircle2 className="mx-auto mb-1 size-6 text-emerald-600 dark:text-emerald-400" />
              <p className="font-medium text-emerald-700 dark:text-emerald-400">
                You joined {equb.name}!
              </p>
              <Link href={`/Equb/${equb.id}`}>
                <Button size="sm" className="mt-3 w-full">
                  Go to Equb <ArrowRight />
                </Button>
              </Link>
            </div>
          ) : equb.isFull ? (
            <div className="mt-4 rounded-xl bg-muted/50 px-3 py-3 text-center text-sm text-muted-foreground">
              This equb is full.
            </div>
          ) : (
            <Button size="lg" className="mt-4 w-full" onClick={handleJoin} disabled={joining}>
              {joining ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Joining…
                </>
              ) : (
                <>
                  <UserPlus /> Join {equb.name}
                </>
              )}
            </Button>
          )}
        </div>

        {!joined && !equb.isFull && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Joining means you agree to send {equb.monthlyAmount.toLocaleString()} ETB each{" "}
            {periodLabel(equb.frequency).toLowerCase()} to that {periodLabel(equb.frequency).toLowerCase()}
            &apos;s winner&apos;s account.
          </p>
        )}
      </div>
    </div>
  );
}