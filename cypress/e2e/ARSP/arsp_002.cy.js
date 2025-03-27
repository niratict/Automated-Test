describe("การทดสอบรูปแบบการคำนวณ", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("TS_ARSP_02_001 ทดสอบการเลือกรูปแบบการคำนวณเริ่มต้นเป็นรูปแบบของบริษัท", () => {
    cy.get('[data-cy="company-rate-radio"]').should("be.checked");
    cy.get('[data-cy="custom-rate-radio"]').should("not.be.checked");
  });

  it("TS_ARSP_02_002 ทดสอบการเปลี่ยนรูปแบบการคำนวณเป็นกำหนดเอง", () => {
    cy.get('[data-cy="custom-rate-radio"]').check();
    cy.get('[data-cy="custom-rate-radio"]').should("be.checked");
    cy.get('[data-cy="company-rate-radio"]').should("not.be.checked");
  });

  it("TS_ARSP_02_003 ทดสอบการปิดการใช้งานส่วนของบริษัทเมื่อเลือกรูปแบบกำหนดเอง", () => {
    cy.get('[data-cy="custom-rate-radio"]').check();

    // ตรวจสอบว่าส่วนของบริษัทถูกทำให้เป็น opacity ต่ำ
    cy.get('[data-cy="company-rates-section"]').should(
      "have.class",
      "opacity-50"
    );

    // ตรวจสอบปุ่มเลือกทั้งหมดในส่วนของบริษัท
    cy.get('[data-cy="customer-level-select"]').should("be.disabled");
    cy.get('[data-cy="product-type-select"]').should("be.disabled");
    cy.get('[data-cy="shipping-method-select"]').should("be.disabled");
  });

  it("TS_ARSP_02_004 ทดสอบการปิดการใช้งานส่วนกำหนดเองเมื่อเลือกรูปแบบของบริษัท", () => {
    cy.get('[data-cy="company-rate-radio"]').check();

    // ตรวจสอบว่าส่วนกำหนดเองถูกทำให้เป็น opacity ต่ำ
    cy.get('[data-cy="custom-rates-section"]').should(
      "have.class",
      "opacity-50"
    );

    // ตรวจสอบช่องกรอกทั้งหมดในส่วนกำหนดเอง
    cy.get('[data-cy="custom-rate-per-kg"]').should("be.disabled");
    cy.get('[data-cy="custom-rate-per-cbm"]').should("be.disabled");
  });

  it("TS_ARSP_02_005 ทดสอบการกรอกอัตราค่าขนส่งแบบกำหนดเอง", () => {
    cy.get('[data-cy="custom-rate-radio"]').check();
    cy.get('[data-cy="custom-rate-per-kg"]').type("50");
    cy.get('[data-cy="custom-rate-per-cbm"]').type("6000");

    cy.get('[data-cy="custom-rate-per-kg"]').should("have.value", "50");
    cy.get('[data-cy="custom-rate-per-cbm"]').should("have.value", "6000");
  });

  it("TS_ARSP_02_006 ทดสอบความผิดพลาดเมื่อไม่กรอกอัตราค่าขนส่งในรูปแบบกำหนดเอง", () => {
    cy.get('[data-cy="custom-rate-radio"]').check();
    cy.get('[data-cy="width-input"]').type("50");
    cy.get('[data-cy="length-input"]').type("60");
    cy.get('[data-cy="height-input"]').type("40");
    cy.get('[data-cy="weight-input"]').type("15");

    cy.get('[data-cy="calculate-button"]').click();
    cy.contains("กรุณากรอกอัตราค่าขนส่งให้ครบถ้วน").should("be.visible");
  });

  it("TS_ARSP_02_007 ทดสอบการล้างข้อมูลด้วยปุ่มล้างข้อมูลในรูปแบบกำหนดเอง", () => {
    cy.get('[data-cy="custom-rate-radio"]').check();
    cy.get('[data-cy="custom-rate-per-kg"]').type("50");
    cy.get('[data-cy="custom-rate-per-cbm"]').type("6000");

    cy.get('[data-cy="clear-button"]').click();

    cy.get('[data-cy="custom-rate-per-kg"]').should("have.value", "");
    cy.get('[data-cy="custom-rate-per-cbm"]').should("have.value", "");
  });

  it("TS_ARSP_02_008 ทดสอบการแสดงส่วนคำนวณด้วยเรทที่กำหนดเองเมื่อเลือกรูปแบบกำหนดเอง", () => {
    cy.get('[data-cy="custom-rate-radio"]').check();
    cy.contains("ข้อมูลการคำนวณด้วยเรทที่กำหนดเอง").should("be.visible");
    cy.get('[data-cy="custom-rates-section"]').should(
      "not.have.class",
      "opacity-50"
    );
  });
});
