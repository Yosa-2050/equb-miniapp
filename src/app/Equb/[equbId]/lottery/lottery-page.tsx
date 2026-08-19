"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { io, Socket } from "socket.io-client";
import {
  ArrowLeft,
  RotateCw,
  Trophy,
  CheckCircle2,
  Loader2,
  Radio,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  API_BASE,
  DrawResult,
  EqubFrequency,
  announceLottery,
  getDraws,
  getEqubDetail,
  getToken,
  spinLottery,
} from "@/lib/api";
import { mockLotteryColors } from "@/lib/mock-data";
import { periodLabel } from "@/lib/period-label";

const COLORS = mockLotteryColors;

const SEG_BASE = 360;
const CX = 150;
const CY = 150;
const R = 138;

function polar(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: CX + radius * Math.sin(rad),
    y: CY - radius * Math.cos(rad),
  };
}

function segmentPath(start: number, end: number, radius: number) {
  const p1 = polar(start, radius);
  const p2 = polar(end, radius);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${p1.x} ${p1.y} A ${radius} ${radius} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`;
}

export default function LotteryPage({ equbId }: { equbId: string }) {
  const router = useRouter();
  const t = useTranslations("lottery");
  const tc = useTranslations("common");

  const [isAdmin, setIsAdmin] = useState(false);
  const [frequency, setFrequency] = useState<EqubFrequency>("monthly");
  const [connected, setConnected] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<(DrawResult & { rosterNumber: number }) | null>(null);
  const [members, setMembers] = useState<DrawResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcing, setAnnouncing] = useState(false);
  const [announced, setAnnounced] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const pendingLocalSpin = useRef(false);
  const targetRef = useRef<(DrawResult & { rosterNumber: number }) | null>(null);
  const membersRef = useRef<DrawResult[]>([]);
  membersRef.current = members;

  useEffect(() => {
    Promise.all([getDraws(equbId), getEqubDetail(equbId)])
      .then(([draws, detail]) => {
        setMembers(draws.results);
        setIsAdmin(detail.isAdmin);
        setFrequency(detail.frequency);
      })
      .catch((err) => console.error("Failed to load draws", err))
      .finally(() => setLoading(false));
  }, [equbId]);

  const N = members.length;
  const SEG = N > 0 ? SEG_BASE / N : SEG_BASE;
  const periodWord = periodLabel(frequency);

  const applyResult = (result: DrawResult) => {
    const current = membersRef.current;
    const idx = current.findIndex((m) => m.memberId === result.memberId);
    const rosterNumber = idx >= 0 ? idx + 1 : current.length;
    const withRoster = { ...result, rosterNumber };

    targetRef.current = withRoster;
    setWinner(withRoster);
    setSpinning(true);

    const mid = rosterNumber * SEG - SEG / 2;
    const revolutions = 5;
    setRotation((rot) => rot + revolutions * 360 + (360 - mid));
  };

  // Live sync: everyone on this page joins a room for this equb and sees
  // spins pushed the instant the admin triggers them.
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = io(`${API_BASE}/lottery`, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("joinEqubRoom", equbId);
    });
    socket.on("disconnect", () => setConnected(false));

    socket.on("spin", (result: DrawResult) => {
      if (pendingLocalSpin.current) {
        // We're the admin and already animated this from our own REST call.
        pendingLocalSpin.current = false;
        return;
      }
      applyResult(result);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equbId]);

  const remaining = useMemo(
    () => members.filter((m) => m.month === null),
    [members],
  );

  const completed = N > 0 && remaining.length === 0;

  const handleSpin = () => {
    if (spinning || completed || remaining.length === 0 || loading) return;

    setWinner(null);
    pendingLocalSpin.current = true;

    spinLottery(equbId)
      .then((result) => applyResult(result))
      .catch((err) => {
        console.error("Spin failed", err);
        pendingLocalSpin.current = false;
      });
  };

  const handleAnnounce = () => {
    setAnnouncing(true);
    announceLottery(equbId)
      .then(() => setAnnounced(true))
      .catch((err) => console.error("Failed to announce lottery", err))
      .finally(() => setAnnouncing(false));
  };

  const handleAnimationEnd = () => {
    if (!spinning) return;
    setSpinning(false);

    const target = targetRef.current;
    targetRef.current = null;
    if (!target) return;

    setMembers((prev) =>
      prev.map((m) =>
        m.memberId === target.memberId ? { ...m, month: target.month } : m,
      ),
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> {tc("loading")}
      </div>
    );
  }

  return (
    <div className="pb-4">
      <header className="flex items-center gap-2 border-b border-border bg-background px-2 py-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="flex-1 truncate text-lg font-bold">{t("title")}</h1>
        {connected && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <Radio className="size-3.5" /> {t("live")}
          </span>
        )}
        {completed && (
          <span className="text-xs font-medium text-emerald-600">{t("completed")}</span>
        )}
      </header>

      <div className="flex flex-col items-center gap-6 p-4">
        {N === 0 ? (
          <p className="py-10 text-sm text-muted-foreground">
            {t("noMembers")}
          </p>
        ) : (
          <>
            {isAdmin && !completed && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAnnounce}
                disabled={announcing || announced}
              >
                <Megaphone />{" "}
                {announcing
                  ? t("announcing")
                  : announced
                    ? t("membersNotified")
                    : t("announceLive")}
              </Button>
            )}

            {/* Wheel */}
            <div className="relative mt-2">
              {/* Pointer at the top */}
              <div className="absolute -top-2 left-1/2 z-10 -translate-x-1/2">
                <div className="h-0 w-0 border-l-8 border-r-8 border-t-[14px] border-l-transparent border-r-transparent border-t-foreground" />
              </div>

              <div
                className="relative overflow-hidden rounded-full shadow-xl ring-4 ring-border"
                style={{ width: 300, height: 300 }}
              >
                <svg
                  viewBox="0 0 300 300"
                  className="size-full"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning
                      ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                      : "none",
                  }}
                  onTransitionEnd={handleAnimationEnd}
                >
                  {members.map((m, i) => {
                    const start = i * SEG;
                    const mid = start + SEG / 2;
                    const label = polar(mid, R * 0.68);
                    return (
                      <g key={m.memberId}>
                        <path
                          d={segmentPath(start, start + SEG, R)}
                          fill={COLORS[i % COLORS.length]}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                        <text
                          x={label.x}
                          y={label.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="fill-white font-bold"
                          fontSize={26}
                          transform={`rotate(${mid}, ${label.x}, ${label.y})`}
                        >
                          {i + 1}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Center hub */}
                <div className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background shadow-lg ring-2 ring-border">
                  <RotateCw className="size-6 text-primary" />
                </div>
              </div>
            </div>

            {/* Winner announcement */}
            <div
              className={cn(
                "w-full rounded-2xl border p-4 text-center transition-all",
                winner
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                  : "border-border bg-card"
              )}
            >
              {winner ? (
                <>
                  <Trophy className="mx-auto mb-2 size-8 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {t("goesTo", { period: periodWord, round: winner.month ?? "" })}
                  </p>
                  <p className="text-xl font-bold">
                    #{winner.rosterNumber} · {winner.fullName}
                  </p>
                </>
              ) : completed ? (
                <p className="text-sm text-muted-foreground">
                  {t("allAssigned", { period: periodWord.toLowerCase() })}
                </p>
              ) : isAdmin ? (
                <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <RotateCw className="size-4" /> {t("pressSpin", { period: periodWord.toLowerCase() })}
                </p>
              ) : (
                <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Radio className="size-4" /> {t("waitingForAdmin")}
                </p>
              )}
            </div>

            {/* Spin button: admin only. Members just watch it happen live. */}
            {isAdmin && (
              <Button
                size="lg"
                className="w-full"
                onClick={handleSpin}
                disabled={spinning || completed}
              >
                {spinning ? t("spinning") : completed ? t("lotteryDone") : t("spinTheWheel")}
              </Button>
            )}

            {/* Results list: members with their assigned equb month */}
            <section className="w-full">
              <h3 className="mb-3 font-semibold">{t("equbPeriods", { period: periodWord })}</h3>
              <ul className="flex flex-col gap-2">
                {members.map((m, i) => (
                  <li
                    key={m.memberId}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5",
                      m.month !== null ? "border-border bg-card" : "border-dashed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">
                          {m.fullName}
                          {m.month !== null && (
                            <CheckCircle2 className="ml-1.5 inline size-3.5 text-emerald-600" />
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{t("memberNumber", { number: i + 1 })}</p>
                      </div>
                    </div>
                    {m.month !== null ? (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {periodWord} {m.month}
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs text-muted-foreground">—</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
