import { getSession } from "@/query/session";
import { cookies, headers } from "next/headers";

export async function isAuthenticated() {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const cookieStore = cookies();
  const token =
    cookieStore.get("ssid")?.value || headers().get("authorization");
  if (!token) {
    return false;
  }

  const s = await getSession(token);
  if (!s) {
    return false;
  }

  // TODO: extend session ttl

  return true;
}
