import { getRequestConfig } from "next-intl/server";
import { getUserLocale, getMessages } from "./locale";

export default getRequestConfig(async () => {
  const locale = await getUserLocale();
  const messages = await getMessages(locale);
  return { locale, messages };
});
