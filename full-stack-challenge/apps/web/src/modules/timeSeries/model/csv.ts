import type { DataPointInput } from "@dynamoxtest/shared";

export interface CsvParseResult {
  points: DataPointInput[];
  errors: string[];
}

/**
 * Reads "timestamp,value" lines. Header is optional
 * timestamp anything Date.parse accepts
 * invalid lines are showed and skipped.
 */
export function parseTimeSeriesCsv(text: string): CsvParseResult {
  const points: DataPointInput[] = [];
  const errors: string[] = [];

  const lines = text.split(/\r?\n/).map((line) => line.trim());

  lines.forEach((line, index) => {
    if (!line) return;
    const [rawTimestamp, rawValue] = line
      .split(",")
      .map((cell) => cell?.trim());
    const time = Date.parse(rawTimestamp ?? "");
    const value = Number(rawValue);

    const isHeader = index === 0 && Number.isNaN(time);
    if (isHeader) return;

    if (
      Number.isNaN(time) ||
      rawValue === undefined ||
      rawValue === "" ||
      !Number.isFinite(value)
    ) {
      errors.push(`Line ${index + 1}: invalid row "${line}"`);
      return;
    }
    points.push({ timestamp: new Date(time).toISOString(), value });
  });

  return { points, errors };
}
