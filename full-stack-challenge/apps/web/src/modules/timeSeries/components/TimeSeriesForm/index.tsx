import { useState, type ChangeEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  MAX_POINTS_PER_REQUEST,
  SENSOR_MODEL_LABELS,
  type CreateTimeSeriesRequest,
  type SensorOption,
} from "@dynamoxtest/shared";
import { SelectField } from "../../../../generic/components/SelectField";
import { parseTimeSeriesCsv } from "../../model/csv";
import { generateSampleSeries } from "../../model/sampleData";
import {
  seriesSchema,
  type SeriesFormValues,
  type SeriesSource,
} from "../../model/seriesSchema";

export const SERIES_FORM_ID = "time-series-form";

interface TimeSeriesFormProps {
  sensors: SensorOption[];
  onSubmit: (sensorId: string, body: CreateTimeSeriesRequest) => void;
}

export function TimeSeriesForm({ sensors, onSubmit }: TimeSeriesFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SeriesFormValues>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      sensorId: "",
      name: "",
      unit: "mm/s",
      source: "sample",
      sampleSize: 500,
      points: [],
    },
  });
  const [fileName, setFileName] = useState("");
  const [csvErrors, setCsvErrors] = useState<string[]>([]);

  const source = watch("source");
  const points = watch("points");

  const sensorOptions = sensors.map((sensor) => ({
    value: sensor.id,
    label: `${sensor.uniqueId} · ${SENSOR_MODEL_LABELS[sensor.model]} · ${sensor.machineName} / ${sensor.monitoringPointName}`,
  }));

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const parsed = parseTimeSeriesCsv(await file.text());
    setFileName(file.name);
    setCsvErrors(parsed.errors);
    setValue("points", parsed.points, { shouldValidate: true });
  };

  const submit = (values: SeriesFormValues) =>
    onSubmit(values.sensorId, {
      name: values.name,
      unit: values.unit || undefined,
      points:
        values.source === "sample"
          ? generateSampleSeries(values.sampleSize)
          : values.points,
    });

  return (
    <Stack
      component="form"
      id={SERIES_FORM_ID}
      noValidate
      spacing={2}
      sx={{ pt: 1 }}
      onSubmit={handleSubmit(submit)}
    >
      {sensors.length === 0 && (
        <Alert severity="warning">
          Add a sensor to a monitoring point first.
        </Alert>
      )}
      <Controller
        name="sensorId"
        control={control}
        render={({ field }) => (
          <SelectField
            label="Sensor"
            value={field.value}
            options={sensorOptions}
            onChange={field.onChange}
            error={!!errors.sensorId}
            helperText={errors.sensorId?.message}
            disabled={sensors.length === 0}
            required
            testId="series-sensor-select"
          />
        )}
      />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          {...register("name")}
          label="Name"
          error={!!errors.name}
          helperText={errors.name?.message}
          required
          fullWidth
          inputProps={{ maxLength: 100, "data-testid": "series-name-input" }}
        />
        <TextField
          {...register("unit")}
          label="Unit"
          error={!!errors.unit}
          helperText={errors.unit?.message}
          sx={{ minWidth: 120 }}
          inputProps={{ maxLength: 20 }}
        />
      </Stack>

      <Tabs
        value={source}
        onChange={(_, value: SeriesSource) =>
          setValue("source", value, { shouldValidate: true })
        }
      >
        <Tab value="sample" label="Generate sample data" />
        <Tab value="csv" label="Upload CSV" />
      </Tabs>

      {source === "sample" ? (
        <TextField
          {...register("sampleSize", { valueAsNumber: true })}
          type="number"
          label="Number of points"
          error={!!errors.sampleSize}
          helperText={
            errors.sampleSize?.message ??
            `Between 2 and ${MAX_POINTS_PER_REQUEST.toLocaleString()} points, one per minute`
          }
          inputProps={{ "data-testid": "series-size-input" }}
        />
      ) : (
        <Stack spacing={1}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
          >
            {fileName || "Choose CSV file"}
            <input
              hidden
              type="file"
              accept=".csv,text/csv"
              onChange={handleFile}
              data-testid="series-csv-input"
            />
          </Button>
          <Typography variant="caption" color="text.secondary">
            Format: <code>timestamp,value</code> per line (header optional).
            Example: <code>2026-09-20T10:00:00Z,2.13</code>
          </Typography>
          {fileName && (
            <Alert severity={points.length ? "success" : "error"}>
              {points.length} valid points read
            </Alert>
          )}
          {csvErrors.length > 0 && (
            <Alert severity="warning">
              {csvErrors.length} invalid line(s) ignored. First: {csvErrors[0]}
            </Alert>
          )}
          {errors.points && (
            <Alert severity="error">{errors.points.message}</Alert>
          )}
        </Stack>
      )}
    </Stack>
  );
}
