/// <reference types="cypress" />

describe("หน้า Test Dashboard", () => {
  beforeEach(() => {
    // ข้อมูลผู้ใช้สำหรับการทดสอบ
    const testUser = {
      email: "test005@tester.com",
      password: "123456",
    };

    // เข้าสู่ระบบก่อนทดสอบ
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type(testUser.email);
    cy.get('[data-cy="login-password"]').type(testUser.password);
    cy.get('[data-cy="login-submit"]').click();
    // ตรวจสอบว่าได้เปลี่ยนเส้นทางไปที่ /mainpage
    cy.url().should("include", "/mainpage");

    // นำทางไปที่หน้า Test Dashboard
    cy.visit("/test-dashboard");
    // รอให้หน้า dashboard โหลดเสร็จ
    cy.get('[data-cy="test-dashboard"]', { timeout: 10000 }).should(
      "be.visible"
    );
  });

  describe("ส่วนการแสดงผลทั่วไป", () => {
    it("TS_SPMS_10_001 แสดงหน้า Test Dashboard ได้ถูกต้อง", () => {
      // ตรวจสอบส่วนหัวหน้า
      cy.get('[data-cy="dashboard-title"]').should("be.visible");
      cy.get('[data-cy="test-dashboard"]').should("be.visible");
    });

    it("TS_SPMS_10_002 แสดงปุ่ม Refresh และสามารถคลิกเพื่อรีเฟรชข้อมูลได้", () => {
      cy.get('[data-cy="refresh-dashboard"]').should("be.visible");
      cy.get('[data-cy="refresh-dashboard"]').click();
      // รอให้โหลดข้อมูลเสร็จหลังจากคลิก refresh
      cy.get('[data-cy="test-dashboard"]').should("be.visible");
    });
  });

  describe("ส่วนการเลือกโปรเจค", () => {
    it("TS_SPMS_10_003 สามารถเลือกโปรเจคได้", () => {
      cy.get('[data-cy="project-selector"]').should("be.visible");
      // เลือกโปรเจคแรก (ถ้ามี)
      cy.get('[data-cy="project-selector"]').click();
      cy.get('[data-cy^="project-option-"]').first().click();
      // ตรวจสอบว่ามีการเปลี่ยนแปลงค่าที่เลือก
      cy.get('[data-cy="project-selector"]').should("not.have.value", "all");
    });
  });

  describe("ส่วนการเลือก Sprint", () => {
    it("TS_SPMS_10_004 สามารถเลือก Sprint ได้หลังเลือกโปรเจค", () => {
      // เลือกโปรเจคก่อน
      cy.get('[data-cy="project-selector"]').click();
      cy.get('[data-cy^="project-option-"]').first().click();

      // รอให้ Sprint โหลด
      cy.get('[data-cy="sprint-selector"]', { timeout: 10000 }).should(
        "be.visible"
      );

      // เลือก Sprint
      cy.get('[data-cy="sprint-selector"]').click();
      cy.get('[data-cy^="sprint-option-"]').first().click();

      // ตรวจสอบว่ามีการเปลี่ยนแปลงค่าที่เลือก
      cy.get('[data-cy="sprint-selector"]').should("not.have.value", "all");
    });
  });

  describe("ส่วนสถิติและกราฟ", () => {
    it("TS_SPMS_10_005 แสดงสถิติโดยรวมได้ถูกต้อง", () => {
      cy.get('[data-cy="sprint-statistics"]').should("be.visible");
      cy.get('[data-cy="summary-stats-title"]').should("be.visible");
    });

    it("TS_SPMS_10_006 แสดงกราฟวงกลมสรุปผลได้ถูกต้อง", () => {
      cy.get('[data-cy="pie-chart-title"]').should("be.visible");
      cy.get('[data-cy="pie-chart-container"]').should("be.visible");
    });

    it("TS_SPMS_10_007 แสดงกราฟแท่งสรุปผลได้ถูกต้อง", () => {
      cy.get('[data-cy="bar-chart-title"]').should("be.visible");
      cy.get('[data-cy="bar-chart-container"]').should("be.visible");
    });

    it("TS_SPMS_10_008 แสดงกราฟ Sprint Stacked Chart ได้ถูกต้อง", () => {
      cy.get('[data-cy="sprint-stacked-chart-container"]').should("be.visible");
      cy.get('[data-cy="sprint-chart-title"]').should("be.visible");
    });
  });

  describe("ส่วนการค้นหาและกรอง", () => {
    it("TS_SPMS_10_009 สามารถค้นหาข้อมูลการทดสอบได้", () => {
      cy.get('[data-cy="search-filter-container"]').should("be.visible");
      cy.get('[data-cy="search-input"]').should("be.visible");

      // ทดสอบการค้นหา
      cy.get('[data-cy="search-input"]').type("test");

      // ตรวจสอบว่ามีผลลัพธ์หรือข้อความแจ้งเตือนไม่พบข้อมูล
      cy.get("body").then(($body) => {
        if (
          $body.find(
            '[data-cy="test-results-container"] [data-cy^="test-result-item-"]'
          ).length > 0
        ) {
          cy.get('[data-cy^="test-result-item-"]').should("be.visible");
        } else {
          cy.get('[data-cy="no-results-message"]').should("be.visible");
        }
      });
    });

    it("TS_SPMS_10_010 สามารถกรองผลการทดสอบตามสถานะได้", () => {
      cy.get('[data-cy="status-filter"]').should("be.visible");

      // กรองเฉพาะผลทดสอบที่ผ่าน (passed)
      cy.get('[data-cy="status-filter"]').select("passed");

      // ตรวจสอบว่ามีผลลัพธ์หรือข้อความแจ้งเตือนไม่พบข้อมูล
      cy.get("body").then(($body) => {
        if (
          $body.find(
            '[data-cy="test-results-container"] [data-cy^="test-result-item-"]'
          ).length > 0
        ) {
          cy.get('[data-cy^="test-result-item-"]').should("be.visible");
        } else {
          cy.get('[data-cy="no-results-message"]').should("be.visible");
        }
      });

      // กรองเฉพาะผลทดสอบที่ไม่ผ่าน (failed)
      cy.get('[data-cy="status-filter"]').select("failed");

      // ตรวจสอบว่ามีผลลัพธ์หรือข้อความแจ้งเตือนไม่พบข้อมูล
      cy.get("body").then(($body) => {
        if (
          $body.find(
            '[data-cy="test-results-container"] [data-cy^="test-result-item-"]'
          ).length > 0
        ) {
          cy.get('[data-cy^="test-result-item-"]').should("be.visible");
        } else {
          cy.get('[data-cy="no-results-message"]').should("be.visible");
        }
      });
    });
  });

  describe("ส่วนผลการทดสอบ", () => {
    it("TS_SPMS_10_011 แสดงรายการผลการทดสอบได้ถูกต้อง", () => {
      // เลือกโปรเจคก่อน
      cy.get('[data-cy="project-selector"]').click();
      cy.get('[data-cy^="project-option-"]').first().click();

      // ตรวจสอบว่ามีคอนเทนเนอร์สำหรับแสดงผลการทดสอบ
      cy.get('[data-cy="test-results-container"]').should("be.visible");

      // ตรวจสอบว่ามีผลลัพธ์หรือข้อความแจ้งเตือนไม่พบข้อมูล
      cy.get("body").then(($body) => {
        if (
          $body.find(
            '[data-cy="test-results-container"] [data-cy^="test-result-item-"]'
          ).length > 0
        ) {
          cy.get('[data-cy^="test-result-item-"]').should("be.visible");
        } else {
          cy.get('[data-cy="no-results-message"]').should("be.visible");
        }
      });
    });

    it("TS_SPMS_10_012 แสดงรายละเอียดของผลการทดสอบแต่ละรายการได้", () => {
      // เลือกโปรเจคก่อน
      cy.get('[data-cy="project-selector"]').click();
      cy.get('[data-cy^="project-option-"]').first().click();

      // ตรวจสอบว่ามีผลลัพธ์การทดสอบ
      cy.get("body").then(($body) => {
        if (
          $body.find(
            '[data-cy="test-results-container"] [data-cy^="test-result-item-"]'
          ).length > 0
        ) {
          // คลิกที่รายการแรกเพื่อดูรายละเอียด
          cy.get('[data-cy^="test-result-item-"]').first().click();

          // ตรวจสอบว่ามีการแสดงรายละเอียด
          cy.get('[data-cy^="test-details-list-"]').should("be.visible");
        } else {
          // ข้ามการทดสอบหากไม่มีผลลัพธ์
          cy.log("ไม่พบรายการผลการทดสอบ");
        }
      });
    });
  });

  describe("ส่วนการแบ่งหน้า (Pagination)", () => {
    it("TS_SPMS_10_013 แสดงส่วนแบ่งหน้าและสามารถเปลี่ยนหน้าได้", () => {
      // เลือกโปรเจคที่มีข้อมูลมากกว่า 1 หน้า (ถ้ามี)
      cy.get('[data-cy="project-selector"]').click();
      cy.get('[data-cy^="project-option-"]').first().click();

      // ตรวจสอบว่ามีส่วนแบ่งหน้า
      cy.get('[data-cy="pagination-container"]').should("be.visible");

      // ตรวจสอบว่ามีปุ่มถัดไปและคลิกได้หรือไม่
      cy.get("body").then(($body) => {
        // ถ้ามีปุ่มถัดไปและไม่เป็น disabled
        if (
          $body.find('[data-cy="pagination-next"]:not(:disabled)').length > 0
        ) {
          cy.get('[data-cy="pagination-next"]').click();
          // ตรวจสอบว่าหน้าที่ 2 ถูกเลือก
          cy.get('[data-cy="pagination-page-2"]').should(
            "have.class",
            "bg-blue-500"
          );
        } else {
          cy.log("ไม่สามารถไปหน้าถัดไปได้หรือมีเพียงหน้าเดียว");
        }
      });
    });

    it("TS_SPMS_10_014 สามารถไปที่หน้าแรกและหน้าสุดท้ายได้", () => {
      // เลือกโปรเจคที่มีข้อมูลมากกว่า 1 หน้า (ถ้ามี)
      cy.get('[data-cy="project-selector"]').click();
      cy.get('[data-cy^="project-option-"]').first().click();

      // ตรวจสอบว่ามีส่วนแบ่งหน้า
      cy.get('[data-cy="pagination-container"]').should("be.visible");

      cy.get("body").then(($body) => {
        // ถ้ามีปุ่มหน้าสุดท้ายและไม่เป็น disabled
        if (
          $body.find('[data-cy="pagination-last"]:not(:disabled)').length > 0
        ) {
          // ไปที่หน้าสุดท้าย
          cy.get('[data-cy="pagination-last"]').click();

          // ตรวจสอบว่าหน้าสุดท้ายถูกเลือก (ไม่สามารถระบุเลขหน้าได้ตรงๆ)
          cy.get('[data-cy="pagination-next"]').should("be.disabled");

          // ไปที่หน้าแรก
          cy.get('[data-cy="pagination-first"]').click();

          // ตรวจสอบว่าหน้าแรกถูกเลือก
          cy.get('[data-cy="pagination-page-1"]').should(
            "have.class",
            "bg-blue-500"
          );
        } else {
          cy.log("มีเพียงหน้าเดียวหรือไม่สามารถไปหน้าสุดท้ายได้");
        }
      });
    });
  });

  describe("การดูกราฟและสถิติเมื่อเลือกโปรเจค", () => {
    it("TS_SPMS_10_015 แสดงกราฟและสถิติที่ถูกต้องเมื่อเลือกโปรเจค", () => {
      // เลือกโปรเจค
      cy.get('[data-cy="project-selector"]').click();
      cy.get('[data-cy^="project-option-"]').first().click();

      // ตรวจสอบว่ากราฟวงกลมแสดงผล
      cy.get('[data-cy="pie-chart-container"]').should("be.visible");

      // ตรวจสอบว่ากราฟแท่งแสดงผล
      cy.get('[data-cy="bar-chart-container"]').should("be.visible");

      // ตรวจสอบว่ากราฟ Sprint Stacked Chart แสดงผล
      cy.get('[data-cy="sprint-stacked-chart"]').should("be.visible");
    });
  });

  describe("การจัดการข้อผิดพลาด", () => {
    it("TS_SPMS_10_016 แสดงข้อความเมื่อไม่พบผลการทดสอบ", () => {
      // ใส่ข้อมูลค้นหาที่ไม่น่าจะมีในระบบ
      cy.get('[data-cy="search-input"]').type(
        "ข้อมูลที่ไม่น่าจะมีในระบบ_xyz987"
      );

      // ตรวจสอบว่ามีข้อความแจ้งเตือนไม่พบข้อมูล
      cy.get('[data-cy="no-results-message"]').should("be.visible");
    });
  });
});
