import { allowedSensorModels, isSensorModelAllowed } from "./domain";

describe("sensor/machine compatibility rule", () => {
  it.each([
    ["PUMP", "TC_AG", false],
    ["PUMP", "TC_AS", false],
    ["PUMP", "HF_PLUS", true],
    ["FAN", "TC_AG", true],
    ["FAN", "TC_AS", true],
    ["FAN", "HF_PLUS", true],
  ] as const)("%s + %s => %s", (machineType, model, expected) => {
    expect(isSensorModelAllowed(machineType, model)).toBe(expected);
  });

  it("only offers HF+ for pumps", () => {
    expect(allowedSensorModels("PUMP")).toEqual(["HF_PLUS"]);
  });

  it("offers every model for fans", () => {
    expect(allowedSensorModels("FAN")).toEqual(["HF_PLUS", "TC_AG", "TC_AS"]);
  });
});
