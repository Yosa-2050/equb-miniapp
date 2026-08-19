import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import "./globals.css";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/bottom-nav";
import { SessionBootstrap } from "./session-bootstrap";
import { getUserLocale, getMessages } from "@/i18n/locale";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sebsabi | ሰብሳቢ",
  description: "Equb management mini app",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getUserLocale();
  const messages = await getMessages(locale);

  return (
    <html
      lang={locale}
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SessionBootstrap />
          <main className="mx-auto w-full max-w-md flex-1 pb-20">{children}</main>
          <BottomNav />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}