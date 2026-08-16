"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, UserRound, Wallet, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getProfile } from "./schema/api";
import type { Profile } from "./schema/type";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch((err) => {
        console.error("Failed to load profile", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      });
  }, []);

  if (error) {
    return (
      <div className="p-4">
        <p className="py-16 text-center text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Loading…
      </div>
    );
  }

  const initials = profile.fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
      </header>

      {/* User info card */}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs">
        <Avatar size="lg" className="size-14">
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-lg font-bold">{profile.fullName}</p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" /> {profile.telegramUsername}
          </p>
        </div>
      </div>

      {/* Contact info */}
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm shadow-xs">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground">Phone Number</p>
          <p className="font-medium">{profile.phone}</p>
        </div>
      </div>

      {/* Stats summary */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-5 shadow-xs">
          <Users className="size-6 text-primary" />
          <p className="text-2xl font-bold">{profile.createdEqubs}</p>
          <p className="text-sm text-muted-foreground">Created Equbs</p>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-5 shadow-xs">
          <UserRound className="size-6 text-primary" />
          <p className="text-2xl font-bold">{profile.joinedEqubs}</p>
          <p className="text-sm text-muted-foreground">Joined Equbs</p>
        </div>
        <div className="col-span-2 flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="size-5 text-primary" />
            <span className="text-muted-foreground">Total Saved</span>
          </div>
          <p className="font-bold">{profile.totalSaved.toLocaleString()} ETB</p>
        </div>
      </div>
    </div>
  );
}