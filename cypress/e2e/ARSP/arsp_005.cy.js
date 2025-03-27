describe("การทดสอบการแสดงผลแบบ Responsive", () => {
  it("TS_ARSP_05_001 ทดสอบการแสดงผลบนอุปกรณ์ขนาดเล็ก (โทรศัพท์มือถือ)", () => {
    // ตั้งค่าวิวพอร์ตเป็นขนาดโทรศัพท์มือถือ (iPhone X)
    cy.viewport(375, 812);
    cy.visit("/");

    // ตรวจสอบการแสดงส่วนหัว
    cy.contains("คำนวณค่าขนส่งจีน-ไทย AriyayaPreorder").should("be.visible");

    // ตรวจสอบว่าปุ่มคำนวณค่าขนส่งแสดงแบบย่อสำหรับอุปกรณ์มือถือ
    cy.get('[data-cy="calculate-button"]')
      .find(".sm\\:hidden")
      .should("be.visible");
    cy.get('[data-cy="calculate-button"]')
      .find(".sm\\:inline")
      .should("not.be.visible");

    // ตรวจสอบว่าช่องกรอกข้อมูลอยู่ในแนวตั้ง (แต่ละช่องอยู่ด้านล่างกัน)
    // โดยตรวจสอบจากความกว้างของช่องกรอกที่ควรใกล้เคียงกับความกว้างของคอนเทนเนอร์
    cy.get('[data-cy="width-input"]')
      .invoke("outerWidth")
      .should("be.greaterThan", 80);
  });

  it("TS_ARSP_05_002 ทดสอบการแสดงผลบนอุปกรณ์ขนาดกลาง (แท็บเล็ต)", () => {
    // ตั้งค่าวิวพอร์ตเป็นขนาดแท็บเล็ต (iPad)
    cy.viewport(768, 1024);
    cy.visit("/");

    // ตรวจสอบการแสดงส่วนหัว
    cy.contains("คำนวณค่าขนส่งจีน-ไทย AriyayaPreorder").should("be.visible");

    // ตรวจสอบว่าปุ่มคำนวณค่าขนส่งแสดงข้อความเต็มสำหรับอุปกรณ์ขนาดกลาง
    cy.get('[data-cy="calculate-button"]')
      .find(".sm\\:inline")
      .should("be.visible");
    cy.get('[data-cy="calculate-button"]')
      .contains("คำนวณค่าขนส่ง")
      .should("be.visible");

    // ตรวจสอบว่าส่วนของอัตราค่าขนส่งแสดงในแนวนอน (2 คอลัมน์) บนแท็บเล็ต
    cy.get('[data-cy="company-rates-section"]')
      .find(".sm\\:grid-cols-3")
      .should("exist");
  });

  it("TS_ARSP_05_003 ทดสอบการแสดงผลบนอุปกรณ์ขนาดใหญ่ (เดสก์ท็อป)", () => {
    // ตั้งค่าวิวพอร์ตเป็นขนาดเดสก์ท็อป
    cy.viewport(1280, 800);
    cy.visit("/");

    // ตรวจสอบว่าส่วนสุดท้ายของหน้าเว็บ (ส่วนติดต่อ) แสดงเป็น grid 3 คอลัมน์
    cy.get('[data-cy="contact-section"]')
      .find(".sm\\:grid-cols-3")
      .should("exist");

    // ตรวจสอบว่าผลลัพธ์การคำนวณ (เมื่อคำนวณแล้ว) แสดงเป็น 2 คอลัมน์
    cy.get('[data-cy="width-input"]').type("50");
    cy.get('[data-cy="length-input"]').type("50");
    cy.get('[data-cy="height-input"]').type("50");
    cy.get('[data-cy="weight-input"]').type("20");
    cy.get('[data-cy="calculate-button"]').click();

    cy.get('[data-cy="calculation-result"]')
      .find(".md\\:grid-cols-2")
      .should("exist");
  });

  it("TS_ARSP_05_004 ทดสอบการเปลี่ยนขนาดวิวพอร์ตจากเล็กไปใหญ่", () => {
    // เริ่มจากขนาดเล็ก (โทรศัพท์มือถือ)
    cy.viewport(375, 667);
    cy.visit("/");

    // ตรวจสอบการแสดงผลบนมือถือ
    cy.get('[data-cy="calculate-button"]')
      .contains("คำนวณ")
      .should("be.visible");

    // เปลี่ยนเป็นขนาดใหญ่ (เดสก์ท็อป)
    cy.viewport(1280, 800);

    // ตรวจสอบว่าการแสดงผลเปลี่ยนเป็นเดสก์ท็อป
    cy.get('[data-cy="calculate-button"]')
      .contains("คำนวณค่าขนส่ง")
      .should("be.visible");
  });

  it("TS_ARSP_05_005 ทดสอบส่วนผลลัพธ์การคำนวณบนอุปกรณ์ขนาดเล็ก", () => {
    cy.viewport(375, 667);
    cy.visit("/");

    // กรอกข้อมูลและคำนวณ
    cy.get('[data-cy="width-input"]').type("50");
    cy.get('[data-cy="length-input"]').type("50");
    cy.get('[data-cy="height-input"]').type("50");
    cy.get('[data-cy="weight-input"]').type("20");
    cy.get('[data-cy="calculate-button"]').click();

    // ตรวจสอบว่าผลลัพธ์แสดงในแนวตั้ง (1 คอลัมน์) บนมือถือ
    cy.get('[data-cy="calculation-result"]')
      .find(".grid-cols-1")
      .should("exist");

    // ตรวจสอบว่าส่วนแสดงค่าขนส่งทั้งหมดแสดงผลอย่างถูกต้องบนมือถือ
    cy.get('[data-cy="shipping-cost"]').should("be.visible");
  });

  it("TS_ARSP_05_006 ทดสอบการแสดงผลฟอร์มอัตราต่างๆ บนอุปกรณ์ขนาดกลาง", () => {
    cy.viewport(768, 1024);
    cy.visit("/");

    // ตรวจสอบว่าฟอร์มข้อมูลสินค้าแสดงผลอย่างถูกต้อง
    cy.get('[data-cy="product-info-section"]').should("be.visible");

    // ตรวจสอบว่ารูปแบบการคำนวณแสดงในแนวนอนบนแท็บเล็ต
    cy.get('[data-cy="calculation-type-section"]')
      .find(".sm\\:flex-row")
      .should("exist");

    // ตรวจสอบว่าปุ่มคำนวณและล้างข้อมูลแสดงขนาดใหญ่ขึ้นบนแท็บเล็ต
    cy.get('[data-cy="calculate-button"]').should("have.class", "sm:py-4");
    cy.get('[data-cy="clear-button"]').should("have.class", "sm:py-4");
  });

  it("TS_ARSP_05_007 ทดสอบการแสดงข้อมูลอธิบายการคำนวณบนทุกขนาดอุปกรณ์", () => {
    // ทดสอบบนอุปกรณ์ขนาดเล็ก
    cy.viewport(375, 667);
    cy.visit("/");
    cy.get('[data-cy="calculation-info-section"]').should("be.visible");

    // ทดสอบบนอุปกรณ์ขนาดกลาง
    cy.viewport(768, 1024);
    cy.get('[data-cy="calculation-info-section"]').should("be.visible");

    // ทดสอบบนอุปกรณ์ขนาดใหญ่
    cy.viewport(1280, 800);
    cy.get('[data-cy="calculation-info-section"]').should("be.visible");

    // ตรวจสอบว่าข้อมูลการคำนวณแสดงทุกรายการ
    cy.get('[data-cy="calculation-info-section"]')
      .contains("คำนวณจาก (กว้าง × ยาว × สูง) ÷ 10000")
      .should("be.visible");
  });

  it("TS_ARSP_05_008 ทดสอบการแสดงผลแจ้งเตือนความผิดพลาดบนอุปกรณ์ขนาดต่างๆ", () => {
    // ทดสอบบนอุปกรณ์ขนาดเล็ก
    cy.viewport(375, 667);
    cy.visit("/");
    cy.get('[data-cy="calculate-button"]').click();
    cy.contains("กรุณากรอกข้อมูลให้ครบถ้วน").should("be.visible");

    // ทดสอบบนอุปกรณ์ขนาดกลาง
    cy.viewport(768, 1024);
    cy.visit("/");
    cy.get('[data-cy="calculate-button"]').click();
    cy.contains("กรุณากรอกข้อมูลให้ครบถ้วน").should("be.visible");

    // ทดสอบบนอุปกรณ์ขนาดใหญ่
    cy.viewport(1280, 800);
    cy.visit("/");
    cy.get('[data-cy="calculate-button"]').click();
    cy.contains("กรุณากรอกข้อมูลให้ครบถ้วน").should("be.visible");
  });
});
