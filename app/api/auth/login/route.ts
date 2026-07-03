import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import {
  validateEmail,
  validatePassword,
  type FieldErrors,
} from "@/lib/auth/validation";

type LoginBody = {
  email?: unknown;
  password?: unknown;
  remember?: unknown;
};

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body.", fieldErrors: {} satisfies FieldErrors },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const remember = body.remember === true;

  const fieldErrors: FieldErrors = {};
  const emailError = validateEmail(email);
  if (emailError) fieldErrors.email = emailError;
  const passwordError = validatePassword(password);
  if (passwordError) fieldErrors.password = passwordError;

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields.", fieldErrors },
      { status: 400 },
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // Always run a hash compare to avoid leaking which emails exist.
  const storedHash = user?.passwordHash ?? "$2a$10$invalidplaceholderhashforbcryptcompare0000000000";
  const ok = await verifyPassword(password, storedHash);

  if (!user || !user.passwordHash || !ok) {
    return NextResponse.json(
      {
        error: "Incorrect email or password.",
        fieldErrors: { form: "Incorrect email or password." } satisfies FieldErrors,
      },
      { status: 401 },
    );
  }

  await createSession(user.id, { remember });

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email },
  });
}
