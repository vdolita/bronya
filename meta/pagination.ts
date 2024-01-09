import { z } from "zod";

export const pageOffset = z.union([z.string(), z.number()]).optional(); // page start offset
export type PageOffset = z.infer<typeof pageOffset>;
