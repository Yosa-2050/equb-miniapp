"use client";

import { useState } from "react";
import { X, Copy, Check, Send, MessageCircle, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareInviteModalProps {
  open: boolean;
  onClose: () => void;
  equbName: string;
  inviteCode: string;
}

export function ShareInviteModal({ open, onClose, equbName, inviteCode }: ShareInviteModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME ?? "equb_sebsabi_bot";
  const inviteLink = `https://t.me/${botUsername}?start=${inviteCode}`;
  const message = `Join my Equb "${equbName}" on Sebsabi! ${inviteLink}`;

  const telegramShare = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(message)}`;
  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(message)}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-md flex-col gap-5 rounded-t-2xl border border-border bg-card p-5 shadow-lg sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Link2 className="size-5 text-primary" /> Invite Members
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X />
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-muted-foreground">
            Share this link with members. They open it in Telegram to join {equbName}.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5">
            <code className="flex-1 truncate text-xs">{inviteLink}</code>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a href={telegramShare} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full" size="lg">
              <Send /> Telegram
            </Button>
          </a>
          <a href={whatsappShare} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full" size="lg">
              <MessageCircle /> WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}