import { z } from "zod";

export const pointSchema = z.object({
  machineId: z.string().min(1, "Machine is required"),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
});

export type PointFormValues = z.infer<typeof pointSchema>;
