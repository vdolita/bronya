import {
  appName,
  identityCode,
  labels,
  licenseKey,
  pageOffset,
  remark,
  rollingCode,
  sortDirection,
  statusEnum,
} from "@/lib/meta"
import { z } from "zod"

const MAX_AR_PAGE_SIZE = 50 // max 50 activation records response per request

const arPageSize = z.coerce
  .number()
  .int()
  .min(1)
  .max(MAX_AR_PAGE_SIZE)
  .default(20)

/** ----------------- Client start -------------------------- */

export const activationReq = z.object({
  app: appName,
  key: licenseKey,
  identityCode: identityCode,
})
export type ActivationReq = z.infer<typeof activationReq>

export const arAckReq = z.object({
  app: appName,
  key: licenseKey,
  identityCode: identityCode,
  rollingCode: rollingCode,
})
export type ArAckReq = z.infer<typeof arAckReq>

export const arSyncReq = arAckReq
export type ArSyncReq = ArAckReq

/** ------------------ Client end ------------------------- */

export const getActRecordsReqA = z.object({
  key: licenseKey,
  pageSize: arPageSize,
  offset: pageOffset.optional(),
})

export const getActRecordsReqB = z.object({
  app: appName,
  expireAt: z.coerce.date().optional(),
  expireAtSort: sortDirection.optional(),
  activatedAt: z.coerce.date().optional(),
  activatedAtSort: sortDirection.default("asc"),
  pageSize: arPageSize,
  offset: pageOffset.optional(),
})

export const getActRecordsReq = z.union([getActRecordsReqA, getActRecordsReqB])
export type GetActRecordsReq = z.infer<typeof getActRecordsReq>

export const updateActRecordReq = z
  .object({
    key: licenseKey,
    idCode: identityCode,
    status: statusEnum.optional(),
    remark: remark.optional(),
    labels: labels.optional(),
    expireAt: z.coerce.date().optional(),
  })
  .refine(
    (v) => {
      // check if all optional fields are undefined
      const { status, remark, labels, expireAt } = v
      return status || remark || labels || expireAt ? true : false
    },
    {
      message: "At least one field is required",
    }
  )

export type UpdateActRecordReq = z.infer<typeof updateActRecordReq>
