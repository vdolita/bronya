import getQueryAdapter from "@/query";
import {
  AR_ACTIVE,
  ActivationRecord,
  LCS_ACTIVE,
  ROLLING_CODE_LENGTH,
} from "@/schemas";
import { BadRequestError } from "@/utils/error";
import crypto from "crypto";

export async function activate(app: string, key: string, identityCode: string) {
  const q = getQueryAdapter();
  const license = await q.getLicenseByKey(key);

  if (!license) {
    throw new BadRequestError("Invalid license key");
  }

  // check license balance, status, app
  if (license.balanceActCount <= 0) {
    throw new BadRequestError("License balance is 0");
  }

  if (license.status !== LCS_ACTIVE) {
    throw new BadRequestError("License is not active");
  }

  if (license.app !== app) {
    throw new BadRequestError("Invalid app");
  }

  const ar = createActivationRecord(
    key,
    app,
    identityCode,
    license.duration,
    license.rollingDays
  );

  const isSuccess = await q.addArAndDeductLcs(ar);

  if (!isSuccess) {
    throw new BadRequestError("Operation failed");
  }

  return ar;
}

function createActivationRecord(
  key: string,
  app: string,
  identityCode: string,
  duration: number,
  rollingDays: number
): ActivationRecord {
  const rollingCode = generateRollingCode();
  const now = new Date();
  const expireAt = new Date(now.getTime() + duration * 24 * 3600 * 1000);

  const ar: ActivationRecord = {
    key,
    app,
    identityCode,
    rollingCode,
    activatedAt: now,
    expireAt,
    status: AR_ACTIVE,
    rollingDays,
  };

  if (rollingDays > 0) {
    ar.lastRollingAt = now;
  }

  return ar;
}

// generate a random string with length 8
function generateRollingCode() {
  return crypto
    .randomBytes(ROLLING_CODE_LENGTH)
    .toString("hex")
    .substring(0, ROLLING_CODE_LENGTH);
}
