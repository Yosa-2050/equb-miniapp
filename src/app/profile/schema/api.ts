import {
  getProfile as apiGetProfile,
  updateProfile as apiUpdateProfile,
  type Profile as ApiProfile,
} from "@/lib/api";
import type { Profile } from "./type";

function toProfile(p: ApiProfile): Profile {
  return {
    id: p.id,
    fullName: p.fullName,
    telegramUsername: p.telegramUsername ? `@${p.telegramUsername}` : "—",
    phone: p.phone ?? "Not set",
    avatarUrl: p.avatarUrl ?? "",
    language: p.language,
    createdEqubs: p.createdEqubs,
    joinedEqubs: p.joinedEqubs,
    totalSaved: p.totalSaved,
  };
}

export const getProfile = async (): Promise<Profile> => {
  const p: ApiProfile = await apiGetProfile();
  return toProfile(p);
};

export const updateProfile = async (data: {
  fullName?: string;
  phone?: string;
  language?: "en" | "am";
}): Promise<Profile> => {
  const p: ApiProfile = await apiUpdateProfile(data);
  return toProfile(p);
};