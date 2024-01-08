import { z } from "zod";
import { identityCode, rollingCode } from "./activation-record";
import { appName } from "./app";
import { offset, sortEnum } from "./common";
import { licenseKey } from "./license";

const MAX_AR_PAGE_SIZE = 50; // max 50 activation records response per request

const arPageSize = z.coerce
  .number()
  .int()
  .min(1)
  .max(MAX_AR_PAGE_SIZE)
  .default(20);

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

export const getActRecordsReqA = z.object({
  key: licenseKey,
  pageSize: arPageSize,
  offset,
});

export const getActRecordsReqB = z.object({
  app: appName,
  activatedAt: z.coerce.date().optional(),
  activatedAtSort: sortEnum.default("asc"),
  pageSize: arPageSize,
  offset,
});

export const getActRecordsReqC = z.object({
  app: appName,
  expireAt: z.coerce.date().optional(),
  expireAtSort: sortEnum.default("asc"),
  pageSize: arPageSize,
  offset,
});

export const getActRecordsReq = z.union([
  getActRecordsReqA,
  getActRecordsReqB,
  getActRecordsReqC,
]);
export type GetActRecordsReq = z.infer<typeof getActRecordsReq>;
