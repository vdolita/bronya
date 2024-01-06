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
  internalErrorRes,
  unauthorizedRes,
  zodValidationRes,
} from "@/utils/res";
import { AttributeValue } from "@aws-sdk/client-dynamodb";

// list licenses
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
    const { app, createdAt, pageSize, lastKey, order } = safeData.data;

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

  return Response.json({
    success: true,
    lastKey: resLastKey,
    data: result.map((lcs) => ({ ...lcs, labels: lcs.labels })),
  });
}

// create licenses
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
      labels || []
    );

    return Response.json({
      success: true,
    });
  } catch (e) {
    console.error(e);
    return internalErrorRes();
  }
}

// update license
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

    return Response.json({
      success: true,
      data: license,
    });
  } catch (e) {
    console.error(e);
    return internalErrorRes();
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
