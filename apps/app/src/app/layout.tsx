import { APP_CONFIG } from "@acme/config";
import { cn, ThemeProvider, Toaster } from "@acme/ui";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Geist,
  Geist_Mono,
  Manrope,
} from "next/font/google";
import { env } from "~/env";
import { ORPCReactProvider } from "~/orpc/react";

import "~/app/styles.css";
import "~/app/3dbirka.css";
import "~/app/brand.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production" ? APP_CONFIG.url : "http://localhost:3000",
  ),
  icons: { icon: "/brand-mark.svg" },
  title: "3D Бирка — сад начинается с имени",
  description:
    "Прочные садовые бирки для рассады и грядок. Выберите форму, цвет и названия сортов. Доставка в пункты Ozon по России.",
  openGraph: {
    title: "3D Бирка — сад начинается с имени",
    description:
      "Прочные садовые бирки для рассады и грядок с доставкой в Ozon.",
    url: APP_CONFIG.url,
    siteName: "3D Бирка",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f1e8",
};

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-craft-sans",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-craft-serif",
});

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
          manrope.variable,
          cormorant.variable,
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
