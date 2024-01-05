import { z } from "zod";
import { appName } from "./app";
import { licenseKey, rollingDays } from "./license";

export const AR_ACTIVE = "active";
export const AR_DISABLED = "disabled";

// activation record status
export const arStatus = z.enum([AR_ACTIVE, AR_DISABLED]);
export type ArStatus = z.infer<typeof arStatus>;

// client identity code, if your license can only use once, can set to a const in client, otherwise should be unique. i.e. machine code
export const identityCode = z.string().min(1).max(120);
export type IdentityCode = z.infer<typeof identityCode>;

// rolling Code, rotate every 30 days or consistent
export const rollingCode = z.string().min(8).max(120);
export type RollingCode = z.infer<typeof rollingCode>;

export const activationRecordSchema = z.object({
  key: licenseKey,
  app: appName,
  identityCode: identityCode,
  rollingCode: rollingCode,
  nxRollingCode: rollingCode.optional(),
  activatedAt: z.date(),
  expiredAt: z.date(),
  status: arStatus,
  lastRollingAt: z.date().optional(),
  rollingDays: rollingDays,
});

export type ActivationRecord = z.infer<typeof activationRecordSchema>;
