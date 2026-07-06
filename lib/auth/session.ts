import { cookies } from "next/headers";
import { randomBytes, createHmac, timingSafeEqual } from "crypto";

import prisma from "@/lib/prisma";

const SESSION_COOKIE = "nxteraa-session";
const REMEMBERED_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const STANDARD_SESSION_TTL_MS = 1000 * 60 * 60 * 24; // 1 day

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 16) {
    return secret;
  }
  // Dev fallback so the site can boot without env setup. Production must set SESSION_SECRET.
  return "nxteraa-dev-only-secret-do-not-use-in-prod-please-override";
}

function sign(token: string) {
  return createHmac("sha256", getSecret()).update(token).digest("hex");
}

function pack(token: string) {
  return `${token}.${sign(token)}`;
}

function unpack(value: string | undefined): string | null {
  if (!value) return null;
  const dotIndex = value.lastIndexOf(".");
  if (dotIndex <= 0) return null;
  const token = value.slice(0, dotIndex);
  const provided = value.slice(dotIndex + 1);
  const expected = sign(token);
  if (provided.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) {
      return null;
    }
  } catch {
    return null;
  }
  return token;
}

export async function createSession(
  userId: string,
  options?: {
    remember?: boolean;
  },
) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(
    Date.now() +
      (options?.remember ? REMEMBERED_SESSION_TTL_MS : STANDARD_SESSION_TTL_MS),
  );

  await prisma.session.create({
    data: {
      sessionToken: token,
      userId,
      expires,
    },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, pack(token), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });

  return token;
}

export async function destroyCurrentSession() {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  const token = unpack(raw);
  if (token) {
    await prisma.session.deleteMany({ where: { sessionToken: token } });
  }
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export type SessionUser = {
  id: string;
  name: string | null;
  email: string | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = unpack(store.get(SESSION_COOKIE)?.value);
  if (!token) return null;

  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!session) return null;
    if (session.expires.getTime() < Date.now()) {
      await prisma.session.delete({ where: { sessionToken: token } }).catch(() => {});
      return null;
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    };
  } catch (error) {
    // Fail closed: if the session store is unreachable (e.g. a transient
    // database outage) treat the request as unauthenticated rather than
    // throwing an unhandled error that crashes every authenticated page.
    console.error("Failed to resolve session user", error);
    return null;
  }
}

export function isAdminEmail(email: string | null | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    return false;
  }

  return email?.trim().toLowerCase() === adminEmail;
}

export async function requireUser(redirectTo = "/account/signin"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (user) return user;

  const store = await cookies();
  const intended = store.get("nxteraa-intended-path")?.value;
  // No throw in API routes; caller handles it.
  throw new AuthRequiredError(redirectTo, intended ?? null);
}

export class AuthRequiredError extends Error {
  constructor(public redirectTo: string, public intended: string | null) {
    super("Authentication required");
    this.name = "AuthRequiredError";
  }
}
