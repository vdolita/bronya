import { z } from "zod"

export const pageOffset = z.union([z.coerce.number(), z.string()])
export type PageOffset = z.infer<typeof pageOffset>

export const pager = z.object({
  size: z.number().int().min(1),
  offset: pageOffset.optional(),
})
export type Pager = z.infer<typeof pager>
