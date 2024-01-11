import { z } from "zod";

export const STATUS_ACT_WAIT = "active_wait";
export const STATUS_ACT = "active";
export const STATUS_DISABLED = "disabled";
export const STATUS_EXPIRED = "expired";

export const statusEnum = z.enum([
  STATUS_ACT_WAIT,
  STATUS_ACT,
  STATUS_DISABLED,
  STATUS_EXPIRED,
]);
export type StatusEnum = z.infer<typeof statusEnum>;
