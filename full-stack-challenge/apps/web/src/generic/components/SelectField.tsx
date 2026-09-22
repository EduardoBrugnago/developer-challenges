import { MenuItem, TextField } from "@mui/material";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T | "";
  options: SelectOption<T>[];
  onChange: (value: T) => void;
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
  return (
    <TextField
      select
      fullWidth
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      helperText={helperText}
      error={error}
      disabled={disabled}
      required={required}
      data-testid={testId}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

/** Transform value list+ map label in select options */
export function toOptions<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): SelectOption<T>[] {
  return values.map((value) => ({ value, label: labels[value] }));
}
