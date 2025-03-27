describe("การทดสอบการคำนวณด้วยอัตราที่กำหนดเอง", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("TS_ARSP_04_001 ทดสอบการเปลี่ยนเป็นรูปแบบกำหนดอัตราเอง", () => {
    cy.get('[data-cy="custom-rate-radio"]').check();
    cy.get('[data-cy="custom-rates-section"]').should(
      "not.have.class",
      "opacity-50"
    );
    cy.get('[data-cy="custom-rate-per-kg"]').should("not.be.disabled");
    cy.get('[data-cy="custom-rate-per-cbm"]').should("not.be.disabled");
  });

  it("TS_ARSP_04_002 ทดสอบการกรอกอัตราค่าขนส่งแบบกำหนดเองเป็นจำนวนทศนิยม", () => {
    cy.get('[data-cy="custom-rate-radio"]').check();
    cy.get('[data-cy="custom-rate-per-kg"]').type("55.50");
    cy.get('[data-cy="custom-rate-per-cbm"]').type("6500.75");

    cy.get('[data-cy="custom-rate-per-kg"]').should("have.value", "55.50");
    cy.get('[data-cy="custom-rate-per-cbm"]').should("have.value", "6500.75");
  });

  it("TS_ARSP_04_003 ทดสอบการคำนวณด้วยอัตราที่กำหนดเองจากน้ำหนัก", () => {
    cy.get('[data-cy="custom-rate-radio"]').check();
    cy.get('[data-cy="custom-rate-per-kg"]').type("60");
    cy.get('[data-cy="custom-rate-per-cbm"]').type("6000");

    cy.get('[data-cy="width-input"]').type("10");
    cy.get('[data-cy="length-input"]').type("10");
    cy.get('[data-cy="height-input"]').type("10");
    cy.get('[data-cy="weight-input"]').type("5");

    cy.get('[data-cy="calculate-button"]').click();

    // น้ำหนักตามปริมาตร = (10*10*10)/5000 = 0.2 กก. น้อยกว่าน้ำหนักจริง 5 กก.
    // ค่าขนส่ง = 5 กก. * 60 บาท/กก. = 300 บาท
    cy.get('[data-cy="calculation-result"]').should("be.visible");
    cy.contains("วิธีการคิดราคา:")
      .parent()
      .contains("คำนวณจากน้ำหนัก")
      .should("be.visible");
    cy.get('[data-cy="shipping-cost"]')
      .contains("300.00 บาท")
      .should("be.visible");
  });

  it("TS_ARSP_04_004 ทดสอบการคำนวณด้วยอัตราที่กำหนดเองจากปริมาตร", () => {
    cy.get('[data-cy="custom-rate-radio"]').check();
    cy.get('[data-cy="custom-rate-per-kg"]').type("60");
    cy.get('[data-cy="custom-rate-per-cbm"]').type("6000");

    cy.get('[data-cy="width-input"]').type("100");
    cy.get('[data-cy="length-input"]').type("100");
    cy.get('[data-cy="height-input"]').type("100");
    cy.get('[data-cy="weight-input"]').type("1");

    cy.get('[data-cy="calculate-button"]').click();

    // น้ำหนักตามปริมาตร = (100*100*100)/5000 = 200 กก. มากกว่าน้ำหนักจริง 1 กก.
    // ปริมาตร = (100*100*100)/1000000 = 1 คิว
    // ค่าขนส่ง = 1 คิว * 6000 บาท/คิว = 6,000 บาท
    cy.get('[data-cy="calculation-result"]').should("be.visible");
    cy.contains("วิธีการคิดราคา:")
      .parent()
      .contains("คำนวณจากปริมาตร")
      .should("be.visible");
    cy.get('[data-cy="shipping-cost"]')
      .contains("6,000.00 บาท")
      .should("be.visible");
  });

  it("TS_ARSP_04_005 ทดสอบความผิดพลาดเมื่อกรอกอัตราค่าขนส่งไม่ครบถ้วน", () => {
    cy.get('[data-cy="custom-rate-radio"]').check();
    cy.get('[data-cy="custom-rate-per-kg"]').type("60");
    // ไม่กรอกค่า custom-rate-per-cbm

    cy.get('[data-cy="width-input"]').type("50");
    cy.get('[data-cy="length-input"]').type("50");
    cy.get('[data-cy="height-input"]').type("50");
    cy.get('[data-cy="weight-input"]').type("10");

    cy.get('[data-cy="calculate-button"]').click();

    cy.contains("กรุณากรอกอัตราค่าขนส่งให้ครบถ้วน").should("be.visible");
  });

  it("TS_ARSP_04_006 ทดสอบการแสดงข้อมูลประเภทการคำนวณในผลลัพธ์", () => {
    cy.get('[data-cy="custom-rate-radio"]').check();
    cy.get('[data-cy="custom-rate-per-kg"]').type("60");
    cy.get('[data-cy="custom-rate-per-cbm"]').type("6000");

    cy.get('[data-cy="width-input"]').type("50");
    cy.get('[data-cy="length-input"]').type("50");
    cy.get('[data-cy="height-input"]').type("50");
    cy.get('[data-cy="weight-input"]').type("20");

    cy.get('[data-cy="calculate-button"]').click();

    cy.get('[data-cy="calculation-result"]').should("be.visible");
    cy.contains("ประเภทการคำนวณ:")
      .parent()
      .contains("คำนวณด้วยอัตราที่กำหนดเอง")
      .should("be.visible");
  });

  it("TS_ARSP_04_007 ทดสอบการคำนวณเมื่อน้ำหนักตามปริมาตรและน้ำหนักจริงเท่ากัน", () => {
    // ต้องกำหนดขนาดที่จะทำให้น้ำหนักตามปริมาตรเท่ากับ 10 กก.
    // สูตร: (กว้าง * ยาว * สูง) / 5000 = 10
    // เลือกใช้ 50 * 50 * 20 = 50000 / 5000 = 10 กก.

    cy.get('[data-cy="custom-rate-radio"]').check();
    cy.get('[data-cy="custom-rate-per-kg"]').type("60");
    cy.get('[data-cy="custom-rate-per-cbm"]').type("6000");

    cy.get('[data-cy="width-input"]').type("50");
    cy.get('[data-cy="length-input"]').type("50");
    cy.get('[data-cy="height-input"]').type("20");
    cy.get('[data-cy="weight-input"]').type("10");

    cy.get('[data-cy="calculate-button"]').click();

    // กรณีเท่ากัน ควรจะใช้การคำนวณจากน้ำหนักตามปริมาตร (volume)
    cy.get('[data-cy="calculation-result"]').should("be.visible");
    cy.contains("วิธีการคิดราคา:")
      .parent()
      .contains("คำนวณจากปริมาตร")
      .should("be.visible");
  });

  it("TS_ARSP_04_008 ทดสอบการคำนวณแบบกำหนดเองกับค่าทศนิยมหลายตำแหน่ง", () => {
    cy.get('[data-cy="custom-rate-radio"]').check();
    cy.get('[data-cy="custom-rate-per-kg"]').type("55.75");
    cy.get('[data-cy="custom-rate-per-cbm"]').type("6235.50");

    cy.get('[data-cy="width-input"]').type("45.5");
    cy.get('[data-cy="length-input"]').type("35.25");
    cy.get('[data-cy="height-input"]').type("22.75");
    cy.get('[data-cy="weight-input"]').type("12.35");

    cy.get('[data-cy="calculate-button"]').click();

    // น้ำหนักตามปริมาตร = (45.5*35.25*22.75)/5000 = 7.28 กก. < น้ำหนักจริง 12.35 กก.
    // ค่าขนส่ง = 12.35 กก. * 55.75 บาท/กก. = 688.51 บาท
    cy.get('[data-cy="calculation-result"]').should("be.visible");
    cy.contains("วิธีการคิดราคา:")
      .parent()
      .contains("คำนวณจากน้ำหนัก")
      .should("be.visible");

    // ตรวจสอบว่าผลการคำนวณใกล้เคียง 688.51 โดยใช้ regex ที่รองรับการปัดเศษ
    cy.get('[data-cy="shipping-cost"]')
      .invoke("text")
      .should("match", /68[89]\.\d{2}\sบาท/);
  });
});
