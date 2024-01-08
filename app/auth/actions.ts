"use server";

import { getUserByUsername } from "@/query/user";
import { AuthCredential, authCredential } from "@/schemas";
import { isAuthenticated } from "@/utils/auth";
import { newSession } from "@/utils/session";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(
  formData: AuthCredential
): Promise<{ error?: string } | undefined> {
  // check if already logged in
  const isLoggedIn = await isAuthenticated();
  if (isLoggedIn) {
    return redirect("/dashboard");
  }

  const credential = authCredential.safeParse(formData);
  if (!credential.success) {
    return { error: credential.error.issues[0].message };
  }

  const { username, password } = credential.data;
  let ssid: string;

  try {
    const user = await mustGetUser(username, password);
    ssid = await newSession(user.username);
  } catch (err) {
    if (err instanceof Error) {
      return { error: err.message };
    } else {
      return { error: "Unknown error" };
    }
  }

  cookies().set("ssid", ssid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  redirect("/dashboard");
}

export async function checkIsLoggedIn() {
  const isLoggedIn = await isAuthenticated();
  return isLoggedIn;
}

async function mustGetUser(username: string, pwd: string) {
  const user = await getUserByUsername(username);

  if (!user) {
    throw new Error("User not found");
  }

  const hash = user.password;
  const match = await bcrypt.compare(pwd, hash!);

  if (!match) {
    throw new Error("Invalid password");
  }

  return {
    username: user.username,
  };
}
