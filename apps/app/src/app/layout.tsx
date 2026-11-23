import { APP_CONFIG } from "@acme/config";
import { cn, ThemeProvider, Toaster } from "@acme/ui";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { env } from "~/env";
import { ORPCReactProvider } from "~/orpc/react";

import "~/app/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production" ? APP_CONFIG.url : "http://localhost:3000",
  ),
  title: "CraftSad — садовые бирки с вашими названиями",
  description:
    "Прочные садовые бирки для рассады и грядок. Выберите форму, цвет и названия сортов. Доставка в пункты Ozon по России.",
  openGraph: {
    title: "CraftSad — садовые бирки с вашими названиями",
    description:
      "Прочные садовые бирки для рассады и грядок с доставкой в Ozon.",
    url: APP_CONFIG.url,
    siteName: "CraftSad",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf8f5",
};

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background text-foreground min-h-screen font-sans antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <ThemeProvider>
          <ORPCReactProvider>{props.children}</ORPCReactProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
