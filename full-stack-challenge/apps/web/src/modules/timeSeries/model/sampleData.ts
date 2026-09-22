import type { DataPointInput } from "@dynamoxtest/shared";

export function generateSampleSeries(
  count = 500,
  intervalMs = 60_000,
  end = Date.now(),
): DataPointInput[] {
  const start = end - (count - 1) * intervalMs;
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(start + i * intervalMs).toISOString(),
    value: Number(
      (
        2 +
        Math.sin(i / 20) * 0.6 +
        i * 0.002 +
        (Math.random() - 0.5) * 0.3
      ).toFixed(4),
    ),
  }));
}
