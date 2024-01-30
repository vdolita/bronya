import { z } from "zod"

export const pageOffset = z.union([z.coerce.number(), z.string()])
export type PageOffset = z.infer<typeof pageOffset>

export const pager = z.object({
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  offset: pageOffset.optional(),
})
export type Pager = z.infer<typeof pager>
