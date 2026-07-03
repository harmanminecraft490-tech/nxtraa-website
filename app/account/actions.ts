"use server";

import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";

export type RegisterState = {
  error?: string;
  success?: boolean;
};

function getSafeRedirectPath(input: FormDataEntryValue | null) {
  const value = String(input ?? "/account").trim();
  return value.startsWith("/") ? value : "/account";
}

export async function registerAccount(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"));

  if (name.length < 2) {
    return { error: "Please enter your full name." };
  }

  if (!email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });

  void redirectTo;

  return { success: true };
}
