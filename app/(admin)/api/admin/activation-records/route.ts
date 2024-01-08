import getQueryAdapter from "@/query";
import { ActivationRecord, getActRecordsReq } from "@/schemas";
import { isAuthenticated } from "@/utils/auth";
import { okRes, unauthorizedRes, zodValidationRes } from "@/utils/res";

/**
 * get activation records
 */
export async function GET(req: Request) {
  // check is authenticated
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return unauthorizedRes();
  }

  const q = getQueryAdapter();

  const url = new URL(req.url);
  const safeData = getActRecordsReq.safeParse(
    Object.fromEntries(url.searchParams)
  );

  if (!safeData.success) {
    return zodValidationRes(safeData.error);
  }

  const result: ActivationRecord[] = [];
  let lastOffset: string | number | undefined = undefined;

  // get by key
  if ("key" in safeData.data) {
    const { key, pageSize, offset } = safeData.data;

    const [records, cursor] = await q.getActRecordsByKey(key, {
      size: pageSize,
      offset,
    });
    result.push(...records);
    lastOffset = cursor;
  }

  // get by app and activated time
  if ("activatedAt" in safeData.data || "activatedAtSort" in safeData.data) {
    const { app, activatedAt, activatedAtSort, pageSize, offset } =
      safeData.data;

    const [records, cursor] = await q.getActRecordsByAppAndActivatedAt(
      app,
      activatedAt,
      activatedAtSort === "asc",
      { size: pageSize, offset }
    );
    result.push(...records);
    lastOffset = cursor;
  }

  // get by app and expire time
  if ("expireAt" in safeData.data || "expireAtSort" in safeData.data) {
    const { app, expireAt, expireAtSort, pageSize, offset } = safeData.data;

    const [records, cursor] = await q.getActRecordsByAppAndExpireAt(
      app,
      expireAt,
      expireAtSort === "asc",
      { size: pageSize, offset }
    );
    result.push(...records);
    lastOffset = cursor;
  }

  return okRes({
    data: result,
    lastOffset,
  });
}
