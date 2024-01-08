import { createLicense } from "@/biz/license";
import {
  getLicenseByKey,
  getLicensesByAppAndCreatedTime,
  updateLicenseByKey,
} from "@/query/license";
import {
  License,
  createLicenseReq,
  getLicenseReq,
  updateLicenseReq,
} from "@/schemas";
import { isAuthenticated } from "@/utils/auth";
import {
  handleErrorRes,
  okRes,
  unauthorizedRes,
  zodValidationRes,
} from "@/utils/res";
import { AttributeValue } from "@aws-sdk/client-dynamodb";

/**
 * @description get license list
 * @param {string} key - license key
 * @param {string} app - app name
 * @param {string} createdAt - created time
 * @param {number} pageSize - page size
 * @param {string} lastKey - last key cursor
 */
export async function GET(req: Request) {
  // check is authenticated
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return unauthorizedRes();
  }

  const url = new URL(req.url);
  const safeData = getLicenseReq.safeParse(
    Object.fromEntries(url.searchParams)
  );

  if (!safeData.success) {
    return zodValidationRes(safeData.error);
  }

  const result: License[] = [];
  let resLastKey: string | undefined = undefined;

  // query by key
  if ("key" in safeData.data) {
    const { key } = safeData.data;
    const license = await getLicenseByKey(key);

    if (license) {
      result.push(license);
    }
  }

  // query by app and created time
  if ("app" in safeData.data) {
    const {
      app,
      createdAt,
      pageSize,
      lastKey,
      createdAtSort: order,
    } = safeData.data;

    const [licenses, cursor] = await getLicensesByAppAndCreatedTime(
      app,
      createdAt,
      pageSize,
      order === "asc",
      decodeLastKey(lastKey)
    );

    if (licenses.length > 0) {
      result.push(...licenses);
    }

    resLastKey = encodeLastKey(cursor);
  }

  return okRes({
    lastKey: resLastKey,
    data: result,
  });
}

/**
 * @description Batch create licenses
 */
export async function POST(req: Request) {
  // check is authenticated
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return unauthorizedRes();
  }

  const data = await req.json();
  const safeData = createLicenseReq.safeParse(data);

  if (!safeData.success) {
    return zodValidationRes(safeData.error);
  }

  const { app, quantity, days, totalActTimes, validFrom, rollingDays, labels } =
    safeData.data;
  try {
    await createLicense(
      app,
      quantity,
      days,
      totalActTimes,
      validFrom,
      rollingDays,
      labels
    );

    return okRes();
  } catch (e) {
    return handleErrorRes(e);
  }
}

/**
 * Update single license
 * @param {string} key - license key
 * @param {string} status - license status
 * @param {string} remarks - license remarks
 * @param {Array} labels - license labels
 */
export async function PATCH(req: Request) {
  // check is authenticated
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return unauthorizedRes();
  }

  const data = await req.json();
  const safeData = updateLicenseReq.safeParse(data);

  if (!safeData.success) {
    return zodValidationRes(safeData.error);
  }

  const { key, ...rest } = safeData.data;
  try {
    const license = await updateLicenseByKey(key, rest);
    // TODO should be able to find license by label

    return okRes(license);
  } catch (e) {
    return handleErrorRes(e);
  }
}

function encodeLastKey(lastKey?: Record<string, AttributeValue>) {
  if (!lastKey) {
    return undefined;
  }

  const buf = Buffer.from(JSON.stringify(lastKey));
  return buf.toString("base64");
}

function decodeLastKey(encodedLastKey?: string) {
  if (!encodedLastKey) {
    return undefined;
  }

  const buf = Buffer.from(encodedLastKey, "base64");
  return JSON.parse(buf.toString("utf-8")) as Record<string, AttributeValue>;
}
