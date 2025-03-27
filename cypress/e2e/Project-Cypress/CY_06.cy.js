/// <reference types="cypress" />

context("Traversal", () => {
  beforeEach(() => {
    cy.visit("https://example.cypress.io/commands/traversal");
  });

  it("TS_CY_06_001 ทดสอบการเข้าถึง DOM elements ลูกด้วย .children()", () => {
    cy.get(".traversal-breadcrumb")
      .children(".active")
      .should("contain", "Data");
  });

  it("TS_CY_06_002 ทดสอบการเข้าถึง DOM elements บรรพบุรุษที่ใกล้ที่สุดด้วย .closest()", () => {
    cy.get(".traversal-badge").closest("ul").should("have.class", "list-group");
  });

  it("TS_CY_06_003 ทดสอบการเข้าถึง DOM element ที่ตำแหน่งเฉพาะด้วย .eq()", () => {
    cy.get(".traversal-list>li").eq(1).should("contain", "siamese");
  });

  it("TS_CY_06_004 ทดสอบการกรอง DOM elements ที่ตรงกับ selector ด้วย .filter()", () => {
    cy.get(".traversal-nav>li").filter(".active").should("contain", "About");
  });

  it("TS_CY_06_005 ทดสอบการค้นหา DOM elements ลูกหลานด้วย .find()", () => {
    cy.get(".traversal-pagination")
      .find("li")
      .find("a")
      .should("have.length", 7);
  });

  it("TS_CY_06_006 ทดสอบการเข้าถึง DOM element แรกด้วย .first()", () => {
    cy.get(".traversal-table td").first().should("contain", "1");
  });

  it("TS_CY_06_007 ทดสอบการเข้าถึง DOM element สุดท้ายด้วย .last()", () => {
    cy.get(".traversal-buttons .btn").last().should("contain", "Submit");
  });

  it("TS_CY_06_008 ทดสอบการเข้าถึง DOM element พี่น้องถัดไปด้วย .next()", () => {
    cy.get(".traversal-ul")
      .contains("apples")
      .next()
      .should("contain", "oranges");
  });

  it("TS_CY_06_009 ทดสอบการเข้าถึง DOM elements พี่น้องทั้งหมดถัดไปด้วย .nextAll()", () => {
    cy.get(".traversal-next-all")
      .contains("oranges")
      .nextAll()
      .should("have.length", 3);
  });

  it("TS_CY_06_010 ทดสอบการเข้าถึง DOM elements พี่น้องถัดไปจนถึง element ที่กำหนดด้วย .nextUntil()", () => {
    cy.get("#veggies").nextUntil("#nuts").should("have.length", 3);
  });

  it("TS_CY_06_011 ทดสอบการลบ DOM elements ออกจากชุดด้วย .not()", () => {
    cy.get(".traversal-disabled .btn")
      .not("[disabled]")
      .should("not.contain", "Disabled");
  });

  it("TS_CY_06_012 ทดสอบการเข้าถึง DOM element แม่ด้วย .parent()", () => {
    cy.get(".traversal-mark").parent().should("contain", "Morbi leo risus");
  });

  it("TS_CY_06_013 ทดสอบการเข้าถึง DOM elements แม่ทั้งหมดด้วย .parents()", () => {
    cy.get(".traversal-cite").parents().should("match", "blockquote");
  });

  it("TS_CY_06_014 ทดสอบการเข้าถึง DOM elements แม่จนถึง element ที่กำหนดด้วย .parentsUntil()", () => {
    cy.get(".clothes-nav")
      .find(".active")
      .parentsUntil(".clothes-nav")
      .should("have.length", 2);
  });

  it("TS_CY_06_015 ทดสอบการเข้าถึง DOM element พี่น้องก่อนหน้าด้วย .prev()", () => {
    cy.get(".birds").find(".active").prev().should("contain", "Lorikeets");
  });

  it("TS_CY_06_016 ทดสอบการเข้าถึง DOM elements พี่น้องก่อนหน้าทั้งหมดด้วย .prevAll()", () => {
    cy.get(".fruits-list").find(".third").prevAll().should("have.length", 2);
  });

  it("TS_CY_06_017 ทดสอบการเข้าถึง DOM elements พี่น้องก่อนหน้าจนถึง element ที่กำหนดด้วย .prevUntil()", () => {
    cy.get(".foods-list")
      .find("#nuts")
      .prevUntil("#veggies")
      .should("have.length", 3);
  });

  it("TS_CY_06_018 ทดสอบการเข้าถึง DOM elements พี่น้องทั้งหมดด้วย .siblings()", () => {
    cy.get(".traversal-pills .active").siblings().should("have.length", 2);
  });

  // เพิ่มกรณีทดสอบที่ fail
  it("TS_CY_06_019 ทดสอบการเข้าถึง DOM element ที่ไม่มีอยู่จริง", () => {

  });

  it("TS_CY_06_020 ทดสอบการตรวจสอบเนื้อหาที่ไม่ถูกต้อง", () => {

  });
});
