import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Stack, TextField } from "@mui/material";
import {
  allowedSensorModels,
  MACHINE_TYPE_LABELS,
  SENSOR_MODEL_LABELS,
  type MonitoringPointListItem,
} from "@dynamoxtest/shared";
import { SelectField } from "../../../../generic/components/SelectField";
import { sensorSchema, type SensorFormValues } from "../../model/sensorSchema";

export const SENSOR_FORM_ID = "sensor-form";

interface SensorFormProps {
  point: MonitoringPointListItem;
  onSubmit: (values: SensorFormValues) => void;
}

export function SensorForm({ point, onSubmit }: SensorFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SensorFormValues>({
    resolver: zodResolver(sensorSchema),
    defaultValues: {
      uniqueId: point.sensor?.uniqueId ?? "",
      model: point.sensor?.model,
    },
  });

  const modelOptions = allowedSensorModels(point.machine.type).map((model) => ({
    value: model,
    label: SENSOR_MODEL_LABELS[model],
  }));
  
  const isPump = point.machine.type === "PUMP";

  return (
    <Stack
      component="form"
      id={SENSOR_FORM_ID}
      noValidate
      spacing={2}
      sx={{ pt: 1 }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Alert severity="info" variant="outlined">
        {point.name} · {point.machine.name} (
        {MACHINE_TYPE_LABELS[point.machine.type]})
      </Alert>
      <TextField
        {...register("uniqueId")}
        label="Sensor unique ID"
        error={!!errors.uniqueId}
        helperText={errors.uniqueId?.message ?? 'Letters, numbers, "-" and "_"'}
        required
        autoFocus
        inputProps={{ maxLength: 64, "data-testid": "sensor-uid-input" }}
      />
      <Controller
        name="model"
        control={control}
        render={({ field }) => (
          <SelectField
            label="Sensor model"
            value={field.value ?? ""}
            options={modelOptions}
            onChange={field.onChange}
            error={!!errors.model}
            helperText={
              errors.model?.message ??
              (isPump ? "TcAg and TcAs sensors are not allowed on pumps" : "")
            }
            required
            testId="sensor-model-select"
          />
        )}
      />
    </Stack>
  );
}
