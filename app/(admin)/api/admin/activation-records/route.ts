import getQueryAdapter from "@/query";
import { getActRecordsReq } from "@/schemas";
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

  // get activation records by key
  if ("key" in safeData.data) {
    const { key, pageSize, offset } = safeData.data;

    const [records, cursor] = await q.getActRecordsByKey(key, {
      size: pageSize,
      offset,
    });

    return okRes({
      data: records,
      lastOffset: cursor,
    });
  }

  // get activation records by app and activatedAt
  if ("expireAtSort" in safeData.data) {
    const { app, expireAt, expireAtSort, pageSize, offset } = safeData.data;

    const [records, cursor] = await q.getActRecordsByAppAndExpireAt(
      app,
      expireAt,
      expireAtSort === "asc",
      { size: pageSize, offset }
    );

    return okRes({
      data: records,
      lastOffset: cursor,
    });
  }

  // fallback to get activation records by app and activatedAt
  const { app, activatedAt, activatedAtSort, pageSize, offset } = safeData.data;
  const [records, cursor] = await q.getActRecordsByAppAndActivatedAt(
    app,
    activatedAt,
    activatedAtSort === "asc",
    { size: pageSize, offset }
  );

  return okRes({
    data: records,
    lastOffset: cursor,
  });
}
