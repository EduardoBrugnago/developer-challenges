import { useEffect } from "react";
import { isFulfilled } from "@reduxjs/toolkit";
import { Button, Chip, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  MACHINE_TYPE_LABELS,
  type Machine,
  type MachineSortField,
} from "@dynamoxtest/shared";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hooks";
import { Modal } from "../../../../generic/components/Modal";
import { PageHeader } from "../../../../generic/components/PageHeader";
import {
  SortableTable,
  type Column,
} from "../../../../generic/components/SortableTable";
import { useModal } from "../../../../generic/hooks/useModal";
import { notify } from "../../../../app/store/notificationsSlice";
import {
  createMachine,
  deleteMachine,
  fetchMachines,
  setPage,
  setSort,
  updateMachine,
} from "../../store/machinesSlice";
import { MACHINE_FORM_ID, MachineForm } from "../../components/MachineForm";
import type { MachineFormValues } from "../../model/machineSchema";

const columns: Column<Machine, MachineSortField>[] = [
  { id: "name", label: "Name", sortKey: "name", render: (m) => m.name },
  {
    id: "type",
    label: "Type",
    sortKey: "type",
    render: (m) => <Chip size="small" label={MACHINE_TYPE_LABELS[m.type]} />,
  },
  {
    id: "monitoringPoints",
    label: "Monitoring points",
    render: (m) => m.monitoringPointsCount,
  },
  {
    id: "createdAt",
    label: "Created at",
    sortKey: "createdAt",
    render: (m) =>
      new Date(m.createdAt).toLocaleString(undefined, {
        dateStyle: "short",
        timeStyle: "short",
      }),
  },
];

export function MachinesPage() {
  const dispatch = useAppDispatch();
  const { items, meta, query, status } = useAppSelector(
    (state) => state.machines,
  );
  const modal = useModal();

  useEffect(() => {
    dispatch(fetchMachines());
  }, [dispatch, query]);

  const saveMachine = async (values: MachineFormValues, machine?: Machine) => {
    const result = machine
      ? await dispatch(updateMachine({ id: machine.id, changes: values }))
      : await dispatch(createMachine(values));
    if (!isFulfilled(result)) return false;
    dispatch(
      notify({
        message: machine ? "Machine updated" : "Machine created",
        severity: "success",
      }),
    );
    return true;
  };

  const removeMachine = async (machine: Machine) => {
    const result = await dispatch(deleteMachine(machine.id));
    if (!isFulfilled(result)) return false;
    dispatch(notify({ message: "Machine deleted", severity: "success" }));
    return true;
  };

  const openForm = (machine?: Machine) =>
    modal.open({
      title: machine ? "Edit machine" : "New machine",
      icon: machine ? <EditIcon /> : <AddIcon />,
      content: (
        <MachineForm
          initialValues={machine && { name: machine.name, type: machine.type }}
          onSubmit={(values) => modal.run(() => saveMachine(values, machine))}
        />
      ),
      formId: MACHINE_FORM_ID,
      confirmLabel: machine ? "Save" : "Create",
      confirmTestId: "machine-form-submit",
    });

  const openDelete = (machine: Machine) =>
    modal.open({
      title: "Delete machine?",
      icon: <DeleteIcon color="error" />,
      content: `"${machine.name}" and all its monitoring points, sensors and time series will be permanently deleted.`,
      confirmLabel: "Delete",
      confirmColor: "error",
      confirmTestId: "confirm-dialog-confirm",
      onConfirm: () => removeMachine(machine),
    });

  return (
    <>
      <PageHeader
        title="Machines"
        subtitle="Register the assets you want to monitor"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openForm()}
            data-testid="new-machine-button"
          >
            New machine
          </Button>
        }
      />

      <SortableTable
        columns={columns}
        rows={items}
        getRowId={(m) => m.id}
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
        loading={status === "idle" || status === "loading"}
        emptyMessage="No machines yet. Create your first one."
        testId="machines-table"
        rowActions={(machine) => (
          <>
            <Tooltip title="Edit">
              <IconButton
                onClick={() => openForm(machine)}
                aria-label={`Edit ${machine.name}`}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={() => openDelete(machine)}
                aria-label={`Delete ${machine.name}`}
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
