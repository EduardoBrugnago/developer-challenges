import reducer, {
  initialState,
  setMachineFilter,
  setPage,
  setSort,
} from "./monitoringPointsSlice";

describe("monitoringPointsSlice", () => {
  it("changes the page", () => {
    const state = reducer(initialState, setPage(3));
    expect(state.query.page).toBe(3);
  });

  it("resets to page 1 when sorting changes", () => {
    const onPage3 = reducer(initialState, setPage(3));
    const state = reducer(
      onPage3,
      setSort({ sortBy: "sensorModel", order: "desc" }),
    );
    expect(state.query).toMatchObject({
      page: 1,
      sortBy: "sensorModel",
      order: "desc",
    });
  });

  it("resets to page 1 when the machine filter changes", () => {
    const state = reducer(
      reducer(initialState, setPage(2)),
      setMachineFilter("m-1"),
    );
    expect(state.query).toMatchObject({ page: 1, machineId: "m-1" });
  });

  it("uses 5 items per page by default", () => {
    expect(initialState.query.limit).toBe(5);
  });
});
