import { pager, sortDirection } from "@/lib/meta"
import { actRecordSchema } from "@/lib/schemas"
import { atLeastOne } from "@/lib/utils/zod"
import { z } from "zod"

export const getActRecordsReqA = actRecordSchema
  .pick({ key: true })
  .merge(pager)

export const getActRecordsReqB = actRecordSchema
  .pick({
    app: true,
    expireAt: true,
    activatedAt: true,
  })
  .extend({
    activatedAtSort: sortDirection.default("asc"),
    expireAtSort: sortDirection,
  })
  .merge(pager)
  .partial({ expireAt: true, activatedAt: true, expireAtSort: true })

export const getActRecordsReq = z.union([getActRecordsReqA, getActRecordsReqB])
export type GetActRecordsReq = z.infer<typeof getActRecordsReq>

export const updateActRecordReq = actRecordSchema
  .pick({
    key: true,
    identityCode: true,
    status: true,
    remark: true,
    labels: true,
    expireAt: true,
  })
  .partial({ status: true, remark: true, labels: true, expireAt: true })
  .refine(...atLeastOne(["status", "remark", "labels", "expireAt"]))

export type UpdateActRecordReq = z.infer<typeof updateActRecordReq>
