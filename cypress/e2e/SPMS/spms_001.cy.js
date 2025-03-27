/**
 * SPMS_01_Login.cy.js
 * ทดสอบอัตโนมัติสำหรับหน้า Login ของระบบบริหารจัดการโครงการ
 * ครอบคลุมการทดสอบการเข้าสู่ระบบในสถานการณ์ต่างๆ
 */

describe("การทดสอบหน้าเข้าสู่ระบบ", () => {
  // ข้อมูลทดสอบ
  const validCredentials = {
    email: "test005@tester.com",
    password: "123456",
  };

  const invalidCredentials = {
    email: "wrong@example.com",
    password: "wrongpassword",
  };

  /**
   * ดำเนินการก่อนการทดสอบแต่ละครั้ง
   * - เข้าถึงหน้า login
   * - ตรวจสอบว่าโหลดหน้าเว็บสำเร็จ
   */
  beforeEach(() => {
    // นำทางไปยังหน้า login
    cy.visit("/login");

    // ตรวจสอบว่าหน้า login ปรากฏ
    cy.get('[data-cy="login-container"]').should("be.visible");
    cy.get('[data-cy="login-form"]').should("be.visible");
  });

  /**
   * กลุ่มทดสอบ: การเข้าสู่ระบบ
   * ทดสอบสถานการณ์ต่างๆ ของการเข้าสู่ระบบ
   */
  describe("การทดสอบกระบวนการเข้าสู่ระบบ", () => {
    it("TS_SPMS_01_001 ทดสอบการ Login สำเร็จ", () => {
      // กรอกข้อมูลถูกต้อง
      cy.get('[data-cy="login-email"]').type(validCredentials.email);
      cy.get('[data-cy="login-password"]').type(validCredentials.password);

      // กดปุ่มเข้าสู่ระบบ
      cy.get('[data-cy="login-submit"]').click();

      // ตรวจสอบว่านำทางไปยังหน้าหลักหลังจากเข้าสู่ระบบสำเร็จ
      cy.url().should("include", "/mainpage");

      // สามารถตรวจสอบเพิ่มเติมว่ามี element ที่แสดงว่าเข้าสู่ระบบสำเร็จ เช่น ชื่อผู้ใช้
      // cy.get('[data-cy="user-welcome"]').should('contain', 'ยินดีต้อนรับ');
    });

    it("TS_SPMS_01_002 ทดสอบกรณีใส่รหัสผ่านผิด", () => {
      // กรอกอีเมลถูกต้องแต่รหัสผ่านผิด
      cy.get('[data-cy="login-email"]').type(validCredentials.email);
      cy.get('[data-cy="login-password"]').type(invalidCredentials.password);

      // กดปุ่มเข้าสู่ระบบ
      cy.get('[data-cy="login-submit"]').click();

      // ตรวจสอบการแสดงข้อความแจ้งเตือน
      cy.get('[data-cy="login-error"]')
        .should("be.visible")
        .and("contain", "รหัสผ่านไม่ถูกต้อง");

      // ตรวจสอบว่ายังคงอยู่ที่หน้า login
      cy.url().should("include", "/login");
    });

    it("TS_SPMS_01_003 ทดสอบกรณีใส่อีเมลผิด", () => {
      // กรอกอีเมลผิดแต่รหัสผ่านถูกต้อง
      cy.get('[data-cy="login-email"]').type(invalidCredentials.email);
      cy.get('[data-cy="login-password"]').type(validCredentials.password);

      // กดปุ่มเข้าสู่ระบบ
      cy.get('[data-cy="login-submit"]').click();

      // ตรวจสอบการแสดงข้อความแจ้งเตือน
      cy.get('[data-cy="login-error"]')
        .should("be.visible")
        .and("contain", "อีเมลไม่ถูกต้อง");

      // ตรวจสอบว่ายังคงอยู่ที่หน้า login
      cy.url().should("include", "/login");
    });

    it("TS_SPMS_01_004 ทดสอบกรณีเว้นช่องว่าง (email หรือ password)", () => {
      // กรณีเว้นว่าง email และกดเข้าสู่ระบบ
      cy.get('[data-cy="login-password"]').type(validCredentials.password);
      cy.get('[data-cy="login-submit"]').click();

      // ตรวจสอบการแสดงข้อความ validation จาก HTML5
      cy.get('[data-cy="login-email"]:invalid').should("exist");

      // เคลียร์ข้อมูลและทดสอบกรณีเว้นว่างรหัสผ่าน
      cy.get('[data-cy="login-password"]').clear();
      cy.get('[data-cy="login-email"]').type(validCredentials.email);
      cy.get('[data-cy="login-submit"]').click();

      // ตรวจสอบการแสดงข้อความ validation จาก HTML5
      cy.get('[data-cy="login-password"]:invalid').should("exist");

      // เคลียร์ข้อมูลและทดสอบกรณีเว้นว่างทั้งสองฟิลด์
      cy.get('[data-cy="login-email"]').clear();
      cy.get('[data-cy="login-submit"]').click();

      // ตรวจสอบว่าฟอร์มไม่ถูกส่ง
      cy.url().should("include", "/login");
    });
  });

  /**
   * กลุ่มทดสอบ: การตรวจสอบองค์ประกอบ UI
   * ตรวจสอบว่าองค์ประกอบทั้งหมดของหน้า login แสดงอย่างถูกต้อง
   */
  describe("การตรวจสอบองค์ประกอบ UI", () => {
    it("TS_SPMS_01_005 ทดสอบ UI ว่ามีองค์ประกอบที่ถูกต้อง", () => {
      // ตรวจสอบองค์ประกอบหลัก
      cy.get('[data-cy="login-logo"]').should("be.visible");
      cy.get('[data-cy="login-title"]')
        .should("be.visible")
        .and("contain", "Project Management System");
      cy.get('[data-cy="login-subtitle"]')
        .should("be.visible")
        .and("contain", "ลงชื่อเข้าใช้บัญชีของคุณเพื่อเริ่มใช้งานระบบ");

      // ตรวจสอบฟอร์มและฟิลด์ข้อมูล
      cy.get('[data-cy="login-email-label"]')
        .should("be.visible")
        .and("contain", "อีเมล");
      cy.get('[data-cy="login-email"]')
        .should("be.visible")
        .and("have.attr", "placeholder", "yourname@example.com");

      cy.get('[data-cy="login-password-label"]')
        .should("be.visible")
        .and("contain", "รหัสผ่าน");
      cy.get('[data-cy="login-password"]')
        .should("be.visible")
        .and("have.attr", "type", "password");

      cy.get('[data-cy="login-toggle-password"]').should("be.visible");
      cy.get('[data-cy="login-submit"]')
        .should("be.visible")
        .and("contain", "เข้าสู่ระบบ");
    });

    it("TS_SPMS_01_006 ทดสอบการกดปุ่มแสดง/ซ่อนรหัสผ่าน", () => {
      // ตรวจสอบว่าฟิลด์รหัสผ่านเริ่มต้นเป็นประเภท password (ซ่อน)
      cy.get('[data-cy="login-password"]').should(
        "have.attr",
        "type",
        "password"
      );

      // กดปุ่มแสดงรหัสผ่าน
      cy.get('[data-cy="login-toggle-password"]').click();

      // ตรวจสอบว่าฟิลด์รหัสผ่านเปลี่ยนเป็นประเภท text (แสดง)
      cy.get('[data-cy="login-password"]').should("have.attr", "type", "text");

      // กดปุ่มซ่อนรหัสผ่าน
      cy.get('[data-cy="login-toggle-password"]').click();

      // ตรวจสอบว่าฟิลด์รหัสผ่านเปลี่ยนกลับเป็นประเภท password (ซ่อน)
      cy.get('[data-cy="login-password"]').should(
        "have.attr",
        "type",
        "password"
      );
    });
  });

  /**
   * กลุ่มทดสอบ: สถานะการโหลด
   * ทดสอบการแสดงสถานะการโหลดระหว่างการเข้าสู่ระบบ
   */
  describe("การทดสอบสถานะการโหลด", () => {
    it("TS_SPMS_01_007 ทดสอบการแสดงสถานะการโหลดระหว่างการเข้าสู่ระบบ", () => {
      // กรอกข้อมูลและส่งฟอร์ม
      cy.get('[data-cy="login-email"]').type(validCredentials.email);
      cy.get('[data-cy="login-password"]').type(validCredentials.password);
      cy.get('[data-cy="login-submit"]').click();

      // ตรวจสอบว่าปุ่มแสดงสถานะการโหลด
      cy.get('[data-cy="login-submit"]').should(
        "contain",
        "กำลังเข้าสู่ระบบ..."
      );
      cy.get('[data-cy="login-submit"]').should("be.disabled");
      cy.get('[data-cy="login-submit"] svg.animate-spin').should("be.visible");
    });
  });

  /**
   * กลุ่มทดสอบ: การตรวจสอบรูปแบบข้อมูล
   * ทดสอบการตรวจสอบรูปแบบของอีเมล
   */
  describe("การตรวจสอบรูปแบบข้อมูล", () => {
    it("TS_SPMS_01_008 ทดสอบการตรวจสอบรูปแบบอีเมล", () => {
      // ทดสอบรูปแบบอีเมลที่ไม่ถูกต้อง
      cy.get('[data-cy="login-email"]').type("invalidemailformat");
      cy.get('[data-cy="login-password"]').type(validCredentials.password);
      cy.get('[data-cy="login-submit"]').click();

      // ตรวจสอบการแสดงข้อความ validation จาก HTML5
      cy.get('[data-cy="login-email"]:invalid').should("exist");

      // เคลียร์และทดสอบรูปแบบอีเมลที่ถูกต้อง
      cy.get('[data-cy="login-email"]').clear().type("valid@example.com");
      cy.get('[data-cy="login-email"]:invalid').should("not.exist");
    });
  });
});
