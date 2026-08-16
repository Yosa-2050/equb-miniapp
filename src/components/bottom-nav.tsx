"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/home", label: "Home", Icon: Home },
  { href: "/notification", label: "Alerts", Icon: Bell },
  { href: "/profile", label: "Profile", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-md items-stretch">
        {items.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors",
                isActive && "font-medium text-primary"
              )}
            >
              <Icon className={cn("size-6", isActive && "text-primary")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}