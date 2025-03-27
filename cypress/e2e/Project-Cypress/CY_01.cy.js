/// <reference types="cypress" />

context("Actions", () => {
  beforeEach(() => {
    cy.visit("https://example.cypress.io/commands/actions");
  });

  // https://on.cypress.io/interacting-with-elements

  it("TS_CY_01_001 .type() - พิมพ์ข้อความในอิลิเมนต์ DOM", () => {
    // https://on.cypress.io/type
    cy.get(".action-email").type("fake@email.com");
    cy.get(".action-email").should("have.value", "fake@email.com");

    // .type() กับลำดับอักขระพิเศษ
    cy.get(".action-email").type("{leftarrow}{rightarrow}{uparrow}{downarrow}");
    cy.get(".action-email").type("{del}{selectall}{backspace}");

    // .type() กับตัวดัดแปลงคีย์
    cy.get(".action-email").type("{alt}{option}"); //คำสั่งเหล่านี้เทียบเท่ากัน
    cy.get(".action-email").type("{ctrl}{control}"); //คำสั่งเหล่านี้เทียบเท่ากัน
    cy.get(".action-email").type("{meta}{command}{cmd}"); //คำสั่งเหล่านี้เทียบเท่ากัน
    cy.get(".action-email").type("{shift}");

    // หน่วงเวลาการกดแต่ละปุ่ม 0.1 วินาที
    cy.get(".action-email").type("slow.typing@email.com", { delay: 100 });
    cy.get(".action-email").should("have.value", "slow.typing@email.com");

    cy.get(".action-disabled")
      // ข้ามการตรวจสอบข้อผิดพลาดก่อนพิมพ์
      // เช่น อิลิเมนต์มองเห็นได้หรือถูกปิดการใช้งาน
      .type("disabled error checking", { force: true });
    cy.get(".action-disabled").should("have.value", "disabled error checking");
  });

  it("TS_CY_01_002 .focus() - โฟกัสที่อิลิเมนต์ DOM", () => {
    // https://on.cypress.io/focus
    cy.get(".action-focus").focus();
    cy.get(".action-focus")
      .should("have.class", "focus")
      .prev()
      .should("have.attr", "style", "color: orange;");
  });

  it("TS_CY_01_003 .blur() - ยกเลิกโฟกัสจากอิลิเมนต์ DOM", () => {
    // https://on.cypress.io/blur
    cy.get(".action-blur").type("About to blur");
    cy.get(".action-blur").blur();
    cy.get(".action-blur")
      .should("have.class", "error")
      .prev()
      .should("have.attr", "style", "color: red;");
  });

  it("TS_CY_01_004 .clear() - ล้างข้อความในอินพุตหรืออิลิเมนต์ textarea", () => {
    // https://on.cypress.io/clear
    cy.get(".action-clear").type("Clear this text");
    cy.get(".action-clear").should("have.value", "Clear this text");
    cy.get(".action-clear").clear();
    cy.get(".action-clear").should("have.value", "");
  });

  it("TS_CY_01_005 .submit() - ส่งแบบฟอร์ม", () => {
    // https://on.cypress.io/submit
    cy.get(".action-form").find('[type="text"]').type("HALFOFF");

    cy.get(".action-form").submit();
    cy.get(".action-form")
      .next()
      .should("contain", "Your form has been submitted!");
  });

  it("TS_CY_01_006 .click() - คลิกที่อิลิเมนต์ DOM", () => {
    // https://on.cypress.io/click
    cy.get(".action-btn").click();

    // คุณสามารถคลิกที่ 9 ตำแหน่งเฉพาะของอิลิเมนต์:
    //  -----------------------------------
    // | topLeft        top       topRight |
    // |                                   |
    // |                                   |
    // |                                   |
    // | left          center        right |
    // |                                   |
    // |                                   |
    // |                                   |
    // | bottomLeft   bottom   bottomRight |
    //  -----------------------------------

    // การคลิกที่กึ่งกลางของอิลิเมนต์เป็นค่าเริ่มต้น
    cy.get("#action-canvas").click();

    cy.get("#action-canvas").click("topLeft");
    cy.get("#action-canvas").click("top");
    cy.get("#action-canvas").click("topRight");
    cy.get("#action-canvas").click("left");
    cy.get("#action-canvas").click("right");
    cy.get("#action-canvas").click("bottomLeft");
    cy.get("#action-canvas").click("bottom");
    cy.get("#action-canvas").click("bottomRight");

    // .click() รับพิกัด x และ y
    // ที่ควบคุมตำแหน่งที่จะคลิก :)

    cy.get("#action-canvas");
    cy.get("#action-canvas").click(80, 75); // คลิกที่พิกัด x 80px และ y 75px
    cy.get("#action-canvas").click(170, 75);
    cy.get("#action-canvas").click(80, 165);
    cy.get("#action-canvas").click(100, 185);
    cy.get("#action-canvas").click(125, 190);
    cy.get("#action-canvas").click(150, 185);
    cy.get("#action-canvas").click(170, 165);

    // คลิกหลายอิลิเมนต์โดยส่งค่า multiple: true
    cy.get(".action-labels>.label").click({ multiple: true });

    // ข้ามการตรวจสอบข้อผิดพลาดก่อนคลิก
    cy.get(".action-opacity>.btn").click({ force: true });
  });

  it("TS_CY_01_007 .dblclick() - ดับเบิลคลิกที่อิลิเมนต์ DOM", () => {
    // https://on.cypress.io/dblclick

    // แอพของเรามีตัวรับฟังเหตุการณ์ 'dblclick' ใน 'scripts.js'
    // ที่ซ่อน div และแสดงอินพุตเมื่อดับเบิลคลิก
    cy.get(".action-div").dblclick();
    cy.get(".action-div").should("not.be.visible");
    cy.get(".action-input-hidden").should("be.visible");
  });

  it("TS_CY_01_008 .rightclick() - คลิกขวาที่อิลิเมนต์ DOM", () => {
    // https://on.cypress.io/rightclick

    // แอพของเรามีตัวรับฟังเหตุการณ์ 'contextmenu' ใน 'scripts.js'
    // ที่ซ่อน div และแสดงอินพุตเมื่อคลิกขวา
    cy.get(".rightclick-action-div").rightclick();
    cy.get(".rightclick-action-div").should("not.be.visible");
    cy.get(".rightclick-action-input-hidden").should("be.visible");
  });

  it("TS_CY_01_009 .check() - เช็คช่องทำเครื่องหมายหรืออิลิเมนต์วิทยุ", () => {
    // https://on.cypress.io/check

    // โดยค่าเริ่มต้น .check() จะเช็คทุก
    // ช่องทำเครื่องหมายหรืออิลิเมนต์วิทยุที่ตรงกันตามลำดับ ทีละอัน
    cy.get('.action-checkboxes [type="checkbox"]').not("[disabled]").check();
    cy.get('.action-checkboxes [type="checkbox"]')
      .not("[disabled]")
      .should("be.checked");

    cy.get('.action-radios [type="radio"]').not("[disabled]").check();
    cy.get('.action-radios [type="radio"]')
      .not("[disabled]")
      .should("be.checked");

    // .check() รับอาร์กิวเมนต์ค่า
    cy.get('.action-radios [type="radio"]').check("radio1");
    cy.get('.action-radios [type="radio"]').should("be.checked");

    // .check() รับอาร์เรย์ของค่า
    cy.get('.action-multiple-checkboxes [type="checkbox"]').check([
      "checkbox1",
      "checkbox2",
    ]);
    cy.get('.action-multiple-checkboxes [type="checkbox"]').should(
      "be.checked"
    );

    // ข้ามการตรวจสอบข้อผิดพลาดก่อนเช็ค
    cy.get(".action-checkboxes [disabled]").check({ force: true });
    cy.get(".action-checkboxes [disabled]").should("be.checked");

    cy.get('.action-radios [type="radio"]').check("radio3", { force: true });
    cy.get('.action-radios [type="radio"]').should("be.checked");
  });

  it("TS_CY_01_010 .uncheck() - ยกเลิกการเช็คอิลิเมนต์ช่องทำเครื่องหมาย", () => {
    // https://on.cypress.io/uncheck

    // โดยค่าเริ่มต้น .uncheck() จะยกเลิกการเช็คทุก
    // อิลิเมนต์ช่องทำเครื่องหมายที่ตรงกันตามลำดับ ทีละอัน
    cy.get('.action-check [type="checkbox"]').not("[disabled]").uncheck();
    cy.get('.action-check [type="checkbox"]')
      .not("[disabled]")
      .should("not.be.checked");

    // .uncheck() รับอาร์กิวเมนต์ค่า
    cy.get('.action-check [type="checkbox"]').check("checkbox1");
    cy.get('.action-check [type="checkbox"]').uncheck("checkbox1");
    cy.get('.action-check [type="checkbox"][value="checkbox1"]').should(
      "not.be.checked"
    );

    // .uncheck() รับอาร์เรย์ของค่า
    cy.get('.action-check [type="checkbox"]').check(["checkbox1", "checkbox3"]);
    cy.get('.action-check [type="checkbox"]').uncheck([
      "checkbox1",
      "checkbox3",
    ]);
    cy.get('.action-check [type="checkbox"][value="checkbox1"]').should(
      "not.be.checked"
    );
    cy.get('.action-check [type="checkbox"][value="checkbox3"]').should(
      "not.be.checked"
    );

    // ข้ามการตรวจสอบข้อผิดพลาดก่อนยกเลิกการเช็ค
    cy.get(".action-check [disabled]").uncheck({ force: true });
    cy.get(".action-check [disabled]").should("not.be.checked");
  });

  it("TS_CY_01_011 .select() - เลือกตัวเลือกในอิลิเมนต์ <select>", () => {
    // https://on.cypress.io/select

    // ในตอนแรก ไม่ควรมีตัวเลือกใดถูกเลือก
    cy.get(".action-select").should("have.value", "--Select a fruit--");

    // เลือกตัวเลือกที่มีเนื้อหาข้อความตรงกัน
    cy.get(".action-select").select("apples");
    // ยืนยันว่าแอปเปิ้ลถูกเลือก
    // สังเกตว่าแต่ละค่าเริ่มต้นด้วย "fr-" ใน HTML ของเรา
    cy.get(".action-select").should("have.value", "fr-apples");

    cy.get(".action-select-multiple").select(["apples", "oranges", "bananas"]);
    cy.get(".action-select-multiple")
      // เมื่อรับค่าหลายค่า ให้เรียกเมธอด "val" ก่อน
      .invoke("val")
      .should("deep.equal", ["fr-apples", "fr-oranges", "fr-bananas"]);

    // เลือกตัวเลือกที่มีค่าตรงกัน
    cy.get(".action-select").select("fr-bananas");
    cy.get(".action-select")
      // สามารถแนบการยืนยันกับอิลิเมนต์ได้ทันที
      .should("have.value", "fr-bananas");

    cy.get(".action-select-multiple").select([
      "fr-apples",
      "fr-oranges",
      "fr-bananas",
    ]);
    cy.get(".action-select-multiple")
      .invoke("val")
      .should("deep.equal", ["fr-apples", "fr-oranges", "fr-bananas"]);

    // ยืนยันว่าค่าที่เลือกรวมส้ม
    cy.get(".action-select-multiple")
      .invoke("val")
      .should("include", "fr-oranges");
  });

  it("TS_CY_01_012 .scrollIntoView() - เลื่อนอิลิเมนต์เข้าสู่มุมมอง", () => {
    // https://on.cypress.io/scrollintoview

    // โดยปกติปุ่มเหล่านี้ทั้งหมดจะถูกซ่อน
    // เพราะไม่อยู่ในพื้นที่ที่มองเห็นได้ของตัวหลัก
    // (เราต้องเลื่อนเพื่อดูพวกมัน)
    cy.get("#scroll-horizontal button").should("not.be.visible");

    // เลื่อนปุ่มเข้าสู่มุมมอง เหมือนผู้ใช้เลื่อน
    cy.get("#scroll-horizontal button").scrollIntoView();
    cy.get("#scroll-horizontal button").should("be.visible");

    cy.get("#scroll-vertical button").should("not.be.visible");

    // Cypress จัดการทิศทางการเลื่อนที่จำเป็น
    cy.get("#scroll-vertical button").scrollIntoView();
    cy.get("#scroll-vertical button").should("be.visible");

    cy.get("#scroll-both button").should("not.be.visible");

    // Cypress รู้ว่าต้องเลื่อนไปทางขวาและลง
    cy.get("#scroll-both button").scrollIntoView();
    cy.get("#scroll-both button").should("be.visible");
  });

  it("TS_CY_01_013 .trigger() - ทริกเกอร์เหตุการณ์บนอิลิเมนต์ DOM", () => {
    // https://on.cypress.io/trigger

    // เพื่อโต้ตอบกับอินพุตช่วง (สไลเดอร์)
    // เราต้องตั้งค่าและทริกเกอร์เหตุการณ์
    // เพื่อส่งสัญญาณว่ามีการเปลี่ยนแปลง

    // ที่นี่ เราเรียกเมธอด val() ของ jQuery เพื่อตั้งค่า
    // และทริกเกอร์เหตุการณ์ 'change'
    cy.get(".trigger-input-range").invoke("val", 25);
    cy.get(".trigger-input-range").trigger("change");
    cy.get(".trigger-input-range")
      .get("input[type=range]")
      .siblings("p")
      .should("have.text", "25");
  });

  it("TS_CY_01_014 cy.scrollTo() - เลื่อนหน้าต่างหรืออิลิเมนต์ไปยังตำแหน่ง", () => {
    // https://on.cypress.io/scrollto

    // คุณสามารถเลื่อนไปยัง 9 ตำแหน่งเฉพาะของอิลิเมนต์:
    //  -----------------------------------
    // | topLeft        top       topRight |
    // |                                   |
    // |                                   |
    // |                                   |
    // | left          center        right |
    // |                                   |
    // |                                   |
    // |                                   |
    // | bottomLeft   bottom   bottomRight |
    //  -----------------------------------

    // ถ้าคุณต่อ .scrollTo() จาก cy เราจะ
    // เลื่อนทั้งหน้าต่าง
    cy.scrollTo("bottom");

    cy.get("#scrollable-horizontal").scrollTo("right");

    // หรือคุณสามารถเลื่อนไปยังพิกัดเฉพาะ:
    // (แกน x, แกน y) ในหน่วยพิกเซล
    cy.get("#scrollable-vertical").scrollTo(250, 250);

    // หรือคุณสามารถเลื่อนไปยังเปอร์เซ็นต์เฉพาะ
    // ของ (ความกว้าง, ความสูง) ของอิลิเมนต์
    cy.get("#scrollable-both").scrollTo("75%", "25%");

    // ควบคุมการเร่งของการเลื่อน (ค่าเริ่มต้นคือ 'swing')
    cy.get("#scrollable-vertical").scrollTo("center", { easing: "linear" });

    // ควบคุมระยะเวลาของการเลื่อน (ในมิลลิวินาที)
    cy.get("#scrollable-both").scrollTo("center", { duration: 2000 });
  });
});
