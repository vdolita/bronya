import { z } from "zod"
import { pageOffset } from "../meta"
import { licenseSchema } from "./license"

export const fetchLcsRes = z.object({
  success: z.boolean(),
  data: z.array(licenseSchema),
  lastOffset: pageOffset.optional(),
})
