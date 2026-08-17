"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, Crown, Wallet, UserPlus, LogIn, Loader2 } from "lucide-react";
import { Equb, getMyEqubs, getPublicEqubs } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [myEqubs, setMyEqubs] = useState<Equb[]>([]);
  const [publicEqubs, setPublicEqubs] = useState<Equb[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    Promise.all([getMyEqubs(), getPublicEqubs()])
      .then(([mine, pub]) => {
        setMyEqubs(mine);
        setPublicEqubs(pub);
      })
      .catch((err) => {
        console.error("Failed to load equbs", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Sebsabi | ሰብሳቢ</h1>
        <p className="text-sm text-muted-foreground">Welcome back!</p>
      </header>

      {/* Join with invite code */}
      <div className="mb-6 rounded-xl border border-border bg-card p-3">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
          <UserPlus className="size-4 text-primary" /> Have an invite code?
        </p>
        <div className="flex items-center gap-2">
          <Input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="e.g. FAM123"
            className="font-mono uppercase"
          />
          <Button onClick={() => router.push(`/join?code=${encodeURIComponent(inviteCode.trim())}`)}>
            <LogIn /> Join
          </Button>
        </div>
      </div>

      {/* Tabs for Public and My Equbs */}
      <Tabs defaultValue="public-equbs" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="public-equbs">Public Equbs</TabsTrigger>
          <TabsTrigger value="my-equbs">My Equbs</TabsTrigger>
        </TabsList>

        <TabsContent value="public-equbs" className="space-y-4">
          {loading ? (
            <p className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </p>
          ) : (
            publicEqubs.map((equb) => <EqubCard key={equb.id} equb={equb} />)
          )}
          {!loading && publicEqubs.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No public equbs yet.
            </p>
          )}
        </TabsContent>

        <TabsContent value="my-equbs" className="space-y-4">
          {loading ? (
            <p className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </p>
          ) : (
            myEqubs.map((equb) => <EqubCard key={equb.id} equb={equb} />)
          )}
          {!loading && myEqubs.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              You have not created or joined any equbs yet.
            </p>
          )}
        </TabsContent>
      </Tabs>

      {/* Floating Action Button (To create new Equb) */}
      <button
        onClick={() => router.push("/Equb/create")}
        className="fixed bottom-20 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:opacity-90"
        aria-label="Create Equb"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}

// Sub-component to display a single Equb Card
function EqubCard({ equb }: { equb: Equb }) {
  return (
    <Link href={`/Equb/${equb.id}`}>
      <Card className="w-full transition-colors hover:bg-muted/40">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 truncate font-semibold text-base">{equb.name}</h3>
            <Badge variant={equb.isPublic ? "default" : "secondary"} className="shrink-0">
              {equb.isPublic ? "Public" : "Private"}
            </Badge>
          </div>

          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            @{equb.admin.telegramUsername || "—"}
            <Crown className="size-3.5 text-amber-500" />
          </p>

          <div className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 py-2.5">
            <Wallet className="size-4 text-primary" />
            <span className="font-semibold text-primary">
              {equb.monthlyAmount.toLocaleString()} ETB
            </span>
          </div>

          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4" /> {equb.membersCount} Members
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}