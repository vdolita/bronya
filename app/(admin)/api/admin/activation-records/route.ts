import getQueryAdapter from "@/query";
import { getActRecordsReq, updateActRecordReq } from "@/schemas";
import { isAuthenticated } from "@/utils/auth";
import {
  handleErrorRes,
  okRes,
  unauthorizedRes,
  zodValidationRes,
} from "@/utils/res";

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

  // get activation records by app and expireAt/activatedAt
  const {
    app,
    expireAt,
    expireAtSort,
    activatedAt,
    activatedAtSort,
    pageSize,
    offset,
  } = safeData.data;

  if (expireAt || expireAtSort) {
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

/**
 * update activation records
 * @returns
 */
export async function PATCH(req: Request) {
  // check is authenticated
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return unauthorizedRes();
  }

  const q = getQueryAdapter();

  const data = await req.json();
  const safeData = updateActRecordReq.safeParse(data);

  if (!safeData.success) {
    return zodValidationRes(safeData.error);
  }

  const { key, idCode, ...rest } = safeData.data;

  try {
    const record = await q.updateActRecordByKey(key, idCode, rest);
    return okRes({
      data: record,
    });
  } catch (e) {
    return handleErrorRes(e);
  }
}
