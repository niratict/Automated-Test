describe("Projects Page Tests", () => {
  beforeEach(() => {
    // เริ่มต้นที่หน้าเข้าสู่ระบบและทำการล็อกอิน
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type("test005@tester.com");
    cy.get('[data-cy="login-password"]').type("123456");
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าเข้าสู่หน้า dashboard หรือไม่
    cy.url().should("include", "/mainpage");
    cy.get('[data-cy="nav-item-โปรเจกต์"]').click();
  });

  it("TS_SPMS_03_001 - ตรวจสอบการแสดงหน้าจัดการโปรเจกต์", () => {
    // ตรวจสอบองค์ประกอบหลักของหน้า
    cy.get('[data-cy="projects-page"]').should("exist");
    cy.get('[data-cy="page-title"]').should("contain", "จัดการโปรเจกต์");
    cy.get('[data-cy="create-project-button"]').should("exist");

    // ตรวจสอบสถานะการโหลดข้อมูล
    cy.get('[data-cy="loading-spinner"]').should("not.exist");

    // ตรวจสอบการแสดงรายการโปรเจกต์หรือข้อความเมื่อไม่มีโปรเจกต์
    cy.get("body").then(($body) => {
      if (
        $body.find('[data-cy="projects-grid"] [data-cy^="project-card-"]')
          .length > 0
      ) {
        // กรณีมีโปรเจกต์
        cy.get('[data-cy="projects-grid"]').should("exist");
        cy.get('[data-cy^="project-card-"]')
          .first()
          .within(() => {
            cy.get('[data-cy="project-name"]').should("exist");
            cy.get('[data-cy="project-description"]').should("exist");
            cy.get('[data-cy="project-status-badge"]').should("exist");
            cy.get('[data-cy="view-details-button"]').should("exist");
          });
      } else {
        // กรณีไม่มีโปรเจกต์
        cy.get('[data-cy="empty-projects"]').should("exist");
        cy.get('[data-cy="create-first-project-button"]').should("exist");
      }
    });
  });

  it("TS_SPMS_03_002 - ตรวจสอบการนำทางไปยังหน้าสร้างโปรเจกต์ใหม่", () => {
    // คลิกปุ่มสร้างโปรเจกต์ใหม่
    cy.get('[data-cy="create-project-button"]').click();

    // ตรวจสอบว่านำทางไปยังหน้าสร้างโปรเจกต์ใหม่หรือไม่
    cy.url().should("include", "/projects/create");
  });

  it("TS_SPMS_03_003 - ตรวจสอบการนำทางไปยังหน้ารายละเอียดโปรเจกต์", () => {
    // ตรวจสอบว่ามีโปรเจกต์หรือไม่ก่อนทำการทดสอบ
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy^="project-card-"]').length > 0) {
        // กรณีมีโปรเจกต์ ทดสอบการคลิกดูรายละเอียด
        cy.get('[data-cy="view-details-button"]').first().click();
        cy.url().should("match", /\/projects\/\d+/);
      } else {
        // กรณีไม่มีโปรเจกต์ ข้ามการทดสอบนี้
        cy.log("ไม่มีโปรเจกต์สำหรับทดสอบการดูรายละเอียด - ข้ามการทดสอบนี้");
      }
    });
  });

  it("TS_SPMS_03_004 - ตรวจสอบการแสดงสถานะโปรเจกต์ด้วยป้ายสี", () => {
    // ตรวจสอบว่ามีโปรเจกต์หรือไม่ก่อนทำการทดสอบ
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy^="project-card-"]').length > 0) {
        // ตรวจสอบการแสดงป้ายสถานะ
        cy.get('[data-cy="project-status-badge"]')
          .first()
          .should("exist")
          .invoke("text")
          .then((text) => {
            // ตรวจสอบว่าสถานะเป็นหนึ่งในค่าที่กำหนดไว้
            const validStatuses = ["Active", "Completed", "Pending", "On Hold"];
            expect(validStatuses).to.include(text.trim());

            // ตรวจสอบการใช้สีที่ถูกต้องตามสถานะ
            if (text.trim() === "Active") {
              cy.get('[data-cy="project-status-badge"]')
                .first()
                .should("have.class", "bg-green-100");
            } else if (text.trim() === "Completed") {
              cy.get('[data-cy="project-status-badge"]')
                .first()
                .should("have.class", "bg-blue-100");
            } else if (text.trim() === "Pending") {
              cy.get('[data-cy="project-status-badge"]')
                .first()
                .should("have.class", "bg-yellow-100");
            } else if (text.trim() === "On Hold") {
              cy.get('[data-cy="project-status-badge"]')
                .first()
                .should("have.class", "bg-gray-100");
            }
          });
      } else {
        // กรณีไม่มีโปรเจกต์ ข้ามการทดสอบนี้
        cy.log("ไม่มีโปรเจกต์สำหรับทดสอบป้ายสถานะ - ข้ามการทดสอบนี้");
      }
    });
  });

  it("TS_SPMS_03_005 - ตรวจสอบการสร้างโปรเจกต์ใหม่จากหน้าว่าง", () => {
    // ตรวจสอบว่าไม่มีโปรเจกต์หรือไม่
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy="empty-projects"]').length > 0) {
        // กรณีไม่มีโปรเจกต์ ทดสอบการคลิกปุ่มสร้างโปรเจกต์จากหน้าว่าง
        cy.get('[data-cy="create-first-project-button"]').click();
        cy.url().should("include", "/projects/create");
      } else {
        // กรณีมีโปรเจกต์ ข้ามการทดสอบนี้
        cy.log("มีโปรเจกต์อยู่แล้ว - ข้ามการทดสอบสร้างโปรเจกต์จากหน้าว่าง");
      }
    });
  });

  it("TS_SPMS_03_006 - ตรวจสอบการแสดงผลบนหน้าจอขนาดต่างๆ (Responsive)", () => {
    // ตรวจสอบบนหน้าจอขนาดเล็ก (มือถือ)
    cy.viewport("iphone-6");
    cy.get('[data-cy="page-title"]').should("exist");
    cy.get('[data-cy="create-project-button"]').should("exist");

    // ตรวจสอบบนหน้าจอขนาดกลาง (แท็บเล็ต)
    cy.viewport("ipad-2");
    cy.get('[data-cy="page-title"]').should("exist");
    cy.get('[data-cy="create-project-button"]').should("exist");

    // ตรวจสอบบนหน้าจอขนาดใหญ่ (เดสก์ท็อป)
    cy.viewport(1280, 800);
    cy.get('[data-cy="page-title"]').should("exist");
    cy.get('[data-cy="create-project-button"]').should("exist");
  });
});
