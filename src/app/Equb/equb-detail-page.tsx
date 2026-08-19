"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Users,
  Wallet,
  CalendarDays,
  Share2,
  Crown,
  CheckCircle2,
  Link2,
  Sparkles,
  CalendarRange,
  Pencil,
  UserCog,
  Megaphone,
  Trash2,
  Ban,
  Loader2,
  Users2,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  EqubDetail,
  DrawsData,
  MemberRow,
  EqubFrequency,
  PaymentCollector,
  getEqubDetail,
  getDraws,
  adminUpdateMember,
  notifyMembers,
  removeMember,
  updateEqub,
  closeEqub,
  deleteEqub,
  createCollabGroup,
  dissolveCollabGroup,
  joinEqub,
  ApiError,
} from "@/lib/api";
import { mockLotteryColors } from "@/lib/mock-data";
import { periodLabel } from "@/lib/period-label";
import { formatEthiopianDate } from "@/lib/ethiopian-calendar";
import { ThisMonthTab } from "./this-month-tab";
import { MemberEditModal } from "./member-edit-modal";
import { NotifyMembersModal } from "./notify-members-modal";
import { ShareInviteModal } from "./share-invite-modal";
import { EditEqubModal } from "./edit-equb-modal";
import { ConfirmDialog } from "./confirm-dialog";
import { CollabGroupModal } from "./collab-group-modal";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return formatEthiopianDate(new Date(value));
}

interface DetailMember extends MemberRow {
  isAdmin: boolean;
}

export function EqubDetailPage({ equbId }: { equbId: string }) {
  const router = useRouter();
  const t = useTranslations("equb");
  const [equb, setEqub] = useState<EqubDetail | null>(null);
  const [draws, setDraws] = useState<DrawsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [removingMember, setRemovingMember] = useState<DetailMember | null>(null);
  const [editingMember, setEditingMember] = useState<DetailMember | null>(null);
  const [savingMember, setSavingMember] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [sendingNotify, setSendingNotify] = useState(false);
  const [busy, setBusy] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [savingGroup, setSavingGroup] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const reload = useCallback(() => {
    Promise.all([getEqubDetail(equbId), getDraws(equbId)])
      .then(([detail, drawData]) => {
        setEqub(detail);
        setDraws(drawData);
      })
      .catch((err) => {
        console.error("Failed to load equb", err);
        setError(err instanceof Error ? err.message : "Failed to load equb");
      })
      .finally(() => setLoading(false));
  }, [equbId]);

  useEffect(() => {
    reload();
  }, [reload]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Loading…
      </div>
    );
  }

  if (!equb) {
    return (
      <div className="p-4">
        <p className="py-16 text-center text-sm text-muted-foreground">
          {error ?? "Equb not found."}
        </p>
        <Button className="w-full" variant="outline" onClick={() => router.push("/home")}>
          Back to home
        </Button>
      </div>
    );
  }

  const isAdmin = equb.isAdmin;
  const label = periodLabel(equb.frequency);
  const members: DetailMember[] = equb.members.map((m) => ({
    ...m,
    isAdmin: m.role === "admin",
  }));

  const eligibleMembers = members.filter(
    (m) => m.order === null && m.collabGroupId === null,
  );
  const groupLabelByMemberId = new Map<string, string>();
  for (const g of equb.collabGroups) {
    for (const id of g.memberIds) groupLabelByMemberId.set(id, g.label);
  }

  const drawResults = draws?.results ?? [];
  const hasDrawn = (draws?.drawn ?? 0) > 0;
  const allDrawn = draws?.allDrawn ?? false;
  const totalMembers = draws?.total ?? drawResults.length;

  const handleSaveMember = (data: {
    fullName?: string;
    phone?: string;
    accountProvider?: string;
    accountNumber?: string;
    accountHolderName?: string;
    contributionAmount?: number;
  }) => {
    if (!editingMember) return;
    setSavingMember(true);
    adminUpdateMember(equbId, editingMember.id, data)
      .then(() => {
        reload();
        setEditingMember(null);
      })
      .catch((err) => console.error("Failed to update member", err))
      .finally(() => setSavingMember(false));
  };

  const handleSendNotify = (data: { title: string; message: string }) => {
    setSendingNotify(true);
    notifyMembers(equbId, data)
      .then(() => setNotifyOpen(false))
      .catch((err) => console.error("Failed to send notification", err))
      .finally(() => setSendingNotify(false));
  };

  const handleRemoveMember = (member: DetailMember) => {
    setBusy(true);
    removeMember(equbId, member.id)
      .then(reload)
      .catch((err) => console.error("Failed to remove member", err))
      .finally(() => {
        setBusy(false);
        setRemovingMember(null);
      });
  };

  const handleEditSave = (data: {
    name: string;
    monthlyAmount: number;
    durationMonths: number;
    totalAmount: number;
    frequency: EqubFrequency;
    collector: PaymentCollector;
    maxMembers?: number;
    reminderTime?: string;
    reminderDayOfWeek?: number;
    reminderDayOfMonth?: number;
    isPublic: boolean;
  }) => {
    setBusy(true);
    updateEqub(equbId, data)
      .then(reload)
      .catch((err) => console.error("Failed to update equb", err))
      .finally(() => setBusy(false));
  };

  const handleCloseEqub = () => {
    setBusy(true);
    closeEqub(equbId)
      .then(reload)
      .catch((err) => console.error("Failed to close equb", err))
      .finally(() => setBusy(false));
  };

  const handleDeleteEqub = () => {
    setBusy(true);
    deleteEqub(equbId)
      .then(() => router.push("/home"))
      .catch((err) => {
        console.error("Failed to delete equb", err);
        setBusy(false);
      });
  };

  const handleCreateGroup = (data: {
    members: { memberId: string; contributionAmount: number }[];
    leaderMemberId: string;
  }) => {
    setSavingGroup(true);
    setGroupError(null);
    createCollabGroup(equbId, data)
      .then(() => {
        reload();
        setGroupModalOpen(false);
      })
      .catch((err) => {
        console.error("Failed to create collab group", err);
        setGroupError(
          err instanceof ApiError ? err.message : "Failed to create group",
        );
      })
      .finally(() => setSavingGroup(false));
  };

  const handleJoin = () => {
    setJoining(true);
    joinEqub(equbId)
      .then(reload)
      .catch((err) => console.error("Failed to join equb", err))
      .finally(() => setJoining(false));
  };

  const handleDissolveGroup = (groupId: string) => {
    setBusy(true);
    dissolveCollabGroup(equbId, groupId)
      .then(reload)
      .catch((err) => console.error("Failed to dissolve group", err))
      .finally(() => setBusy(false));
  };

  return (
    <div className="pb-4">
      {/* Header with back button */}
      <header className="flex items-center gap-2 border-b border-border bg-background px-2 py-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="flex-1 truncate text-lg font-bold">{t("detailsTitle")}</h1>
      </header>

      <div className="flex flex-col gap-4 p-4">
        {/* Info card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate text-xl font-bold">{equb.name}</h2>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Edit equb"
                    onClick={() => setEditOpen(true)}
                    disabled={busy}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                by @{equb.admin.telegramUsername} · {label} {equb.currentRound}/{equb.durationMonths}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant={equb.isPublic ? "default" : "secondary"}>
                {equb.isPublic ? t("public") : t("private")}
              </Badge>
              {equb.isFull && <Badge variant="destructive">{t("full")}</Badge>}
              <Badge
                variant="outline"
                className={
                  equb.status === "active"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
                }
              >
                {equb.status === "active" ? t("active") : t("completed")}
              </Badge>
            </div>
          </div>

          <div className="my-4 grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 p-3">
              <Wallet className="size-5 text-primary" />
              <p className="text-lg font-bold">{equb.monthlyAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">ETB / {label.toLowerCase()}</p>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 p-3">
              <Users className="size-5 text-primary" />
              <p className="text-lg font-bold">
                {members.length}
                {equb.maxMembers != null && (
                  <span className="text-sm font-normal text-muted-foreground">
                    /{equb.maxMembers}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{t("members")}</p>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 p-3">
              <Wallet className="size-5 text-primary" />
              <p className="text-lg font-bold">{equb.totalPot.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">ETB total pot</p>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 p-3">
              <Wallet className="size-5 text-primary" />
              <p className="text-lg font-bold">{equb.totalAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">ETB total amount</p>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 p-3">
              <CalendarDays className="size-5 text-primary" />
              <p className="text-xs font-semibold">{formatDate(equb.nextDrawDate)}</p>
              <p className="text-xs text-muted-foreground">Next draw</p>
            </div>
          </div>

          {equb.description && <p className="text-sm text-muted-foreground">{equb.description}</p>}

          <div className="mt-4 flex flex-col gap-2">
            {equb.isPublic ? (
              !equb.isMember && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleJoin}
                  disabled={joining || equb.isFull}
                >
                  {joining ? (
                    <>
                      <Loader2 className="animate-spin" /> {t("joining")}
                    </>
                  ) : equb.isFull ? (
                    t("equbFull")
                  ) : (
                    <>
                      <UserPlus /> {t("joinEqub")}
                    </>
                  )}
                </Button>
              )
            ) : (
              !equb.isFull && (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={() => setShareOpen(true)}
                  >
                    <Link2 /> {equb.inviteCode}
                  </Button>
                  <Button
                    variant="default"
                    className="w-full"
                    size="lg"
                    onClick={() => setShareOpen(true)}
                  >
                    <Share2 /> {t("shareInvite")}
                  </Button>
                </>
              )
            )}
          </div>

          {isAdmin && (
            <div className="mt-3 flex items-center justify-center gap-2 border-t border-border pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmClose(true)}
                disabled={busy || equb.status !== "active"}
              >
                <Ban /> {t("closeEqub")}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)} disabled={busy}>
                <Trash2 /> {t("delete")}
              </Button>
            </div>
          )}
        </div>

        {/* Tabs: This Month | Members | Equb Months */}
        <Tabs defaultValue="this-month" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="this-month">This {label}</TabsTrigger>
            <TabsTrigger value="members">{t("members")}</TabsTrigger>
            <TabsTrigger value="months">Equb {label}s</TabsTrigger>
          </TabsList>

          <TabsContent value="this-month" className="mt-4">
            <ThisMonthTab equbId={equbId} month={equb.currentRound} isAdmin={isAdmin} frequency={equb.frequency} />
          </TabsContent>

          <TabsContent value="members" className="mt-4">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{t("members")}</h3>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="size-4" /> {members.length}
                  </span>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setGroupError(null);
                        setGroupModalOpen(true);
                      }}
                      disabled={busy || eligibleMembers.length < 2}
                    >
                      <Users2 /> {t("group")}
                    </Button>
                  )}
                  {isAdmin && (
                    <Button size="sm" variant="outline" onClick={() => setNotifyOpen(true)} disabled={busy}>
                      <Megaphone /> {t("notify")}
                    </Button>
                  )}
                </div>
              </div>

              {equb.collabGroups.length > 0 && (
                <div className="mb-4 flex flex-col gap-2">
                  {equb.collabGroups.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2"
                    >
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <Users2 className="size-3.5 text-primary" /> {g.label}
                      </span>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDissolveGroup(g.id)}
                          disabled={busy}
                        >
                          {t("dissolve")}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

                           <div className="mb-4 flex items-center -space-x-2">
                {members.slice(0, 4).map((m) => (
                  <Avatar key={m.id} className="border-2 border-background">
                    <AvatarFallback className="text-xs">
                      {initials(m.fullName)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {members.length > 4 && (
                  <div className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                    +{members.length - 4}
                  </div>
                )}
              </div>

              <ul className="flex flex-col gap-2">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar size="sm">
                        <AvatarFallback>{initials(m.fullName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1 truncate text-sm font-medium">
                          {m.fullName}
                          {m.isAdmin && <Crown className="size-3.5 shrink-0 text-primary" />}
                          {m.collabRole === "leader" && (
                            <Badge variant="outline" className="gap-1 px-1.5 py-0 text-[10px]">
                              Leader
                            </Badge>
                          )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          @{m.telegramUsername ?? "—"}
                          {m.account.provider
                            ? ` · ${m.account.provider}: ${m.account.number ?? "—"}`
                            : ""}
                        </p>
                        {groupLabelByMemberId.has(m.id) && (
                          <p className="truncate text-xs font-medium text-primary">
                            {groupLabelByMemberId.get(m.id)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {m.order ? (
                        <Badge variant="outline" className="gap-1">
                          <CalendarRange className="size-3" /> {label} {m.order}
                        </Badge>
                      ) : (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          No {label.toLowerCase()} yet
                        </span>
                      )}
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Edit ${m.fullName}`}
                          onClick={() => setEditingMember(m)}
                          disabled={busy}
                        >
                          <UserCog />
                        </Button>
                      )}
                      {isAdmin && !m.isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Remove ${m.fullName}`}
                          onClick={() => setRemovingMember(m)}
                          disabled={busy}
                        >
                          <Trash2 className="text-destructive" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </TabsContent>

          <TabsContent value="months" className="mt-4">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Equb {label}s</h3>
                {hasDrawn && (
                  <Badge variant={allDrawn ? "default" : "secondary"}>
                    {draws?.drawn}/{totalMembers} drawn
                  </Badge>
                )}
              </div>

              {!hasDrawn ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="size-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">No lottery yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Spin the wheel once at the start of the equb to assign each
                      member their equb {label.toLowerCase()}.
                    </p>
                  </div>
                  {isAdmin && (
                    <Button
                      size="lg"
                      className="mt-2"
                      onClick={() => router.push(`/Equb/${equbId}/lottery`)}
                    >
                      <Sparkles /> Run Lottery
                    </Button>
                  )}
                </div>
              ) : allDrawn ? (
                <p className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <CheckCircle2 className="size-4 shrink-0" /> Lottery complete — every member
                  has their equb {label.toLowerCase()}.
                </p>
              ) : (
                <div className="mb-4 flex items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-2.5">
                  <p className="text-sm text-muted-foreground">
                    {totalMembers - (draws?.drawn ?? 0)} member(s) still need a {label.toLowerCase()}.
                  </p>
                  {isAdmin && (
                    <Button size="sm" onClick={() => router.push(`/Equb/${equbId}/lottery`)}>
                      <Sparkles /> Continue Draw
                    </Button>
                  )}
                </div>
              )}

              {hasDrawn && (
                <ul className="flex flex-col gap-2">
                  {drawResults.map((m) => (
                    <li
                      key={m.memberId}
                      className="flex items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                          style={{
                            backgroundColor:
                              mockLotteryColors[(m.number - 1) % mockLotteryColors.length],
                          }}
                        >
                          {m.number}
                        </span>
                        <div className="min-w-0">
                          <p className="flex items-center gap-1 truncate text-sm font-medium">
                            {m.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">@{m.telegramUsername ?? "—"}</p>
                        </div>
                      </div>
                      {m.month ? (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          <CalendarRange className="size-3" /> {label} {m.month}
                        </span>
                      ) : (
                        <span className="shrink-0 text-xs text-muted-foreground">—</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <MemberEditModal
        open={editingMember !== null}
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onSave={handleSaveMember}
        saving={savingMember}
      />
      <NotifyMembersModal
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        onSend={handleSendNotify}
        sending={sendingNotify}
      />
      <CollabGroupModal
        open={groupModalOpen}
        eligibleMembers={eligibleMembers}
        monthlyAmount={equb.monthlyAmount}
        onClose={() => setGroupModalOpen(false)}
        onCreate={handleCreateGroup}
        saving={savingGroup}
        error={groupError}
      />
      <ShareInviteModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        equbName={equb.name}
        inviteCode={equb.inviteCode}
      />
      <EditEqubModal
        open={editOpen}
        initial={{
          name: equb.name,
          monthlyAmount: equb.monthlyAmount,
          durationMonths: equb.durationMonths,
          totalAmount: equb.totalAmount,
          frequency: equb.frequency,
          collector: equb.collector,
          maxMembers: equb.maxMembers,
          reminderTime: equb.reminderTime,
          reminderDayOfWeek: equb.reminderDayOfWeek,
          reminderDayOfMonth: equb.reminderDayOfMonth,
          isPublic: equb.isPublic,
        }}
        onClose={() => setEditOpen(false)}
        onSave={handleEditSave}
      />
      <ConfirmDialog
        open={confirmClose}
        title="Close this Equb?"
        description="Closing stops new payments and marks the equb as completed. Existing draw results are kept."
        confirmLabel="Close Equb"
        onConfirm={handleCloseEqub}
        onClose={() => setConfirmClose(false)}
      />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this Equb?"
        description="This permanently removes the equb and all its data. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteEqub}
        onClose={() => setConfirmDelete(false)}
      />
      <ConfirmDialog
        open={removingMember !== null}
        title="Remove member?"
        description={
          removingMember
            ? `${removingMember.fullName} will be removed from ${equb.name}.`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={() => removingMember && handleRemoveMember(removingMember)}
        onClose={() => setRemovingMember(null)}
      />
    </div>
  );
}