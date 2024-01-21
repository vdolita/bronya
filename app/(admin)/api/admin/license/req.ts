import { createLcsData, updateLcsData } from "@/app/_action/license-req"
import { pager, sortDirection } from "@/lib/meta"
import { licenseSchema } from "@/lib/schemas"
import { z } from "zod"

const getLicenseReqA = licenseSchema.pick({ key: true })

const getLicenseReqB = licenseSchema
  .pick({ app: true, createdAt: true })
  .extend({
    createdAtSort: sortDirection.default("asc"),
  })
  .merge(pager)
  .partial({ createdAt: true })

export const getLicenseReq = z.union([getLicenseReqA, getLicenseReqB])

export const createLicenseReq = createLcsData

export const updateLicenseReq = updateLcsData
