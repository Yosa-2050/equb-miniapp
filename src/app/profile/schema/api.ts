import { getProfile as apiGetProfile, type Profile as ApiProfile } from "@/lib/api";
import type { Profile } from "./type";

export const getProfile = async (): Promise<Profile> => {
  const p: ApiProfile = await apiGetProfile();
  return {
    id: p.id,
    fullName: p.fullName,
    telegramUsername: p.telegramUsername ? `@${p.telegramUsername}` : "—",
    phone: p.phone ?? "Not set",
    avatarUrl: p.avatarUrl ?? "",
    createdEqubs: p.createdEqubs,
    joinedEqubs: p.joinedEqubs,
    totalSaved: p.totalSaved,
  };
};