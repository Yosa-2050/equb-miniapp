"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ensureToken, getProfile } from "@/lib/api";
import { setLocaleCookie } from "@/i18n/actions";
import { LOCALE_COOKIE } from "@/i18n/config";

// Silently logs the user in the moment the mini app opens: Telegram's
// WebApp.ready() signals the client is loaded, then ensureToken() reads
// window.Telegram.WebApp.initData and exchanges it for a JWT (falling back
// to /auth/dev-login outside Telegram). No UI, no user action.
export function SessionBootstrap() {
  const router = useRouter();

  useEffect(() => {
    const webApp = (
      window as unknown as { Telegram?: { WebApp?: { ready?: () => void } } }
    ).Telegram?.WebApp;
    webApp?.ready?.();

    ensureToken()
      .then(async () => {
        const hasLocaleCookie = document.cookie
          .split("; ")
          .some((c) => c.startsWith(`${LOCALE_COOKIE}=`));
        if (hasLocaleCookie) return;

        const profile = await getProfile();
        await setLocaleCookie(profile.language);
        router.refresh();
      })
      .catch((err) => {
        console.error("Failed to establish session:", err);
      });
  }, [router]);

  return null;
}
