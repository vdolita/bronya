import { z } from "zod";

export const SORT_ASC = "asc";
export const SORT_DESC = "desc";

export const sortEnum = z.enum([SORT_ASC, SORT_DESC]);
export type SortEnum = z.infer<typeof sortEnum>;
