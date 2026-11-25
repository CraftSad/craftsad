import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { eq, session, user } from "@acme/db";
import { createTestDb } from "@acme/db/testing";

import { initAuth } from ".";
import { hasAdminRole, isAdmin } from "./roles";

// ADMIN_EMAILS is pinned by test/setup.ts (and packages/api/test/setup.ts).
const ADMIN_EMAIL = "admin@test.local";

describe("hasAdminRole / isAdmin", () => {
  it("reads comma-separated Better Auth roles", () => {
    expect(hasAdminRole("admin")).toBe(true);
    expect(hasAdminRole("editor, admin")).toBe(true);
    expect(hasAdminRole("user")).toBe(false);
    expect(hasAdminRole(null)).toBe(false);
  });

  it("requires verification for the ADMIN_EMAILS fallback", () => {
    expect(
      isAdmin({ email: "ADMIN@test.local", emailVerified: true, role: "user" }),
    ).toBe(true);
    expect(
      isAdmin({
        email: "ADMIN@test.local",
        emailVerified: false,
        role: "user",
      }),
    ).toBe(false);
    expect(
      isAdmin({
        email: "someone@test.local",
        emailVerified: true,
        role: "user",
      }),
    ).toBe(false);
  });
});

describe("ADMIN_EMAILS bootstrap hooks", () => {
  let testDb: Awaited<ReturnType<typeof createTestDb>>;
  let auth: ReturnType<typeof initAuth>;
  const codes = new Map<string, string>();
  const links = new Map<string, string>();

  function makeAuth(adminOnly = false) {
    return initAuth({
      baseUrl: "http://localhost:3000",
      productionUrl: "http://localhost:3000",
      secret: "test-secret-0123456789-0123456789-abcdef",
      database: testDb.db,
      adminOnly,
      sendEmail: async ({ email, otp, url, type }) => {
        if (otp) codes.set(email, otp);
        if (url) links.set(type, url);
      },
    });
  }

  beforeEach(async () => {
    testDb = await createTestDb();
    auth = makeAuth();
  });
  afterEach(() => {
    codes.clear();
    links.clear();
    return testDb.close();
  });

  async function signInWithCode(email: string, instance = auth) {
    await instance.api.sendVerificationOTP({
      body: { email, type: "sign-in" },
    });
    const otp = codes.get(email);
    if (!otp) throw new Error("OTP was not sent");
    await instance.api.signInEmailOTP({ body: { email, otp } });
  }

  async function roleOf(email: string) {
    const [row] = await testDb.db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.email, email));
    return row?.role;
  }

  it("gives new users the default role and listed emails the admin role", async () => {
    await signInWithCode("regular@test.local");
    await signInWithCode(ADMIN_EMAIL);

    expect(await roleOf("regular@test.local")).toBe("customer");
    expect(await roleOf(ADMIN_EMAIL)).toBe("admin");
  });

  it("rejects customer sign-in before inserting an admin session", async () => {
    const storefrontEmail = "regular@test.local";
    await signInWithCode(storefrontEmail);
    const { rateLimit } = await import("@acme/db");
    await testDb.db.delete(rateLimit);

    const adminAuth = makeAuth(true);
    await expect(
      signInWithCode(storefrontEmail, adminAuth),
    ).rejects.toMatchObject({
      status: "FORBIDDEN",
    });
    expect(await testDb.db.select().from(session)).toHaveLength(1);
    expect(await roleOf(storefrontEmail)).toBe("customer");

    await testDb.db.insert(user).values({
      id: crypto.randomUUID(),
      name: "Bootstrap admin",
      email: ADMIN_EMAIL,
      role: "customer",
    });
    await signInWithCode(ADMIN_EMAIL, adminAuth);
    expect(await roleOf(ADMIN_EMAIL)).toBe("admin");
    expect(await testDb.db.select().from(session)).toHaveLength(2);
  });

  it("promotes a listed account on sign-in", async () => {
    await signInWithCode(ADMIN_EMAIL);
    await testDb.db
      .update(user)
      .set({ role: "user" })
      .where(eq(user.email, ADMIN_EMAIL));

    // A fresh code is required for the next sign-in; clear only the send limit.
    const { rateLimit } = await import("@acme/db");
    await testDb.db.delete(rateLimit);
    await signInWithCode(ADMIN_EMAIL);

    expect(await roleOf(ADMIN_EMAIL)).toBe("admin");
  });

  it("does not grant an admin role or password session until email verification", async () => {
    const credentials = { email: ADMIN_EMAIL, password: "test-password-123" };
    const signup = await auth.api.signUpEmail({
      body: { ...credentials, name: "Admin", callbackURL: "/auth/login" },
    });
    expect(signup.token).toBeNull();
    expect(await roleOf(ADMIN_EMAIL)).toBe("customer");
    await expect(
      auth.api.signInEmail({ body: credentials }),
    ).rejects.toMatchObject({
      body: { code: "EMAIL_NOT_VERIFIED" },
    });
    expect(await testDb.db.select().from(session)).toHaveLength(0);

    const link = links.get("email-verification");
    if (!link) throw new Error("Verification email was not sent");
    expect(
      (await auth.handler(new Request(link))).headers.get("location"),
    ).toBeTruthy();
    expect(
      (await auth.api.signInEmail({ body: credentials })).token,
    ).toBeTruthy();
    expect(await roleOf(ADMIN_EMAIL)).toBe("admin");
  });

  it("sends a reset link that can be used to change the password", async () => {
    const email = "reset@test.local";
    await signInWithCode(email);
    const response = await auth.api.requestPasswordReset({
      body: { email, redirectTo: "/auth/reset-password" },
    });
    expect(response.status).toBe(true);
    const link = links.get("forget-password");
    if (!link) throw new Error("Password reset email was not sent");
    const redirect = (await auth.handler(new Request(link))).headers.get(
      "location",
    );
    if (!redirect) throw new Error("Password reset link did not redirect");
    const target = new URL(redirect, link);
    expect(target.pathname).toBe("/auth/reset-password");
    const token = target.searchParams.get("token");
    if (!token) throw new Error("Missing password reset token");

    const password = "new-test-password-123";
    await auth.api.resetPassword({ body: { token, newPassword: password } });
    expect(
      (await auth.api.signInEmail({ body: { email, password } })).token,
    ).toBeTruthy();
  });
});
