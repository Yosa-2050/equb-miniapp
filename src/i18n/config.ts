export const locales = ["en", "am"] as const;
export type Locale = (typeof locales)[number];

// Amharic is the default per the product spec, matching the bot's default.
export const defaultLocale: Locale = "am";

export const LOCALE_COOKIE = "equb_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
