import { Alert, Snackbar } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { dismiss } from "../store/notificationsSlice";

export function GlobalSnackbar() {
  const dispatch = useAppDispatch();
  const current = useAppSelector((state) => state.notifications.queue[0]);

  if (!current) return null;

  const handleClose = () => dispatch(dismiss(current.id));

  return (
    <Snackbar
      key={current.id}
      open
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={handleClose}
        severity={current.severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {current.message}
      </Alert>
    </Snackbar>
  );
}
