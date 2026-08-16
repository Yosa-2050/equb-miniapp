"use client";

import { useEffect } from "react";
import { ensureToken } from "@/lib/api";

// Silently logs the user in the moment the mini app opens: Telegram's
// WebApp.ready() signals the client is loaded, then ensureToken() reads
// window.Telegram.WebApp.initData and exchanges it for a JWT (falling back
// to /auth/dev-login outside Telegram). No UI, no user action.
export function SessionBootstrap() {
  useEffect(() => {
    const webApp = (
      window as unknown as { Telegram?: { WebApp?: { ready?: () => void } } }
    ).Telegram?.WebApp;
    webApp?.ready?.();

    ensureToken().catch((err) => {
      console.error("Failed to establish session:", err);
    });
  }, []);

  return null;
}
