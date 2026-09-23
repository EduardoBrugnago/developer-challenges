import { parseTimeSeriesCsv, toTimeSeriesCsv } from "./csv";

describe("toTimeSeriesCsv", () => {
  it("writes a header and one row per point, and parses back to the same points", () => {
    const points = [
      { timestamp: "2026-01-01T00:00:00.000Z", value: 1.5 },
      { timestamp: "2026-01-01T00:01:00.000Z", value: 2 },
    ];

    const csv = toTimeSeriesCsv(points);

    expect(csv.split("\n")[0]).toBe("timestamp,value");
    expect(csv.split("\n")).toHaveLength(3);
    expect(parseTimeSeriesCsv(csv).points).toEqual(points);
  });

  it("writes only the header when there are no points", () => {
    expect(toTimeSeriesCsv([])).toBe("timestamp,value");
  });
});

describe("parseTimeSeriesCsv", () => {
  it("parses rows and skips the header", () => {
    const { points, errors } = parseTimeSeriesCsv(
      "timestamp,value\n2026-01-01T00:00:00Z,1.5\n2026-01-01T00:01:00Z,2",
    );
    expect(errors).toEqual([]);
    expect(points).toEqual([
      { timestamp: "2026-01-01T00:00:00.000Z", value: 1.5 },
      { timestamp: "2026-01-01T00:01:00.000Z", value: 2 },
    ]);
  });

  it("reports invalid lines without failing the whole file", () => {
    const { points, errors } = parseTimeSeriesCsv(
      "2026-01-01T00:00:00Z,1\nnot-a-date,2\n2026-01-01T00:02:00Z,abc",
    );
    expect(points).toHaveLength(1);
    expect(errors).toHaveLength(2);
  });

  it("ignores blank lines and Windows line endings", () => {
    const { points } = parseTimeSeriesCsv(
      "2026-01-01T00:00:00Z,1\r\n\r\n2026-01-01T00:01:00Z,2\r\n",
    );
    expect(points).toHaveLength(2);
  });
});
