/// <reference types="cypress" />

// กำหนดข้อมูลผู้ใช้สำหรับการทดสอบ
const testUser = {
  email: "test005@tester.com",
  password: "123456",
};

// กำหนดข้อมูล mock สำหรับสปรินต์ตัวอย่าง
const mockSprint = {
  id: 1,
  name: "Sprint 1",
  project_id: 123,
  project_name: "Test Project",
  start_date: "2025-03-15",
  end_date: "2025-03-29",
  created_by: "Test User",
};

describe("ทดสอบแต่ละกรณีให้เข้าสู่ระบบและเตรียมข้อมูลจำลอง", () => {
  // ก่อนการทดสอบแต่ละกรณี ให้เข้าสู่ระบบและเตรียมข้อมูลจำลอง
  beforeEach(() => {
    // เข้าสู่ระบบก่อนทดสอบ
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type(testUser.email);
    cy.get('[data-cy="login-password"]').type(testUser.password);
    cy.get('[data-cy="login-submit"]').click();
    // ตรวจสอบว่าได้เปลี่ยนเส้นทางไปที่ /mainpage
    cy.url().should("include", "/mainpage");

    // จำลองข้อมูล API สำหรับสปรินต์รายละเอียด
    cy.intercept("GET", `**/api/sprints/${mockSprint.id}`, {
      statusCode: 200,
      body: mockSprint,
    }).as("getSprint");

    // จำลองข้อมูล API สำหรับช่วงวันที่ของสปรินต์ทั้งหมดในโปรเจกต์
    cy.intercept("GET", `**/api/sprints/date-ranges*`, {
      statusCode: 200,
      body: [
        { name: "Sprint 1", start_date: "2025-03-15", end_date: "2025-03-29" },
      ],
    }).as("getSprintDateRanges");

    // เข้าสู่หน้ารายละเอียดสปรินต์
    cy.visit(`/sprints/${mockSprint.id}`);
    cy.wait("@getSprint");
    cy.wait("@getSprintDateRanges");
  });

  // กลุ่มทดสอบการแสดงผลข้อมูลพื้นฐาน
  describe("ทดสอบการแสดงผลข้อมูลพื้นฐาน", () => {
    it("TS_SPMS_07_001 แสดงข้อมูลหัวข้อสปรินต์ถูกต้อง", () => {
      cy.get('[data-cy="sprint-name"]').should("contain", mockSprint.name);
      cy.get('[data-cy="project-name"]').should(
        "contain",
        `โปรเจกต์: ${mockSprint.project_name}`
      );
    });

    it("TS_SPMS_07_002 แสดงข้อมูลวันที่เริ่มต้นและสิ้นสุดถูกต้อง", () => {
      // ตรวจสอบการแสดงวันที่ในส่วนหัว
      cy.get('[data-cy="sprint-start-date"]').should(
        "contain",
        formatThaiDate(mockSprint.start_date)
      );
      cy.get('[data-cy="sprint-end-date"]').should(
        "contain",
        formatThaiDate(mockSprint.end_date)
      );

      // ตรวจสอบการแสดงวันที่ในส่วนรายละเอียด
      cy.get('[data-cy="start-date-detail"]').should(
        "contain",
        formatThaiDate(mockSprint.start_date)
      );
      cy.get('[data-cy="end-date-detail"]').should(
        "contain",
        formatThaiDate(mockSprint.end_date)
      );
    });

    it("TS_SPMS_07_003 แสดงข้อมูลเพิ่มเติมถูกต้อง", () => {
      cy.get('[data-cy="created-by"]').should("contain", mockSprint.created_by);
      cy.get('[data-cy="created-date"]').should("exist");
    });
  });

  // กลุ่มทดสอบการแสดงสถานะสปรินต์
  describe("ทดสอบการแสดงสถานะสปรินต์", () => {
    it("TS_SPMS_07_004 แสดงสถานะสปรินต์ [ยังไม่เริ่ม] ถูกต้องเมื่อวันที่ปัจจุบันน้อยกว่าวันเริ่มต้น", () => {
      // จำลองวันที่ปัจจุบันให้อยู่ก่อนวันเริ่มต้น
      const pastDate = new Date("2025-03-10");
      cy.clock(pastDate.getTime());
      cy.reload();
      cy.wait("@getSprint");
      cy.wait("@getSprintDateRanges");

      cy.get('[data-cy="sprint-active-status"]').should(
        "contain",
        "ยังไม่เริ่ม"
      );
      cy.get('[data-cy="time-status-label"]').should(
        "contain",
        "จะเริ่มภายในอีก"
      );
      cy.get('[data-cy="time-status-value"]').should("contain", "วัน");
      cy.get('[data-cy="sprint-time-status"]').should("contain", "อีก");
      cy.get('[data-cy="sprint-time-status"]').should(
        "contain",
        "วันจะเริ่มสปรินต์"
      );
    });

    it("TS_SPMS_07_005 แสดงสถานะสปรินต์ [กำลังดำเนินการ] ถูกต้องเมื่อวันที่ปัจจุบันอยู่ในช่วงสปรินต์", () => {
      // จำลองวันที่ปัจจุบันให้อยู่ในช่วงสปรินต์
      const duringDate = new Date("2025-03-20");
      cy.clock(duringDate.getTime());
      cy.reload();
      cy.wait("@getSprint");
      cy.wait("@getSprintDateRanges");

      cy.get('[data-cy="sprint-active-status"]').should(
        "contain",
        "กำลังดำเนินการ"
      );
      cy.get('[data-cy="time-status-label"]').should("contain", "จะเริ่มภายในอีก");
      cy.get('[data-cy="time-status-value"]').should("contain", "วัน");
      cy.get('[data-cy="sprint-time-status"]').should("contain", "อีก");
      cy.get('[data-cy="sprint-time-status"]').should('be.visible');
    });

    it("TS_SPMS_07_006 แสดงสถานะสปรินต์ [เสร็จสิ้น] ถูกต้องเมื่อวันที่ปัจจุบันมากกว่าวันสิ้นสุด", () => {
      // จำลองวันที่ปัจจุบันให้อยู่หลังวันสิ้นสุด
      const futureDate = new Date("2025-04-05");
      cy.clock(futureDate.getTime());
      cy.reload();
      cy.wait("@getSprint");
      cy.wait("@getSprintDateRanges");

      cy.get('[data-cy="sprint-active-status"]').should("contain", "เสร็จสิ้น");
      cy.get('[data-cy="time-status-label"]').should(
        "contain",
        "เสร็จสิ้นเมื่อ"
      );
      cy.get('[data-cy="time-status-value"]').should("contain", "วันที่แล้ว");
      cy.get('[data-cy="sprint-time-status"]').should(
        "contain",
        "สปรินต์เสร็จสิ้นแล้ว"
      );
    });
  });

  // กลุ่มทดสอบความคืบหน้าของสปรินต์
  describe("ทดสอบความคืบหน้าของสปรินต์", () => {
    it("TS_SPMS_07_007 แสดงความคืบหน้า 0% เมื่อยังไม่ถึงวันเริ่มต้น", () => {
      // จำลองวันที่ปัจจุบันให้อยู่ก่อนวันเริ่มต้น
      const pastDate = new Date("2025-03-10");
      cy.clock(pastDate.getTime());
      cy.reload();
      cy.wait("@getSprint");
      cy.wait("@getSprintDateRanges");

      cy.get('[data-cy="sprint-progress-percentage"]').should("contain", "0%");
    });

    it("TS_SPMS_07_008 แสดงความคืบหน้า 50% เมื่ออยู่กึ่งกลางระยะเวลาสปรินต์", () => {
      // จำลองวันที่ปัจจุบันให้อยู่กึ่งกลางระยะเวลาสปรินต์
      const middleDate = new Date("2025-03-22"); // วันกึ่งกลางของช่วง 15-29 มีนาคม
      cy.clock(middleDate.getTime());
      cy.reload();
      cy.wait("@getSprint");
      cy.wait("@getSprintDateRanges");

      cy.get('[data-cy="sprint-progress-percentage"]').should("contain", "50%");
    });

    it("TS_SPMS_07_009 แสดงความคืบหน้า 100% เมื่อสิ้นสุดระยะเวลาสปรินต์", () => {
      // จำลองวันที่ปัจจุบันให้อยู่หลังวันสิ้นสุด
      const futureDate = new Date("2025-04-05");
      cy.clock(futureDate.getTime());
      cy.reload();
      cy.wait("@getSprint");
      cy.wait("@getSprintDateRanges");

      cy.get('[data-cy="sprint-progress-percentage"]').should(
        "contain",
        "100%"
      );
    });
  });

  // กลุ่มทดสอบการนำทาง
  describe("ทดสอบการนำทาง", () => {
    it("TS_SPMS_07_010 กดปุ่มกลับสามารถกลับไปยังหน้าเลือกสปรินต์ได้", () => {
      cy.intercept("GET", "**/api/sprints*", {
        statusCode: 200,
        body: [],
      }).as("getSprints");

      cy.get('[data-cy="back-button"]').click();
      cy.url().should("include", "/sprints");
    });

    it("TS_SPMS_07_011 กดปุ่มแก้ไขเมื่อเป็นสปรินต์ล่าสุดสามารถไปยังหน้าแก้ไขได้", () => {
      // จำลองให้เป็นสปรินต์ล่าสุด
      cy.intercept("GET", `**/api/sprints/date-ranges*`, {
        statusCode: 200,
        body: [
          {
            name: "Sprint 1",
            start_date: "2025-03-15",
            end_date: "2025-03-29",
          },
        ],
      }).as("getLatestSprint");

      cy.reload();
      cy.wait("@getSprint");
      cy.wait("@getLatestSprint");

      cy.get('[data-cy="edit-sprint-button"]').click();
      cy.url().should("include", `/sprints/${mockSprint.id}/edit`);
    });

    it("TS_SPMS_07_012 กดปุ่มแก้ไขเมื่อไม่ใช่สปรินต์ล่าสุดแสดงข้อความเตือน", () => {
      // จำลองให้ไม่ใช่สปรินต์ล่าสุด
      cy.intercept("GET", `**/api/sprints/date-ranges*`, {
        statusCode: 200,
        body: [
          {
            name: "Sprint 1",
            start_date: "2025-03-15",
            end_date: "2025-03-29",
          },
          {
            name: "Sprint 2",
            start_date: "2025-03-30",
            end_date: "2025-04-13",
          },
        ],
      }).as("getNotLatestSprint");

      cy.reload();
      cy.wait("@getSprint");
      cy.wait("@getNotLatestSprint");

      cy.get('[data-cy="edit-sprint-button"]').click();
      cy.get('[data-cy="edit-warning-modal"]').should("be.visible");
      cy.get('[data-cy="edit-warning-modal"]').should(
        "contain",
        "ไม่สามารถแก้ไขสปรินต์ได้"
      );
      cy.get('[data-cy="edit-warning-modal"]').should(
        "contain",
        "สามารถแก้ไขได้เฉพาะสปรินต์ล่าสุดเท่านั้น"
      );

      // ปิดกล่องข้อความเตือน
      cy.get('[data-cy="edit-warning-ok"]').click();
      cy.get('[data-cy="edit-warning-modal"]').should("not.exist");
    });
  });

  // กลุ่มทดสอบการลบสปรินต์
  describe("ทดสอบการลบสปรินต์", () => {
    it("TS_SPMS_07_013 ยกเลิกการลบสปรินต์เมื่อกดปุ่มยกเลิก", () => {
      cy.get('[data-cy="delete-sprint-button"]').click();
      cy.get('[data-cy="delete-modal"]').should("be.visible");
      cy.get('[data-cy="delete-modal-cancel"]').click();
      cy.get('[data-cy="delete-modal"]').should("not.exist");
    });

    it("TS_SPMS_07_014 ลบสปรินต์สำเร็จและกลับไปยังหน้าเลือกสปรินต์", () => {
      // จำลอง API การลบให้สำเร็จ
      cy.intercept("DELETE", `**/api/sprints/${mockSprint.id}`, {
        statusCode: 200,
        body: { message: "Sprint deleted successfully" },
      }).as("deleteSprint");

      cy.intercept("GET", "**/api/sprints*", {
        statusCode: 200,
        body: [],
      }).as("getSprints");

      cy.get('[data-cy="delete-sprint-button"]').click();
      cy.get('[data-cy="delete-modal"]').should("be.visible");
      cy.get('[data-cy="delete-modal-confirm"]').click();

      cy.wait("@deleteSprint");
      cy.url().should("include", "/sprints");
    });

    it("TS_SPMS_07_015 แสดงข้อความเตือนเมื่อไม่สามารถลบสปรินต์เนื่องจากมีสปรินต์ตามมาในลำดับ", () => {
      // จำลอง API การลบให้ล้มเหลวเพราะมีสปรินต์ตามมา
      cy.intercept("DELETE", `**/api/sprints/${mockSprint.id}`, {
        statusCode: 400,
        body: {
          message: "Cannot delete sprint. Later sprints exist in sequence.",
        },
      }).as("deleteSprintFailed");

      cy.get('[data-cy="delete-sprint-button"]').click();
      cy.get('[data-cy="delete-modal"]').should("be.visible");
      cy.get('[data-cy="delete-modal-confirm"]').click();

      cy.wait("@deleteSprintFailed");
      cy.get('[data-cy="delete-warning-modal"]').should("be.visible");
      cy.get('[data-cy="delete-warning-modal"]').should(
        "contain",
        "ไม่สามารถลบสปรินต์ได้"
      );
      cy.get('[data-cy="delete-warning-modal"]').should(
        "contain",
        "ไม่สามารถลบสปรินต์ได้ เนื่องจากมีสปรินต์ที่ตามมาในลำดับ"
      );

      // ปิดกล่องข้อความเตือน
      cy.get('[data-cy="delete-warning-ok"]').click();
      cy.get('[data-cy="delete-warning-modal"]').should("not.exist");
    });

    it("TS_SPMS_07_016 แสดงข้อความเตือนเมื่อไม่สามารถลบสปรินต์เนื่องจากมีไฟล์ทดสอบอยู่", () => {
      // จำลอง API การลบให้ล้มเหลวเพราะมีไฟล์ทดสอบ
      cy.intercept("DELETE", `**/api/sprints/${mockSprint.id}`, {
        statusCode: 400,
        body: { message: "Cannot delete sprint with existing test files" },
      }).as("deleteSprintWithFilesFailed");

      cy.get('[data-cy="delete-sprint-button"]').click();
      cy.get('[data-cy="delete-modal"]').should("be.visible");
      cy.get('[data-cy="delete-modal-confirm"]').click();

      cy.wait("@deleteSprintWithFilesFailed");
      cy.get('[data-cy="delete-warning-modal"]').should("be.visible");
      cy.get('[data-cy="delete-warning-modal"]').should(
        "contain",
        "ไม่สามารถลบสปรินต์ได้"
      );
      cy.get('[data-cy="delete-warning-modal"]').should(
        "contain",
        "ไม่สามารถลบสปรินต์ที่มีไฟล์ทดสอบอยู่ได้"
      );

      // ปิดกล่องข้อความเตือน
      cy.get('[data-cy="delete-warning-ok"]').click();
      cy.get('[data-cy="delete-warning-modal"]').should("not.exist");
    });
  });

  // กลุ่มทดสอบกรณีพิเศษ (Edge Cases)
  describe("ทดสอบกรณีพิเศษ", () => {
    it("TS_SPMS_07_017 แสดงหน้า Loading ขณะกำลังโหลดข้อมูล", () => {
      // ใช้ Network Throttling และแสดงหน้า Loading
      cy.intercept("GET", `**/api/sprints/${mockSprint.id}`, (req) => {
        req.on("response", (res) => {
          // หน่วงเวลาการตอบกลับ
          res.setDelay(1000);
        });
      }).as("getSprintDelayed");

      cy.reload();
      cy.get('[data-cy="loading-spinner"]').should("be.visible");
      cy.wait("@getSprintDelayed");
    });

    it("TS_SPMS_07_018 แสดงข้อความเมื่อไม่พบข้อมูลสปรินต์", () => {
      cy.intercept("GET", `**/api/sprints/${mockSprint.id}`, {
        statusCode: 404,
        body: { message: "Sprint not found" },
      }).as("getSprintNotFound");

      cy.reload();
      cy.wait("@getSprintNotFound");
      cy.get('[data-cy="error-container"]').should("be.visible");
      cy.get('[data-cy="error-container"]').should("contain", "เกิดข้อผิดพลาด");
    });

    it('TS_SPMS_07_019 แสดงหน้า "ไม่พบข้อมูลสปรินต์" เมื่อไม่มีข้อมูลสปรินต์', () => {
      cy.intercept("GET", `**/api/sprints/${mockSprint.id}`, {
        statusCode: 200,
        body: null,
      }).as("getEmptySprint");

      cy.reload();
      cy.wait("@getEmptySprint");
      cy.contains("เกิดข้อผิดพลาด").should("be.visible");
    });
  });
});

// ฟังก์ชันสำหรับจำลองการแสดงวันที่แบบไทย
function formatThaiDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear() + 543; // แปลงจาก ค.ศ. เป็น พ.ศ.
  return `${day}/${month}/${year}`;
}
