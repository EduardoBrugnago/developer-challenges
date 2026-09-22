import { SENSOR_MODELS } from "@dynamoxtest/shared";
import { z } from "zod";

export const sensorSchema = z.object({
  uniqueId: z
    .string()
    .trim()
    .min(1, "Unique ID is required")
    .max(64, "Unique ID must be at most 64 characters")
    .regex(/^[A-Za-z0-9_-]+$/, 'Only letters, numbers, "-" and "_"'),
  model: z.enum(SENSOR_MODELS, { error: "Sensor model is required" }),
});

export type SensorFormValues = z.infer<typeof sensorSchema>;
