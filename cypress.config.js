// cypress.config.js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("after:run", (results) => {
        console.log("Test results written to mochawesome report");
      });
    },
    reporter: "mochawesome",
    reporterOptions: {
      reportDir: "cypress/reports",
      overwrite: true,
      html: false,
      json: true,
      reportFilename: "[name]", // กำหนดชื่อไฟล์ตาม spec file
      reportPageTitle: "Test Report", // ชื่อรายงาน
      charts: true,
      embeddedScreenshots: true,
      inlineAssets: true,
    },
  },
});
