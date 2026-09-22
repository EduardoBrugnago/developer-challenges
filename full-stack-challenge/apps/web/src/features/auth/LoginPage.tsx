import { useState } from "react";
import { Navigate, useLocation, type Location } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { login } from "./authSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "./loginSchema";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { token, status, error } = useAppSelector((state) => state.auth);
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

  const from =
    (location.state as { from?: Location } | null)?.from?.pathname ??
    "/machines";

  if (token) return <Navigate to={from} replace />;

  const onSubmit = (values: LoginFormValues) => {
    dispatch(login(values));
  };

  const loading = status === "loading";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
        bgcolor: "background.default",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 400 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Dynamox
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to manage your machines
          </Typography>

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
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign in"
              )}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
