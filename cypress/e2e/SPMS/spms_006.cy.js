// cypress/e2e/sprints.cy.js

/**
 * Cypress Test Suite สำหรับหน้า Sprints
 * ทดสอบฟังก์ชันการทำงานต่างๆ ของหน้าจัดการสปรินต์
 */

describe("หน้าจัดการสปรินต์", () => {
  // ข้อมูลสำหรับการทดสอบ
  const testUser = {
    email: "test005@tester.com",
    password: "123456",
  };

  // ข้อมูลตัวอย่างสำหรับทดสอบ
  const mockProjects = [
    {
      project_id: 1,
      name: "โปรเจกต์ทดสอบ 1",
      description: "คำอธิบายโปรเจกต์ทดสอบ 1",
    },
    {
      project_id: 2,
      name: "โปรเจกต์ทดสอบ 2",
      description: "คำอธิบายโปรเจกต์ทดสอบ 2",
    },
  ];

  const mockSprints = [
    {
      sprint_id: 1,
      name: "สปรินต์ 1",
      project_id: 1,
      start_date: "2025-03-01",
      end_date: "2025-03-14",
      total_tests: 30,
      passed_tests: 25,
    },
    {
      sprint_id: 2,
      name: "สปรินต์ 2",
      project_id: 1,
      start_date: "2025-03-15",
      end_date: "2025-03-28",
      total_tests: 40,
      passed_tests: 35,
    },
  ];

  /**
   * การตั้งค่าก่อนแต่ละการทดสอบ
   * - เข้าสู่ระบบ
   * - จำลองการเรียก API
   * - นำทางไปยังหน้า Sprints
   */
  beforeEach(() => {
    // จำลองการเรียก API สำหรับข้อมูลโปรเจกต์
    cy.intercept("GET", "**/api/projects", {
      statusCode: 200,
      body: mockProjects,
    }).as("getProjects");

    // จำลองการเรียก API สำหรับข้อมูลสปรินต์ของโปรเจกต์ที่ 1
    cy.intercept("GET", "**/api/sprints?project_id=1", {
      statusCode: 200,
      body: mockSprints,
    }).as("getProjectSprints");

    // จำลองการเรียก API สำหรับกรณีที่ไม่มีสปรินต์
    cy.intercept("GET", "**/api/sprints?project_id=2", {
      statusCode: 200,
      body: [],
    }).as("getEmptySprints");

    // เข้าสู่ระบบก่อนทดสอบ
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type(testUser.email);
    cy.get('[data-cy="login-password"]').type(testUser.password);
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าได้เปลี่ยนเส้นทางไปที่ /mainpage
    cy.url().should("include", "/mainpage");

    // นำทางไปยังหน้า Sprints
    cy.visit("/sprints");
    cy.wait("@getProjects");
  });

  /**
   * กลุ่มการทดสอบ: การโหลดหน้าและการแสดงผลพื้นฐาน
   */
  describe("การโหลดหน้าและการแสดงผล", () => {
    it("TS_SPMS_06_001 ทดสอบการแสดงหน้าสปรินต์เบื้องต้น", () => {
      // ตรวจสอบองค์ประกอบพื้นฐานของหน้า
      cy.get('[data-cy="sprints-page"]').should("be.visible");
      cy.contains("การจัดสปรินต์").should("be.visible");
      cy.get('[data-cy="project-selection-section"]').should("be.visible");
    });

    it("TS_SPMS_06_002 ทดสอบการแสดงรายการโปรเจกต์ทั้งหมด", () => {
      // ตรวจสอบแต่ละโปรเจกต์ในรายการ
      mockProjects.forEach((project) => {
        cy.get(`[data-cy="project-card-${project.project_id}"]`).should(
          "be.visible"
        );
        cy.get(`[data-cy="project-card-${project.project_id}"]`).contains(
          project.name
        );
      });
    });
  });

  /**
   * กลุ่มการทดสอบ: การเลือกโปรเจกต์
   */
  describe("การเลือกโปรเจกต์", () => {
    it("TS_SPMS_06_003 ทดสอบการเลือกโปรเจกต์และแสดงสปรินต์", () => {
      // เลือกโปรเจกต์แรก
      cy.get(`[data-cy="project-card-1"]`).click();
      cy.wait("@getProjectSprints");

      // ตรวจสอบว่าโปรเจกต์ถูกเลือก (ตรวจสอบโดยการมีคลาสที่แตกต่าง)
      cy.get(`[data-cy="project-card-1"]`).should(
        "have.class",
        "border-blue-500"
      );

      // ตรวจสอบการแสดงส่วนข้อมูลสปรินต์
      cy.get('[data-cy="sprints-section"]').should("be.visible");
      cy.contains(`สปรินต์ในโปรเจกต์ ${mockProjects[0].name}`).should(
        "be.visible"
      );

      // ตรวจสอบการแสดงสปรินต์ทั้งหมด
      cy.get('[data-cy="sprints-grid"]').should("be.visible");
      mockSprints.forEach((sprint) => {
        cy.get(`[data-cy="sprint-card-${sprint.sprint_id}"]`).should(
          "be.visible"
        );
        cy.get(`[data-cy="sprint-card-${sprint.sprint_id}"]`).contains(
          sprint.name
        );
      });
    });

    it("TS_SPMS_06_004 ทดสอบการยกเลิกการเลือกโปรเจกต์", () => {
      // เลือกโปรเจกต์แรก
      cy.get(`[data-cy="project-card-1"]`).click();
      cy.wait("@getProjectSprints");

      // ตรวจสอบว่าโปรเจกต์ถูกเลือก
      cy.get(`[data-cy="project-card-1"]`).should(
        "have.class",
        "border-blue-500"
      );
      cy.get('[data-cy="sprints-section"]').should("be.visible");

      // คลิกที่โปรเจกต์เดิมอีกครั้งเพื่อยกเลิกการเลือก
      cy.get(`[data-cy="project-card-1"]`).click();

      // ตรวจสอบว่าได้ยกเลิกการเลือกโปรเจกต์
      cy.get(`[data-cy="project-card-1"]`).should(
        "not.have.class",
        "border-blue-500"
      );
      cy.get('[data-cy="sprints-section"]').should("not.exist");
    });

    it("TS_SPMS_06_005 ทดสอบการเปลี่ยนโปรเจกต์ที่เลือก", () => {
      // เลือกโปรเจกต์แรก
      cy.get(`[data-cy="project-card-1"]`).click();
      cy.wait("@getProjectSprints");

      // ตรวจสอบว่าโปรเจกต์ถูกเลือก
      cy.get(`[data-cy="project-card-1"]`).should(
        "have.class",
        "border-blue-500"
      );

      // เลือกโปรเจกต์ที่สอง
      cy.get(`[data-cy="project-card-2"]`).click();
      cy.wait("@getEmptySprints");

      // ตรวจสอบว่าโปรเจกต์ที่สองถูกเลือกแทน
      cy.get(`[data-cy="project-card-1"]`).should(
        "not.have.class",
        "border-blue-500"
      );
      cy.get(`[data-cy="project-card-2"]`).should(
        "have.class",
        "border-blue-500"
      );
      cy.contains(`สปรินต์ในโปรเจกต์ ${mockProjects[1].name}`).should(
        "be.visible"
      );
    });
  });

  /**
   * กลุ่มการทดสอบ: การแสดงสปรินต์
   */
  describe("การแสดงสปรินต์", () => {
    it("TS_SPMS_06_006 ทดสอบการแสดงสปรินต์เมื่อมีข้อมูล", () => {
      // เลือกโปรเจกต์ที่มีสปรินต์
      cy.get(`[data-cy="project-card-1"]`).click();
      cy.wait("@getProjectSprints");

      // ตรวจสอบจำนวนสปรินต์ที่แสดง
      cy.get('[data-cy="sprints-grid"] > div').should(
        "have.length",
        mockSprints.length
      );

      // ตรวจสอบข้อมูลของแต่ละสปรินต์
      mockSprints.forEach((sprint) => {
        // ตรวจสอบชื่อสปรินต์
        cy.get(`[data-cy="sprint-card-${sprint.sprint_id}"]`).contains(
          sprint.name
        );

        // ตรวจสอบช่วงวันที่
        const startDate = new Date(sprint.start_date).toLocaleDateString(
          "th-TH",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        );
        const endDate = new Date(sprint.end_date).toLocaleDateString("th-TH", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        cy.get(`[data-cy="sprint-date-range-${sprint.sprint_id}"]`).should(
          "contain",
          startDate
        );
        cy.get(`[data-cy="sprint-date-range-${sprint.sprint_id}"]`).should(
          "contain",
          endDate
        );

        // ตรวจสอบปุ่ม "ดูรายละเอียดเพิ่มเติม"
        cy.get(`[data-cy="view-sprint-details-${sprint.sprint_id}"]`).should(
          "be.visible"
        );
      });
    });

    it("TS_SPMS_06_007 ทดสอบการแสดงข้อความเมื่อไม่มีสปรินต์", () => {
      // เลือกโปรเจกต์ที่ไม่มีสปรินต์
      cy.get(`[data-cy="project-card-2"]`).click();
      cy.wait("@getEmptySprints");

      // ตรวจสอบการแสดงข้อความเมื่อไม่มีสปรินต์
      cy.get('[data-cy="no-sprints-message"]').should("be.visible");
      cy.contains("ยังไม่มีสปรินต์ในโปรเจกต์นี้").should("be.visible");
      cy.get('[data-cy="create-first-sprint-button"]').should("be.visible");
    });
  });

  /**
   * กลุ่มการทดสอบ: การนำทาง
   */
  describe("การนำทาง", () => {
    it("TS_SPMS_06_008 ทดสอบการนำทางไปยังหน้าสร้างสปรินต์", () => {
      // จำลองการนำทาง
      cy.intercept("GET", "**/sprints/create/**", {}).as(
        "navigateToCreateSprint"
      );

      // เลือกโปรเจกต์
      cy.get(`[data-cy="project-card-1"]`).click();
      cy.wait("@getProjectSprints");

      // คลิกปุ่มสร้างสปรินต์
      cy.get('[data-cy="create-sprint-button"]').click();

      // ตรวจสอบการนำทาง
      cy.url().should(
        "include",
        `/sprints/create/${mockProjects[0].project_id}`
      );
    });

    it("TS_SPMS_06_009 ทดสอบการนำทางไปยังหน้าสร้างสปรินต์เมื่อยังไม่มีสปรินต์", () => {
      // จำลองการนำทาง
      cy.intercept("GET", "**/sprints/create/**", {}).as(
        "navigateToCreateSprint"
      );

      // เลือกโปรเจกต์ที่ไม่มีสปรินต์
      cy.get(`[data-cy="project-card-2"]`).click();
      cy.wait("@getEmptySprints");

      // คลิกปุ่มสร้างสปรินต์แรก
      cy.get('[data-cy="create-first-sprint-button"]').click();

      // ตรวจสอบการนำทาง
      cy.url().should(
        "include",
        `/sprints/create/${mockProjects[1].project_id}`
      );
    });

    it("TS_SPMS_06_010 ทดสอบการนำทางไปยังหน้ารายละเอียดสปรินต์", () => {
      // จำลองการนำทาง
      cy.intercept("GET", "**/sprints/**", {}).as("navigateToSprintDetails");

      // เลือกโปรเจกต์ที่มีสปรินต์
      cy.get(`[data-cy="project-card-1"]`).click();
      cy.wait("@getProjectSprints");

      // คลิกปุ่มดูรายละเอียดของสปรินต์แรก
      cy.get(`[data-cy="view-sprint-details-1"]`).click();

      // ตรวจสอบการนำทาง
      cy.url().should("include", `/sprints/1`);
    });
  });

  /**
   * กลุ่มการทดสอบ: กรณีข้อผิดพลาด
   */
  describe("กรณีข้อผิดพลาด", () => {
    it("TS_SPMS_06_011 ทดสอบกรณีการดึงข้อมูลโปรเจกต์ล้มเหลว", () => {
      // เริ่มต้นการทดสอบใหม่เพื่อจำลองกรณีข้อผิดพลาด
      cy.visit("/login");
      cy.get('[data-cy="login-email"]').type(testUser.email);
      cy.get('[data-cy="login-password"]').type(testUser.password);

      // จำลองการเรียก API ล้มเหลว
      cy.intercept("GET", "**/api/projects", {
        statusCode: 500,
        body: { message: "Failed to fetch projects" },
      }).as("getProjectsError");

      cy.get('[data-cy="login-submit"]').click();
      cy.url().should("include", "/mainpage");

      // นำทางไปยังหน้า Sprints
      cy.visit("/sprints");
      cy.wait("@getProjectsError");

      // ตรวจสอบการแสดงข้อความผิดพลาด
      cy.get(".bg-red-50").should("be.visible");
      cy.contains("Failed to fetch projects").should("be.visible");
    });

    it("TS_SPMS_06_012 ทดสอบกรณีการดึงข้อมูลสปรินต์ล้มเหลว", () => {
      // จำลองการเรียก API ล้มเหลวสำหรับการดึงข้อมูลสปรินต์
      cy.intercept("GET", "**/api/sprints?project_id=1", {
        statusCode: 500,
        body: { message: "Failed to fetch sprints" },
      }).as("getSprintsError");

      // เลือกโปรเจกต์
      cy.get(`[data-cy="project-card-1"]`).click();
      cy.wait("@getSprintsError");

      // ตรวจสอบการแสดงข้อความผิดพลาด
      cy.get(".bg-red-50").should("be.visible");
      cy.contains("Failed to fetch sprints").should("be.visible");
    });
  });

  /**
   * กลุ่มการทดสอบ: ความสมบูรณ์ของหน้า
   */
  describe("ความสมบูรณ์ของหน้า", () => {
    it("TS_SPMS_06_013 ทดสอบกรณีไม่มีโปรเจกต์", () => {
      // เริ่มต้นการทดสอบใหม่เพื่อจำลองกรณีไม่มีโปรเจกต์
      cy.visit("/login");
      cy.get('[data-cy="login-email"]').type(testUser.email);
      cy.get('[data-cy="login-password"]').type(testUser.password);

      // จำลองการเรียก API ส่งรายการว่าง
      cy.intercept("GET", "**/api/projects", {
        statusCode: 200,
        body: [],
      }).as("getEmptyProjects");

      cy.get('[data-cy="login-submit"]').click();
      cy.url().should("include", "/mainpage");

      // นำทางไปยังหน้า Sprints
      cy.visit("/sprints");
      cy.wait("@getEmptyProjects");

      // ตรวจสอบการแสดงข้อความเมื่อไม่มีโปรเจกต์
      cy.get('[data-cy="project-notfound-1"]').should("be.visible");
      cy.contains("ไม่พบโปรเจกต์").should("be.visible");
      cy.get('[data-cy="project-notfound-2"]').should("be.visible");
    });
  });

  /**
   * กลุ่มการทดสอบ: การโหลดข้อมูล
   */
  describe("การโหลดข้อมูล", () => {
    it("TS_SPMS_06_014 ทดสอบการแสดงสถานะโหลดข้อมูล", () => {
      // จำลองการเรียก API ที่ใช้เวลานาน
      cy.intercept("GET", "**/api/sprints?project_id=1", (req) => {
        // หน่วงเวลาการตอบกลับ 1 วินาที
        req.reply((res) => {
          res.delay = 1000;
          res.body = mockSprints;
          return res;
        });
      }).as("getSlowSprints");

      // เลือกโปรเจกต์
      cy.get(`[data-cy="project-card-1"]`).click();

      // ตรวจสอบว่าแสดงสถานะกำลังโหลด
      cy.get('[data-cy="sprints-loading"]').should("be.visible");
      cy.contains("กำลังโหลดสปรินต์...").should("be.visible");

      // รอการโหลดเสร็จสิ้น
      cy.wait("@getSlowSprints");

      // ตรวจสอบว่าสถานะโหลดหายไป
      cy.get('[data-cy="sprints-loading"]').should("not.exist");
      cy.get('[data-cy="sprints-grid"]').should("be.visible");
    });
  });
});
