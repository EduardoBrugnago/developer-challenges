import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SortableTable, type Column } from "./SortableTable";

interface Row {
  id: string;
  name: string;
}

const columns: Column<Row, "name">[] = [
  { id: "name", label: "Name", sortKey: "name", render: (r) => r.name },
];
const rows: Row[] = [{ id: "1", name: "Alpha" }];

describe("SortableTable", () => {
  it("renders rows", () => {
    render(
      <SortableTable columns={columns} rows={rows} getRowId={(r) => r.id} />,
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });

  it("switches to descending when clicking a column already sorted ascending", async () => {
    const onSortChange = vi.fn();
    render(
      <SortableTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        sort={{ by: "name", order: "asc" }}
        onSortChange={onSortChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /name/i }));

    expect(onSortChange).toHaveBeenCalledWith({ by: "name", order: "desc" });
  });

  it("shows the empty message when there are no rows", () => {
    render(
      <SortableTable
        columns={columns}
        rows={[]}
        getRowId={(r) => r.id}
        emptyMessage="Nothing here"
      />,
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("converts MUI zero-based pages when paginating", async () => {
    const onPageChange = vi.fn();
    render(
      <SortableTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        pagination={{ page: 0, rowsPerPage: 5, total: 12, onPageChange }}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /next page/i }));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
