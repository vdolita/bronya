import { z } from "zod";

export const STATUS_ACT = "active";
export const STATUS_DISABLED = "disabled";

export const statusEnum = z.enum([STATUS_ACT, STATUS_DISABLED]);
export type StatusEnum = z.infer<typeof statusEnum>;
