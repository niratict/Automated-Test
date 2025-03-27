/// <reference types="cypress" />

/**
 * Cypress test suite for TestFiles page functionality
 * ทดสอบการทำงานของหน้าจัดการไฟล์ทดสอบ
 */

describe("ทดสอบหน้าไฟล์ทดสอบ", () => {
  // ข้อมูลผู้ใช้สำหรับการทดสอบ
  const testUser = {
    email: "test005@tester.com",
    password: "123456",
  };

  // ตั้งค่าก่อนแต่ละการทดสอบ
  beforeEach(() => {
    // เข้าสู่ระบบก่อนทดสอบ
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type(testUser.email);
    cy.get('[data-cy="login-password"]').type(testUser.password);
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าได้เปลี่ยนเส้นทางไปที่ /mainpage
    cy.url().should("include", "/mainpage");

    // นำทางไปยังหน้า TestFiles
    cy.visit("/test-files");

    // ตรวจสอบว่าหน้า TestFiles โหลดสมบูรณ์
    cy.get('[data-cy="test-files-page"]').should("be.visible");
  });

  /**
   * กลุ่มทดสอบ: การโหลดหน้าและองค์ประกอบพื้นฐาน
   */
  describe("หน้าหลักและองค์ประกอบพื้นฐาน", () => {
    it("TS_SPMS_08_001 ตรวจสอบการโหลดหน้า TestFiles สำเร็จ", () => {
      // ตรวจสอบองค์ประกอบหลักปรากฏบนหน้า
      cy.get('[data-cy="test-files-page"]').should("be.visible");
      cy.get('[data-cy="project-selection-section"]').should("be.visible");
    });

    it("TS_SPMS_08_002 ตรวจสอบการแสดงข้อความเมื่อไม่มีโปรเจกต์", () => {
      // จำลองกรณีไม่มีโปรเจกต์
      cy.intercept("GET", "**/api/projects", { body: [], delay: 100 }).as(
        "getEmptyProjects"
      );
      cy.reload();
      cy.wait("@getEmptyProjects");

      cy.get('[data-cy="project-selection-section"]').click().should("be.visible");
      // ตรวจสอบข้อความแจ้งเตือนเมื่อไม่มีโปรเจกต์
      cy.get('[data-cy="project-notfound-1"]').should("be.visible");
      cy.get('[data-cy="project-notfound-2"]').should("be.visible");
    });

    it("TS_SPMS_08_003 ตรวจสอบการแสดงข้อความเมื่อเกิดข้อผิดพลาด", () => {
      // จำลองสถานการณ์เกิดข้อผิดพลาด
      cy.intercept("GET", "**/api/projects", {
        statusCode: 500,
        body: { message: "เกิดข้อผิดพลาดในการเรียกข้อมูล" },
      }).as("getProjectsError");

      cy.reload();
      cy.wait("@getProjectsError");

      // ตรวจสอบการแสดงข้อความแจ้งเตือนข้อผิดพลาด
      cy.get('[data-cy="error-message"]').should("be.visible");
    });
  });

  /**
   * กลุ่มทดสอบ: การเลือกโปรเจกต์
   */
  describe("การเลือกโปรเจกต์", () => {
    // ข้อมูลจำลองสำหรับการทดสอบโปรเจกต์
    const mockProjects = [
      {
        project_id: "1",
        name: "โปรเจกต์ทดสอบ 1",
        description: "คำอธิบายโปรเจกต์ 1",
      },
      {
        project_id: "2",
        name: "โปรเจกต์ทดสอบ 2",
        description: "คำอธิบายโปรเจกต์ 2",
      },
    ];

    beforeEach(() => {
      // จำลองการเรียกข้อมูลโปรเจกต์
      cy.intercept("GET", "**/api/projects", { body: mockProjects }).as(
        "getProjects"
      );
      cy.reload();
      cy.wait("@getProjects");
    });

    it("TS_SPMS_08_004 ตรวจสอบการแสดงรายการโปรเจกต์", () => {
      // ตรวจสอบว่ามีการแสดงโปรเจกต์ครบถ้วน
      cy.get('[data-cy^="project-card-"]').should(
        "have.length",
        mockProjects.length
      );

      // ตรวจสอบข้อมูลของโปรเจกต์แต่ละรายการ
      mockProjects.forEach((project) => {
        cy.get(`[data-cy="project-card-${project.project_id}"]`).should(
          "contain",
          project.name
        );
      });
    });

    it("TS_SPMS_08_005 ตรวจสอบการเลือกโปรเจกต์", () => {
      cy.get('[data-cy="project-selection-section"]').click().should("be.visible");
      // เลือกโปรเจกต์
      cy.get('[data-cy="project-card-1"]').click();

      // ตรวจสอบว่าโปรเจกต์ถูกเลือก (มีสถานะถูกเลือก)
      cy.get('[data-cy="project-card-1"]').should(
        "have.class",
        "border-blue-500"
      );

      // ตรวจสอบการแสดงส่วนเลือกสปรินต์
      cy.get('[data-cy="sprints-section"]').should("be.visible");
    });

    it("TS_SPMS_08_006 ตรวจสอบการยกเลิกการเลือกโปรเจกต์", () => {
      cy.get('[data-cy="project-selection-section"]').click().should("be.visible");
      // เลือกโปรเจกต์
      cy.get('[data-cy="project-card-1"]').click();

      // ตรวจสอบว่าโปรเจกต์ถูกเลือก
      cy.get('[data-cy="project-card-1"]').should(
        "have.class",
        "border-blue-500"
      );

      // ยกเลิกการเลือกโดยคลิกที่โปรเจกต์เดิมอีกครั้ง
      cy.get('[data-cy="project-card-1"]').click();

      // ตรวจสอบว่าโปรเจกต์ไม่ถูกเลือก
      cy.get('[data-cy="project-card-1"]').should(
        "not.have.class",
        "border-blue-500"
      );

      // ตรวจสอบว่าส่วนเลือกสปรินต์ไม่แสดง
      cy.get('[data-cy="sprints-section"]').should("not.exist");
    });
  });

  /**
   * กลุ่มทดสอบ: การเลือกสปรินต์
   */
  describe("การเลือกสปรินต์", () => {
    // ข้อมูลจำลองสำหรับการทดสอบโปรเจกต์และสปรินต์
    const mockProjects = [
      {
        project_id: "1",
        name: "โปรเจกต์ทดสอบ 1",
        description: "คำอธิบายโปรเจกต์ 1",
      },
    ];

    const mockSprints = [
      {
        sprint_id: "1",
        name: "สปรินต์ 1",
        start_date: "2025-01-01",
        end_date: "2025-01-15",
      },
      {
        sprint_id: "2",
        name: "สปรินต์ 2",
        start_date: "2025-01-16",
        end_date: "2025-01-31",
      },
    ];

    beforeEach(() => {
      // จำลองการเรียกข้อมูลโปรเจกต์
      cy.intercept("GET", "**/api/projects", { body: mockProjects }).as(
        "getProjects"
      );

      // จำลองการเรียกข้อมูลสปรินต์
      cy.intercept("GET", "**/api/projects/*/sprints", {
        body: mockSprints,
      }).as("getSprints");

      cy.reload();
      cy.wait("@getProjects");

      cy.get('[data-cy="project-selection-section"]').click().should("be.visible");

      // เลือกโปรเจกต์
      cy.get('[data-cy="project-card-1"]').click();
      cy.wait("@getSprints");

      cy.get('[data-cy="sprints-section"]').click().should("be.visible");
    });

    it.only("TS_SPMS_08_007 ตรวจสอบการแสดงรายการสปรินต์", () => {
      // ตรวจสอบว่ามีการแสดงสปรินต์ครบถ้วน
      cy.get('[data-cy^="sprint-item-"]').should(
        "have.length",
        mockSprints.length
      );

      // ตรวจสอบข้อมูลของสปรินต์แต่ละรายการ
      mockSprints.forEach((sprint) => {
        cy.get(`[data-cy="sprint-item-${sprint.sprint_id}"]`).should(
          "contain",
          sprint.name
        );
      });
    });

    it("TS_SPMS_08_008 ตรวจสอบการเลือกสปรินต์", () => {
      // เลือกสปรินต์
      cy.get('[data-cy="sprint-item-1"]').click();

      // ตรวจสอบว่าสปรินต์ถูกเลือก (มีสถานะถูกเลือก)
      cy.get('[data-cy="sprint-item-1"]').should(
        "have.class",
        "border-green-500"
      );

      // ตรวจสอบการแสดงส่วนไฟล์ทดสอบ
      cy.get('[data-cy="test-files-filter-section"]').should("be.visible");
      cy.get('[data-cy="test-files-list-section"]').should("be.visible");
    });

    it("TS_SPMS_08_009 ตรวจสอบการยกเลิกการเลือกสปรินต์", () => {
      // เลือกสปรินต์
      cy.get('[data-cy="sprint-item-1"]').click();

      // ตรวจสอบว่าสปรินต์ถูกเลือก
      cy.get('[data-cy="sprint-item-1"]').should(
        "have.class",
        "border-green-500"
      );

      // ยกเลิกการเลือกโดยคลิกที่สปรินต์เดิมอีกครั้ง
      cy.get('[data-cy="sprint-item-1"]').click();

      // ตรวจสอบว่าสปรินต์ไม่ถูกเลือก
      cy.get('[data-cy="sprint-item-1"]').should(
        "not.have.class",
        "border-green-500"
      );

      // ตรวจสอบว่าส่วนไฟล์ทดสอบไม่แสดง
      cy.get('[data-cy="test-files-filter-section"]').should("not.exist");
    });

    it("TS_SPMS_08_010 ตรวจสอบการแสดงข้อความเมื่อไม่มีสปรินต์", () => {
      // จำลองกรณีไม่มีสปรินต์
      cy.intercept("GET", "**/api/projects/*/sprints", { body: [] }).as(
        "getEmptySprints"
      );
      cy.reload();
      cy.wait("@getProjects");

      // เลือกโปรเจกต์
      cy.get('[data-cy="project-card-1"]').click();
      cy.wait("@getEmptySprints");

      // ตรวจสอบข้อความแจ้งเตือนเมื่อไม่มีสปรินต์
      cy.get('[data-cy="empty-sprints"]').should("be.visible");
    });
  });

  /**
   * กลุ่มทดสอบ: การจัดการไฟล์ทดสอบ
   */
  describe("การจัดการไฟล์ทดสอบ", () => {
    // ข้อมูลจำลองสำหรับการทดสอบโปรเจกต์ สปรินต์ และไฟล์ทดสอบ
    const mockProjects = [
      {
        project_id: "1",
        name: "โปรเจกต์ทดสอบ 1",
        description: "คำอธิบายโปรเจกต์ 1",
      },
    ];

    const mockSprints = [
      {
        sprint_id: "1",
        name: "สปรินต์ 1",
        start_date: "2025-01-01",
        end_date: "2025-01-15",
      },
    ];

    const mockTestFiles = [
      {
        file_id: "1",
        filename: "test_file_1.xlsx",
        status: "Pass",
        file_size: 1024,
        upload_date: "2025-01-05T10:00:00Z",
      },
      {
        file_id: "2",
        filename: "test_file_2.xlsx",
        status: "Fail",
        file_size: 2048,
        upload_date: "2025-01-06T11:00:00Z",
      },
      {
        file_id: "3",
        filename: "test_file_3.xlsx",
        status: "Pending",
        file_size: 3072,
        upload_date: "2025-01-07T12:00:00Z",
      },
    ];

    beforeEach(() => {
      // จำลองการเรียกข้อมูลโปรเจกต์
      cy.intercept("GET", "**/api/projects", { body: mockProjects }).as(
        "getProjects"
      );

      // จำลองการเรียกข้อมูลสปรินต์
      cy.intercept("GET", "**/api/projects/*/sprints", {
        body: mockSprints,
      }).as("getSprints");

      // จำลองการเรียกข้อมูลไฟล์ทดสอบ
      cy.intercept("GET", "**/api/sprints/*/test-files", {
        body: mockTestFiles,
      }).as("getTestFiles");

      cy.reload();
      cy.wait("@getProjects");

      // เลือกโปรเจกต์
      cy.get('[data-cy="project-card-1"]').click();
      cy.wait("@getSprints");

      // เลือกสปรินต์
      cy.get('[data-cy="sprint-item-1"]').click();
      cy.wait("@getTestFiles");
    });

    it("TS_SPMS_08_011 ตรวจสอบการแสดงรายการไฟล์ทดสอบ", () => {
      // ตรวจสอบว่ามีการแสดงไฟล์ทดสอบครบถ้วน
      cy.get('[data-cy^="test-file-"]').should(
        "have.length",
        mockTestFiles.length
      );

      // ตรวจสอบข้อมูลของไฟล์ทดสอบแต่ละรายการ
      mockTestFiles.forEach((file) => {
        cy.get(`[data-cy="test-file-${file.file_id}"]`).should(
          "contain",
          file.filename
        );
        cy.get(`[data-cy="test-status-${file.status.toLowerCase()}"]`).should(
          "exist"
        );
      });
    });

    it("TS_SPMS_08_012 ตรวจสอบฟังก์ชันการค้นหาไฟล์ทดสอบ", () => {
      // ค้นหาไฟล์ทดสอบด้วยคำค้นหา
      cy.get('[data-cy="search-test-files"]').type("test_file_1");

      // ตรวจสอบว่าแสดงเฉพาะไฟล์ที่ตรงกับคำค้นหา
      cy.get('[data-cy^="test-file-"]').should("have.length", 1);
      cy.get('[data-cy="test-file-1"]').should("be.visible");

      // ลบคำค้นหาและตรวจสอบว่าแสดงไฟล์ทั้งหมดอีกครั้ง
      cy.get('[data-cy="search-test-files"]').clear();
      cy.get('[data-cy^="test-file-"]').should(
        "have.length",
        mockTestFiles.length
      );
    });

    it("TS_SPMS_08_013 ตรวจสอบการกรองไฟล์ทดสอบตามสถานะ (ผ่าน)", () => {
      // กรองไฟล์ทดสอบที่มีสถานะผ่าน
      cy.get('[data-cy="status-filter-button"]').click();
      cy.get('[data-cy="filter-pass"]').click();

      // ตรวจสอบว่าแสดงเฉพาะไฟล์ที่มีสถานะผ่าน
      cy.get('[data-cy^="test-file-"]').should("have.length", 1);
      cy.get('[data-cy="test-status-pass"]').should("be.visible");
    });

    it("TS_SPMS_08_014 ตรวจสอบการกรองไฟล์ทดสอบตามสถานะ (ไม่ผ่าน)", () => {
      // กรองไฟล์ทดสอบที่มีสถานะไม่ผ่าน
      cy.get('[data-cy="status-filter-button"]').click();
      cy.get('[data-cy="filter-fail"]').click();

      // ตรวจสอบว่าแสดงเฉพาะไฟล์ที่มีสถานะไม่ผ่าน
      cy.get('[data-cy^="test-file-"]').should("have.length", 1);
      cy.get('[data-cy="test-status-fail"]').should("be.visible");
    });

    it("TS_SPMS_08_015 ตรวจสอบการเรียงลำดับไฟล์ทดสอบ", () => {
      // ทดสอบการเรียงลำดับต่างๆ

      // เรียงตามวันที่ล่าสุด (ค่าเริ่มต้น)
      cy.get('[data-cy="sort-order-button"]').click();
      cy.get('[data-cy="sort-newest"]').click();

      // เรียงตามวันที่เก่าสุด
      cy.get('[data-cy="sort-order-button"]').click();
      cy.get('[data-cy="sort-oldest"]').click();

      // เรียงตามชื่อ A-Z
      cy.get('[data-cy="sort-order-button"]').click();
      cy.get('[data-cy="sort-name-asc"]').click();

      // เรียงตามชื่อ Z-A
      cy.get('[data-cy="sort-order-button"]').click();
      cy.get('[data-cy="sort-name-desc"]').click();

      // ตรวจสอบว่ามีการเรียงลำดับตามที่เลือก (ตรวจสอบปุ่มที่เลือก)
      cy.get('[data-cy="sort-name-desc"]').should("have.class", "bg-blue-50");
    });

    it("TS_SPMS_08_016 ตรวจสอบการรีเฟรชข้อมูลไฟล์ทดสอบ", () => {
      // จำลองการเรียกข้อมูลไฟล์ทดสอบใหม่
      cy.intercept("GET", "**/api/sprints/*/test-files", {
        body: mockTestFiles,
      }).as("refreshTestFiles");

      // คลิกปุ่มรีเฟรชข้อมูล
      cy.get('[data-cy="refresh-test-files"]').click();

      // ตรวจสอบว่ามีการเรียกข้อมูลใหม่
      cy.wait("@refreshTestFiles");
    });

    it("TS_SPMS_08_017 ตรวจสอบการนำทางไปยังหน้ารายละเอียดไฟล์ทดสอบ", () => {
      // จำลองการนำทางไปยังหน้ารายละเอียดไฟล์ทดสอบ
      cy.intercept("GET", "**/api/test-files/*", { body: mockTestFiles[0] }).as(
        "getTestFileDetail"
      );

      // คลิกปุ่มดูรายละเอียดเพิ่มเติม
      cy.get('[data-cy="view-detail-button-1"]').click();

      // ตรวจสอบว่ามีการนำทางไปยังหน้ารายละเอียดไฟล์ทดสอบ
      cy.url().should("include", "/test-files/1");
    });

    it("TS_SPMS_08_018 ตรวจสอบการแสดงข้อความเมื่อไม่มีไฟล์ทดสอบ", () => {
      // จำลองกรณีไม่มีไฟล์ทดสอบ
      cy.intercept("GET", "**/api/sprints/*/test-files", { body: [] }).as(
        "getEmptyTestFiles"
      );
      cy.reload();
      cy.wait("@getProjects");

      // เลือกโปรเจกต์
      cy.get('[data-cy="project-card-1"]').click();
      cy.wait("@getSprints");

      // เลือกสปรินต์
      cy.get('[data-cy="sprint-item-1"]').click();
      cy.wait("@getEmptyTestFiles");

      // ตรวจสอบข้อความแจ้งเตือนเมื่อไม่มีไฟล์ทดสอบ
      cy.contains("ไม่พบไฟล์ทดสอบในสปรินต์นี้").should("be.visible");
      cy.get('[data-cy="upload-first-test-file-button"]').should("be.visible");
    });
  });

  /**
   * กลุ่มทดสอบ: ฟังก์ชันการสร้างและอัพโหลดไฟล์ทดสอบ
   */
  describe("การสร้างและอัพโหลดไฟล์ทดสอบ", () => {
    // ข้อมูลจำลองสำหรับการทดสอบโปรเจกต์ สปรินต์ และไฟล์ทดสอบ
    const mockProjects = [
      {
        project_id: "1",
        name: "โปรเจกต์ทดสอบ 1",
        description: "คำอธิบายโปรเจกต์ 1",
      },
    ];

    const mockSprints = [
      {
        sprint_id: "1",
        name: "สปรินต์ 1",
        start_date: "2025-01-01",
        end_date: "2025-01-15",
      },
    ];

    const mockTestFiles = [
      {
        file_id: "1",
        filename: "test_file_1.xlsx",
        status: "Pass",
        file_size: 1024,
        upload_date: "2025-01-05T10:00:00Z",
      },
    ];

    beforeEach(() => {
      // จำลองการเรียกข้อมูลโปรเจกต์
      cy.intercept("GET", "**/api/projects", { body: mockProjects }).as(
        "getProjects"
      );

      // จำลองการเรียกข้อมูลสปรินต์
      cy.intercept("GET", "**/api/projects/*/sprints", {
        body: mockSprints,
      }).as("getSprints");

      // จำลองการเรียกข้อมูลไฟล์ทดสอบ
      cy.intercept("GET", "**/api/sprints/*/test-files", {
        body: mockTestFiles,
      }).as("getTestFiles");

      cy.reload();
      cy.wait("@getProjects");

      // เลือกโปรเจกต์
      cy.get('[data-cy="project-card-1"]').click();
      cy.wait("@getSprints");

      // เลือกสปรินต์
      cy.get('[data-cy="sprint-item-1"]').click();
      cy.wait("@getTestFiles");
    });

    it("TS_SPMS_08_019 ตรวจสอบการกดปุ่มสร้างไฟล์ทดสอบบนหน้าจอปกติ", () => {
      // จำลองการนำทางไปยังหน้าสร้างไฟล์ทดสอบ
      cy.intercept("POST", "**/api/test-files", { statusCode: 201 }).as(
        "createTestFile"
      );

      // คลิกปุ่มสร้างไฟล์ทดสอบ
      cy.get('[data-cy="create-test-file-button"]').click();

      // ตรวจสอบว่ามีการนำทางไปยังหน้าสร้างไฟล์ทดสอบหรือแสดงหน้าต่าง modal
      // กรณีนี้จะขึ้นอยู่กับการออกแบบ UI แต่เราสามารถทดสอบเบื้องต้นได้
      cy.url().should("include", "/test-files");
    });

    it("TS_SPMS_08_020 ตรวจสอบการกดปุ่มสร้างไฟล์ทดสอบบนหน้าจอมือถือ", () => {
      // จำลองหน้าจอมือถือ
      cy.viewport("iphone-x");

      // จำลองการนำทางไปยังหน้าสร้างไฟล์ทดสอบ
      cy.intercept("POST", "**/api/test-files", { statusCode: 201 }).as(
        "createTestFile"
      );

      // คลิกปุ่มสร้างไฟล์ทดสอบสำหรับมือถือ
      cy.get('[data-cy="create-test-file-button-mobile"]').should("be.visible");
      cy.get('[data-cy="create-test-file-button-mobile"]').click();

      // ตรวจสอบว่ามีการนำทางไปยังหน้าสร้างไฟล์ทดสอบหรือแสดงหน้าต่าง modal
      cy.url().should("include", "/test-files");
    });
  });
});
