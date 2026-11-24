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

  it("treats ADMIN_EMAILS as admins regardless of role", () => {
    expect(isAdmin({ email: "ADMIN@test.local", role: "user" })).toBe(true);
    expect(isAdmin({ email: "someone@test.local", role: "user" })).toBe(false);
  });
});

describe("ADMIN_EMAILS bootstrap hooks", () => {
  let testDb: Awaited<ReturnType<typeof createTestDb>>;
  let auth: ReturnType<typeof initAuth>;
  const codes = new Map<string, string>();

  function makeAuth(adminOnly = false) {
    return initAuth({
      baseUrl: "http://localhost:3000",
      productionUrl: "http://localhost:3000",
      secret: "test-secret-0123456789-0123456789-abcdef",
      database: testDb.db,
      adminOnly,
      sendEmail: async ({ email, otp }) => {
        if (otp) codes.set(email, otp);
      },
    });
  }

  beforeEach(async () => {
    testDb = await createTestDb();
    auth = makeAuth();
  });
  afterEach(() => {
    codes.clear();
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
});
