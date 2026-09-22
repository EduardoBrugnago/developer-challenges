import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, TextField } from "@mui/material";
import {
  MACHINE_TYPE_LABELS,
  type MachineOption,
} from "@dynamoxtest/shared";
import { SelectField } from "../../../../generic/components/SelectField";
import { pointSchema, type PointFormValues } from "../../model/pointSchema";

export const POINT_FORM_ID = "monitoring-point-form";

interface MonitoringPointFormProps {
  machines: MachineOption[];
  onSubmit: (values: PointFormValues) => void;
}

export function MonitoringPointForm({
  machines,
  onSubmit,
}: MonitoringPointFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PointFormValues>({
    resolver: zodResolver(pointSchema),
    defaultValues: { machineId: "", name: "" },
  });

  const machineOptions = machines.map((machine) => ({
    value: machine.id,
    label: `${machine.name} (${MACHINE_TYPE_LABELS[machine.type]})`,
  }));

  return (
    <Stack
      component="form"
      id={POINT_FORM_ID}
      noValidate
      spacing={2}
      sx={{ pt: 1 }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        name="machineId"
        control={control}
        render={({ field }) => (
          <SelectField
            label="Machine"
            value={field.value}
            options={machineOptions}
            onChange={field.onChange}
            error={!!errors.machineId}
            helperText={
              machines.length === 0
                ? "Create a machine first"
                : errors.machineId?.message
            }
            disabled={machines.length === 0}
            required
            testId="point-machine-select"
          />
        )}
      />
      <TextField
        {...register("name")}
        label="Name"
        error={!!errors.name}
        helperText={errors.name?.message ?? 'e.g. "Motor drive-end bearing"'}
        required
        autoFocus
        inputProps={{ maxLength: 100, "data-testid": "point-name-input" }}
      />
    </Stack>
  );
}
