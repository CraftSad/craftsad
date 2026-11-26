import { CookieBanner, cn, ThemeProvider, Toaster } from "@acme/ui";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Geist,
  Geist_Mono,
  Manrope,
} from "next/font/google";
import { ORPCReactProvider } from "~/orpc/react";
import { DEPLOYMENT_URL, INDEXING_ENABLED, SITE_URL } from "~/seo";

import "~/app/styles.css";
import "~/app/3dbirka.css";
import "~/app/brand.css";
import "~/app/error-pages.css";

export const metadata: Metadata = {
  metadataBase: new URL(DEPLOYMENT_URL),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  title: "3D Бирка — сад начинается с имени",
  description:
    "Прочные садовые бирки для рассады и грядок. Выберите форму, цвет и названия сортов. Доставка в пункты Ozon по России.",
  robots: INDEXING_ENABLED
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      }
    : {
        index: false,
        follow: false,
        nocache: true,
      },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    title: "3D Бирка — сад начинается с имени",
    description:
      "Прочные садовые бирки для рассады и грядок с доставкой в Ozon.",
    url: SITE_URL,
    siteName: "3D Бирка",
    images: [
      {
        url: "/images/3dbirka-garden.png",
        width: 1672,
        height: 941,
        alt: "Садовые 3D-бирки на грядке с томатами",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "3D Бирка — сад начинается с имени",
    description:
      "Прочные садовые бирки для рассады и грядок с доставкой в Ozon.",
    images: ["/images/3dbirka-garden.png"],
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
          <CookieBanner />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
