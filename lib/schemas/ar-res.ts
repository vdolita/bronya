import { z } from "zod"
import { pageOffset } from "../meta"
import { actRecordSchema } from "./activation-record"

export const fetchArRes = z.object({
  success: z.boolean(),
  data: z.array(actRecordSchema),
  lastOffset: pageOffset.optional(),
})
