import { z } from "zod";

export const sortEnum = z.enum(["asc", "desc"]);
