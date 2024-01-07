import { z } from "zod";
import { identityCode, rollingCode } from "./activation-record";
import { appName } from "./app";
import { licenseKey } from "./license";

export const activationReq = z.object({
  app: appName,
  key: licenseKey,
  identityCode: identityCode,
});
export type ActivationReq = z.infer<typeof activationReq>;

export const verifyReq = z.object({
  app: appName,
  key: licenseKey,
  identityCode: identityCode,
  rollingCode: rollingCode,
});
export type VerifyReq = z.infer<typeof verifyReq>;

export const rollingAckReq = z.object({
  app: appName,
  key: licenseKey,
  identityCode: identityCode,
  nxRollingCode: rollingCode,
});
export type RollingAckReq = z.infer<typeof rollingAckReq>;
