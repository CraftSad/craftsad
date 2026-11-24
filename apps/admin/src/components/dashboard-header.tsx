"use client";

import { Separator, SidebarTrigger, ThemeToggle } from "@acme/ui";

export function DashboardHeader() {
  return (
    <header className="bg-background/80 sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="data-[orientation=vertical]:h-4"
        />
        <span className="text-sm font-medium">Админ-панель</span>
      </div>
      <ThemeToggle />
    </header>
  );
}
