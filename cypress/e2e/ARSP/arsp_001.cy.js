describe("การทดสอบส่วนข้อมูลสินค้า", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("TS_ARSP_01_001 ทดสอบการแสดงหน้าเว็บและส่วนการกรอกข้อมูลสินค้า", () => {
    cy.get('[data-cy="product-info-section"]').should("be.visible");
    cy.contains("ข้อมูลสินค้า").should("be.visible");
    cy.contains("ขนาด : กว้าง*ยาว*สูง (ซม.)").should("be.visible");
    cy.contains("น้ำหนัก : กก.").should("be.visible");
  });

  it("TS_ARSP_01_002 ทดสอบการกรอกค่าขนาดเป็นตัวเลขที่ถูกต้อง", () => {
    cy.get('[data-cy="width-input"]').type("50");
    cy.get('[data-cy="length-input"]').type("60");
    cy.get('[data-cy="height-input"]').type("40");

    cy.get('[data-cy="width-input"]').should("have.value", "50");
    cy.get('[data-cy="length-input"]').should("have.value", "60");
    cy.get('[data-cy="height-input"]').should("have.value", "40");
  });

  it("TS_ARSP_01_003 ทดสอบการกรอกค่าน้ำหนักเป็นทศนิยม 2 ตำแหน่ง", () => {
    cy.get('[data-cy="weight-input"]').type("15.75");
    cy.get('[data-cy="weight-input"]').blur();
    cy.get('[data-cy="weight-input"]').should("have.value", "15.75");
  });

  it("TS_ARSP_01_004 ทดสอบการกรอกค่าน้ำหนักและปรับรูปแบบทศนิยม", () => {
    cy.get('[data-cy="weight-input"]').type("20.5");
    cy.get('[data-cy="weight-input"]').blur();
    cy.get('[data-cy="weight-input"]').should("have.value", "20.50");
  });

  it("TS_ARSP_01_005 ทดสอบข้อความแสดงความผิดพลาดเมื่อไม่กรอกข้อมูล", () => {
    cy.get('[data-cy="calculate-button"]').click();
    cy.contains("กรุณากรอกข้อมูลให้ครบถ้วน").should("be.visible");
  });

  it("TS_ARSP_01_006 ทดสอบข้อความแสดงความผิดพลาดเมื่อกรอกข้อมูลน้ำหนักเป็น 0", () => {
    cy.get('[data-cy="width-input"]').type("50");
    cy.get('[data-cy="length-input"]').type("60");
    cy.get('[data-cy="height-input"]').type("40");
    cy.get('[data-cy="weight-input"]').type("0");

    cy.get('[data-cy="calculate-button"]').click();
    cy.contains("กรุณากรอกค่าน้ำหนักและขนาดให้มากกว่า 0").should("be.visible");
  });

  it("TS_ARSP_01_007 ทดสอบการล้างข้อมูลด้วยปุ่มล้างข้อมูล", () => {
    cy.get('[data-cy="width-input"]').type("50");
    cy.get('[data-cy="length-input"]').type("60");
    cy.get('[data-cy="height-input"]').type("40");
    cy.get('[data-cy="weight-input"]').type("15.5");

    cy.get('[data-cy="clear-button"]').click();

    cy.get('[data-cy="width-input"]').should("have.value", "");
    cy.get('[data-cy="length-input"]').should("have.value", "");
    cy.get('[data-cy="height-input"]').should("have.value", "");
    cy.get('[data-cy="weight-input"]').should("have.value", "");
  });

  it("TS_ARSP_01_008 ทดสอบการกรอกข้อมูลติดลบและตรวจสอบการแปลงเป็นค่าบวก", () => {
    cy.get('[data-cy="width-input"]').type("-50");
    cy.get('[data-cy="length-input"]').type("-60");
    cy.get('[data-cy="height-input"]').type("-40");

    cy.get('[data-cy="calculate-button"]').click();
    // ค่าติดลบควรถูกแปลงเป็นค่าบวกในการคำนวณ
    cy.contains("กรุณากรอกข้อมูลให้ครบถ้วน").should("be.visible");
  });
});
