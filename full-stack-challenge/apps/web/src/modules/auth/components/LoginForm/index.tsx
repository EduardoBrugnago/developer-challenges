import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hooks";
import { loginSchema, type LoginFormValues } from "../../model/loginSchema";
import { login } from "../../store/authSlice";

export function LoginForm() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: 'onChange'
  });
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (values: LoginFormValues) => {
    dispatch(login(values));
  };

  const loading = status === "loading";

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {error && (
        <Alert severity="error" data-testid="login-error">
          {error}
        </Alert>
      )}
      <TextField
        {...register("email")}
        label="Email"
        type="email"
        autoComplete="email"
        required
        autoFocus
        error={!!errors.email}
        helperText={errors.email?.message}
        inputProps={{ "data-testid": "login-email" }}
      />
      <TextField
        {...register("password")}
        label="Password"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        required
        error={!!errors.password}
        helperText={errors.password?.message}
        inputProps={{ "data-testid": "login-password" }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((show) => !show)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={loading || !isValid}
        data-testid="login-submit"
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Sign in"}
      </Button>
    </Stack>
  );
}
