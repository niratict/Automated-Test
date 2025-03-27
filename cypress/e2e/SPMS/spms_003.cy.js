// cypress/integration/projects.spec.js

/**
 * ไฟล์ทดสอบสำหรับหน้าจัดการโปรเจกต์
 * ทดสอบฟังก์ชันการทำงานหลักของหน้า Projects
 */

describe("การทดสอบหน้าจัดการโปรเจกต์", () => {
  // ข้อมูลสำหรับการทดสอบ
  const testUser = {
    email: "test005@tester.com",
    password: "123456",
  };

  // รายการโปรเจกต์จำลอง
  const mockProjects = [
    {
      project_id: 1,
      name: "โปรเจกต์ทดสอบ 1",
      description: "คำอธิบายสำหรับโปรเจกต์ทดสอบที่ 1",
      status: "Active",
    },
    {
      project_id: 2,
      name: "โปรเจกต์ทดสอบ 2",
      description: "คำอธิบายสำหรับโปรเจกต์ทดสอบที่ 2",
      status: "Completed",
    },
  ];

  // จัดเตรียมสภาพแวดล้อมก่อนการทดสอบแต่ละครั้ง
  beforeEach(() => {
    // ล้างคุกกี้และจัดการข้อมูลที่เก็บในเบราว์เซอร์
    cy.clearCookies();
    cy.clearLocalStorage();

    // จำลองการตอบกลับจาก API สำหรับการดึงข้อมูลโปรเจกต์
    cy.intercept("GET", "**/api/projects", {
      statusCode: 200,
      body: mockProjects,
    }).as("getProjects");

    // เข้าสู่ระบบก่อนทดสอบ
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type(testUser.email);
    cy.get('[data-cy="login-password"]').type(testUser.password);
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าได้เปลี่ยนเส้นทางไปที่ /mainpage
    cy.url().should("include", "/mainpage");

    // นำทางไปยังหน้าโปรเจกต์
    cy.visit("/projects");
    cy.wait("@getProjects");
  });

  /**
   * กลุ่มทดสอบการโหลดหน้าและการแสดงผล
   */
  describe("การแสดงหน้าโปรเจกต์", () => {
    it("TS_SPMS_03_001 ทดสอบการแสดงหน้าโปรเจกต์เมื่อมีข้อมูล", () => {
      // ตรวจสอบหัวข้อหน้า
      cy.get('[data-cy="page-title"]').should("contain", "จัดการโปรเจกต์");

      // ตรวจสอบการแสดงรายการโปรเจกต์
      cy.get('[data-cy="projects-grid"]')
        .should("be.visible")
        .find('[data-cy^="project-card-"]')
        .should("have.length", mockProjects.length);

      // ตรวจสอบข้อมูลของโปรเจกต์แรก
      cy.get(`[data-cy="project-card-${mockProjects[0].project_id}"]`).within(
        () => {
          cy.get('[data-cy="project-name"]').should(
            "contain",
            mockProjects[0].name
          );
          cy.get('[data-cy="project-description"]').should(
            "contain",
            mockProjects[0].description
          );
          cy.get('[data-cy="project-status-badge"]').should(
            "contain",
            "กำลังดำเนินการ"
          );
        }
      );

      // ตรวจสอบข้อมูลของโปรเจกต์ที่สอง
      cy.get(`[data-cy="project-card-${mockProjects[1].project_id}"]`).within(
        () => {
          cy.get('[data-cy="project-name"]').should(
            "contain",
            mockProjects[1].name
          );
          cy.get('[data-cy="project-description"]').should(
            "contain",
            mockProjects[1].description
          );
          cy.get('[data-cy="project-status-badge"]').should(
            "contain",
            "เสร็จสิ้น"
          );
        }
      );
    });

    it("TS_SPMS_03_002 ทดสอบการแสดงหน้าโปรเจกต์เมื่อไม่มีข้อมูล", () => {
      // จำลองการตอบกลับจาก API เป็นรายการว่าง
      cy.intercept("GET", "**/api/projects", {
        statusCode: 200,
        body: [],
      }).as("getEmptyProjects");

      // โหลดหน้าโปรเจกต์ใหม่
      cy.visit("/projects");
      cy.wait("@getEmptyProjects");

      // ตรวจสอบการแสดงข้อความเมื่อไม่มีโปรเจกต์
      cy.get('[data-cy="empty-projects"]').should("be.visible");
      cy.get('[data-cy="empty-projects"]').should(
        "contain",
        "ยังไม่มีการสร้างโปรเจกต์"
      );
      cy.get('[data-cy="create-first-project-button"]').should("be.visible");
    });

    it("TS_SPMS_03_003 ทดสอบการแสดงตัวโหลดระหว่างดึงข้อมูล", () => {
      // จำลองการตอบกลับจาก API ที่ใช้เวลานาน
      cy.intercept("GET", "**/api/projects", (req) => {
        // หน่วงเวลาการตอบกลับเพื่อให้แสดงตัวโหลด
        req.on("response", (res) => {
          res.setDelay(1000);
          res.send({ body: mockProjects });
        });
      }).as("getDelayedProjects");

      // โหลดหน้าโปรเจกต์ใหม่
      cy.visit("/projects");

      // ตรวจสอบการแสดงตัวโหลด
      cy.get('[data-cy="loading-spinner"]').should("be.visible");

      // รอจนกว่าจะได้รับการตอบกลับและตรวจสอบว่าตัวโหลดหายไป
      cy.wait("@getDelayedProjects");
      cy.get('[data-cy="loading-spinner"]').should("not.exist");
    });

    it("TS_SPMS_03_004 ทดสอบการแสดงข้อความเมื่อเกิดข้อผิดพลาด", () => {
      // จำลองการตอบกลับจาก API เป็นข้อผิดพลาด
      cy.intercept("GET", "**/api/projects", {
        statusCode: 500,
        body: {
          message: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจกต์",
        },
      }).as("getProjectsError");

      // โหลดหน้าโปรเจกต์ใหม่
      cy.visit("/projects");
      cy.wait("@getProjectsError");

      // ตรวจสอบการแสดงข้อความเตือนข้อผิดพลาด
      cy.get('[data-cy="error-message"]').should("be.visible");
      cy.get('[data-cy="error-message"]').should(
        "contain",
        "เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจกต์"
      );
    });
  });

  /**
   * กลุ่มทดสอบการเนวิเกตและการทำงานของปุ่ม
   */
  describe("การทำงานของปุ่มและการนำทาง", () => {
    it("TS_SPMS_03_005 ทดสอบการกดปุ่มสร้างโปรเจกต์ใหม่", () => {
      // ตรวจสอบการมีอยู่ของปุ่มสร้างโปรเจกต์ใหม่
      cy.get('[data-cy="create-project-button"]').should("be.visible");

      // กดปุ่มสร้างโปรเจกต์ใหม่
      cy.get('[data-cy="create-project-button"]').click();

      // ตรวจสอบการเปลี่ยนเส้นทาง
      cy.url().should("include", "/projects/create");
    });

    it("TS_SPMS_03_006 ทดสอบการกดปุ่มดูรายละเอียดเพิ่มเติม", () => {
      // จำลองการกดปุ่มดูรายละเอียดของโปรเจกต์แรก
      cy.get(`[data-cy="project-card-${mockProjects[0].project_id}"]`)
        .find('[data-cy="view-details-button"]')
        .click();

      // ตรวจสอบการเปลี่ยนเส้นทาง
      cy.url().should("include", `/projects/${mockProjects[0].project_id}`);
    });

    it("TS_SPMS_03_007 ทดสอบการกดปุ่มสร้างโปรเจกต์ในกรณีไม่มีโปรเจกต์", () => {
      // จำลองการตอบกลับจาก API เป็นรายการว่าง
      cy.intercept("GET", "**/api/projects", {
        statusCode: 200,
        body: [],
      }).as("getEmptyProjects");

      // โหลดหน้าโปรเจกต์ใหม่
      cy.visit("/projects");
      cy.wait("@getEmptyProjects");

      // กดปุ่มสร้างโปรเจกต์ในส่วนแสดงเมื่อไม่มีโปรเจกต์
      cy.get('[data-cy="create-first-project-button"]').click();

      // ตรวจสอบการเปลี่ยนเส้นทาง
      cy.url().should("include", "/projects/create");
    });
  });

  /**
   * กลุ่มทดสอบการแสดงสถานะโปรเจกต์
   */
  describe("การแสดงสถานะโปรเจกต์", () => {
    it('TS_SPMS_03_008 ทดสอบการแสดงป้ายสถานะ "กำลังดำเนินการ" (Active)', () => {
      // จำลองโปรเจกต์ที่มีสถานะ Active
      const activeProject = {
        project_id: 1,
        name: "โปรเจกต์ที่กำลังดำเนินการ",
        description: "โปรเจกต์ที่มีสถานะกำลังดำเนินการ",
        status: "Active",
      };

      cy.intercept("GET", "**/api/projects", {
        statusCode: 200,
        body: [activeProject],
      }).as("getActiveProject");

      cy.visit("/projects");
      cy.wait("@getActiveProject");

      // ตรวจสอบการแสดงป้ายสถานะ
      cy.get(`[data-cy="project-card-${activeProject.project_id}"]`)
        .find('[data-cy="project-status-badge"]')
        .should("contain", "กำลังดำเนินการ")
        .and("have.class", "bg-green-100");
    });

    it('TS_SPMS_03_009 ทดสอบการแสดงป้ายสถานะ "เสร็จสิ้น" (Completed)', () => {
      // จำลองโปรเจกต์ที่มีสถานะ Completed
      const completedProject = {
        project_id: 2,
        name: "โปรเจกต์ที่เสร็จสิ้น",
        description: "โปรเจกต์ที่มีสถานะเสร็จสิ้น",
        status: "Completed",
      };

      cy.intercept("GET", "**/api/projects", {
        statusCode: 200,
        body: [completedProject],
      }).as("getCompletedProject");

      cy.visit("/projects");
      cy.wait("@getCompletedProject");

      // ตรวจสอบการแสดงป้ายสถานะ
      cy.get(`[data-cy="project-card-${completedProject.project_id}"]`)
        .find('[data-cy="project-status-badge"]')
        .should("contain", "เสร็จสิ้น")
        .and("have.class", "bg-blue-500");
    });

    it('TS_SPMS_03_010 ทดสอบการแสดงป้ายสถานะ "ระงับชั่วคราว" (On Hold)', () => {
      // จำลองโปรเจกต์ที่มีสถานะ On Hold
      const onHoldProject = {
        project_id: 3,
        name: "โปรเจกต์ที่ถูกระงับชั่วคราว",
        description: "โปรเจกต์ที่มีสถานะระงับชั่วคราว",
        status: "On Hold",
      };

      cy.intercept("GET", "**/api/projects", {
        statusCode: 200,
        body: [onHoldProject],
      }).as("getOnHoldProject");

      cy.visit("/projects");
      cy.wait("@getOnHoldProject");

      // ตรวจสอบการแสดงป้ายสถานะ
      cy.get(`[data-cy="project-card-${onHoldProject.project_id}"]`)
        .find('[data-cy="project-status-badge"]')
        .should("contain", "ระงับชั่วคราว")
        .and("have.class", "bg-gray-100");
    });
  });

  /**
   * กลุ่มทดสอบการแสดงผลบนขนาดหน้าจอต่างๆ (Responsive)
   */
  describe("การแสดงผลบนขนาดหน้าจอต่างๆ", () => {
    it("TS_SPMS_03_011 ทดสอบการแสดงผลบนอุปกรณ์มือถือ", () => {
      // กำหนดขนาดหน้าจอให้เป็นขนาดมือถือ
      cy.viewport("iphone-x");

      // ตรวจสอบการแสดงผลของหน้าโปรเจกต์
      cy.get('[data-cy="page-title"]').should("be.visible");
      cy.get('[data-cy="create-project-button"]').should("be.visible");
    });

    it("TS_SPMS_03_012 ทดสอบการแสดงผลบนแท็บเล็ต", () => {
      // กำหนดขนาดหน้าจอให้เป็นขนาดแท็บเล็ต
      cy.viewport("ipad-2");

      // ตรวจสอบการแสดงผลของหน้าโปรเจกต์
      cy.get('[data-cy="page-title"]').should("be.visible");
      cy.get('[data-cy="create-project-button"]').should("be.visible");
    });
  });

  /**
   * กลุ่มทดสอบการรักษาความปลอดภัยและการจัดการเซสชัน
   */
  describe("การรักษาความปลอดภัยและการจัดการเซสชัน", () => {
    it("TS_SPMS_03_013 ทดสอบการเข้าถึงหน้าโปรเจกต์โดยไม่ได้เข้าสู่ระบบ", () => {
      // ออกจากระบบ
      cy.clearCookies();
      cy.clearLocalStorage();

      // พยายามเข้าถึงหน้าโปรเจกต์โดยตรง
      cy.visit("/projects", { failOnStatusCode: false });

      // ตรวจสอบว่าถูกเปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบ
      cy.url().should("include", "/login");
    });

    it("TS_SPMS_03_014 ทดสอบการแสดงข้อผิดพลาดเมื่อ Token หมดอายุ", () => {
      // จำลองการตอบกลับจาก API ว่า Token หมดอายุ
      cy.intercept("GET", "**/api/projects", {
        statusCode: 401,
        body: {
          message: "Token หมดอายุหรือไม่ถูกต้อง",
        },
      }).as("getTokenError");

      // เข้าถึงหน้าโปรเจกต์
      cy.visit("/projects");
      cy.wait("@getTokenError");
      // แสดงข้อความผิดพลาด
      cy.get('[data-cy="error-message"]').should('contain', 'Token หมดอายุหรือไม่ถูกต้อง');
      // ตรวจสอบการเปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบหรือการแสดงข้อความข้อผิดพลาด
      // cy.url().should("include", "/login");
      // หรือในกรณีที่มีการแสดงข้อผิดพลาด
      // cy.get('[data-cy="error-message"]').should('contain', 'Token หมดอายุหรือไม่ถูกต้อง');
    });
  });
});
