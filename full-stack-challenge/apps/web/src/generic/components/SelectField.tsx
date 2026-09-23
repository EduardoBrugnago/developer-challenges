import { Autocomplete, TextField } from "@mui/material";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T | "";
  options: SelectOption<T>[];
  onChange: (value: T | "") => void;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  testId?: string;
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  helperText,
  error,
  disabled,
  required,
  testId,
}: SelectFieldProps<T>) {
  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <Autocomplete
      options={options}
      value={selected}
      onChange={(_, option) => onChange(option?.value ?? "")}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, current) => option.value === current.value}
      disabled={disabled}
      fullWidth
      size="small"
      data-testid={testId}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
        />
      )}
    />
  );
}

/** Transform value list+ map label in select options */
export function toOptions<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): SelectOption<T>[] {
  return values.map((value) => ({ value, label: labels[value] }));
}
