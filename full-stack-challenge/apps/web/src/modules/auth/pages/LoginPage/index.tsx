import { Navigate, useLocation, type Location } from "react-router-dom";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { useAppSelector } from "../../../../app/store/hooks";
import { LoginForm } from "../../components/LoginForm";

export function LoginPage() {
  const location = useLocation();
  const token = useAppSelector((state) => state.auth.token);

  const from =
    (location.state as { from?: Location } | null)?.from?.pathname ??
    "/machines";

  if (token) return <Navigate to={from} replace />;

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
          <LoginForm />
        </CardContent>
      </Card>
    </Box>
  );
}
