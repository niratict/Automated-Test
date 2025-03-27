describe("การทดสอบการคำนวณด้วยอัตราของบริษัท", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("TS_ARSP_03_001 ทดสอบการเลือกระดับของลูกค้า", () => {
    cy.get('[data-cy="customer-level-select"]').select("Diamond Rabbit");
    cy.get('[data-cy="customer-level-select"]').should(
      "have.value",
      "Diamond Rabbit"
    );
  });

  it("TS_ARSP_03_002 ทดสอบการเลือกประเภทสินค้า", () => {
    cy.get('[data-cy="product-type-select"]').select("สินค้าประเภทที่ 1,2");
    cy.get('[data-cy="product-type-select"]').should(
      "have.value",
      "สินค้าประเภทที่ 1,2"
    );
  });

  it("TS_ARSP_03_003 ทดสอบการเลือกวิธีการขนส่ง", () => {
    cy.get('[data-cy="shipping-method-select"]').select("ทางรถ");
    cy.get('[data-cy="shipping-method-select"]').should("have.value", "ทางรถ");
  });

  it("TS_ARSP_03_004 ทดสอบการคำนวณจากน้ำหนักที่มากกว่าน้ำหนักตามปริมาตร", () => {
    cy.get('[data-cy="width-input"]').type("10");
    cy.get('[data-cy="length-input"]').type("10");
    cy.get('[data-cy="height-input"]').type("10");
    cy.get('[data-cy="weight-input"]').type("5");
    cy.get('[data-cy="company-rate-radio"]').check();
    cy.get('[data-cy="calculate-button"]').click();

    // น้ำหนักตามปริมาตร = (10*10*10)/5000 = 0.2 กก. น้อยกว่าน้ำหนักจริง 5 กก.
    cy.get('[data-cy="calculation-result"]').should("be.visible");
    cy.contains("วิธีการคิดราคา:")
      .parent()
      .contains("คำนวณจากน้ำหนัก")
      .should("be.visible");
  });

  it("TS_ARSP_03_005 ทดสอบการคำนวณจากปริมาตรที่มากกว่าน้ำหนัก", () => {
    cy.get('[data-cy="width-input"]').type("100");
    cy.get('[data-cy="length-input"]').type("100");
    cy.get('[data-cy="height-input"]').type("100");
    cy.get('[data-cy="weight-input"]').type("1");
    cy.get('[data-cy="company-rate-radio"]').check();
    cy.get('[data-cy="calculate-button"]').click();

    // น้ำหนักตามปริมาตร = (100*100*100)/5000 = 200 กก. มากกว่าน้ำหนักจริง 1 กก.
    cy.get('[data-cy="calculation-result"]').should("be.visible");
    cy.contains("วิธีการคิดราคา:")
      .parent()
      .contains("คำนวณจากปริมาตร")
      .should("be.visible");
  });

  it("TS_ARSP_03_006 ทดสอบการแสดงผลลัพธ์การคำนวณที่ถูกต้องสำหรับลูกค้า Silver Rabbit", () => {
    cy.get('[data-cy="width-input"]').type("50");
    cy.get('[data-cy="length-input"]').type("50");
    cy.get('[data-cy="height-input"]').type("50");
    cy.get('[data-cy="weight-input"]').type("30");

    cy.get('[data-cy="customer-level-select"]').select("Silver Rabbit");
    cy.get('[data-cy="product-type-select"]').select("สินค้าทั่วไป");
    cy.get('[data-cy="shipping-method-select"]').select("ทางเรือ");

    cy.get('[data-cy="calculate-button"]').click();

    // อัตรา Silver Rabbit + ทางเรือ + สินค้าทั่วไป = 45 บาท/กก.
    // น้ำหนักจริง 30 กก. * 45 = 1,350 บาท
    cy.get('[data-cy="shipping-cost"]')
      .contains("1,350.00 บาท")
      .should("be.visible");
  });

  it("TS_ARSP_03_007 ทดสอบการแสดงผลลัพธ์การคำนวณสำหรับลูกค้า Diamond Rabbit", () => {
    cy.get('[data-cy="width-input"]').type("100");
    cy.get('[data-cy="length-input"]').type("100");
    cy.get('[data-cy="height-input"]').type("50");
    cy.get('[data-cy="weight-input"]').type("5");

    cy.get('[data-cy="customer-level-select"]').select("Diamond Rabbit");
    cy.get('[data-cy="product-type-select"]').select("สินค้าทั่วไป");
    cy.get('[data-cy="shipping-method-select"]').select("ทางเรือ");

    cy.get('[data-cy="calculate-button"]').click();

    // น้ำหนักตามปริมาตร = (100*100*50)/5000 = 100 กก. มากกว่าน้ำหนักจริง 5 กก.
    // ปริมาตร = (100*100*50)/1000000 = 0.5 คิว
    // อัตรา Diamond Rabbit + ทางเรือ + สินค้าทั่วไป = 4,900 บาท/คิว
    // ค่าขนส่ง = 0.5 * 4,900 = 2,450 บาท
    cy.get('[data-cy="shipping-cost"]')
      .contains("2,450.00 บาท")
      .should("be.visible");
  });

  it("TS_ARSP_03_008 ทดสอบการแสดงค่าขนส่งสำหรับสินค้าพิเศษ", () => {
    cy.get('[data-cy="width-input"]').type("50");
    cy.get('[data-cy="length-input"]').type("50");
    cy.get('[data-cy="height-input"]').type("40");
    cy.get('[data-cy="weight-input"]').type("15");

    cy.get('[data-cy="customer-level-select"]').select("Star Rabbit");
    cy.get('[data-cy="product-type-select"]').select("สินค้าพิเศษ");
    cy.get('[data-cy="shipping-method-select"]').select("ทางรถ");

    cy.get('[data-cy="calculate-button"]').click();

    // อัตรา Star Rabbit + ทางรถ + สินค้าพิเศษ = 100 บาท/กก.
    // น้ำหนักจริง 15 กก. * 100 = 1,500 บาท
    cy.get('[data-cy="shipping-cost"]')
      .contains("1,000.00 บาท")
      .should("be.visible");
  });
});
