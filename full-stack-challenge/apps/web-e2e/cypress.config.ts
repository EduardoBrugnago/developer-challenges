const { nxE2EPreset } = require("@nx/cypress/plugins/cypress-preset");
const { defineConfig } = require("cypress");
module.exports = defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: "src",
      bundler: "vite",
      webServerCommands: {
        default: "npx nx run web:dev",
        production: "npx nx run web:preview",
      },
      ciWebServerCommand: "npx nx run web:preview",
      ciBaseUrl: "http://localhost:4300",
    }),
    baseUrl: "http://localhost:4200",
    downloadsFolder: "cypress/downloads",
    env: {
      USER_EMAIL: process.env.SEED_USER_EMAIL ?? "admin@dynamox.com",
      USER_PASSWORD: process.env.SEED_USER_PASSWORD ?? "dynamox123",
    },
  },
});
