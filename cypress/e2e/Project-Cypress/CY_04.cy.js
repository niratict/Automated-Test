/// <reference types="cypress" />

context("Local Storage / Session Storage", () => {
  beforeEach(() => {
    cy.visit("https://example.cypress.io/commands/storage");
  });

  it("TS_CY_04_001 - ทดสอบการล้างข้อมูล localStorage ทั้งหมดสำหรับ origin ปัจจุบัน", () => {
    // https://on.cypress.io/clearlocalstorage
    cy.get(".ls-btn").click();
    cy.get(".ls-btn").should(() => {
      expect(localStorage.getItem("prop1")).to.eq("red");
      expect(localStorage.getItem("prop2")).to.eq("blue");
      expect(localStorage.getItem("prop3")).to.eq("magenta");
    });

    cy.clearLocalStorage();
    cy.getAllLocalStorage().should(() => {
      expect(localStorage.getItem("prop1")).to.be.null;
      expect(localStorage.getItem("prop2")).to.be.null;
      expect(localStorage.getItem("prop3")).to.be.null;
    });

    cy.get(".ls-btn").click();
    cy.get(".ls-btn").should(() => {
      expect(localStorage.getItem("prop1")).to.eq("red");
      expect(localStorage.getItem("prop2")).to.eq("blue");
      expect(localStorage.getItem("prop3")).to.eq("magenta");
    });

    // Clear key matching string in localStorage
    cy.clearLocalStorage("prop1");
    cy.getAllLocalStorage().should(() => {
      expect(localStorage.getItem("prop1")).to.be.null;
      expect(localStorage.getItem("prop2")).to.eq("blue");
      expect(localStorage.getItem("prop3")).to.eq("magenta");
    });

    cy.get(".ls-btn").click();
    cy.get(".ls-btn").should(() => {
      expect(localStorage.getItem("prop1")).to.eq("red");
      expect(localStorage.getItem("prop2")).to.eq("blue");
      expect(localStorage.getItem("prop3")).to.eq("magenta");
    });

    // Clear keys matching regex in localStorage
    cy.clearLocalStorage(/prop1|2/);
    cy.getAllLocalStorage().should(() => {
      expect(localStorage.getItem("prop1")).to.be.null;
      expect(localStorage.getItem("prop2")).to.be.null;
      expect(localStorage.getItem("prop3")).to.eq("magenta");
    });
  });

  it("TS_CY_04_002 - ทดสอบการดึงข้อมูล localStorage ทั้งหมดจากทุก origins", () => {
    // https://on.cypress.io/getalllocalstorage
    cy.get(".ls-btn").click();

    cy.getAllLocalStorage().should((storageMap) => {
      expect(storageMap).to.deep.equal({
        "https://example.cypress.io": {
          prop1: "red",
          prop2: "blue",
          prop3: "magenta",
        },
      });
    });
  });

  it("TS_CY_04_003 - ทดสอบการล้างข้อมูล localStorage ทั้งหมดจากทุก origins", () => {
    // https://on.cypress.io/clearalllocalstorage
    cy.get(".ls-btn").click();

    cy.clearAllLocalStorage();
    cy.getAllLocalStorage().should(() => {
      expect(localStorage.getItem("prop1")).to.be.null;
      expect(localStorage.getItem("prop2")).to.be.null;
      expect(localStorage.getItem("prop3")).to.be.null;
    });
  });

  it("TS_CY_04_004 - ทดสอบการดึงข้อมูล sessionStorage ทั้งหมดจากทุก origins", () => {
    // https://on.cypress.io/getallsessionstorage
    cy.get(".ls-btn").click();

    cy.getAllSessionStorage().should((storageMap) => {
      expect(storageMap).to.deep.equal({
        "https://example.cypress.io": {
          prop4: "cyan",
          prop5: "yellow",
          prop6: "black",
        },
      });
    });
  });

  it("TS_CY_04_005 - ทดสอบการล้างข้อมูล sessionStorage ทั้งหมดจากทุก origins", () => {
    // https://on.cypress.io/clearallsessionstorage
    cy.get(".ls-btn").click();

    cy.clearAllSessionStorage();
    cy.getAllSessionStorage().should(() => {
      expect(sessionStorage.getItem("prop4")).to.be.null;
      expect(sessionStorage.getItem("prop5")).to.be.null;
      expect(sessionStorage.getItem("prop6")).to.be.null;
    });
  });
});
