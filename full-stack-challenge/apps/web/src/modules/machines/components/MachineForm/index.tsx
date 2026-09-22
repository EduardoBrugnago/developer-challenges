import { Controller, useForm, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, TextField } from "@mui/material";
import { MACHINE_TYPE_LABELS, MACHINE_TYPES } from "@dynamoxtest/shared";
import { SelectField, toOptions } from "../../../../generic/components/SelectField";
import { machineSchema, type MachineFormValues } from "../../model/machineSchema";

export const MACHINE_FORM_ID = "machine-form";

interface MachineFormProps {
  initialValues?: MachineFormValues;
  onSubmit: (values: MachineFormValues) => void;
}

const typeOptions = toOptions(MACHINE_TYPES, MACHINE_TYPE_LABELS);
const emptyValues: DefaultValues<MachineFormValues> = {
  name: "",
  type: undefined,
};

export function MachineForm({ initialValues, onSubmit }: MachineFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MachineFormValues>({
    resolver: zodResolver(machineSchema),
    defaultValues: initialValues ?? emptyValues,
  });

  return (
    <Stack
      component="form"
      id={MACHINE_FORM_ID}
      noValidate
      spacing={2}
      sx={{ pt: 1 }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextField
        {...register("name")}
        label="Name"
        error={!!errors.name}
        helperText={errors.name?.message}
        required
        autoFocus
        inputProps={{ maxLength: 100, "data-testid": "machine-name-input" }}
      />
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <SelectField
            label="Type"
            value={field.value ?? ""}
            options={typeOptions}
            onChange={field.onChange}
            error={!!errors.type}
            helperText={errors.type?.message}
            required
            testId="machine-type-select"
          />
        )}
      />
    </Stack>
  );
}
