import type { ReactNode } from "react";
import {
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import type { SortOrder } from "@dynamoxtest/shared";

export interface Column<Row, SortKey extends string> {
  id: string;
  label: string;
  sortKey?: SortKey;
  render: (row: Row) => ReactNode;
  align?: "left" | "right" | "center";
}

export interface SortState<SortKey extends string> {
  by: SortKey;
  order: SortOrder;
}

export interface PaginationState {
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface SortableTableProps<Row, SortKey extends string> {
  columns: Column<Row, SortKey>[];
  rows: Row[];
  getRowId: (row: Row) => string;
  sort?: SortState<SortKey>;
  onSortChange?: (sort: SortState<SortKey>) => void;
  pagination?: PaginationState;
  loading?: boolean;
  emptyMessage?: string;
  rowActions?: (row: Row) => ReactNode;
  testId?: string;
}

export function SortableTable<Row, SortKey extends string>({
  columns,
  rows,
  getRowId,
  sort,
  onSortChange,
  pagination,
  loading = false,
  emptyMessage = "No data",
  rowActions,
  testId,
}: SortableTableProps<Row, SortKey>) {
  const totalColumns = columns.length + (rowActions ? 1 : 0);

  const handleSort = (key: SortKey) => {
    const order: SortOrder =
      sort?.by === key && sort.order === "asc" ? "desc" : "asc";
    onSortChange?.({ by: key, order });
  };

  return (
    <Paper>
      <TableContainer>
        {loading && <LinearProgress />}
        <Table sx={{ minWidth: 640 }} data-testid={testId}>
          <TableHead>
            <TableRow>
              {columns.map((column) => {
                const active =
                  Boolean(column.sortKey) && sort?.by === column.sortKey;
                return (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    sortDirection={active ? sort?.order : false}
                  >
                    {column.sortKey ? (
                      <TableSortLabel
                        active={active}
                        direction={active ? sort?.order : "asc"}
                        onClick={() => handleSort(column.sortKey as SortKey)}
                        data-testid={`sort-${column.id}`}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                );
              })}
              {rowActions && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowId(row)} hover>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align}>
                    {column.render(row)}
                  </TableCell>
                ))}
                {rowActions && (
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    {rowActions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={totalColumns}>
                  <Typography
                    color="text.secondary"
                    align="center"
                    sx={{ py: 3 }}
                  >
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page}
          rowsPerPage={pagination.rowsPerPage}
          rowsPerPageOptions={[]}
          onPageChange={(_, page) => pagination.onPageChange(page)}
        />
      )}
    </Paper>
  );
}
