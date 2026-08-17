// Central API client for the Equb backend.
// Handles auth (Telegram initData or dev login), token storage, and typed calls.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050";

const TOKEN_KEY = "equb_token";

// ---- Types (mirror the backend response shapes) ----

export type EqubStatus = "active" | "completed";

export interface Equb {
  id: string;
  name: string;
  monthlyAmount: number;
  totalAmount: number;
  durationMonths: number;
  inviteCode: string;
  status: EqubStatus;
  isPublic: boolean;
  admin: { id: string; fullName: string; telegramUsername: string };
  membersCount: number;
  createdAt: string;
}

export interface MemberRow {
  id: string;
  number: number;
  fullName: string;
  telegramUsername: string;
  role: "admin" | "member";
  order: number | null;
  contributionAmount: number | null;
  account: {
    provider: string | null;
    number: string | null;
    holderName: string | null;
  };
}

export interface EqubDetail extends Equb {
  totalPot: number;
  description: string | null;
  currentRound: number;
  nextDrawDate: string | null;
  isAdmin: boolean;
  isMember: boolean;
  members: MemberRow[];
}

export interface DrawResult {
  memberId: string;
  number: number;
  fullName: string;
  telegramUsername: string;
  month: number | null;
}

export interface DrawsData {
  total: number;
  drawn: number;
  allDrawn: boolean;
  results: DrawResult[];
}

export type PaymentStatus = "paid" | "pending" | "rejected";

export interface PaymentRow {
  id: string;
  memberId: string;
  fullName: string;
  telegramUsername: string;
  amount: number;
  status: PaymentStatus;
  receiptDate: string | null;
}

export interface MonthData {
  equbId: string;
  month: number;
  amount: number;
  isRecipient: boolean;
  recipient: {
    memberId: string;
    fullName: string;
    telegramUsername: string;
    account: { provider: string | null; number: string | null };
  } | null;
  collected: number;
  totalMembers: number;
  paidCount: number;
  allCollected: boolean;
  payments: PaymentRow[];
}

export type NotificationType = "success" | "info" | "warning";

export interface ApiNotification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface Profile {
  id: string;
  fullName: string;
  telegramUsername: string | null;
  phone: string | null;
  avatarUrl: string | null;
  createdEqubs: number;
  joinedEqubs: number;
  totalSaved: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ---- Auth plumbing ----

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

function telegramInitData(): string {
  if (typeof window === "undefined") return "";
  const webApp = (window as unknown as { Telegram?: { WebApp?: { initData?: string } } })
    ?.Telegram?.WebApp;
  return webApp?.initData ?? "";
}

let loginPromise: Promise<string> | null = null;

// Returns a valid token, logging in if needed. Uses Telegram initData when
// available and falls back to the dev-login endpoint (browser testing).
export function ensureToken(): Promise<string> {
  const existing = getToken();
  if (existing) return Promise.resolve(existing);
  if (loginPromise) return loginPromise;

  loginPromise = (async () => {
    const initData = telegramInitData();
    const res = initData
      ? await apiFetch<{ token: string }>("/auth/login", {
          method: "POST",
          body: { initData },
          auth: false,
        })
      : await apiFetch<{ token: string }>("/auth/dev-login", {
          method: "POST",
          auth: false,
        });
    setToken(res.token);
    loginPromise = null;
    return res.token;
  })().catch((err) => {
    loginPromise = null;
    throw err;
  });

  return loginPromise!;
}

// ---- Low-level fetch ----

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

async function apiFetch<T>(
  path: string,
  { method = "GET", body, auth = true }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = await ensureToken();
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    const message =
      (json as { message?: string } | null)?.message ?? res.statusText;
    throw new ApiError(res.status, typeof message === "string" ? message : "Request failed");
  }
  return json as T;
}

// ---- Auth ----

export function devLogin() {
  return apiFetch<{ user: Profile; token: string }>("/auth/dev-login", {
    method: "POST",
    auth: false,
  });
}

// ---- Equb ----

export const getMyEqubs = () => apiFetch<Equb[]>("/equb");
export const getPublicEqubs = () => apiFetch<Equb[]>("/equb/public");
export const getEqubByInvite = (code: string) =>
  apiFetch<Equb>(`/equb/invite/${encodeURIComponent(code)}`);
export const getEqubDetail = (id: string) =>
  apiFetch<EqubDetail>(`/equb/${id}`);
export const createEqub = (data: {
  name: string;
  monthlyAmount: number;
  durationMonths: number;
  totalAmount: number;
  isPublic: boolean;
  description?: string;
}) => apiFetch<Equb>("/equb", { method: "POST", body: data });
export const updateEqub = (
  id: string,
  data: {
    name?: string;
    monthlyAmount?: number;
    durationMonths?: number;
    totalAmount?: number;
    isPublic?: boolean;
    description?: string;
  },
) => apiFetch<Equb>(`/equb/${id}`, { method: "PATCH", body: data });
export const closeEqub = (id: string) =>
  apiFetch<Equb>(`/equb/${id}/close`, { method: "POST" });
export const deleteEqub = (id: string) =>
  apiFetch<{ success: boolean }>(`/equb/${id}`, { method: "DELETE" });
export const joinEqub = (id: string) =>
  apiFetch<object>(`/equb/${id}/join`, { method: "POST" });
export const joinEqubByInvite = (id: string) =>
  apiFetch<object>(`/equb/${id}/join/invite`, { method: "POST" });
export const removeMember = (equbId: string, memberId: string) =>
  apiFetch<{ success: boolean }>(`/equb/${equbId}/members/${memberId}`, {
    method: "DELETE",
  });
export const adminUpdateMember = (
  equbId: string,
  memberId: string,
  data: {
    fullName?: string;
    phone?: string;
    accountProvider?: string;
    accountNumber?: string;
    accountHolderName?: string;
    contributionAmount?: number;
  },
) =>
  apiFetch<MemberRow>(`/equb/${equbId}/members/${memberId}`, {
    method: "PATCH",
    body: data,
  });
export const notifyMembers = (
  equbId: string,
  data: { title: string; message: string },
) =>
  apiFetch<{ notifiedCount: number }>(`/equb/${equbId}/notify`, {
    method: "POST",
    body: data,
  });

// ---- Lottery ----

export const getDraws = (equbId: string) =>
  apiFetch<DrawsData>(`/equb/${equbId}/lottery`);
export const spinLottery = (equbId: string) =>
  apiFetch<DrawResult>(`/equb/${equbId}/lottery/spin`, { method: "POST" });
export const announceLottery = (equbId: string) =>
  apiFetch<{ notifiedCount: number }>(`/equb/${equbId}/lottery/announce`, {
    method: "POST",
  });

// ---- Payments ----

export const getMonth = (equbId: string, month: number) =>
  apiFetch<MonthData>(`/equb/${equbId}/month/${month}`);
export const submitPayment = (equbId: string, amount?: number) =>
  apiFetch<object>(`/equb/${equbId}/payments`, {
    method: "POST",
    body: amount !== undefined ? { amount } : {},
  });
export const approvePaymentFor = (equbId: string, paymentId: string) =>
  apiFetch<object>(`/equb/${equbId}/payments/${paymentId}/approve`, {
    method: "POST",
  });
export const remindUnpaidMembers = (equbId: string) =>
  apiFetch<{ remindedCount: number }>(`/equb/${equbId}/payments/remind`, {
    method: "POST",
  });
export const rejectPaymentFor = (equbId: string, paymentId: string, reason?: string) =>
  apiFetch<object>(`/equb/${equbId}/payments/${paymentId}/reject`, {
    method: "POST",
    body: reason !== undefined ? { reason } : {},
  });

// ---- Notifications ----

export const getNotifications = () => apiFetch<ApiNotification[]>("/notifications");
export const markNotificationRead = (id: string) =>
  apiFetch<ApiNotification>(`/notifications/${id}/read`, { method: "PATCH" });

// ---- Profile ----

export const getProfile = () => apiFetch<Profile>("/profile");