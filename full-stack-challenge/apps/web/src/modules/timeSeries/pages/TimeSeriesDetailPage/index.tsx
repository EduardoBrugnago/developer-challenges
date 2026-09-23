import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isFulfilled } from "@reduxjs/toolkit";
import {
  Alert,
  Button,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hooks";
import { notify } from "../../../../app/store/notificationsSlice";
import { Modal } from "../../../../generic/components/Modal";
import { PageHeader } from "../../../../generic/components/PageHeader";
import { useModal } from "../../../../generic/hooks/useModal";
import { MetricsCards } from "../../components/MetricsCards";
import { TimeSeriesChart } from "../../components/TimeSeriesChart";
import { toTimeSeriesCsv } from "../../model/csv";
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
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    dispatch(
      fetchTimeSeriesDetail({
        id,
        range: {
          from: from ? new Date(from).toISOString() : undefined,
          to: to ? new Date(to).toISOString() : undefined,
        },
      }),
    );
  }, [dispatch, id, from, to]);

  const removeSeries = async () => {
    const result = await dispatch(deleteTimeSeries(id));
    if (!isFulfilled(result)) return false;
    dispatch(notify({ message: "Time series deleted", severity: "success" }));
    navigate("/time-series", { replace: true });
    return true;
  };

  const loading = status === "loading" || status === "idle";

  if (loading && (!series || !metrics)) {
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

  const exportCsv = () => {
    if (!series) return;
    const suffix = from || to ? `-${from || "start"}_${to || "end"}` : "";
    const url = URL.createObjectURL(
      new Blob([toTimeSeriesCsv(series.points)], { type: "text/csv" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${series.name}${suffix}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
          <>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportCsv}
              disabled={series.points.length === 0}
              data-testid="export-series-button"
            >
              Export CSV
            </Button>
            <Button
              color="error"
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={openDelete}
              data-testid="delete-series-button"
            >
              Delete
            </Button>
          </>
        }
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <TextField
          type="datetime-local"
          label="From"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ "data-testid": "series-from-input" }}
        />
        <TextField
          type="datetime-local"
          label="To"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ "data-testid": "series-to-input" }}
        />
        {(from || to) && (
          <Button
            onClick={() => {
              setFrom("");
              setTo("");
            }}
            data-testid="series-clear-range"
          >
            Clear period
          </Button>
        )}
      </Stack>

      {loading && <LinearProgress sx={{ mb: 1 }} />}

      <Stack>
        <MetricsCards metrics={metrics} unit={series.unit} />

        <Paper sx={{ p: { xs: 1, sm: 2 } }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ mb: 1, px: 1 }}
          >
            Signal · {series.points.length.toLocaleString()} points
          </Typography>
          <TimeSeriesChart points={series.points} unit={series.unit} />
        </Paper>
      </Stack>

      <Modal {...modal.props} />
    </>
  );
}
