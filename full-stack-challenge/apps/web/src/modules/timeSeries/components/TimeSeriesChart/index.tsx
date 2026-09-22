import { useMemo } from "react";
import { Box, useTheme } from "@mui/material";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DataPointInput } from "@dynamoxtest/shared";

interface TimeSeriesChartProps {
  points: DataPointInput[];
  unit?: string | null;
}

const pad = (value: number) => String(value).padStart(2, "0");

const formatTimestamp = (t: number) => {
  const date = new Date(t);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${pad(
    date.getFullYear() % 100,
  )} - ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export function TimeSeriesChart({ points, unit }: TimeSeriesChartProps) {
  const theme = useTheme();

  const data = useMemo(
    () => points.map((p) => ({ t: Date.parse(p.timestamp), value: p.value })),
    [points],
  );

  return (
    <Box sx={{ width: "100%", height: { xs: 280, md: 400 } }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={formatTimestamp}
            minTickGap={42}
          />
          <YAxis width={56} tickFormatter={(v) => Number(v).toFixed(2)} />
          <Tooltip
            labelFormatter={(t) => formatTimestamp(Number(t))}
            formatter={(v) =>
              `${Number(v).toFixed(3)}${unit ? ` ${unit}` : ""}`
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name="Measured"
            stroke={theme.palette.primary.main}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
