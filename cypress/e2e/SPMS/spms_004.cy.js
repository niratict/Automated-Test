// cypress/e2e/projectDetail.cy.js

describe("การทดสอบหน้ารายละเอียดโปรเจกต์", () => {
  // ข้อมูลผู้ใช้สำหรับการทดสอบ
  const testUser = {
    email: "test005@tester.com",
    password: "123456",
  };

  // ข้อมูลโปรเจกต์จำลองสำหรับทดสอบ
  const mockProject = {
    project_id: "1",
    name: "ทดสอบโปรเจกต์",
    description: "รายละเอียดโปรเจกต์ทดสอบ",
    status: "Active",
    start_date: "2025-01-01",
    end_date: "2025-12-31",
    created_by: "Test User",
    photo: null,
    sprints: [
      {
        sprint_id: "101",
        name: "สปรินต์ที่ 1",
        start_date: "2025-01-01",
        end_date: "2025-01-14",
      },
      {
        sprint_id: "102",
        name: "สปรินต์ที่ 2",
        start_date: "2025-01-15",
        end_date: "2025-01-28",
      },
    ],
  };

  // ข้อมูลโปรเจกต์ที่ไม่มีสปรินต์
  const mockProjectNoSprints = {
    ...mockProject,
    sprints: [],
  };

  beforeEach(() => {
    // ล้างคุกกี้และจำลองการยืนยันตัวตน
    cy.clearCookies();
    cy.clearLocalStorage();

    // จำลองการล็อกอิน
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type(testUser.email);
    cy.get('[data-cy="login-password"]').type(testUser.password);
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าได้เปลี่ยนเส้นทางไปที่ /mainpage
    cy.url().should("include", "/mainpage");
  });

  // กลุ่มการทดสอบการโหลดหน้า
  describe("ทดสอบการโหลดหน้า", () => {
    it("TS_SPMS_04_001 แสดงหน้าโหลดขณะกำลังดึงข้อมูลโปรเจกต์", () => {
      // จำลองการดึงข้อมูลโปรเจกต์ที่ใช้เวลานาน
      cy.intercept("GET", "**/api/projects/*", (req) => {
        req.reply((res) => {
          // หน่วงเวลา 1 วินาที
          res.delay = 1000;
          res.body = mockProject;
        });
      }).as("getProject");

      // เข้าสู่หน้ารายละเอียดโปรเจกต์
      cy.visit("/projects/1");

      // ตรวจสอบการแสดงสถานะการโหลด
      cy.get('[data-cy="project-detail-loading"]').should("be.visible");

      // รอการโหลดข้อมูลเสร็จสิ้น
      cy.wait("@getProject");

      // ตรวจสอบว่าหน้าโหลดหายไปเมื่อโหลดเสร็จแล้ว
      cy.get('[data-cy="project-detail-loading"]').should("not.exist");
    });

    it("TS_SPMS_04_002 แสดงข้อความแจ้งเตือนเมื่อเกิดข้อผิดพลาดในการโหลดข้อมูล", () => {
      // จำลองการดึงข้อมูลโปรเจกต์ที่เกิดข้อผิดพลาด
      cy.intercept("GET", "**/api/projects/*", {
        statusCode: 500,
        body: {
          message: "ไม่สามารถโหลดรายละเอียดโปรเจกต์ได้",
        },
      }).as("getProjectError");

      // เข้าสู่หน้ารายละเอียดโปรเจกต์
      cy.visit("/projects/1");

      // รอการโหลดข้อมูลเสร็จสิ้น
      cy.wait("@getProjectError");

      // ตรวจสอบการแสดงข้อความแจ้งเตือนความผิดพลาด
      cy.get('[data-cy="project-detail-error"]').should("be.visible");
      cy.contains("เกิดข้อผิดพลาด").should("be.visible");
      cy.contains("ไม่สามารถโหลดรายละเอียดโปรเจกต์ได้").should("be.visible");
    });

    it("TS_SPMS_04_003 แสดงข้อความเมื่อไม่พบโปรเจกต์", () => {
      // จำลองการดึงข้อมูลโปรเจกต์ที่ไม่พบข้อมูล
      cy.intercept("GET", "**/api/projects/*", {
        statusCode: 404,
        body: {
          message: "ไม่พบโปรเจกต์",
        },
      }).as("getProjectNotFound");

      // เข้าสู่หน้ารายละเอียดโปรเจกต์
      cy.visit("/projects/999");

      // รอการโหลดข้อมูลเสร็จสิ้น
      cy.wait("@getProjectNotFound");

      // ตรวจสอบการแสดงข้อความแจ้งเตือนไม่พบข้อมูล
      cy.get('[data-cy="project-detail-error"]').should("be.visible");
      cy.contains("ไม่พบโปรเจกต์").should("be.visible");
    });
  });

  // กลุ่มการทดสอบการแสดงข้อมูลโปรเจกต์
  describe("ทดสอบการแสดงข้อมูลโปรเจกต์", () => {
    beforeEach(() => {
      // จำลองการดึงข้อมูลโปรเจกต์สำเร็จ
      cy.intercept("GET", "**/api/projects/*", {
        statusCode: 200,
        body: mockProject,
      }).as("getProject");

      // เข้าสู่หน้ารายละเอียดโปรเจกต์
      cy.visit("/projects/1");

      // รอการโหลดข้อมูลเสร็จสิ้น
      cy.wait("@getProject");
    });

    it("TS_SPMS_04_004 แสดงข้อมูลพื้นฐานของโปรเจกต์อย่างถูกต้อง", () => {
      // ตรวจสอบชื่อโปรเจกต์
      cy.contains("โปรเจกต์ ทดสอบโปรเจกต์").should("be.visible");

      // ตรวจสอบสถานะโปรเจกต์
      cy.get('[data-cy="project-status"]').should("contain", "กำลังดำเนินการ");

      // ตรวจสอบรายละเอียดโปรเจกต์
      cy.contains("รายละเอียดโปรเจกต์ทดสอบ").should("be.visible");

      // ตรวจสอบข้อมูลผู้สร้าง
      cy.contains("สร้างโดย: Test User").should("be.visible");
    });

    it("TS_SPMS_04_005 แสดงวันที่เริ่มต้นและสิ้นสุดโปรเจกต์อย่างถูกต้อง", () => {
      // ตรวจสอบวันที่เริ่มต้น
      cy.get('[data-cy="project-start-date"]').should("contain", "01/01/2568");

      // ตรวจสอบวันที่สิ้นสุด
      cy.get('[data-cy="project-end-date"]').should("contain", "31/12/2568");
    });

    it("TS_SPMS_04_006 แสดงรายการสปรินต์ของโปรเจกต์อย่างถูกต้อง", () => {
      // ตรวจสอบส่วนรายการสปรินต์
      cy.get('[data-cy="sprint-list"]').should("be.visible");

      // ตรวจสอบจำนวนสปรินต์
      cy.get('[data-cy^="sprint-item-"]').should("have.length", 2);

      // ตรวจสอบข้อมูลสปรินต์แรก
      cy.get('[data-cy="sprint-item-101"]').should("contain", "สปรินต์ที่ 1");
      cy.get('[data-cy="sprint-item-101"]').should("contain", "01/01/2568");
      cy.get('[data-cy="sprint-item-101"]').should("contain", "14/01/2568");

      // ตรวจสอบข้อมูลสปรินต์ที่สอง
      cy.get('[data-cy="sprint-item-102"]').should("contain", "สปรินต์ที่ 2");
      cy.get('[data-cy="sprint-item-102"]').should("contain", "15/01/2568");
      cy.get('[data-cy="sprint-item-102"]').should("contain", "28/01/2568");
    });

    it("TS_SPMS_04_007 แสดงข้อความเมื่อโปรเจกต์ไม่มีสปรินต์", () => {
      // จำลองการดึงข้อมูลโปรเจกต์ที่ไม่มีสปรินต์
      cy.intercept("GET", "**/api/projects/*", {
        statusCode: 200,
        body: mockProjectNoSprints,
      }).as("getProjectNoSprints");

      // เข้าสู่หน้ารายละเอียดโปรเจกต์
      cy.visit("/projects/1");

      // รอการโหลดข้อมูลเสร็จสิ้น
      cy.wait("@getProjectNoSprints");

      // ตรวจสอบการแสดงข้อความแจ้งเตือนไม่มีสปรินต์
      cy.get('[data-cy="no-sprints"]').should("be.visible");
      cy.contains("ยังไม่มีสปรินต์ในโปรเจกต์นี้").should("be.visible");
    });

    it("TS_SPMS_04_008 แสดงข้อความเมื่อโปรเจกต์ไม่มีรูปภาพ", () => {
      // ตรวจสอบการแสดงข้อความแจ้งเตือนไม่มีรูปภาพ
      cy.get('[data-cy="project-no-image"]').should("be.visible");
      cy.contains("ไม่มีรูปภาพ").should("be.visible");
    });

    it("TS_SPMS_04_009 แสดงรูปภาพโปรเจกต์เมื่อมีรูปภาพ", () => {
      // จำลองการดึงข้อมูลโปรเจกต์ที่มีรูปภาพ
      const mockProjectWithImage = {
        ...mockProject,
        photo: "https://example.com/project-image.jpg",
      };

      cy.intercept("GET", "**/api/projects/*", {
        statusCode: 200,
        body: mockProjectWithImage,
      }).as("getProjectWithImage");

      // เข้าสู่หน้ารายละเอียดโปรเจกต์
      cy.visit("/projects/1");

      // รอการโหลดข้อมูลเสร็จสิ้น
      cy.wait("@getProjectWithImage");

      // ตรวจสอบการแสดงรูปภาพโปรเจกต์
      cy.get('[data-cy="project-image"]').should("be.visible");
      cy.get('[data-cy="project-image"] img').should(
        "have.attr",
        "src",
        "https://example.com/project-image.jpg"
      );
    });
  });

  // กลุ่มการทดสอบการนำทาง
  describe("ทดสอบการนำทาง", () => {
    beforeEach(() => {
      // จำลองการดึงข้อมูลโปรเจกต์สำเร็จ
      cy.intercept("GET", "**/api/projects/*", {
        statusCode: 200,
        body: mockProject,
      }).as("getProject");

      // เข้าสู่หน้ารายละเอียดโปรเจกต์
      cy.visit("/projects/1");

      // รอการโหลดข้อมูลเสร็จสิ้น
      cy.wait("@getProject");
    });

    it("TS_SPMS_04_010 นำทางกลับไปยังหน้าเลือกโปรเจกต์เมื่อคลิกปุ่มกลับ", () => {
      // คลิกปุ่มกลับ
      cy.get('[data-cy="back-to-projects"]').click();

      // ตรวจสอบการเปลี่ยนเส้นทาง
      cy.url().should("include", "/projects");
    });

    it("TS_SPMS_04_011 นำทางไปยังหน้าแก้ไขโปรเจกต์เมื่อคลิกปุ่มแก้ไข", () => {
      // คลิกปุ่มแก้ไข
      cy.get('[data-cy="edit-project"]').click();

      // ตรวจสอบการเปลี่ยนเส้นทาง
      cy.url().should("include", "/projects/1/edit");
    });

    it("TS_SPMS_04_012 นำทางไปยังหน้าจัดการสิทธิ์เมื่อคลิกปุ่มจัดการสิทธิ์", () => {
      // คลิกปุ่มจัดการสิทธิ์
      cy.get('[data-cy="manage-permissions"]').click();

      // ตรวจสอบการเปลี่ยนเส้นทาง
      cy.url().should("include", "/projects/1/permissions");
    });

    it("TS_SPMS_04_013 นำทางไปยังหน้ารายละเอียดสปรินต์เมื่อคลิกที่สปรินต์", () => {
      // คลิกที่สปรินต์แรก
      cy.get('[data-cy="sprint-item-101"]').click();

      // ตรวจสอบการเปลี่ยนเส้นทาง
      cy.url().should("include", "/sprints/101");
    });
  });

  // กลุ่มการทดสอบเมนูบนอุปกรณ์มือถือ
  describe("Mobile Actions Menu", () => {
    beforeEach(() => {
      // กำหนดจอแสดงผลขนาดมือถือ
      cy.viewport("iphone-x");

      // จำลองการดึงข้อมูลโปรเจกต์สำเร็จ
      cy.intercept("GET", "**/api/projects/*", {
        statusCode: 200,
        body: mockProject,
      }).as("getProject");

      // เข้าสู่หน้ารายละเอียดโปรเจกต์
      cy.visit("/projects/1");

      // รอการโหลดข้อมูลเสร็จสิ้น
      cy.wait("@getProject");
    });

    it("TS_SPMS_04_014 แสดงเมนูมือถือเมื่อคลิกที่ปุ่ม", () => {
      // ตรวจสอบว่าปุ่มเมนูมือถือแสดงอยู่
      cy.get('[data-cy="mobile-actions-menu"]').should("be.visible");

      // คลิกที่ปุ่มเมนูมือถือ
      cy.get('[data-cy="mobile-actions-menu"]').click();

      // ตรวจสอบว่าเมนูแสดงออกมา
      cy.get('[data-cy="mobile-manage-permissions"]').should("be.visible");
      cy.get('[data-cy="mobile-edit-project"]').should("be.visible");
      cy.get('[data-cy="mobile-delete-project"]').should("be.visible");
    });

    it("TS_SPMS_04_015 นำทางไปยังหน้าแก้ไขโปรเจกต์เมื่อเลือกจากเมนูมือถือ", () => {
      // คลิกที่ปุ่มเมนูมือถือ
      cy.get('[data-cy="mobile-actions-menu"]').click();

      // คลิกที่ตัวเลือกแก้ไขโปรเจกต์
      cy.get('[data-cy="mobile-edit-project"]').click();

      // ตรวจสอบการเปลี่ยนเส้นทาง
      cy.url().should("include", "/projects/1/edit");
    });

    it("TS_SPMS_04_016 นำทางไปยังหน้าจัดการสิทธิ์เมื่อเลือกจากเมนูมือถือ", () => {
      // คลิกที่ปุ่มเมนูมือถือ
      cy.get('[data-cy="mobile-actions-menu"]').click();

      // คลิกที่ตัวเลือกจัดการสิทธิ์
      cy.get('[data-cy="mobile-manage-permissions"]').click();

      // ตรวจสอบการเปลี่ยนเส้นทาง
      cy.url().should("include", "/projects/1/permissions");
    });
  });

  // กลุ่มการทดสอบการลบโปรเจกต์
  describe("ทดสอบการลบโปรเจกต์", () => {
    beforeEach(() => {
      // จำลองการดึงข้อมูลโปรเจกต์สำเร็จ
      cy.intercept("GET", "**/api/projects/*", {
        statusCode: 200,
        body: mockProject,
      }).as("getProject");

      // เข้าสู่หน้ารายละเอียดโปรเจกต์
      cy.visit("/projects/1");

      // รอการโหลดข้อมูลเสร็จสิ้น
      cy.wait("@getProject");
    });

    it("TS_SPMS_04_017 แสดงโมดัลยืนยันการลบเมื่อคลิกปุ่มลบโปรเจกต์", () => {
      // คลิกปุ่มลบโปรเจกต์
      cy.get('[data-cy="delete-project"]').click();

      // ตรวจสอบว่าโมดัลยืนยันการลบแสดงออกมา
      cy.contains("ยืนยันการลบโปรเจกต์").should("be.visible");
      cy.contains("คุณแน่ใจหรือไม่ว่าต้องการลบโปรเจกต์นี้?").should(
        "be.visible"
      );
      cy.get('[data-cy="delete-modal-cancel"]').should("be.visible");
      cy.get('[data-cy="delete-modal-confirm"]').should("be.visible");
    });

    it("TS_SPMS_04_018 ปิดโมดัลเมื่อคลิกปุ่มยกเลิกในโมดัลยืนยันการลบ", () => {
      // คลิกปุ่มลบโปรเจกต์
      cy.get('[data-cy="delete-project"]').click();

      // ตรวจสอบว่าโมดัลยืนยันการลบแสดงออกมา
      cy.contains("ยืนยันการลบโปรเจกต์").should("be.visible");

      // คลิกปุ่มยกเลิก
      cy.get('[data-cy="delete-modal-cancel"]').click();

      // ตรวจสอบว่าโมดัลปิดไปแล้ว
      cy.contains("ยืนยันการลบโปรเจกต์").should("not.exist");
    });

    it("TS_SPMS_04_019 ลบโปรเจกต์สำเร็จและนำทางกลับไปยังหน้าเลือกโปรเจกต์", () => {
      // จำลองการลบโปรเจกต์สำเร็จ
      cy.intercept("DELETE", "**/api/projects/*", {
        statusCode: 200,
        body: {
          message: "ลบโปรเจกต์สำเร็จ",
        },
      }).as("deleteProject");

      // คลิกปุ่มลบโปรเจกต์
      cy.get('[data-cy="delete-project"]').click();

      // คลิกปุ่มยืนยันการลบ
      cy.get('[data-cy="delete-modal-confirm"]').click();

      // รอการลบข้อมูลเสร็จสิ้น
      cy.wait("@deleteProject");

      // ตรวจสอบการเปลี่ยนเส้นทาง
      cy.url().should("include", "/projects");
    });

    it("TS_SPMS_04_020 แสดงโมดัลแจ้งเตือนเมื่อลบโปรเจกต์ที่มีสปรินต์ไม่ได้", () => {
      // จำลองการลบโปรเจกต์ไม่สำเร็จเนื่องจากมีสปรินต์
      cy.intercept("DELETE", "**/api/projects/*", {
        statusCode: 400,
        body: {
          message: "ไม่สามารถลบโปรเจกต์ที่มีสปรินต์อยู่ได้",
          sprint_count: 2,
        },
      }).as("deleteProjectError");

      // คลิกปุ่มลบโปรเจกต์
      cy.get('[data-cy="delete-project"]').click();

      // คลิกปุ่มยืนยันการลบ
      cy.get('[data-cy="delete-modal-confirm"]').click();

      // รอการลบข้อมูลเสร็จสิ้น
      cy.wait("@deleteProjectError");

      // ตรวจสอบการแสดงโมดัลแจ้งเตือนข้อผิดพลาด
      cy.contains("เกิดข้อผิดพลาด").should("be.visible");
      cy.contains("ไม่สามารถลบโปรเจกต์ที่มีสปรินต์อยู่ได้").should(
        "be.visible"
      );
      cy.get('[data-cy="delete-error-modal-close"]').should("be.visible");
    });

    it("TS_SPMS_04_021 ปิดโมดัลแจ้งเตือนข้อผิดพลาดเมื่อคลิกปุ่มเข้าใจแล้ว", () => {
      // จำลองการลบโปรเจกต์ไม่สำเร็จเนื่องจากมีสปรินต์
      cy.intercept("DELETE", "**/api/projects/*", {
        statusCode: 400,
        body: {
          message: "ไม่สามารถลบโปรเจกต์ที่มีสปรินต์อยู่ได้",
          sprint_count: 2,
        },
      }).as("deleteProjectError");

      // คลิกปุ่มลบโปรเจกต์
      cy.get('[data-cy="delete-project"]').click();

      // คลิกปุ่มยืนยันการลบ
      cy.get('[data-cy="delete-modal-confirm"]').click();

      // รอการลบข้อมูลเสร็จสิ้น
      cy.wait("@deleteProjectError");

      // ตรวจสอบการแสดงโมดัลแจ้งเตือนข้อผิดพลาด
      cy.contains("เกิดข้อผิดพลาด").should("be.visible");

      // คลิกปุ่มเข้าใจแล้ว
      cy.get('[data-cy="delete-error-modal-close"]').click();

      // ตรวจสอบว่าโมดัลปิดไปแล้ว
      cy.contains("เกิดข้อผิดพลาด").should("not.exist");
    });
  });
});
