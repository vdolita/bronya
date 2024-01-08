import { addApp, getApps } from "@/query/app";
import { createAppReq } from "@/schemas/app-req";
import { isAuthenticated } from "@/utils/auth";
import { okRes, unauthorizedRes, zodValidationRes } from "@/utils/res";

/**
 * @description get all apps
 */
export async function GET() {
  // check is authenticated
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return unauthorizedRes();
  }

  const apps = await getApps();
  return okRes(apps);
}

/**
 * @description Create a new app
 */
export async function POST(req: Request) {
  // check is authenticated
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return unauthorizedRes();
  }

  const data = await req.json();
  const safeData = createAppReq.safeParse(data);

  if (!safeData.success) {
    return zodValidationRes(safeData.error);
  }

  await addApp(safeData.data.name);

  return okRes();
}
