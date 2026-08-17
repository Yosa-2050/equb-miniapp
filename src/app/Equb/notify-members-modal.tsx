"use client";

import { useState } from "react";
import { X, Megaphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NotifyMembersModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (data: { title: string; message: string }) => void;
  sending: boolean;
}

export function NotifyMembersModal({ open, onClose, onSend, sending }: NotifyMembersModalProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend({ title: title.trim(), message: message.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Megaphone className="size-5 text-primary" /> Notify Members
          </h2>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose}>
            <X />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Sends this as an in-app notification and a Telegram DM to every member.
        </p>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notify-title">Title</Label>
          <Input
            id="notify-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lottery starts soon!"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notify-message">Message</Label>
          <textarea
            id="notify-message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Join us live in the app at 6 PM for this month's draw."
            rows={4}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={sending}>
          {sending ? (
            <>
              <Loader2 className="animate-spin" /> Sending…
            </>
          ) : (
            "Send to All Members"
          )}
        </Button>
      </form>
    </div>
  );
}
