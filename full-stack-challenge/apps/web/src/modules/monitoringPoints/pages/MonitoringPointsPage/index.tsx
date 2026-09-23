import { useEffect } from "react";
import { isFulfilled } from "@reduxjs/toolkit";
import { Box, Button, Chip, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SensorsIcon from "@mui/icons-material/Sensors";
import {
  MACHINE_TYPE_LABELS,
  SENSOR_MODEL_LABELS,
  type MonitoringPointListItem,
  type MonitoringPointSortField,
} from "@dynamoxtest/shared";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hooks";
import { notify } from "../../../../app/store/notificationsSlice";
import { Modal } from "../../../../generic/components/Modal";
import { PageHeader } from "../../../../generic/components/PageHeader";
import { SelectField } from "../../../../generic/components/SelectField";
import {
  SortableTable,
  type Column,
} from "../../../../generic/components/SortableTable";
import { useModal } from "../../../../generic/hooks/useModal";
import { fetchMachineOptions } from "../../../machines/store/machinesSlice";
import {
  MonitoringPointForm,
  POINT_FORM_ID,
} from "../../components/MonitoringPointForm";
import { SENSOR_FORM_ID, SensorForm } from "../../components/SensorForm";
import type { PointFormValues } from "../../model/pointSchema";
import type { SensorFormValues } from "../../model/sensorSchema";
import {
  createMonitoringPoint,
  deleteMonitoringPoint,
  fetchMonitoringPoints,
  setMachineFilter,
  setPage,
  setSort,
  upsertSensor,
} from "../../store/monitoringPointsSlice";

const columns: Column<MonitoringPointListItem, MonitoringPointSortField>[] = [
  {
    id: "monitoringPointName",
    label: "Monitoring Point Name",
    sortKey: "monitoringPointName",
    render: (row) => row.name,
  },
  {
    id: "machineName",
    label: "Machine Name",
    sortKey: "machineName",
    render: (row) => row.machine.name,
  },
  {
    id: "machineType",
    label: "Machine Type",
    sortKey: "machineType",
    render: (row) => MACHINE_TYPE_LABELS[row.machine.type],
  },

  {
    id: "sensorModel",
    label: "Sensor Model",
    sortKey: "sensorModel",
    render: (row) =>
      row.sensor ? (
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={SENSOR_MODEL_LABELS[row.sensor.model]}
        />
      ) : (
        <Chip size="small" label="No sensor" />
      ),
  },
];

export function MonitoringPointsPage() {
  const dispatch = useAppDispatch();
  const { items, meta, query, status } = useAppSelector(
    (state) => state.monitoringPoints,
  );
  const machines = useAppSelector((state) => state.machines.options);
  const modal = useModal();

  useEffect(() => {
    dispatch(fetchMonitoringPoints());
  }, [dispatch, query]);

  useEffect(() => {
    dispatch(fetchMachineOptions());
  }, [dispatch]);

  const createPoint = async ({ machineId, name }: PointFormValues) => {
    const result = await dispatch(
      createMonitoringPoint({ machineId, body: { name } }),
    );
    if (!isFulfilled(result)) return false;
    dispatch(
      notify({ message: "Monitoring point created", severity: "success" }),
    );
    return true;
  };

  const saveSensor = async (
    point: MonitoringPointListItem,
    values: SensorFormValues,
  ) => {
    const result = await dispatch(
      upsertSensor({ pointId: point.id, body: values }),
    );
    if (!isFulfilled(result)) return false;
    dispatch(notify({ message: "Sensor saved", severity: "success" }));
    return true;
  };

  const removePoint = async (point: MonitoringPointListItem) => {
    const result = await dispatch(deleteMonitoringPoint(point.id));
    if (!isFulfilled(result)) return false;
    dispatch(
      notify({ message: "Monitoring point deleted", severity: "success" }),
    );
    return true;
  };

  const openCreate = () =>
    modal.open({
      title: "New monitoring point",
      icon: <AddIcon />,
      content: (
        <MonitoringPointForm
          onSubmit={(values) => modal.run(() => createPoint(values))}
        />
      ),
      formId: POINT_FORM_ID,
      confirmLabel: "Create",
      confirmTestId: "point-form-submit",
    });

  const openSensor = (point: MonitoringPointListItem) =>
    modal.open({
      title: point.sensor ? "Edit sensor" : "Add sensor",
      icon: <SensorsIcon />,
      content: (
        <SensorForm
          point={point}
          onSubmit={(values) => modal.run(() => saveSensor(point, values))}
        />
      ),
      formId: SENSOR_FORM_ID,
      confirmLabel: "Save",
      confirmTestId: "sensor-form-submit",
    });

  const openDelete = (point: MonitoringPointListItem) =>
    modal.open({
      title: "Delete monitoring point?",
      icon: <DeleteIcon color="error" />,
      content: `"${point.name}" and its sensor data will be permanently deleted.`,
      confirmLabel: "Delete",
      confirmColor: "error",
      confirmTestId: "confirm-dialog-confirm",
      onConfirm: () => removePoint(point),
    });

  return (
    <>
      <PageHeader
        title="Monitoring points"
        subtitle="Register sensors on your machines"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            data-testid="new-point-button"
          >
            New monitoring point
          </Button>
        }
      />

      <Box sx={{ mb: 2, maxWidth: { sm: 320 } }}>
        <SelectField
          label="Filter by machine"
          value={query.machineId ?? ""}
          options={machines.map((machine) => ({
            value: machine.id,
            label: machine.name,
          }))}
          onChange={(machineId) =>
            dispatch(setMachineFilter(machineId || undefined))
          }
          testId="point-machine-filter"
        />
      </Box>

      <SortableTable
        testId="monitoring-points-table"
        columns={columns}
        rows={items}
        getRowId={(row) => row.id}
        loading={status === "idle" || status === "loading"}
        emptyMessage="No monitoring points found"
        sort={{ by: query.sortBy, order: query.order }}
        onSortChange={({ by, order }) =>
          dispatch(setSort({ sortBy: by, order }))
        }
        pagination={{
          page: meta.page - 1,
          rowsPerPage: meta.limit,
          total: meta.total,
          onPageChange: (page) => dispatch(setPage(page + 1)),
        }}
        rowActions={(row) => (
          <>
            <Tooltip title={row.sensor ? "Edit sensor" : "Add sensor"}>
              <IconButton
                onClick={() => openSensor(row)}
                data-testid="set-sensor-button"
                aria-label={`Set sensor of ${row.name}`}
              >
                <SensorsIcon />
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
