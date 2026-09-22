import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isFulfilled } from "@reduxjs/toolkit";
import {
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  SENSOR_MODEL_LABELS,
  type CreateTimeSeriesRequest,
  type TimeSeriesSummary,
} from "@dynamoxtest/shared";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hooks";
import { notify } from "../../../../app/store/notificationsSlice";
import { Modal } from "../../../../generic/components/Modal";
import { PageHeader } from "../../../../generic/components/PageHeader";
import {
  SortableTable,
  type Column,
} from "../../../../generic/components/SortableTable";
import { useModal } from "../../../../generic/hooks/useModal";
import {
  SERIES_FORM_ID,
  TimeSeriesForm,
} from "../../components/TimeSeriesForm";
import {
  createTimeSeries,
  deleteTimeSeries,
  fetchSensorOptions,
  fetchTimeSeriesOverview,
} from "../../store/timeSeriesSlice";

const columns: Column<TimeSeriesSummary, never>[] = [
  { id: "name", label: "Name", render: (row) => row.name },
  {
    id: "sensor",
    label: "Sensor",
    render: (row) =>
      `${row.sensor.uniqueId} (${SENSOR_MODEL_LABELS[row.sensor.model]})`,
  },
  {
    id: "location",
    label: "Machine / Point",
    render: (row) =>
      `${row.sensor.machineName} / ${row.sensor.monitoringPointName}`,
  },
  {
    id: "points",
    label: "Points",
    align: "right",
    render: (row) => row.pointsCount.toLocaleString(),
  },
  {
    id: "createdAt",
    label: "Created",
    render: (row) => new Date(row.createdAt).toLocaleString(),
  },
];

export function TimeSeriesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list, count, listStatus, sensors } = useAppSelector(
    (state) => state.timeSeries,
  );
  const modal = useModal();

  useEffect(() => {
    dispatch(fetchTimeSeriesOverview());
    dispatch(fetchSensorOptions());
  }, [dispatch]);

  const storeSeries = async (
    sensorId: string,
    body: CreateTimeSeriesRequest,
  ) => {
    const result = await dispatch(createTimeSeries({ sensorId, body }));
    if (!isFulfilled(result)) return false;
    dispatch(
      notify({
        message: `Stored ${result.payload.pointsCount} points`,
        severity: "success",
      }),
    );
    return true;
  };

  const removeSeries = async (series: TimeSeriesSummary) => {
    const result = await dispatch(deleteTimeSeries(series.id));
    if (!isFulfilled(result)) return false;
    dispatch(notify({ message: "Time series deleted", severity: "success" }));
    return true;
  };

  const openUpload = () =>
    modal.open({
      title: "Store time series",
      icon: <AddIcon />,
      maxWidth: "sm",
      content: (
        <TimeSeriesForm
          sensors={sensors}
          onSubmit={(sensorId, body) =>
            modal.run(() => storeSeries(sensorId, body))
          }
        />
      ),
      formId: SERIES_FORM_ID,
      confirmLabel: "Store",
      confirmTestId: "series-form-submit",
    });

  const openDelete = (series: TimeSeriesSummary) =>
    modal.open({
      title: "Delete time series?",
      icon: <DeleteIcon color="error" />,
      content: `"${series.name}" and all its ${series.pointsCount.toLocaleString()} points will be permanently deleted.`,
      confirmLabel: "Delete",
      confirmColor: "error",
      confirmTestId: "confirm-dialog-confirm",
      onConfirm: () => removeSeries(series),
    });

  return (
    <>
      <PageHeader
        title="Time series"
        subtitle="Raw sensor data stored on the server"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openUpload}
            data-testid="new-series-button"
          >
            Store time series
          </Button>
        }
      />

      <Card sx={{ mb: 2, maxWidth: 260 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            Stored time series
          </Typography>
          <Typography variant="h4" fontWeight={700} data-testid="series-count">
            {count ?? "—"}
          </Typography>
        </CardContent>
      </Card>

      <SortableTable
        testId="time-series-table"
        columns={columns}
        rows={list}
        getRowId={(row) => row.id}
        loading={listStatus === "idle" || listStatus === "loading"}
        emptyMessage="No time series stored yet"
        rowActions={(row) => (
          <>
            <Tooltip title="View">
              <IconButton
                onClick={() => navigate(`/time-series/${row.id}`)}
                aria-label={`View ${row.name}`}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={() => openDelete(row)}
                aria-label={`Delete ${row.name}`}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      />

      <Modal {...modal.props} />
    </>
  );
}
