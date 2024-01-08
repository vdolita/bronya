import { getActRecordsReq } from "@/schemas";
import { isAuthenticated } from "@/utils/auth";
import { unauthorizedRes, zodValidationRes } from "@/utils/res";

export async function GET(req: Request) {
  // check is authenticated
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return unauthorizedRes();
  }

  const url = new URL(req.url);
  const safeData = getActRecordsReq.safeParse(
    Object.fromEntries(url.searchParams)
  );

  if (!safeData.success) {
    return zodValidationRes(safeData.error);
  }

  // get by key
  if ("key" in safeData.data) {
    const { key } = safeData.data;
  }
}
