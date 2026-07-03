import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import {
  validateEmail,
  validateName,
  validatePassword,
  type FieldErrors,
} from "@/lib/auth/validation";

type RegisterBody = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  remember?: unknown;
};

export async function POST(request: Request) {
  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body.", fieldErrors: {} satisfies FieldErrors },
      { status: 400 },
    );
  }

  const name = typeof body.name === "string" ? body.name : "";
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const remember = body.remember === true;

  const fieldErrors: FieldErrors = {};
  const nameError = validateName(name);
  if (nameError) fieldErrors.name = nameError;
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
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return NextResponse.json(
      {
        error: "An account with this email already exists. Try signing in instead.",
        fieldErrors: { email: "An account with this email already exists." } satisfies FieldErrors,
      },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    },
  });

  await createSession(user.id, { remember });

  return NextResponse.json(
    {
      user: { id: user.id, name: user.name, email: user.email },
    },
    { status: 201 },
  );
}
