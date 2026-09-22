import { MAX_POINTS_PER_REQUEST } from "@dynamoxtest/shared";
import { z } from "zod";

export const SERIES_SOURCES = ["sample", "csv"] as const;
export type SeriesSource = (typeof SERIES_SOURCES)[number];

const pointsRange = `Between 2 and ${MAX_POINTS_PER_REQUEST.toLocaleString()} points`;

export const seriesSchema = z
  .object({
    sensorId: z.string().min(1, "Sensor is required"),
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name must be at most 100 characters"),
    unit: z.string().trim().max(20, "Unit must be at most 20 characters"),
    source: z.enum(SERIES_SOURCES),
    sampleSize: z
      .number({ error: pointsRange })
      .int(pointsRange)
      .min(2, pointsRange)
      .max(MAX_POINTS_PER_REQUEST, pointsRange),
    points: z.array(z.object({ timestamp: z.string(), value: z.number() })),
  })
  .superRefine((values, ctx) => {
    if (values.source === "csv" && values.points.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["points"],
        message: "Choose a CSV file with at least one valid row",
      });
    }
  });

export type SeriesFormValues = z.infer<typeof seriesSchema>;
