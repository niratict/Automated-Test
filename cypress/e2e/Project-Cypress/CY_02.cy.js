/// <reference types="cypress" />

context("Cookies", () => {
  beforeEach(() => {
    Cypress.Cookies.debug(true);

    cy.visit("https://example.cypress.io/commands/cookies");

    // ล้างคุกกี้อีกครั้งหลังจากเข้าชมเพื่อลบ
    // คุกกี้บุคคลที่สามที่ถูกเก็บ เช่น cloudflare
    cy.clearCookies();
  });

  it("TS_CY_02_001 cy.getCookie() - รับคุกกี้ของเบราว์เซอร์", () => {
    // https://on.cypress.io/getcookie
    cy.get("#getCookie .set-a-cookie").click();

    // cy.getCookie() ให้ผลลัพธ์เป็นออบเจกต์คุกกี้
    cy.getCookie("token").should("have.property", "value", "123ABC");
  });

  it("TS_CY_02_002 cy.getCookies() - รับคุกกี้เบราว์เซอร์สำหรับโดเมนปัจจุบัน", () => {
    // https://on.cypress.io/getcookies
    cy.getCookies().should("be.empty");

    cy.get("#getCookies .set-a-cookie").click();

    // cy.getCookies() ให้ผลลัพธ์เป็นอาร์เรย์ของคุกกี้
    cy.getCookies()
      .should("have.length", 1)
      .should((cookies) => {
        // คุกกี้แต่ละตัวมีคุณสมบัติเหล่านี้
        expect(cookies[0]).to.have.property("name", "token");
        expect(cookies[0]).to.have.property("value", "123ABC");
        expect(cookies[0]).to.have.property("httpOnly", false);
        expect(cookies[0]).to.have.property("secure", false);
        expect(cookies[0]).to.have.property("domain");
        expect(cookies[0]).to.have.property("path");
      });
  });

  it("TS_CY_02_003 cy.getAllCookies() - รับคุกกี้ทั้งหมดของเบราว์เซอร์", () => {
    // https://on.cypress.io/getallcookies
    cy.getAllCookies().should("be.empty");

    cy.setCookie("key", "value");
    cy.setCookie("key", "value", { domain: ".example.com" });

    // cy.getAllCookies() ให้ผลลัพธ์เป็นอาร์เรย์ของคุกกี้
    cy.getAllCookies()
      .should("have.length", 2)
      .should((cookies) => {
        // คุกกี้แต่ละตัวมีคุณสมบัติเหล่านี้
        expect(cookies[0]).to.have.property("name", "key");
        expect(cookies[0]).to.have.property("value", "value");
        expect(cookies[0]).to.have.property("httpOnly", false);
        expect(cookies[0]).to.have.property("secure", false);
        expect(cookies[0]).to.have.property("domain");
        expect(cookies[0]).to.have.property("path");

        expect(cookies[1]).to.have.property("name", "key");
        expect(cookies[1]).to.have.property("value", "value");
        expect(cookies[1]).to.have.property("httpOnly", false);
        expect(cookies[1]).to.have.property("secure", false);
        expect(cookies[1]).to.have.property("domain", ".example.com");
        expect(cookies[1]).to.have.property("path");
      });
  });

  it("TS_CY_02_004 cy.setCookie() - ตั้งค่าคุกกี้ของเบราว์เซอร์", () => {
    // https://on.cypress.io/setcookie
    cy.getCookies().should("be.empty");

    cy.setCookie("foo", "bar");

    // cy.getCookie() ให้ผลลัพธ์เป็นออบเจกต์คุกกี้
    cy.getCookie("foo").should("have.property", "value", "bar");
  });

  it("TS_CY_02_005 cy.clearCookie() - ล้างคุกกี้ของเบราว์เซอร์", () => {
    // https://on.cypress.io/clearcookie
    cy.getCookie("token").should("be.null");

    cy.get("#clearCookie .set-a-cookie").click();

    cy.getCookie("token").should("have.property", "value", "123ABC");

    // cy.clearCookies() ให้ผลลัพธ์เป็น null
    cy.clearCookie("token");

    cy.getCookie("token").should("be.null");
  });

  it("TS_CY_02_006 cy.clearCookies() - ล้างคุกกี้เบราว์เซอร์สำหรับโดเมนปัจจุบัน", () => {
    // https://on.cypress.io/clearcookies
    cy.getCookies().should("be.empty");

    cy.get("#clearCookies .set-a-cookie").click();

    cy.getCookies().should("have.length", 1);

    // cy.clearCookies() ให้ผลลัพธ์เป็น null
    cy.clearCookies();

    cy.getCookies().should("be.empty");
  });

  it("TS_CY_02_007 cy.clearAllCookies() - ล้างคุกกี้ทั้งหมดของเบราว์เซอร์", () => {
    // https://on.cypress.io/clearallcookies
    cy.getAllCookies().should("be.empty");

    cy.setCookie("key", "value");
    cy.setCookie("key", "value", { domain: ".example.com" });

    cy.getAllCookies().should("have.length", 2);

    // cy.clearAllCookies() ให้ผลลัพธ์เป็น null
    cy.clearAllCookies();

    cy.getAllCookies().should("be.empty");
  });
});
