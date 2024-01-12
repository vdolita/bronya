import { z } from "zod"

export const SORT_ASC = "asc"
export const SORT_DESC = "desc"

export const sortDirection = z.enum([SORT_ASC, SORT_DESC])
export type SortDirection = z.infer<typeof sortDirection>
