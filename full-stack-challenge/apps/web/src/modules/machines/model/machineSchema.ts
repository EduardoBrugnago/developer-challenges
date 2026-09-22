import { MACHINE_TYPES } from "@dynamoxtest/shared";
import { z } from "zod";

export const machineSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  type: z.enum(MACHINE_TYPES, { error: "Type is required" }),
});

export type MachineFormValues = z.infer<typeof machineSchema>;
