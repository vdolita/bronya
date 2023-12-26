import z from "zod";

export const authCredential = z.object({
  username: z.string().min(1).max(16),
  password: z.string().min(6).max(32),
});

export type AuthCredential = z.infer<typeof authCredential>;
