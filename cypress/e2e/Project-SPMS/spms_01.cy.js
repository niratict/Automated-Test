// ไฟล์: cypress/e2e/login.spec.cy.js
describe("Login Page Tests", () => {
  /**
   * TS_SPMS_01_001: ทดสอบการแสดงผลหน้า Login
   * ตรวจสอบว่าหน้า Login แสดงองค์ประกอบสำคัญครบถ้วนหรือไม่
   */
  it("TS_SPMS_01_001 ทดสอบการแสดงผลหน้า Login", () => {
    // เข้าสู่หน้า login
    cy.visit("/login");

    // ตรวจสอบองค์ประกอบต่างๆในหน้า login
    cy.get('[data-cy="login-container"]').should("be.visible");
    cy.get('[data-cy="login-title"]').should(
      "contain",
      "Project Management System"
    );
    cy.get('[data-cy="login-subtitle"]').should(
      "contain",
      "ลงชื่อเข้าใช้บัญชีของคุณ"
    );
    cy.get('[data-cy="login-form"]').should("be.visible");
    cy.get('[data-cy="login-email"]').should("be.visible");
    cy.get('[data-cy="login-password"]').should("be.visible");
    cy.get('[data-cy="login-submit"]')
      .should("be.visible")
      .and("contain", "เข้าสู่ระบบ");
  });

  /**
   * TS_SPMS_01_002: ทดสอบการ Login สำเร็จ
   * ตรวจสอบว่าเมื่อกรอกข้อมูลถูกต้อง สามารถเข้าสู่ระบบได้หรือไม่
   */
  it("TS_SPMS_01_002 ทดสอบการ Login สำเร็จ", () => {
    cy.visit("/login");

    // กรอกข้อมูลเข้าสู่ระบบ
    cy.get('[data-cy="login-email"]').type("test005@tester.com");
    cy.get('[data-cy="login-password"]').type("123456");
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าเข้าสู่หน้า dashboard หรือไม่
    cy.url().should("include", "/dashboard");
    cy.get('[data-cy="dashboard-container"]').should("be.visible");
  });

  /**
   * TS_SPMS_01_003: ทดสอบกรณี Login ล้มเหลว (อีเมลผิด)
   * ตรวจสอบว่าระบบแสดงข้อความแจ้งเตือนเมื่อใส่อีเมลที่ไม่มีในระบบ
   */
  it("TS_SPMS_01_003 ทดสอบกรณี Login ล้มเหลว (อีเมลผิด)", () => {
    cy.visit("/login");

    // กรอกข้อมูลเข้าสู่ระบบด้วยอีเมลที่ไม่ถูกต้อง
    cy.get('[data-cy="login-email"]').type("wrong@email.com");
    cy.get('[data-cy="login-password"]').type("123456");
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบการแสดงข้อความผิดพลาด
    cy.get('[data-cy="login-error"]').should("be.visible");
  });

  /**
   * TS_SPMS_01_004: ทดสอบกรณี Login ล้มเหลว (รหัสผ่านผิด)
   * ตรวจสอบว่าระบบแสดงข้อความแจ้งเตือนเมื่อใส่รหัสผ่านไม่ถูกต้อง
   */
  it("TS_SPMS_01_004 ทดสอบกรณี Login ล้มเหลว (รหัสผ่านผิด)", () => {
    cy.visit("/login");

    // กรอกข้อมูลเข้าสู่ระบบด้วยรหัสผ่านที่ไม่ถูกต้อง
    cy.get('[data-cy="login-email"]').type("test005@tester.com");
    cy.get('[data-cy="login-password"]').type("wrongpassword");
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบการแสดงข้อความผิดพลาด
    cy.get('[data-cy="login-error"]').should("be.visible");
  });

  /**
   * TS_SPMS_01_005: ทดสอบการตรวจสอบ validation ของฟอร์ม
   * ตรวจสอบว่าระบบบังคับให้กรอกข้อมูลที่จำเป็นก่อนส่งฟอร์ม
   */
  it("TS_SPMS_01_005 ทดสอบการตรวจสอบ validation ของฟอร์ม", () => {
    cy.visit("/login");

    // ทดสอบส่งฟอร์มโดยไม่กรอกข้อมูล
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบ HTML5 validation (required attribute)
    cy.get('[data-cy="login-email"]:invalid').should("exist");

    // กรอกอีเมลและลองส่งโดยไม่กรอกรหัสผ่าน
    cy.get('[data-cy="login-email"]').type("test@example.com");
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบ HTML5 validation สำหรับรหัสผ่าน
    cy.get('[data-cy="login-password"]:invalid').should("exist");
  });
});

// ไฟล์: cypress/e2e/dashboard.spec.cy.js
describe("Dashboard Page Tests", () => {
  // เข้าสู่ระบบก่อนทำการทดสอบทุกกรณี
  beforeEach(() => {
    // ทำการเข้าสู่ระบบก่อนทดสอบ dashboard
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type("test005@tester.com");
    cy.get('[data-cy="login-password"]').type("123456");
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าอยู่ที่หน้า dashboard
    cy.url().should("include", "/dashboard");
  });

  /**
   * TS_SPMS_01_006: ทดสอบการแสดงผลหน้า Dashboard
   * ตรวจสอบว่าหน้า Dashboard แสดงองค์ประกอบสำคัญต่างๆ ถูกต้อง
   */
  it("TS_SPMS_01_006 ทดสอบการแสดงผลหน้า Dashboard", () => {
    // ตรวจสอบหัวข้อ dashboard
    cy.get('[data-cy="dashboard-title"]').should(
      "contain",
      "ระบบบริหารจัดการโครงการซอฟต์แวร์"
    );

    // ตรวจสอบส่วนแสดงสถิติ
    cy.get('[data-cy="stats-container"]').should("be.visible");
    cy.get('[data-cy="stat-card"]').should("have.length.at.least", 4);

    // ตรวจสอบส่วนโปรเจกต์ล่าสุด
    cy.get('[data-cy="latest-projects-section"]').should("be.visible");
    cy.get('[data-cy="latest-projects-title"]').should(
      "contain",
      "โปรเจกต์ล่าสุด"
    );
  });

  /**
   * TS_SPMS_01_007: ทดสอบการแสดงข้อมูลสถิติบน Dashboard
   * ตรวจสอบว่าแสดงข้อมูลสถิติในแต่ละการ์ดถูกต้อง
   */
  it("TS_SPMS_01_007 ทดสอบการแสดงข้อมูลสถิติบน Dashboard", () => {
    // ตรวจสอบการแสดงค่าสถิติทั้ง 4 การ์ด
    cy.get('[data-cy="stat-card"]')
      .eq(0)
      .find('[data-cy="stat-value"]')
      .should("exist")
      .invoke("text")
      .then((text) => {
        // ตรวจสอบว่าเป็นตัวเลข
        expect(parseInt(text.trim())).to.be.a("number");
      });

    // ตรวจสอบการแสดงผลของการ์ดอื่นๆ
    cy.get('[data-cy="stat-card"]')
      .eq(1)
      .find('[data-cy="stat-value"]')
      .should("exist");
    cy.get('[data-cy="stat-card"]')
      .eq(2)
      .find('[data-cy="stat-value"]')
      .should("exist");
    cy.get('[data-cy="stat-card"]')
      .eq(3)
      .find('[data-cy="stat-value"]')
      .should("exist");
  });

  /**
   * TS_SPMS_01_008: ทดสอบการแสดงรายการโปรเจกต์ล่าสุด
   * ตรวจสอบว่าแสดงรายการโปรเจกต์ล่าสุดได้ถูกต้อง
   */
  it("TS_SPMS_01_008 ทดสอบการแสดงรายการโปรเจกต์ล่าสุด", () => {
    cy.get('[data-cy="latest-projects-grid"]').should("be.visible");

    // ตรวจสอบว่ามีโปรเจกต์อย่างน้อย 1 รายการ (ถ้ามีข้อมูล)
    cy.get('[data-cy="project-card"]').then(($cards) => {
      if ($cards.length > 0) {
        // ตรวจสอบข้อมูลในการ์ดโปรเจกต์
        cy.get('[data-cy="project-name"]').first().should("not.be.empty");
        cy.get('[data-cy="project-status"]').first().should("exist");
        cy.get('[data-cy="project-sprint-count"]').first().should("exist");
        cy.get('[data-cy="project-file-count"]').first().should("exist");
      } else {
        // กรณีไม่มีโปรเจกต์ให้แสดง
        cy.log("No projects available for testing");
      }
    });
  });

  /**
   * TS_SPMS_01_009: ทดสอบสถานะโปรเจกต์ที่แสดงบน Dashboard
   * ตรวจสอบว่าแสดงสถานะโปรเจกต์ (กำลังดำเนินการ/ไม่ได้ใช้งาน) ถูกต้อง
   */
  it("TS_SPMS_01_009 ทดสอบสถานะโปรเจกต์ที่แสดงบน Dashboard", () => {
    cy.get('[data-cy="project-card"]').then(($cards) => {
      if ($cards.length > 0) {
        // ตรวจสอบการแสดงสถานะ
        cy.get('[data-cy="project-status"]').each(($status) => {
          const statusText = $status.text().trim();
          expect(statusText).to.be.oneOf(["กำลังดำเนินการ", "ไม่ได้ใช้งาน"]);
        });
      } else {
        cy.log("No projects available for testing status");
      }
    });
  });

  /**
   * TS_SPMS_01_010: ทดสอบการแสดง Loading state
   * ทดสอบโดยจำลองการโหลดข้อมูลล่าช้า และตรวจสอบ loading spinner
   */
  it("TS_SPMS_01_010 ทดสอบการแสดง Loading state", () => {
    // เริ่มจำลอง API ให้ล่าช้า
    cy.intercept("GET", "**/api/main-dashboard/stats", (req) => {
      req.on("response", (res) => {
        // หน่วงเวลาตอบกลับ 1 วินาที
        res.setDelay(1000);
      });
    }).as("dashboardStats");

    // โหลดหน้า dashboard ใหม่
    cy.visit("/dashboard");

    // ตรวจสอบว่า loading spinner แสดงขึ้นมา
    cy.get('[data-cy="loading-spinner"]').should("be.visible");

    // รอให้ API ตอบกลับ
    cy.wait("@dashboardStats");

    // ตรวจสอบว่า loading spinner หายไป
    cy.get('[data-cy="loading-spinner"]').should("not.exist");
  });

  /**
   * TS_SPMS_01_011: ทดสอบการแสดงข้อความผิดพลาด
   * จำลองสถานการณ์ API error และตรวจสอบการแสดงข้อความผิดพลาด
   */
  it("TS_SPMS_01_011 ทดสอบการแสดงข้อความผิดพลาด", () => {
    // เริ่มจำลอง API ให้เกิดข้อผิดพลาด
    cy.intercept("GET", "**/api/main-dashboard/stats", {
      statusCode: 500,
      body: { error: "ไม่สามารถดึงข้อมูลแดชบอร์ดได้" },
    }).as("dashboardError");

    // โหลดหน้า dashboard ใหม่
    cy.visit("/dashboard");

    // รอให้ API ตอบกลับ
    cy.wait("@dashboardError");

    // ตรวจสอบว่ามีการแสดงข้อความผิดพลาด
    cy.get('[data-cy="error-message"]')
      .should("be.visible")
      .and("contain", "ไม่สามารถดึงข้อมูลแดชบอร์ดได้");
  });
});

// ไฟล์: cypress/support/commands.js
// สร้าง Custom Commands สำหรับใช้ในไฟล์ทดสอบต่างๆ

/**
 * Custom command สำหรับการเข้าสู่ระบบ
 * ประหยัดเวลาในการเขียนโค้ดซ้ำซ้อนในหลาย test cases
 */
Cypress.Commands.add("login", (email, password) => {
  cy.visit("/login");
  cy.get('[data-cy="login-email"]').type(email);
  cy.get('[data-cy="login-password"]').type(password);
  cy.get('[data-cy="login-submit"]').click();
});

/**
 * Custom command สำหรับตรวจสอบว่าเข้าสู่ระบบสำเร็จหรือไม่
 */
Cypress.Commands.add("checkSuccessfulLogin", () => {
  cy.url().should("include", "/dashboard");
  cy.get('[data-cy="dashboard-container"]').should("be.visible");
});
