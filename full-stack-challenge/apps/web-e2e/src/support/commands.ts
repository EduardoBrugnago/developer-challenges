/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Types in the searchable select and picks the option by its text. */
      selectOption(testId: string, optionText: string): Chainable<void>;
      loginViaUi(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("selectOption", (testId: string, optionText: string) => {
  cy.get(`[data-testid="${testId}"] input[role="combobox"]`)
    .clear()
    .type(optionText);
  cy.get('[role="listbox"]').contains("li", optionText).click();
});

Cypress.Commands.add("loginViaUi", () => {
  cy.visit("/login");
  cy.get('[data-testid="login-email"]').type(Cypress.env("USER_EMAIL"));
  cy.get('[data-testid="login-password"]').type(Cypress.env("USER_PASSWORD"), {
    log: false,
  });
  cy.get('[data-testid="login-submit"]').click();
  cy.location("pathname").should("eq", "/machines");
});

export {};
