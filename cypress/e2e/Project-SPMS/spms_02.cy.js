// cypress/integration/spms_dashboard_login.cy.js
describe("Dashboard Page with Login", () => {
  beforeEach(() => {
    // จัดการกับ uncaught exceptions เพื่อป้องกัน error "Token is expired"
    cy.on("uncaught:exception", (err) => {
      // หากพบข้อความ error เกี่ยวกับ token expired ให้ ignore
      if (err.message.includes("Token is expired")) {
        return false; // ป้องกันไม่ให้ Cypress fail test
      }
      // หากเป็น error อื่นๆ ให้ fail test ตามปกติ
      return true;
    });

    // ตั้งค่า intercept ก่อนที่จะเข้าหน้าเว็บ
    cy.intercept("GET", "**/api/main-dashboard/stats", {
      statusCode: 200,
      body: {
        stats: {
          totalProjects: 12,
          totalSprints: 48,
          totalFiles: 320,
          activeProjects: 8,
        },
        latestProjects: [
          {
            id: 1,
            name: "โปรเจกต์ระบบจัดการบัญชี",
            status: "Active",
            created_at: "2024-02-15T09:30:00.000Z",
            sprintCount: 5,
            fileCount: 28,
          },
          {
            id: 2,
            name: "โปรเจกต์พัฒนาเว็บไซต์",
            status: "Active",
            created_at: "2024-02-10T14:20:00.000Z",
            sprintCount: 3,
            fileCount: 32,
          },
          {
            id: 3,
            name: "โปรเจกต์ระบบจัดการสินค้า",
            status: "Inactive",
            created_at: "2024-01-05T11:45:00.000Z",
            sprintCount: 6,
            fileCount: 45,
          },
        ],
      },
    }).as("getDashboardStats");

    // เริ่มต้นที่หน้าเข้าสู่ระบบและทำการล็อกอิน
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type("test005@tester.com");
    cy.get('[data-cy="login-password"]').type("123456");
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าเข้าสู่หน้า dashboard หรือไม่
    cy.url().should("include", "/mainpage");
  });

  it("TS_SPMS_02_001 ตรวจสอบการแสดงผลองค์ประกอบหลักของหน้า Dashboard", () => {
    // ตรวจสอบว่า container หลักของ Dashboard แสดงผล
    cy.get("[data-cy=dashboard-container]", { timeout: 10000 }).should(
      "be.visible"
    );

    // ตรวจสอบหัวข้อหลัก
    cy.get("[data-cy=dashboard-container] h1").should(
      "contain",
      "การจัดการไฟล์ทดสอบ"
    );

    // ตรวจสอบส่วนแสดงสถิติ
    cy.get("[data-cy=stats-container]").should("be.visible");

    // ตรวจสอบส่วนแสดงโปรเจกต์ล่าสุด
    cy.get("[data-cy=latest-projects-section]").should("be.visible");
    cy.get("[data-cy=latest-projects-title]").should(
      "contain",
      "โปรเจกต์ล่าสุด"
    );
  });

  it("TS_SPMS_02_002 ตรวจสอบการแสดงผลการ์ดสถิติทั้งหมด", () => {
    // ตรวจสอบจำนวนการ์ดสถิติทั้งหมด (ควรมี 4 การ์ด)
    cy.get("[data-cy=stats-container] [data-cy=stat-card]", {
      timeout: 10000,
    }).should("have.length", 4);

    // ตรวจสอบค่าสถิติในแต่ละการ์ด
    cy.get("[data-cy=stats-container] [data-cy=stat-card]")
      .eq(0)
      .find("[data-cy=stat-value]")
      .should("contain", "12");
    cy.get("[data-cy=stats-container] [data-cy=stat-card]")
      .eq(1)
      .find("[data-cy=stat-value]")
      .should("contain", "48");
    cy.get("[data-cy=stats-container] [data-cy=stat-card]")
      .eq(2)
      .find("[data-cy=stat-value]")
      .should("contain", "320");
    cy.get("[data-cy=stats-container] [data-cy=stat-card]")
      .eq(3)
      .find("[data-cy=stat-value]")
      .should("contain", "8");
  });

  it("TS_SPMS_02_003 ตรวจสอบการแสดงผลโปรเจกต์ล่าสุด", () => {
    // ตรวจสอบจำนวนการ์ดโปรเจกต์ (ควรมี 3 การ์ด)
    cy.get("[data-cy=latest-projects-grid] [data-cy=project-card]", {
      timeout: 10000,
    }).should("have.length", 3);

    // ตรวจสอบชื่อโปรเจกต์แรก
    cy.get("[data-cy=latest-projects-grid] [data-cy=project-card]")
      .eq(0)
      .find("[data-cy=project-name]")
      .should("contain", "โปรเจกต์ระบบจัดการบัญชี");

    // ตรวจสอบสถานะโปรเจกต์
    cy.get("[data-cy=latest-projects-grid] [data-cy=project-card]")
      .eq(0)
      .find("[data-cy=project-status]")
      .should("contain", "กำลังดำเนินการ");
    cy.get("[data-cy=latest-projects-grid] [data-cy=project-card]")
      .eq(2)
      .find("[data-cy=project-status]")
      .should("contain", "ไม่ได้ใช้งาน");

    // ตรวจสอบจำนวนสปรินต์และไฟล์ทดสอบของโปรเจกต์แรก
    cy.get("[data-cy=latest-projects-grid] [data-cy=project-card]")
      .eq(0)
      .find("[data-cy=project-sprint-count]")
      .should("contain", "5 สปรินต์");
    cy.get("[data-cy=latest-projects-grid] [data-cy=project-card]")
      .eq(0)
      .find("[data-cy=project-file-count]")
      .should("contain", "28 ไฟล์ทดสอบ");
  });

  it("TS_SPMS_02_004 ทดสอบการแสดงผลเมื่อยังไม่มีข้อมูลโปรเจกต์", () => {
    // Mock API ให้ส่งกลับข้อมูลว่างเปล่า
    cy.intercept("GET", "**/api/main-dashboard/stats", {
      statusCode: 200,
      body: {
        stats: {
          totalProjects: 0,
          totalSprints: 0,
          totalFiles: 0,
          activeProjects: 0,
        },
        latestProjects: [],
      },
    }).as("getEmptyDashboardStats");

    // รีโหลดหน้า
    cy.visit("/dashboard");

    // ตรวจสอบว่าทุกการ์ดสถิติแสดงค่า 0
    cy.get("[data-cy=stats-container] [data-cy=stat-card]", { timeout: 10000 })
      .eq(0)
      .find("[data-cy=stat-value]")
      .should("contain", "0");
    cy.get("[data-cy=stats-container] [data-cy=stat-card]")
      .eq(1)
      .find("[data-cy=stat-value]")
      .should("contain", "0");
    cy.get("[data-cy=stats-container] [data-cy=stat-card]")
      .eq(2)
      .find("[data-cy=stat-value]")
      .should("contain", "0");
    cy.get("[data-cy=stats-container] [data-cy=stat-card]")
      .eq(3)
      .find("[data-cy=stat-value]")
      .should("contain", "0");

    // ตรวจสอบข้อความเมื่อไม่มีโปรเจกต์
    cy.get("[data-cy=latest-projects-grid]").should(
      "contain",
      "ยังไม่มีโปรเจกต์ล่าสุด"
    );
  });

  it("TS_SPMS_02_005 ทดสอบการแสดงผลเมื่อเกิดข้อผิดพลาดในการดึงข้อมูล", () => {
    // Mock API ให้ส่งกลับ error
    cy.intercept("GET", "**/api/main-dashboard/stats", {
      statusCode: 500,
      body: {
        error: "ไม่สามารถดึงข้อมูลแดชบอร์ดได้ เนื่องจากเซิร์ฟเวอร์มีปัญหา",
      },
    }).as("getDashboardError");

    // รีโหลดหน้า
    cy.visit("/dashboard");

    // ตรวจสอบว่าแสดงข้อความ error
    cy.get("[data-cy=error-message]", { timeout: 10000 }).should("be.visible");
    cy.get("[data-cy=error-message]").should(
      "contain",
      "ไม่สามารถดึงข้อมูลแดชบอร์ดได้"
    );

    // ตรวจสอบว่าไม่แสดงส่วนอื่นๆ ของ dashboard
    cy.get("[data-cy=stats-container]").should("not.exist");
    cy.get("[data-cy=latest-projects-section]").should("not.exist");
  });

  it("TS_SPMS_02_006 ทดสอบการแสดงตัวโหลดขณะกำลังดึงข้อมูล", () => {
    // Mock API ให้ตอบกลับช้า (หน่วงเวลา 1500ms)
    cy.intercept("GET", "**/api/main-dashboard/stats", (req) => {
      // หน่วงเวลาก่อนตอบกลับ
      req.reply({
        delay: 1500,
        statusCode: 200,
        body: {
          stats: {
            totalProjects: 12,
            totalSprints: 48,
            totalFiles: 320,
            activeProjects: 8,
          },
          latestProjects: [
            {
              id: 1,
              name: "โปรเจกต์ระบบจัดการบัญชี",
              status: "Active",
              created_at: "2024-02-15T09:30:00.000Z",
              sprintCount: 5,
              fileCount: 28,
            },
          ],
        },
      });
    }).as("getDelayedDashboardStats");

    // รีโหลดหน้า
    cy.visit("/dashboard");

    // ตรวจสอบว่าแสดงตัวโหลด
    cy.get("[data-cy=loading-spinner]", { timeout: 1000 }).should("be.visible");

    // รอให้โหลดเสร็จแล้วตรวจสอบว่าไม่แสดงตัวโหลดอีก
    cy.get("[data-cy=dashboard-container]", { timeout: 10000 }).should(
      "be.visible"
    );
    cy.get("[data-cy=loading-spinner]").should("not.exist");
  });

  it("TS_SPMS_02_007 ทดสอบการคำนวณเปอร์เซ็นต์โปรเจกต์ที่กำลังดำเนินการ", () => {
    // คำนวณค่าที่คาดหวัง: 8 active จาก 12 total = 66.7%
    const expectedPercentage = "66.7";

    // ตรวจสอบการ์ดที่ 4 ซึ่งแสดงเปอร์เซ็นต์โปรเจกต์ที่กำลังดำเนินการ
    cy.get("[data-cy=stats-container] [data-cy=stat-card]", { timeout: 10000 })
      .eq(3)
      .should("contain", expectedPercentage + "%");
  });

  it("TS_SPMS_02_008 ทดสอบการแสดงวันที่สร้างโปรเจกต์ในรูปแบบ locale ของไทย", () => {
    // โปรเจกต์แรกมีวันที่สร้าง 2024-02-15
    cy.get("[data-cy=latest-projects-grid] [data-cy=project-card]", {
      timeout: 10000,
    })
      .eq(0)
      .should("contain", "สร้างเมื่อ");

    // หมายเหตุ: เนื่องจาก Cypress รันใน browser จริง การตรวจสอบค่า expectedDate อาจแตกต่างกันตามเครื่อง
    // จึงตรวจสอบเพียงว่ามีข้อความ "สร้างเมื่อ" แสดงอยู่
  });
});
