import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isFulfilled } from "@reduxjs/toolkit";
import {
  Alert,
  Button,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hooks";
import { notify } from "../../../../app/store/notificationsSlice";
import { Modal } from "../../../../generic/components/Modal";
import { PageHeader } from "../../../../generic/components/PageHeader";
import { useModal } from "../../../../generic/hooks/useModal";
import { MetricsCards } from "../../components/MetricsCards";
import { TimeSeriesChart } from "../../components/TimeSeriesChart";
import {
  deleteTimeSeries,
  fetchTimeSeriesDetail,
} from "../../store/timeSeriesSlice";

export function TimeSeriesDetailPage() {
  const { id = "" } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { series, metrics, status } = useAppSelector(
    (state) => state.timeSeries.detail,
  );
  const modal = useModal();

  useEffect(() => {
    dispatch(fetchTimeSeriesDetail(id));
  }, [dispatch, id]);

  const removeSeries = async () => {
    const result = await dispatch(deleteTimeSeries(id));
    if (!isFulfilled(result)) return false;
    dispatch(notify({ message: "Time series deleted", severity: "success" }));
    navigate("/time-series", { replace: true });
    return true;
  };

  if (status === "loading" || status === "idle") {
    return (
      <div data-testid="series-detail-skeleton">
        <Skeleton variant="text" width={140} height={36} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="text" width="60%" sx={{ mb: 3 }} />

        <Grid container spacing={1} sx={{ mb: 1 }}>
          {Array.from({ length: 6 }, (_, i) => (
            <Grid item xs={6} sm={4} md={3} lg key={i}>
              <Skeleton variant="rounded" height={88} />
            </Grid>
          ))}
        </Grid>

        <Skeleton
          variant="rounded"
          sx={{ height: { xs: 320, md: 440 }, mt: 2 }}
        />
      </div>
    );
  }

  if (status === "failed" || !series || !metrics) {
    return (
      <Alert
        severity="error"
        action={
          <Button onClick={() => navigate("/time-series")}>Back</Button>
        }
      >
        Could not load this time series.
      </Alert>
    );
  }

  const openDelete = () =>
    modal.open({
      title: "Delete time series?",
      icon: <DeleteIcon color="error" />,
      content: `"${series.name}" and all its ${metrics.count.toLocaleString()} points will be permanently deleted.`,
      confirmLabel: "Delete",
      confirmColor: "error",
      confirmTestId: "confirm-dialog-confirm",
      onConfirm: removeSeries,
    });

  return (
    <>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/time-series")}
        sx={{ mb: 1 }}
      >
        All time series
      </Button>
      <PageHeader
        title={series.name}
        subtitle={
          metrics.startAt && metrics.endAt
            ? `${new Date(metrics.startAt).toLocaleString()} → ${new Date(metrics.endAt).toLocaleString()}`
            : undefined
        }
        actions={
          <Button
            color="error"
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={openDelete}
            data-testid="delete-series-button"
          >
            Delete
          </Button>
        }
      />

      <Stack>
        <MetricsCards metrics={metrics} unit={series.unit} />

        <Paper sx={{ p: { xs: 1, sm: 2 } }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ mb: 1, px: 1 }}
          >
            Signal
          </Typography>
          <TimeSeriesChart points={series.points} unit={series.unit} />
        </Paper>
      </Stack>

      <Modal {...modal.props} />
    </>
  );
}
