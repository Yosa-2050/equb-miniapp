"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Bell, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { getNotifications, markNotificationRead } from "./schema/api";
import type { Notification } from "./schema/type";
import { cn } from "@/lib/utils";

const colorByType = {
  success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  info: "bg-primary/10 text-primary",
  warning: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
} as const;

export default function NotificationPage() {
  const t = useTranslations("notification");
  const tc = useTranslations("common");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getNotifications()
      .then(setNotifications)
      .catch((err) => {
        console.error("Failed to load notifications", err);
        setError(err instanceof Error ? err.message : "Failed to load notifications");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = (n: Notification) => {
    if (n.read) return;
    markNotificationRead(n.id)
      .then(() => {
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
        );
      })
      .catch((err) => console.error("Failed to mark read", err));
  };

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </header>

      {loading ? (
        <p className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {tc("loading")}
        </p>
      ) : error ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{error}</p>
      ) : notifications.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
      <div className="flex flex-col gap-3">
        {notifications.map((n) => {
          const Icon = n.type === "info" ? Bell : n.type === "success" ? CheckCircle2 : AlertTriangle;
          const iconClass = n.type === "info" ? "bg-primary/10 text-primary" : colorByType[n.type];
          return (
            <button
              key={n.id}
              onClick={() => handleOpen(n)}
              className={cn(
                "flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-xs transition hover:bg-muted/40",
                !n.read && "border-l-4 border-l-primary"
              )}
            >
              <div className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full", iconClass)}>
                <Icon className="size-5" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm">{n.title}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{n.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground">{n.description}</p>
              </div>
              {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
      )}
    </div>
  );
}