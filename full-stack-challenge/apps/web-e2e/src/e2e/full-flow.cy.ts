describe("Dynamox – main user flow", () => {
  const suffix = Date.now();
  const machineName = `E2E Pump ${suffix}`;
  const pointNames = [`Motor DE ${suffix}`, `Motor NDE ${suffix}`];
  const sensorId = `E2E-${suffix}`;
  const seriesName = `E2E Series ${suffix}`;

  // The period inputs are `datetime-local`, so the CSV is built from a local
  // time to keep both sides talking about the same instant.
  const day = "2026-03-01";
  const csv = [
    "timestamp,value",
    ...Array.from({ length: 10 }, (_, i) => {
      const at = new Date(`${day}T00:00`);
      at.setMinutes(at.getMinutes() + i);
      return `${at.toISOString()},${i + 1}`;
    }),
  ].join("\n");

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("blocks private routes for anonymous users", () => {
    cy.visit("/monitoring-points");
    cy.location("pathname").should("eq", "/login");
  });

  it("shows an error for wrong credentials", () => {
    cy.visit("/login");
    cy.get('[data-testid="login-email"]').type(Cypress.env("USER_EMAIL"));
    cy.get('[data-testid="login-password"]').type("wrong-password");
    cy.get('[data-testid="login-submit"]').click();
    cy.get('[data-testid="login-error"]').should(
      "contain",
      "Invalid email or password",
    );
  });

  it("manages machines, points, sensors and time series end to end", () => {
    cy.loginViaUi();

    // 1. Create a Pump machine
    cy.get('[data-testid="new-machine-button"]').click();
    cy.get('[data-testid="machine-name-input"]').type(machineName);
    cy.selectOption("machine-type-select", "Pump");
    cy.get('[data-testid="machine-form-submit"]').click();
    cy.contains("td", machineName).should("be.visible");

    // 2. Two monitoring points for it
    cy.get('[data-testid="nav-monitoring-points"]').click();
    pointNames.forEach((name) => {
      cy.get('[data-testid="new-point-button"]').click();
      cy.selectOption("point-machine-select", machineName);
      cy.get('[data-testid="point-name-input"]').type(name);
      cy.get('[data-testid="point-form-submit"]').click();
      cy.get('[role="dialog"]').should("not.exist");
    });

    // 3. Filter by machine keeps the list deterministic
    cy.selectOption("point-machine-filter", machineName);
    cy.get('[data-testid="monitoring-points-table"] tbody tr').should(
      "have.length",
      2,
    );

    // 4. A Pump only accepts HF+
    cy.contains("tr", pointNames[0])
      .find('[data-testid="set-sensor-button"]')
      .click();
    cy.get('[data-testid="sensor-uid-input"]').type(sensorId);
    cy.get(
      '[data-testid="sensor-model-select"] input[role="combobox"]',
    ).click();
    cy.get('[role="listbox"] li')
      .should("have.length", 1)
      .and("contain", "HF+");
    cy.get('[role="listbox"] li').first().click();
    cy.get('[data-testid="sensor-form-submit"]').click();
    cy.contains("tr", pointNames[0]).should("contain", "HF+");

    // 5. Sorting by point name descending puts "NDE" first
    cy.get('[data-testid="sort-monitoringPointName"]').click();
    cy.get('[data-testid="sort-monitoringPointName"]').click();
    cy.get('[data-testid="monitoring-points-table"] tbody tr')
      .first()
      .should("contain", pointNames[1]);

    // 6. Store a time series from a CSV with known timestamps
    cy.get('[data-testid="nav-time-series"]').click();
    cy.get('[data-testid="new-series-button"]').click();
    cy.selectOption("series-sensor-select", sensorId);
    cy.get('[data-testid="series-name-input"]').type(seriesName);
    cy.contains('button[role="tab"]', "Upload CSV").click();
    cy.get('[data-testid="series-csv-input"]').selectFile(
      { contents: Cypress.Buffer.from(csv), fileName: "points.csv" },
      { force: true },
    );
    cy.contains("10 valid points read").should("be.visible");
    cy.get('[data-testid="series-form-submit"]').click();
    cy.get('[role="dialog"]').should("not.exist");

    // 7. Filtering by sensor leaves only the series just stored
    cy.selectOption("series-sensor-filter", sensorId);
    cy.get('[data-testid="time-series-table"] tbody tr').should(
      "have.length",
      1,
    );

    // 8. The period filter narrows points and metrics
    cy.get(`[aria-label="View ${seriesName}"]`).click();
    cy.contains("Signal · 10 points").should("be.visible");
    cy.get('[data-testid="series-from-input"]').type(`${day}T00:02`);
    cy.get('[data-testid="series-to-input"]').type(`${day}T00:05`);
    cy.contains("Signal · 4 points").should("be.visible");
    cy.contains("Points").parent().should("contain", "4");

    // 9. Export of the filtered period
    cy.get('[data-testid="export-series-button"]').click();
    cy.readFile(`cypress/downloads/${seriesName}-${day}T00-02_${day}T00-05.csv`)
      .should("contain", "timestamp,value")
      .and((content: string) => {
        expect(content.trim().split("\n")).to.have.length(5);
      });

    // 10. Deleting the machine cascades to points, sensor and series
    cy.get('[data-testid="nav-machines"]').click();
    cy.contains("tr", machineName).find('[aria-label^="Delete"]').click();
    cy.get('[data-testid="confirm-dialog-confirm"]').click();
    cy.contains("td", machineName).should("not.exist");

    // 11. Logout
    cy.get('[data-testid="logout-button"]').click();
    cy.location("pathname").should("eq", "/login");
    cy.visit("/machines");
    cy.location("pathname").should("eq", "/login");
  });
});
