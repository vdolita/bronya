import { z } from "zod";
import { identityCode, rollingCode } from "./activation-record";
import { appName } from "./app";
import { licenseKey } from "./license";

export const actReq = z.object({
  type: z.literal("LSC-ACT"),
  key: licenseKey,
  app: appName,
  identityCode: identityCode,
});

export const verifyReq = z.object({
  type: z.literal("LSC-VFY"),
  key: licenseKey,
  app: appName,
  rollingCode: rollingCode,
  identityCode: identityCode,
});

export const clientReq = z.union([actReq, verifyReq]);
