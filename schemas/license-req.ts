import { z } from "zod";
import { appName } from "./app";
import {
  labels,
  licenseDuration,
  licenseKey,
  licenseSchema,
  rollingDays,
  totalActCount,
} from "./license";

const MAX_GENERATE_LICENSES = 10000; // max generate 10000 licenses at once
const MAX_REQ_LCS_SIZE = 50; // max 50 licenses response per request

const order = z.enum(["asc", "desc"]);

export const createLicenseReq = z.object({
  app: appName,
  validFrom: z.coerce.date(),
  quantity: z.coerce.number().int().min(1).max(MAX_GENERATE_LICENSES),
  days: licenseDuration,
  totalActTimes: totalActCount,
  rollingDays: rollingDays,
  labels: labels,
});

export type CreateLicenseReq = z.infer<typeof createLicenseReq>;

const getLicenseReqA = z.object({
  key: licenseKey,
});

const getLicenseReqB = z.object({
  app: appName,
  createdAt: z.coerce.date().optional(),
  createdAtSort: order.default("asc"),
  pageSize: z.coerce.number().int().min(1).max(MAX_REQ_LCS_SIZE).default(20),
  offset: z.union([z.string(), z.number()]).optional(),
});

export const getLicenseReq = z.union([getLicenseReqA, getLicenseReqB]);

export type GetLicenseReq = z.infer<typeof getLicenseReq>;

export const updateLicenseReq = licenseSchema
  .pick({
    key: true,
    status: true,
    remarks: true,
    labels: true,
  })
  .partial()
  .required({
    key: true,
  });

export type UpdateLicenseReq = z.infer<typeof updateLicenseReq>;
