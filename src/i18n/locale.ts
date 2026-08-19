import "server-only";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";

export async function getUserLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}

export async function getMessages(locale: Locale) {
  switch (locale) {
    case "en":
      return (await import("../../messages/en.json")).default;
    case "am":
    default:
      return (await import("../../messages/am.json")).default;
  }
}
