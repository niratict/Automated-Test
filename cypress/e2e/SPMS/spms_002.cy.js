// cypress/integration/mainpage.spec.js

/**
 * การทดสอบอัตโนมัติสำหรับหน้า MainPage
 * ทดสอบฟังก์ชันการทำงานหลักของหน้าหลักระบบบริหารโครงการพัฒนาซอฟต์แวร์
 */

describe("MainPage - SPMS_02: ทดสอบหน้าหลักระบบบริหารโครงการพัฒนาซอฟต์แวร์", () => {
  // ข้อมูลผู้ใช้สำหรับการทดสอบ
  const testUser = {
    email: "test005@tester.com",
    password: "123456",
  };

  // การจำลองข้อมูลที่จะได้รับจาก API
  const mockMainPageData = {
    stats: {
      totalProjects: 15,
      totalSprints: 67,
      totalFiles: 123,
      activeProjects: 8,
    },
    latestProjects: [
      {
        name: "โปรเจกต์ A",
        status: "Active",
        created_at: "2025-01-15T00:00:00.000Z",
        sprintCount: 5,
        fileCount: 12,
      },
      {
        name: "โปรเจกต์ B",
        status: "Completed",
        created_at: "2025-01-10T00:00:00.000Z",
        sprintCount: 3,
        fileCount: 8,
      },
      {
        name: "โปรเจกต์ C",
        status: "Suspended",
        created_at: "2025-01-05T00:00:00.000Z",
        sprintCount: 2,
        fileCount: 6,
      },
    ],
    latestTestFiles: [
      {
        filename: "ทดสอบฟังก์ชัน A",
        projectName: "โปรเจกต์ A",
        sprintName: "สปรินต์ 1",
        status: "Pass",
        uploadDate: "2025-02-01T10:00:00.000Z",
        uploadedBy: "นายทดสอบ",
      },
      {
        filename: "ทดสอบฟังก์ชัน B",
        projectName: "โปรเจกต์ B",
        sprintName: "สปรินต์ 2",
        status: "Fail",
        uploadDate: "2025-02-02T10:00:00.000Z",
        uploadedBy: "นางสาวทดสอบ",
      },
      {
        filename: "ทดสอบฟังก์ชัน C",
        projectName: "โปรเจกต์ C",
        sprintName: "สปรินต์ 3",
        status: "Pending",
        uploadDate: "2025-02-03T10:00:00.000Z",
        uploadedBy: "นายทดสอบ 2",
      },
    ],
  };

  /**
   * ตั้งค่าก่อนการทดสอบแต่ละกรณี
   * - จำลองการเรียก API และกำหนดค่าที่ต้องการให้ API ตอบกลับ
   * - เข้าสู่ระบบก่อนการทดสอบ
   */
  beforeEach(() => {
    // จำลองการเรียก API stats
    cy.intercept("GET", "**/api/main-dashboard/stats", {
      statusCode: 200,
      body: {
        stats: mockMainPageData.stats,
        latestProjects: mockMainPageData.latestProjects,
      },
    }).as("getMainStats");

    // จำลองการเรียก API latest-test-files
    cy.intercept("GET", "**/api/main-dashboard/latest-test-files", {
      statusCode: 200,
      body: {
        latestTestFiles: mockMainPageData.latestTestFiles,
      },
    }).as("getLatestTestFiles");

    // เข้าสู่ระบบก่อนเริ่มการทดสอบ
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type(testUser.email);
    cy.get('[data-cy="login-password"]').type(testUser.password);
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าเข้าสู่ระบบสำเร็จและเปลี่ยนเส้นทางไปยังหน้า MainPage
    cy.url().should("include", "/mainpage");

    // รอให้ API ตอบกลับ
    cy.wait(["@getMainStats", "@getLatestTestFiles"]);
  });

  /**
   * กลุ่มการทดสอบที่ 1: ทดสอบการแสดงผลองค์ประกอบหลักของหน้า MainPage
   */
  describe("1. ทดสอบการแสดงผลองค์ประกอบหลักของหน้า", () => {
    it("TS_SPMS_02_001 ตรวจสอบการแสดงผลหัวเรื่องของหน้า", () => {
      // ตรวจสอบการแสดงผลหัวข้อหลักของหน้า
      cy.get("[data-cy=main-dashboard]").should("be.visible");
      cy.contains("ระบบบริหารโครงการพัฒนาซอฟต์แวร์").should("be.visible");
      cy.contains("ภาพรวมของโปรเจกต์และไฟล์ทดสอบ").should("be.visible");
    });

    it("TS_SPMS_02_002 ตรวจสอบการแสดงผลส่วนแสดงสถิติ", () => {
      // ตรวจสอบการแสดงผลการ์ดแสดงสถิติทั้ง 4 ใบ
      cy.get("[data-cy=stats-section]").should("be.visible");
      cy.get("[data-cy=stat-card-จำนวนโปรเจกต์ทั้งหมด]").should("be.visible");
      cy.get("[data-cy=stat-card-จำนวนสปรินต์ทั้งหมด]").should("be.visible");
      cy.get("[data-cy=stat-card-จำนวนไฟล์ทดสอบ]").should("be.visible");
      cy.get("[data-cy=stat-card-โปรเจกต์ที่กำลังดำเนินการ]").should(
        "be.visible"
      );
    });

    it("TS_SPMS_02_003 ตรวจสอบการแสดงผลส่วนโปรเจกต์ล่าสุด", () => {
      // ตรวจสอบการแสดงผลส่วนโปรเจกต์ล่าสุด
      cy.get("[data-cy=latest-projects-section]").should("be.visible");
      cy.contains("โปรเจกต์ล่าสุด").should("be.visible");
      cy.get("[data-cy=view-all-projects]").should("be.visible");
    });

    it("TS_SPMS_02_004 ตรวจสอบการแสดงผลส่วนไฟล์ทดสอบล่าสุด", () => {
      // ตรวจสอบการแสดงผลส่วนไฟล์ทดสอบล่าสุด
      cy.get("[data-cy=latest-test-files-section]").should("be.visible");
      cy.contains("ไฟล์ทดสอบล่าสุด").should("be.visible");
      cy.get("[data-cy=view-all-test-files]").should("be.visible");
    });
  });

  /**
   * กลุ่มการทดสอบที่ 2: ทดสอบการแสดงผลข้อมูลสถิติ
   */
  describe("2. ทดสอบการแสดงผลข้อมูลสถิติ", () => {
    it("TS_SPMS_02_005 ตรวจสอบค่าที่แสดงในการ์ดสถิติทั้งหมด", () => {
      // ตรวจสอบค่าที่แสดงในการ์ดสถิติ
      cy.get("[data-cy=stat-card-จำนวนโปรเจกต์ทั้งหมด]").should(
        "contain",
        mockMainPageData.stats.totalProjects
      );
      cy.get("[data-cy=stat-card-จำนวนสปรินต์ทั้งหมด]").should(
        "contain",
        mockMainPageData.stats.totalSprints
      );
      cy.get("[data-cy=stat-card-จำนวนไฟล์ทดสอบ]").should(
        "contain",
        mockMainPageData.stats.totalFiles
      );
      cy.get("[data-cy=stat-card-โปรเจกต์ที่กำลังดำเนินการ]").should(
        "contain",
        mockMainPageData.stats.activeProjects
      );

      // ตรวจสอบคำอธิบายเพิ่มเติมที่แสดงในการ์ดสถิติ
      cy.get("[data-cy=stat-card-จำนวนโปรเจกต์ทั้งหมด]").should(
        "contain",
        `${mockMainPageData.stats.activeProjects} โปรเจกต์ที่กำลังดำเนินการ`
      );

      // คำนวณเปอร์เซ็นต์โปรเจกต์ที่กำลังดำเนินการ
      const percentageActive = (
        (mockMainPageData.stats.activeProjects /
          mockMainPageData.stats.totalProjects) *
        100
      ).toFixed(1);
      cy.get("[data-cy=stat-card-โปรเจกต์ที่กำลังดำเนินการ]").should(
        "contain",
        `${percentageActive}% ของทั้งหมด`
      );
    });
  });

  /**
   * กลุ่มการทดสอบที่ 3: ทดสอบการแสดงผลข้อมูลโปรเจกต์ล่าสุด
   */
  describe("3. ทดสอบการแสดงผลข้อมูลโปรเจกต์ล่าสุด", () => {
    it("TS_SPMS_02_006 ตรวจสอบการแสดงผลการ์ดโปรเจกต์ล่าสุดที่ถูกต้อง", () => {
      // ตรวจสอบจำนวนโปรเจกต์ล่าสุดที่แสดง
      cy.get("[data-cy=latest-projects-section]")
        .find("[data-cy^=project-card-]")
        .should("have.length", mockMainPageData.latestProjects.length);

      // ตรวจสอบโปรเจกต์ล่าสุดแต่ละรายการ
      mockMainPageData.latestProjects.forEach((project) => {
        const projectSelector = `[data-cy=project-card-${project.name
          .toLowerCase()
          .replace(/\s+/g, "-")}]`;
        cy.get(projectSelector).should("be.visible");
        cy.get(projectSelector).should("contain", project.name);

        // ตรวจสอบวันที่สร้างโปรเจกต์
        const createdDate = new Date(project.created_at).toLocaleDateString(
          "th-TH",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        );
        cy.get(projectSelector).should("contain", createdDate);

        // ตรวจสอบสถานะโปรเจกต์
        switch (project.status) {
          case "Active":
            cy.get(projectSelector)
              .find("[data-cy=project-active-status]")
              .should("be.visible")
              .should("contain", "กำลังดำเนินการ");
            break;
          case "Completed":
            cy.get(projectSelector)
              .find("[data-cy=project-completed-status]")
              .should("be.visible")
              .should("contain", "เสร็จสิ้น");
            break;
          case "Suspended":
            cy.get(projectSelector)
              .find("[data-cy=project-suspended-status]")
              .should("be.visible")
              .should("contain", "ระงับ");
            break;
        }

        // ตรวจสอบจำนวนสปรินต์และไฟล์ที่แสดง
        cy.get(projectSelector).should(
          "contain",
          `${project.sprintCount} สปรินต์`
        );
        cy.get(projectSelector).should(
          "contain",
          `${project.fileCount} ไฟล์ทดสอบ`
        );
      });
    });

    it("TS_SPMS_02_007 ตรวจสอบการทำงานของลิงก์ดูโปรเจกต์ทั้งหมด", () => {
      // ตรวจสอบลิงก์ดูโปรเจกต์ทั้งหมด
      cy.get("[data-cy=view-all-projects]")
        .should("have.attr", "href", "/projects")
        .click();
      cy.url().should("include", "/projects");
    });
  });

  /**
   * กลุ่มการทดสอบที่ 4: ทดสอบการแสดงผลข้อมูลไฟล์ทดสอบล่าสุด
   */
  describe("4. ทดสอบการแสดงผลข้อมูลไฟล์ทดสอบล่าสุด", () => {
    it("TS_SPMS_02_008 ตรวจสอบการแสดงผลการ์ดไฟล์ทดสอบล่าสุดที่ถูกต้อง", () => {
      // ตรวจสอบจำนวนไฟล์ทดสอบล่าสุดที่แสดง
      cy.get("[data-cy=latest-test-files-section]")
        .find("[data-cy^=test-file-card-]")
        .should("have.length", mockMainPageData.latestTestFiles.length);

      // ตรวจสอบไฟล์ทดสอบล่าสุดแต่ละรายการ
      mockMainPageData.latestTestFiles.forEach((file) => {
        const fileSelector = `[data-cy=test-file-card-${file.filename
          .toLowerCase()
          .replace(/\s+/g, "-")}]`;
        cy.get(fileSelector).should("be.visible");
        cy.get(fileSelector).should("contain", file.filename);

        // ตรวจสอบชื่อโปรเจกต์และสปรินต์
        cy.get(fileSelector).should("contain", file.projectName);
        cy.get(fileSelector).should("contain", file.sprintName);

        // ตรวจสอบสถานะไฟล์ทดสอบ
        switch (file.status) {
          case "Pass":
            cy.get(fileSelector)
              .find("[data-cy=test-file-pass-status]")
              .should("be.visible")
              .should("contain", "ผ่านการทดสอบ");
            break;
          case "Fail":
            cy.get(fileSelector)
              .find("[data-cy=test-file-fail-status]")
              .should("be.visible")
              .should("contain", "ไม่ผ่านการทดสอบ");
            break;
          default:
            cy.get(fileSelector)
              .find("[data-cy=test-file-pending-status]")
              .should("be.visible")
              .should("contain", "รอการทดสอบ");
            break;
        }

        // ตรวจสอบวันที่อัปโหลดและผู้อัปโหลด
        const uploadDate = new Date(file.uploadDate).toLocaleString("th-TH", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        cy.get(fileSelector).should("contain", uploadDate);
        cy.get(fileSelector).should("contain", file.uploadedBy);
      });
    });

    it("TS_SPMS_02_009 ตรวจสอบการทำงานของลิงก์ดูไฟล์ทดสอบทั้งหมด", () => {
      // ตรวจสอบลิงก์ดูไฟล์ทดสอบทั้งหมด
      cy.get("[data-cy=view-all-test-files]")
        .should("have.attr", "href", "/test-files")
        .click();
      cy.url().should("include", "/test-files");
    });
  });

  /**
   * กลุ่มการทดสอบที่ 5: ทดสอบฟังก์ชันการรีเฟรชข้อมูล
   */
  describe("5. ทดสอบฟังก์ชันการรีเฟรชข้อมูล", () => {
    it("TS_SPMS_02_010 ตรวจสอบการทำงานของปุ่มรีเฟรช", () => {
      // ตรวจสอบปุ่มรีเฟรช
      cy.get("[data-cy=refresh-dashboard]").should("be.visible");

      // รีเซ็ตข้อมูลจำลองที่จะได้รับหลังการรีเฟรช
      const updatedStats = {
        ...mockMainPageData.stats,
        totalProjects: 16, // เปลี่ยนแปลงค่าเพื่อตรวจสอบการอัปเดต
      };

      // จำลองการเรียก API stats หลังจากรีเฟรช
      cy.intercept("GET", "**/api/main-dashboard/stats", {
        statusCode: 200,
        body: {
          stats: updatedStats,
          latestProjects: mockMainPageData.latestProjects,
        },
      }).as("getRefreshedStats");

      // จำลองการเรียก API latest-test-files หลังจากรีเฟรช
      cy.intercept("GET", "**/api/main-dashboard/latest-test-files", {
        statusCode: 200,
        body: {
          latestTestFiles: mockMainPageData.latestTestFiles,
        },
      }).as("getRefreshedTestFiles");

      // คลิกปุ่มรีเฟรช
      cy.get("[data-cy=refresh-dashboard]").click();

      // รอให้ API ตอบกลับ
      cy.wait(["@getRefreshedStats", "@getRefreshedTestFiles"]);

      // ตรวจสอบว่าข้อมูลถูกอัปเดตหลังจากรีเฟรช
      cy.get("[data-cy=stat-card-จำนวนโปรเจกต์ทั้งหมด]").should(
        "contain",
        updatedStats.totalProjects
      );
    });
  });

  /**
   * กลุ่มการทดสอบที่ 6: ทดสอบการแสดงผลหน้าจอโหลดข้อมูล
   */
  describe("6. ทดสอบการแสดงผลหน้าจอโหลดข้อมูล", () => {
    it("TS_SPMS_02_011 ตรวจสอบการแสดงผลหน้าจอโหลดข้อมูล", () => {
      // เข้าสู่ระบบใหม่ แต่จำลองให้การเรียก API ช้า
      cy.visit("/login");
      cy.get('[data-cy="login-email"]').type(testUser.email);
      cy.get('[data-cy="login-password"]').type(testUser.password);

      // จำลองการเรียก API ที่ใช้เวลานาน
      cy.intercept("GET", "**/api/main-dashboard/stats", (req) => {
        req.on("response", (res) => {
          // หน่วงเวลาการตอบกลับ
          res.setDelay(1000);
        });
      }).as("getSlowStats");

      cy.intercept("GET", "**/api/main-dashboard/latest-test-files", (req) => {
        req.on("response", (res) => {
          // หน่วงเวลาการตอบกลับ
          res.setDelay(1000);
        });
      }).as("getSlowTestFiles");

      // เข้าสู่ระบบ
      cy.get('[data-cy="login-submit"]').click();

      // ตรวจสอบการแสดงผลของหน้าจอโหลด
      cy.get("[data-cy=loading-screen]").should("be.visible");
      cy.get("[data-cy=loading-screen]").should("contain", "กำลังโหลดข้อมูล");

      // รอให้การโหลดเสร็จสิ้น
      cy.wait(["@getSlowStats", "@getSlowTestFiles"]);

      // ตรวจสอบว่าหน้าจอโหลดหายไปและแสดงเนื้อหาหลัก
      cy.get("[data-cy=loading-screen]").should("not.exist");
      cy.get("[data-cy=main-dashboard]").should("be.visible");
    });
  });

  /**
   * กลุ่มการทดสอบที่ 7: ทดสอบการแสดงผลกรณีมีข้อผิดพลาด
   */
  describe("7. ทดสอบการแสดงผลกรณีมีข้อผิดพลาด", () => {
    it("TS_SPMS_02_012 ตรวจสอบการแสดงผลกรณีเกิดข้อผิดพลาดในการโหลดข้อมูล", () => {
      // เข้าสู่ระบบใหม่ แต่จำลองให้การเรียก API เกิดข้อผิดพลาด
      cy.visit("/login");
      cy.get('[data-cy="login-email"]').type(testUser.email);
      cy.get('[data-cy="login-password"]').type(testUser.password);

      // จำลองการเรียก API ที่เกิดข้อผิดพลาด
      cy.intercept("GET", "**/api/main-dashboard/stats", {
        statusCode: 500,
        body: {
          error: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
        },
      }).as("getErrorStats");

      // เข้าสู่ระบบ
      cy.get('[data-cy="login-submit"]').click();

      // รอให้ API ตอบกลับ
      cy.wait("@getErrorStats");

      // ตรวจสอบการแสดงผลของหน้าจอแสดงข้อผิดพลาด
      cy.get("[data-cy=error-screen]").should("be.visible");
      cy.get("[data-cy=error-screen]").should(
        "contain",
        "เกิดข้อผิดพลาดในการโหลดข้อมูล"
      );
      cy.get("[data-cy=reload-button]").should("be.visible");
    });

    it("TS_SPMS_02_013 ตรวจสอบการทำงานของปุ่มโหลดใหม่กรณีเกิดข้อผิดพลาด", () => {
      // เข้าสู่ระบบใหม่ แต่จำลองให้การเรียก API เกิดข้อผิดพลาด
      cy.visit("/login");
      cy.get('[data-cy="login-email"]').type(testUser.email);
      cy.get('[data-cy="login-password"]').type(testUser.password);

      // จำลองการเรียก API ที่เกิดข้อผิดพลาด
      cy.intercept("GET", "**/api/main-dashboard/stats", {
        statusCode: 500,
        body: {
          error: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
        },
      }).as("getErrorStats");

      // เข้าสู่ระบบ
      cy.get('[data-cy="login-submit"]').click();

      // รอให้ API ตอบกลับ
      cy.wait("@getErrorStats");

      // ตรวจสอบการแสดงผลของหน้าจอแสดงข้อผิดพลาด
      cy.get("[data-cy=error-screen]").should("be.visible");

      // จำลองการเรียก API หลังจากกดปุ่มโหลดใหม่และให้สำเร็จ
      cy.intercept("GET", "**/api/main-dashboard/stats", {
        statusCode: 200,
        body: {
          stats: mockMainPageData.stats,
          latestProjects: mockMainPageData.latestProjects,
        },
      }).as("getSuccessStats");

      cy.intercept("GET", "**/api/main-dashboard/latest-test-files", {
        statusCode: 200,
        body: {
          latestTestFiles: mockMainPageData.latestTestFiles,
        },
      }).as("getSuccessTestFiles");

      // คลิกปุ่มโหลดใหม่
      cy.get("[data-cy=reload-button]").click();

      // รอให้ API ตอบกลับ
      cy.wait(["@getSuccessStats", "@getSuccessTestFiles"]);

      // ตรวจสอบว่าหน้าจอแสดงข้อผิดพลาดหายไปและแสดงเนื้อหาหลัก
      cy.get("[data-cy=error-screen]").should("not.exist");
      cy.get("[data-cy=main-dashboard]").should("be.visible");
    });
  });
});
