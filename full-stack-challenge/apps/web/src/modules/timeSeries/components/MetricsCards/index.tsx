import { Card, CardContent, Grid, Typography } from "@mui/material";
import type { TimeSeriesMetrics } from "@dynamoxtest/shared";

interface MetricsCardsProps {
  metrics: TimeSeriesMetrics;
  unit?: string | null;
}

const format = (value: number | null, digits = 3) =>
  value === null ? "—" : value.toFixed(digits);

export function MetricsCards({ metrics, unit }: MetricsCardsProps) {
  const suffix = unit ? ` ${unit}` : "";
  const items = [
    { label: "Points", value: metrics.count.toLocaleString() },
    { label: "Min", value: format(metrics.min) + suffix },
    { label: "Max", value: format(metrics.max) + suffix },
    { label: "Mean", value: format(metrics.mean) + suffix },
    { label: "Median", value: format(metrics.median) + suffix },
    { label: "Std. deviation", value: format(metrics.stdDev) + suffix },
  ];

  return (
    <Grid container spacing={1} style={{ marginBottom: 8 }}>
      {items.map((item) => (
        <Grid item xs={6} sm={4} md={3} lg key={item.label}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {item.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
