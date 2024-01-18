"use server"

import { authenticate } from "@/lib/biz/auth"
import { AuthCredential, authCredential } from "@/lib/schemas"
import { isAuthenticated } from "@/lib/utils/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function login(
  formData: AuthCredential
): Promise<{ error?: string } | undefined> {
  // check if already logged in
  const isLoggedIn = await isAuthenticated()
  if (isLoggedIn) {
    return redirect("/dashboard")
  }

  const credential = authCredential.safeParse(formData)
  if (!credential.success) {
    return { error: credential.error.issues[0].message }
  }

  const { username, password } = credential.data
  let ssid: string

  try {
    const s = await authenticate(username, password)
    ssid = s.token
  } catch (err) {
    return { error: "Login fail" }
  }

  cookies().set("ssid", ssid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  })
  redirect("/dashboard")
}

export async function checkIsLoggedIn() {
  const isLoggedIn = await isAuthenticated()
  return isLoggedIn
}
