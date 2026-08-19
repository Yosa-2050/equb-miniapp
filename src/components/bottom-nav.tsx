"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNotifications } from "@/lib/api";

const items = [
  { href: "/home", label: "Home", Icon: Home },
  { href: "/notification", label: "Alerts", Icon: Bell },
  { href: "/profile", label: "Profile", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const refresh = () => {
      getNotifications()
        .then((list) => {
          if (!cancelled) setUnreadCount(list.filter((n) => !n.read).length);
        })
        .catch((err) => console.error("Failed to load notification count", err));
    };

    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // Refetch whenever the route changes (e.g. leaving /notification after
    // marking things read) so the badge stays in sync.
  }, [pathname]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-md items-stretch">
        {items.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          const showBadge = href === "/notification" && unreadCount > 0;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors",
                isActive && "font-medium text-primary"
              )}
            >
              <span className="relative">
                <Icon className={cn("size-6", isActive && "text-primary")} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                    {unreadCount}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}