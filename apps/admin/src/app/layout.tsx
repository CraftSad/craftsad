import { cn, ThemeProvider, Toaster } from "@acme/ui";
import type { Metadata, Viewport } from "next";

import { ORPCReactProvider } from "~/orpc/react";

import "~/app/styles.css";

export const metadata: Metadata = {
  title: {
    default: "3dbirka — админ-панель",
    template: "%s — 3dbirka",
  },
  description: "Внутренняя панель управления заказами и клиентами 3dbirka.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#faf8f5",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background text-foreground min-h-screen font-sans antialiased",
        )}
      >
        <ThemeProvider>
          <ORPCReactProvider>{props.children}</ORPCReactProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
