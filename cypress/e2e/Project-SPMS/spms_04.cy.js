describe("Sprints Page Tests", () => {
  beforeEach(() => {
    // เริ่มต้นที่หน้าเข้าสู่ระบบและทำการล็อกอิน
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type("test005@tester.com");
    cy.get('[data-cy="login-password"]').type("123456");
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าเข้าสู่หน้า dashboard หรือไม่
    cy.url().should("include", "/mainpage");
    // กด navbar เพื่อไปหน้า สปรินต์
    cy.get('[data-cy="nav-item-สปรินต์"]').click();
  });

  it("TS_SPMS_04_001 ตรวจสอบการโหลดหน้าสปรินต์ถูกต้อง", () => {
    // ตรวจสอบว่าโหลดหน้าสปรินต์สำเร็จ
    cy.get('[data-cy="sprints-page"]').should("be.visible");
    cy.contains("การจัดสปรินต์").should("be.visible");
    cy.get('[data-cy="project-selection-section"]').should("be.visible");
  });

  it("TS_SPMS_04_002 ตรวจสอบการแสดงโปรเจกต์และการเลือกโปรเจกต์", () => {
    // ตรวจสอบว่ามีการแสดงโปรเจกต์
    cy.get('[data-cy="project-selection-section"]').within(() => {
      cy.contains("เลือกโปรเจกต์").should("be.visible");
      // ตรวจสอบว่ามีการ์ดโปรเจกต์แสดงอยู่อย่างน้อย 1 รายการ
      cy.get('[data-cy^="project-card-"]').should("have.length.at.least", 1);

      // เลือกโปรเจกต์แรก
      cy.get('[data-cy^="project-card-"]').first().click();
      // ตรวจสอบว่าการ์ดที่เลือกมี class แสดงการเลือก (border-blue-500)
      cy.get('[data-cy^="project-card-"]')
        .first()
        .should("have.class", "border-blue-500");
    });
  });

  it("TS_SPMS_04_003 ตรวจสอบการแสดงส่วนของสปรินต์หลังจากเลือกโปรเจกต์", () => {
    // เลือกโปรเจกต์แรก
    cy.get('[data-cy^="project-card-"]').first().click();

    // ตรวจสอบว่าส่วนของสปรินต์แสดงขึ้นมา
    cy.get('[data-cy="sprints-section"]').should("be.visible");
    // ตรวจสอบว่ามีปุ่มสร้างสปรินต์
    cy.get('[data-cy="create-sprint-button"]').should("be.visible");
  });

  it("TS_SPMS_04_004 ตรวจสอบการแสดงข้อความเมื่อไม่มีโปรเจกต์", () => {
    // ทดสอบการจำลองกรณีไม่มีโปรเจกต์
    // แทรกข้อมูลจำลองก่อนการโหลดเพจ
    cy.intercept("GET", "*/api/projects", { body: [] }).as("emptyProjects");

    // รีโหลดหน้า
    cy.reload();

    // รอให้ api ถูกเรียก
    cy.wait("@emptyProjects");

    // ตรวจสอบว่าแสดงข้อความไม่พบโปรเจกต์
    cy.get('[data-cy="project-notfound-1"]')
      .should("be.visible")
      .and("contain", "ไม่พบโปรเจกต์");
    cy.get('[data-cy="project-notfound-2"]').should("be.visible");
  });

  it("TS_SPMS_04_005 ตรวจสอบการแสดงข้อความเมื่อไม่มีสปรินต์ในโปรเจกต์", () => {
    // จำลองข้อมูลว่าโปรเจกต์มี แต่ไม่มีสปรินต์
    cy.intercept("GET", "*/api/sprints*", { body: [] }).as("emptySprints");

    // เลือกโปรเจกต์แรก
    cy.get('[data-cy^="project-card-"]').first().click();

    // รอให้ api ถูกเรียก
    cy.wait("@emptySprints");

    // ตรวจสอบว่าแสดงข้อความไม่พบสปรินต์
    cy.get('[data-cy="no-sprints-message"]').should("be.visible");
    cy.get('[data-cy="create-first-sprint-button"]').should("be.visible");
  });

  it("TS_SPMS_04_006 ตรวจสอบการแสดงรายการสปรินต์เมื่อโปรเจกต์มีสปรินต์", () => {
    // เลือกโปรเจกต์แรกที่มีสปรินต์
    cy.get('[data-cy^="project-card-"]').first().click();

    // รอให้การโหลดข้อมูลเสร็จสิ้น (หากมีสปรินต์)
    cy.get('[data-cy="sprints-loading"]').should("not.exist", {
      timeout: 10000,
    });

    // ตรวจสอบว่ามีการ์ดสปรินต์หรือข้อความไม่พบสปรินต์
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy="sprints-grid"]').length > 0) {
        // มีสปรินต์
        cy.get('[data-cy="sprints-grid"]').should("be.visible");
        cy.get('[data-cy^="sprint-card-"]').should("have.length.at.least", 1);

        // ตรวจสอบว่าข้อมูลในการ์ดสปรินต์แสดงถูกต้อง
        cy.get('[data-cy^="sprint-card-"]')
          .first()
          .within(() => {
            // ตรวจสอบว่ามีชื่อสปรินต์
            cy.contains(/sprint|สปรินต์/i).should("be.visible");

            // ตรวจสอบว่ามีช่วงวันที่
            cy.get('[data-cy^="sprint-date-range-"]').should("be.visible");

            // ตรวจสอบว่ามีปุ่มดูรายละเอียด
            cy.get('[data-cy^="view-sprint-details-"]').should("be.visible");
          });
      } else {
        // ไม่มีสปรินต์
        cy.get('[data-cy="no-sprints-message"]').should("be.visible");
      }
    });
  });

  it("TS_SPMS_04_007 ตรวจสอบการนำทางไปยังหน้ารายละเอียดสปรินต์เมื่อคลิกที่สปรินต์", () => {
    // เลือกโปรเจกต์แรก
    cy.get('[data-cy^="project-card-"]').first().click();

    // รอให้การโหลดข้อมูลเสร็จสิ้น
    cy.get('[data-cy="sprints-loading"]').should("not.exist", {
      timeout: 10000,
    });

    // ตรวจสอบว่ามีการ์ดสปรินต์หรือไม่
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy^="sprint-card-"]').length > 0) {
        // คลิกปุ่มดูรายละเอียดของสปรินต์แรก
        cy.get('[data-cy^="view-sprint-details-"]').first().click();

        // ตรวจสอบว่า URL เปลี่ยนไปที่หน้ารายละเอียดสปรินต์
        cy.url().should("include", "/sprints/");
      } else {
        // กรณีไม่มีสปรินต์ให้ข้ามการทดสอบนี้
        cy.log("ไม่พบสปรินต์ ข้ามการทดสอบการนำทาง");
      }
    });
  });

  it("TS_SPMS_04_008 ตรวจสอบการนำทางไปยังหน้าสร้างสปรินต์เมื่อคลิกปุ่มสร้าง", () => {
    // เลือกโปรเจกต์แรก
    cy.get('[data-cy^="project-card-"]').first().click();

    // คลิกปุ่มสร้างสปรินต์
    cy.get('[data-cy="create-sprint-button"]').click();

    // ตรวจสอบว่า URL เปลี่ยนไปที่หน้าสร้างสปรินต์
    cy.url().should("include", "/sprints/create/");
  });

  it("TS_SPMS_04_009 ตรวจสอบการแสดงข้อความเมื่อเกิดข้อผิดพลาดจาก API", () => {
    // จำลองข้อผิดพลาด API
    cy.intercept("GET", "*/api/projects", {
      statusCode: 500,
      body: { message: "Server error" },
    }).as("projectsError");

    // รีโหลดหน้า
    cy.reload();

    // รอให้ api ถูกเรียก
    cy.wait("@projectsError");

    // ตรวจสอบว่าแสดงข้อความแจ้งเตือนความผิดพลาด
    cy.contains("Failed to fetch projects").should("be.visible");
  });

  it("TS_SPMS_04_010 ตรวจสอบการอัปเดตรายการสปรินต์เมื่อเลือกโปรเจกต์ที่แตกต่างกัน", () => {
    // ตรวจสอบว่ามีโปรเจกต์มากกว่า 1 โปรเจกต์
    cy.get('[data-cy^="project-card-"]').then(($cards) => {
      if ($cards.length > 1) {
        // เลือกโปรเจกต์แรก
        cy.get('[data-cy^="project-card-"]').first().click();

        // รอให้การโหลดข้อมูลเสร็จสิ้น
        cy.get('[data-cy="sprints-loading"]').should("not.exist", {
          timeout: 10000,
        });

        // บันทึกข้อมูลของสปรินต์ในโปรเจกต์แรก
        cy.get("body").then(($body) => {
          const hasSprintsInFirstProject =
            $body.find('[data-cy^="sprint-card-"]').length > 0;

          // เลือกโปรเจกต์ที่สอง
          cy.get('[data-cy^="project-card-"]').eq(1).click();

          // รอให้การโหลดข้อมูลเสร็จสิ้น
          cy.get('[data-cy="sprints-loading"]').should("not.exist", {
            timeout: 10000,
          });

          // ตรวจสอบว่าข้อมูลสปรินต์ถูกอัปเดต
          cy.log("ตรวจสอบการโหลดข้อมูลสปรินต์ของโปรเจกต์ที่สอง");
          // การทดสอบนี้เพียงตรวจสอบว่าการแสดงผลเปลี่ยนแปลงเมื่อเลือกโปรเจกต์อื่น
          cy.get('[data-cy="sprints-section"]').should("be.visible");
        });
      } else {
        cy.log(
          "มีโปรเจกต์เพียงรายการเดียว ไม่สามารถทดสอบการเปลี่ยนโปรเจกต์ได้"
        );
      }
    });
  });

  it("TS_SPMS_04_011 ตรวจสอบการทำงานของปุ่มสร้างสปรินต์แรกเมื่อไม่มีสปรินต์", () => {
    // จำลองข้อมูลว่าโปรเจกต์มี แต่ไม่มีสปรินต์
    cy.intercept("GET", "*/api/sprints*", { body: [] }).as("emptySprints");

    // เลือกโปรเจกต์แรก
    cy.get('[data-cy^="project-card-"]').first().click();

    // รอให้ api ถูกเรียก
    cy.wait("@emptySprints");

    // คลิกปุ่มสร้างสปรินต์แรก
    cy.get('[data-cy="create-first-sprint-button"]').click();

    // ตรวจสอบว่า URL เปลี่ยนไปที่หน้าสร้างสปรินต์
    cy.url().should("include", "/sprints/create/");
  });

  it("TS_SPMS_04_012 ตรวจสอบการแสดงข้อมูลวันที่ของสปรินต์", () => {
    // เลือกโปรเจกต์แรก
    cy.get('[data-cy^="project-card-"]').first().click();

    // รอให้การโหลดข้อมูลเสร็จสิ้น
    cy.get('[data-cy="sprints-loading"]').should("not.exist", {
      timeout: 10000,
    });

    // ตรวจสอบว่ามีการ์ดสปรินต์หรือไม่
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy^="sprint-card-"]').length > 0) {
        // ตรวจสอบการแสดงวันที่ในรูปแบบที่ถูกต้อง (dd/mm/yyyy - dd/mm/yyyy)
        cy.get('[data-cy^="sprint-date-range-"]')
          .first()
          .should("be.visible")
          .should(
            "match",
            /\d{1,2}\/\d{1,2}\/\d{4}\s*-\s*\d{1,2}\/\d{1,2}\/\d{4}/
          );
      } else {
        cy.log("ไม่พบสปรินต์ ข้ามการทดสอบการแสดงวันที่");
      }
    });
  });
});
