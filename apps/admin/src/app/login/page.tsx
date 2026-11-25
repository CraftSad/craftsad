import { isAdmin } from "@acme/auth/roles";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getSession } from "~/auth/server";
import { LoginForm } from "~/components/login-form";

export const metadata = {
  title: "Вход",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

async function RedirectIfSignedIn() {
  const session = await getSession();
  if (session?.user && isAdmin(session.user)) redirect("/");
  return null;
}
