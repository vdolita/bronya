import { z } from "zod";

export const sortEnum = z.enum(["asc", "desc"]);

export const offset = z.union([z.string(), z.number()]).optional(); // page start offset
