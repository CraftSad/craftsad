import { isAdmin } from "@acme/auth/roles";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  Skeleton,
} from "@acme/ui";
import { redirect } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { getSession } from "~/auth/server";
import { AdminSidebar } from "~/components/admin-sidebar";
import { DashboardHeader } from "~/components/dashboard-header";

/**
 * The shell is static; only the session-dependent sidebar streams in. The
 * admin check runs here (and again in every procedure) — `proxy.ts` is just an
 * optimistic redirect.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Suspense fallback={<SidebarSkeleton />}>
        <SessionSidebar />
      </Suspense>
      <SidebarInset>
        <DashboardHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

async function SessionSidebar() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (!isAdmin(session.user)) redirect("/login?error=forbidden");

  return (
    <AdminSidebar
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
    />
  );
}

function SidebarSkeleton() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="gap-2 p-2">
        {["70%", "55%", "80%", "60%"].map((width) => (
          <div key={width} className="flex h-8 items-center gap-2 px-2">
            <Skeleton className="size-4 rounded-md" />
            <Skeleton className="h-4" style={{ width }} />
          </div>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
