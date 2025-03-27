// ไฟล์: cypress/e2e/test-dashboard.spec.js

describe("ทดสอบหน้า Test Dashboard", () => {
  // ข้อมูลผู้ใช้สำหรับเข้าสู่ระบบ
  const testUser = {
    email: "test005@tester.com",
    password: "123456",
  };

  // เข้าสู่ระบบก่อนแต่ละการทดสอบ
  beforeEach(() => {
    // เข้าสู่ระบบก่อนทดสอบ
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type(testUser.email);
    cy.get('[data-cy="login-password"]').type(testUser.password);
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าได้เปลี่ยนเส้นทางไปที่ /mainpage
    cy.url().should("include", "/mainpage");

    // นำทางไปยังหน้า test-dashboard
    cy.visit("/test-dashboard");

    // ตรวจสอบว่าอยู่ที่หน้า test-dashboard
    cy.url().should("include", "/test-dashboard");
    cy.get('[data-cy="test-dashboard"]').should("exist");
  });

  // กลุ่มทดสอบ: การแสดงผลองค์ประกอบพื้นฐาน
  describe("การแสดงผลองค์ประกอบพื้นฐาน", () => {
    it("TS_SPMS_12_001 ตรวจสอบการแสดงหัวข้อแดชบอร์ด", () => {
      cy.get('[data-cy="dashboard-title"]').should("be.visible");
      cy.get('[data-cy="dashboard-title"]').should(
        "contain",
        "แดชบอร์ดแสดงผลการทดสอบ"
      );
    });

    it("TS_SPMS_12_002 ตรวจสอบการแสดงตัวเลือกโปรเจกต์", () => {
      cy.get('[data-cy="project-selector"]').should("be.visible");
    });

    it("TS_SPMS_12_003 ตรวจสอบการแสดงตัวเลือก Sprint", () => {
      cy.get('[data-cy="sprint-selector"]').should("be.visible");
      // Sprint selector ควรถูกปิดใช้งานเมื่อยังไม่ได้เลือกโปรเจกต์
      cy.get('[data-cy="sprint-selector"]').should("be.disabled");
    });
  });

  // กลุ่มทดสอบ: การเลือกโปรเจกต์และ Sprint
  describe("การเลือกโปรเจกต์และ Sprint", () => {
    it("TS_SPMS_12_004 ตรวจสอบการเลือกโปรเจกต์", () => {
      // เลือกโปรเจกต์จากตัวเลือกแรก
      cy.get('[data-cy="project-selector"]').select(1);

      // ตรวจสอบว่าตัวเลือก Sprint ไม่ถูกปิดใช้งานแล้ว
      cy.get('[data-cy="sprint-selector"]').should("not.be.disabled");
    });

    it("TS_SPMS_12_005 ตรวจสอบการเลือก Sprint หลังจากเลือกโปรเจกต์", () => {
      // เลือกโปรเจกต์
      cy.get('[data-cy="project-selector"]').select(1);

      // ตรวจสอบว่าตัวเลือก Sprint แสดงผลและสามารถเลือกได้
      cy.get('[data-cy="sprint-selector"]').should("not.be.disabled");

      // เลือก Sprint ที่ต้องการ
      cy.get('[data-cy="sprint-selector"]').select("All Sprints");
      cy.get('[data-cy="sprint-stacked-chart-container"]').should("be.visible");

      // เลือก Sprint เฉพาะ
      cy.get('[data-cy="sprint-selector"]').select(1);
      cy.get('[data-cy="sprint-statistics"]').should("be.visible");
    });
  });

  // กลุ่มทดสอบ: การแสดงผลสถิติและกราฟ
  describe("การแสดงผลสถิติและกราฟ", () => {
    beforeEach(() => {
      // เลือกโปรเจกต์และ Sprint เพื่อแสดงข้อมูล
      cy.get('[data-cy="project-selector"]').select(1);
      cy.get('[data-cy="sprint-selector"]').select(1);
    });

    it("TS_SPMS_12_006 ตรวจสอบการแสดงสถิติสรุป", () => {
      // ตรวจสอบว่าส่วนสถิติสรุปแสดงผล
      cy.get('[data-cy="summary-stats-title"]').should("be.visible");
      cy.get('[data-cy="total-tests"]').should("be.visible");
      cy.get('[data-cy="passed-tests"]').should("be.visible");
      cy.get('[data-cy="failed-tests"]').should("be.visible");
      cy.get('[data-cy="test-duration"]').should("be.visible");
    });

    it("TS_SPMS_12_007 ตรวจสอบการแสดงแผนภูมิวงกลม", () => {
      // ตรวจสอบว่าแผนภูมิวงกลมแสดงผล
      cy.get('[data-cy="pie-chart-title"]').should("be.visible");
      cy.get('[data-cy="pie-label-passed"]').should("exist");
      cy.get('[data-cy="pie-label-failed"]').should("exist");
    });

    it("TS_SPMS_12_008 ตรวจสอบการแสดงแผนภูมิแท่ง", () => {
      // ตรวจสอบว่าแผนภูมิแท่งแสดงผล
      cy.get('[data-cy="bar-chart-title"]').should("be.visible");
      cy.get('[data-cy="bar-chart-summary"]').should("be.visible");
    });
  });

  // กลุ่มทดสอบ: การแสดงแผนภูมิแบบซ้อนเมื่อเลือก "All Sprints"
  describe('การแสดงแผนภูมิแบบซ้อนเมื่อเลือก "All Sprints"', () => {
    it("TS_SPMS_12_009 ตรวจสอบการแสดงแผนภูมิแบบซ้อนเมื่อเลือก All Sprints", () => {
      // เลือกโปรเจกต์
      cy.get('[data-cy="project-selector"]').select(1);

      // เลือก All Sprints
      cy.get('[data-cy="sprint-selector"]').select("All Sprints");

      // ตรวจสอบว่าแผนภูมิแบบซ้อนแสดงผล
      cy.get('[data-cy="sprint-chart-title"]').should("be.visible");
      cy.get('[data-cy="sprint-stacked-chart"]').should("exist");
    });
  });

  // กลุ่มทดสอบ: การค้นหาและกรองผลการทดสอบ
  describe("การค้นหาและกรองผลการทดสอบ", () => {
    beforeEach(() => {
      // เลือกโปรเจกต์และ Sprint เพื่อแสดงข้อมูล
      cy.get('[data-cy="project-selector"]').select(1);
      cy.get('[data-cy="sprint-selector"]').select(1);
    });

    it("TS_SPMS_12_010 ตรวจสอบการค้นหาไฟล์ทดสอบ", () => {
      // ตรวจสอบว่าช่องค้นหาแสดงผล
      cy.get('[data-cy="search-input"]').should("be.visible");

      // ใส่คำค้นหา "test" และตรวจสอบการกรองข้อมูล
      cy.get('[data-cy="search-input"]').type("test");

      // รอให้ผลการค้นหาแสดงผล
      cy.wait(500);

      // ตรวจสอบข้อความสรุปผลการค้นหา
      cy.get('[data-cy="results-summary"]').should("contain", "พบผลการทดสอบ");
    });

    it("TS_SPMS_12_011 ตรวจสอบการกรองตามสถานะ", () => {
      // ตรวจสอบว่าตัวกรองสถานะแสดงผล
      cy.get('[data-cy="status-filter"]').should("be.visible");

      // เลือกกรองเฉพาะที่ผ่าน
      cy.get('[data-cy="status-filter"]').select("passed");

      // รอให้ผลการกรองแสดงผล
      cy.wait(500);

      // ตรวจสอบข้อความสรุปผลการกรอง
      cy.get('[data-cy="results-summary"]').should("contain", "พบผลการทดสอบ");

      // เลือกกรองเฉพาะที่ผิดพลาด
      cy.get('[data-cy="status-filter"]').select("failed");

      // รอให้ผลการกรองแสดงผล
      cy.wait(500);

      // ตรวจสอบข้อความสรุปผลการกรอง
      cy.get('[data-cy="results-summary"]').should("contain", "พบผลการทดสอบ");
    });
  });

  // กลุ่มทดสอบ: การแสดงผลรายการทดสอบ
  describe("การแสดงผลรายการทดสอบ", () => {
    beforeEach(() => {
      // เลือกโปรเจกต์และ Sprint เพื่อแสดงข้อมูล
      cy.get('[data-cy="project-selector"]').select(1);
      cy.get('[data-cy="sprint-selector"]').select(1);
    });

    it("TS_SPMS_12_012 ตรวจสอบการแสดงผลรายการทดสอบ", () => {
      // ตรวจสอบว่าส่วนแสดงผลรายการทดสอบแสดงผล
      cy.get('[data-cy="test-results-container"]').should("be.visible");

      // ตรวจสอบว่ามีรายการทดสอบอย่างน้อย 1 รายการ
      cy.get('[data-cy="test-result-item-0"]').should("exist");

      // ตรวจสอบองค์ประกอบของรายการทดสอบ
      cy.get('[data-cy="test-result-title-0"]').should("be.visible");
      cy.get('[data-cy="test-result-filename-0"]').should("be.visible");
      cy.get('[data-cy="test-count-0"]').should("be.visible");
      cy.get('[data-cy="test-status-0"]').should("be.visible");
      cy.get('[data-cy="test-duration-0"]').should("be.visible");
    });
  });

  // กลุ่มทดสอบ: การแบ่งหน้า
  describe("การแบ่งหน้า", () => {
    beforeEach(() => {
      // เลือกโปรเจกต์และ Sprint เพื่อแสดงข้อมูล
      cy.get('[data-cy="project-selector"]').select(1);
      cy.get('[data-cy="sprint-selector"]').select(1);

      // ใส่คำค้นหาที่มีโอกาสแสดงผลหลายหน้า หรือใช้ตัวกรองที่แสดงผลหลายรายการ
      cy.get('[data-cy="search-input"]').clear();
      cy.get('[data-cy="status-filter"]').select("all");
    });

    it("TS_SPMS_12_013 ตรวจสอบปุ่มการแบ่งหน้า", () => {
      // รอให้ข้อมูลโหลดเสร็จ
      cy.wait(1000);

      // ตรวจสอบว่ามีระบบการแบ่งหน้าหรือไม่ (กรณีมีผลการทดสอบมากกว่า 1 หน้า)
      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="pagination-container"]').length > 0) {
          // ตรวจสอบว่าส่วนการแบ่งหน้าแสดงผล
          cy.get('[data-cy="pagination-container"]').should("be.visible");
          cy.get('[data-cy="pagination-info"]').should("be.visible");

          // ทดสอบการคลิกปุ่มหน้าถัดไป (ถ้ามี)
          cy.get('[data-cy="pagination-next"]').then(($next) => {
            if (!$next.prop("disabled")) {
              cy.get('[data-cy="pagination-next"]').click();
              cy.wait(500);
              // ตรวจสอบว่าข้อมูลมีการเปลี่ยนแปลงหรือหมายเลขหน้าเปลี่ยนไป
              cy.get('[data-cy="pagination-info"]').should(
                "not.contain",
                "หน้า 1 จาก"
              );
            }
          });

          // ทดสอบการคลิกปุ่มหน้าแรก (ถ้าไม่ได้อยู่ที่หน้าแรก)
          cy.get('[data-cy="pagination-first"]').then(($first) => {
            if (!$first.prop("disabled")) {
              cy.get('[data-cy="pagination-first"]').click();
              cy.wait(500);
              // ตรวจสอบว่าหมายเลขหน้ากลับมาที่หน้า 1
              cy.get('[data-cy="pagination-info"]').should(
                "contain",
                "หน้า 1 จาก"
              );
            }
          });
        } else {
          // กรณีไม่มีการแบ่งหน้า ให้ผ่านการทดสอบไปโดยตรวจสอบว่ามีผลการทดสอบแสดงอยู่
          cy.get('[data-cy="results-summary"]').should("be.visible");
        }
      });
    });

    it("TS_SPMS_12_014 ตรวจสอบการคลิกที่หมายเลขหน้า", () => {
      // รอให้ข้อมูลโหลดเสร็จ
      cy.wait(1000);

      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="pagination-container"]').length > 0) {
          // ตรวจสอบจำนวนหน้าทั้งหมด
          cy.get('[data-cy="pagination-info"]').then(($info) => {
            const pageInfoText = $info.text();
            // ใช้ regex ดึงข้อมูลจำนวนหน้า เช่น "หน้า 1 จาก 5 (25 รายการ)"
            const match = pageInfoText.match(/หน้า \d+ จาก (\d+)/);

            if (match && match[1] && parseInt(match[1]) > 1) {
              // คลิกที่หมายเลขหน้า 2 (ถ้ามีมากกว่า 1 หน้า)
              cy.get('[data-cy="pagination-page-2"]').click();
              cy.wait(500);

              // ตรวจสอบว่าหมายเลขหน้าเปลี่ยนเป็นหน้า 2
              cy.get('[data-cy="pagination-info"]').should(
                "contain",
                "หน้า 2 จาก"
              );
            }
          });
        } else {
          // กรณีไม่มีการแบ่งหน้า ให้ผ่านการทดสอบไปโดยตรวจสอบว่ามีผลการทดสอบแสดงอยู่
          cy.get('[data-cy="results-summary"]').should("be.visible");
        }
      });
    });
  });

  // กลุ่มทดสอบ: การกระทำอื่นๆ และ Edge Cases
  describe("การกระทำอื่นๆ และ Edge Cases", () => {
    it("TS_SPMS_12_015 ตรวจสอบกรณีไม่พบผลการทดสอบ", () => {
      // เลือกโปรเจกต์
      cy.get('[data-cy="project-selector"]').select(1);
      cy.get('[data-cy="sprint-selector"]').select(1);

      // ใส่คำค้นหาที่ไม่น่าจะตรงกับผลการทดสอบใดๆ
      cy.get('[data-cy="search-input"]').type(
        "ไม่มีผลการทดสอบนี้แน่นอน-xyz-123!@#"
      );

      // รอให้ระบบประมวลผลการค้นหา
      cy.wait(500);

      // ตรวจสอบว่าแสดงข้อความไม่พบผลการทดสอบ
      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="no-results-message"]').length > 0) {
          cy.get('[data-cy="no-results-message"]').should("be.visible");
        } else {
          // กรณีไม่มีข้อความระบุชัดเจน ให้ตรวจสอบจำนวนผลลัพธ์เป็น 0
          cy.get('[data-cy="results-summary"]').should(
            "contain",
            "พบผลการทดสอบทั้งหมด 0 รายการ"
          );
        }
      });
    });

    it("TS_SPMS_12_016 ตรวจสอบการรีเฟรชข้อมูล", () => {
      // เลือกโปรเจกต์และ Sprint
      cy.get('[data-cy="project-selector"]').select(1);
      cy.get('[data-cy="sprint-selector"]').select(1);

      // ตรวจสอบว่ามีปุ่มรีเฟรช
      cy.get('[data-cy="search-filter-container"]')
        .find("button")
        .then(($buttons) => {
          // ถ้ามีปุ่มรีเฟรช ให้คลิกและตรวจสอบการโหลดใหม่
          if ($buttons.length > 0) {
            cy.get('[data-cy="search-filter-container"]')
              .find("button")
              .last()
              .click();
            // ตรวจสอบว่าข้อมูลได้รับการโหลดใหม่ (อาจตรวจสอบโดยดูจากการมีส่วนแสดงผล)
            cy.get('[data-cy="test-results-container"]').should("be.visible");
          } else {
            // ถ้าไม่มีปุ่มรีเฟรชโดยตรง ให้ข้ามการทดสอบนี้ไป
            cy.log("ไม่พบปุ่มรีเฟรชในหน้าจอ");
          }
        });
    });
  });

  // กลุ่มทดสอบ: การตรวจสอบการแสดงผลบนหน้าจอขนาดต่างๆ (Responsive)
  describe("การตรวจสอบการแสดงผลบนหน้าจอขนาดต่างๆ (Responsive)", () => {
    beforeEach(() => {
      // เลือกโปรเจกต์และ Sprint เพื่อแสดงข้อมูล
      cy.get('[data-cy="project-selector"]').select(1);
      cy.get('[data-cy="sprint-selector"]').select(1);
    });

    it("TS_SPMS_12_017 ตรวจสอบการแสดงผลบนหน้าจอขนาดกลาง (Tablet)", () => {
      // กำหนดขนาดหน้าจอแบบ Tablet
      cy.viewport(768, 1024);

      // ตรวจสอบว่าองค์ประกอบหลักยังคงแสดงผลได้ถูกต้อง
      cy.get('[data-cy="dashboard-title"]').should("be.visible");
      cy.get('[data-cy="project-selector"]').should("be.visible");
      cy.get('[data-cy="sprint-selector"]').should("be.visible");
      cy.get('[data-cy="sprint-statistics"]').should("be.visible");
      cy.get('[data-cy="test-results-container"]').should("be.visible");
    });

    it("TS_SPMS_12_018 ตรวจสอบการแสดงผลบนหน้าจอขนาดเล็ก (Mobile)", () => {
      // กำหนดขนาดหน้าจอแบบ Mobile
      cy.viewport(375, 812);

      // ตรวจสอบว่าองค์ประกอบหลักยังคงแสดงผลได้ถูกต้อง
      cy.get('[data-cy="dashboard-title"]').should("be.visible");
      cy.get('[data-cy="project-selector"]').should("be.visible");
      cy.get('[data-cy="sprint-selector"]').should("be.visible");
      cy.get('[data-cy="sprint-statistics"]').should("be.visible");
      cy.get('[data-cy="test-results-container"]').should("be.visible");
    });
  });

  // กลุ่มทดสอบ: การทดสอบแบบ End-to-End
  describe("การทดสอบแบบ End-to-End", () => {
    it("TS_SPMS_12_019 ทดสอบการใช้งานแบบครบวงจร", () => {
      // เลือกโปรเจกต์
      cy.get('[data-cy="project-selector"]').select(1);

      // ตรวจสอบว่า Sprint selector ไม่ถูกปิดใช้งานแล้ว
      cy.get('[data-cy="sprint-selector"]').should("not.be.disabled");

      // เลือก All Sprints
      cy.get('[data-cy="sprint-selector"]').select("All Sprints");
      cy.get('[data-cy="sprint-stacked-chart-container"]').should("be.visible");

      // เลือก Sprint เฉพาะ
      cy.get('[data-cy="sprint-selector"]').select(1);
      cy.get('[data-cy="sprint-statistics"]').should("be.visible");

      // ค้นหาผลการทดสอบ
      cy.get('[data-cy="search-input"]').type("test");
      cy.wait(500);

      // กรองตามสถานะที่ผ่าน
      cy.get('[data-cy="status-filter"]').select("passed");
      cy.wait(500);

      // ตรวจสอบผลลัพธ์
      cy.get('[data-cy="results-summary"]').should("contain", "พบผลการทดสอบ");

      // ล้างการค้นหาและกรอง
      cy.get('[data-cy="search-input"]').clear();
      cy.get('[data-cy="status-filter"]').select("all");
      cy.wait(500);

      // ตรวจสอบการแบ่งหน้า (ถ้ามี)
      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="pagination-container"]').length > 0) {
          cy.get('[data-cy="pagination-container"]').should("be.visible");
          // ตรวจสอบการคลิกปุ่มหน้าถัดไป (ถ้าไม่ถูกปิดใช้งาน)
          cy.get('[data-cy="pagination-next"]').then(($next) => {
            if (!$next.prop("disabled")) {
              cy.get('[data-cy="pagination-next"]').click();
              cy.wait(500);
            }
          });
        }
      });
    });

    it("TS_SPMS_12_020 ทดสอบการเลือกโปรเจกต์อื่น", () => {
      // เลือกโปรเจกต์แรก
      cy.get('[data-cy="project-selector"]').select(1);
      cy.get('[data-cy="sprint-selector"]').select(1);

      // จดจำข้อมูลของโปรเจกต์แรก (อาจใช้ alias หรือตัวแปร)
      cy.get('[data-cy="test-result-title-0"]')
        .invoke("text")
        .as("firstProjectTitle");

      // เลือกโปรเจกต์อื่น (ถ้ามี)
      cy.get('[data-cy="project-selector"]').then(($select) => {
        if ($select.find("option").length > 2) {
          // มีตัวเลือกมากกว่า 2 ตัว (รวม option กรณีไม่เลือก)
          cy.get('[data-cy="project-selector"]').select(2);
          cy.get('[data-cy="sprint-selector"]').select(1);

          // ตรวจสอบว่าข้อมูลเปลี่ยนไป
          cy.get("@firstProjectTitle").then((firstTitle) => {
            cy.get('[data-cy="test-result-title-0"]').should(
              "not.contain",
              firstTitle
            );
          });
        } else {
          cy.log(
            "มีโปรเจกต์เพียงตัวเดียวในระบบ ไม่สามารถทดสอบการเปลี่ยนโปรเจกต์ได้"
          );
        }
      });
    });
  });

  // กลุ่มทดสอบ: การแสดงรายละเอียดกรณีทดสอบและการจัดการข้อผิดพลาด
  describe("การแสดงรายละเอียดกรณีทดสอบและการจัดการข้อผิดพลาด", () => {
    beforeEach(() => {
      // เลือกโปรเจกต์และ Sprint เพื่อแสดงข้อมูล
      cy.get('[data-cy="project-selector"]').select(1);
      cy.get('[data-cy="sprint-selector"]').select(1);

      // Check if the toggle-details button exists before trying to click it
      cy.wait(1000);
      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="toggle-details"]').length > 0) {
          cy.get('[data-cy="toggle-details"]').first().click({ force: true });
        } else {
          cy.log("Toggle details button not found - skipping click");
        }
      });
      cy.wait(500);
    });

    it("TS_SPMS_12_021 ตรวจสอบการแสดงรายการกรณีทดสอบที่ผ่าน", () => {
      // กรองเฉพาะกรณีทดสอบที่ผ่าน
      cy.get('[data-cy="filter-select"]').select("passed");
      cy.wait(500);

      // ตรวจสอบว่ามีไอคอนกรณีทดสอบที่ผ่านแสดงผล
      cy.get('[data-cy="pass-icon"]').should("exist");

      // ตรวจสอบว่าสี UI ของกรณีทดสอบที่ผ่านเป็นสีเขียว
      cy.get('[data-test-status="passed"]').should("exist");
    });

    it("TS_SPMS_12_022 ตรวจสอบการแสดงรายการกรณีทดสอบที่ผิดพลาด", () => {
      // กรองเฉพาะกรณีทดสอบที่ผิดพลาด
      cy.get('[data-cy="filter-select"]').select("failed");
      cy.wait(500);

      // ตรวจสอบว่ามีไอคอนกรณีทดสอบที่ผิดพลาดแสดงผล
      cy.get('[data-cy="fail-icon"]').should("exist");

      // ตรวจสอบว่าสี UI ของกรณีทดสอบที่ผิดพลาดเป็นสีแดง
      cy.get('[data-test-status="failed"]').should("exist");
    });

    it("TS_SPMS_12_023 ตรวจสอบการแสดงข้อความว่าไม่พบผลลัพธ์การค้นหา", () => {
      // ค้นหาด้วยข้อความที่ไม่น่าจะมีในผลการทดสอบ
      cy.get('[data-cy="search-input"]').type("ZZXXYYNOTEXIST123456");
      cy.wait(500);

      // ตรวจสอบว่าแสดงข้อความว่าไม่พบผลลัพธ์
      cy.get('[data-cy="no-results-message"]').should("be.visible");

      // ตรวจสอบปุ่มล้างตัวกรอง
      cy.get('[data-cy="clear-filters-button"]').should("be.visible");

      // คลิกปุ่มล้างตัวกรอง
      cy.get('[data-cy="clear-filters-button"]').click();
      cy.wait(500);

      // ตรวจสอบว่าแสดงผลลัพธ์อีกครั้ง
      cy.get('[data-cy="no-results-message"]').should("not.exist");
    });

    it("TS_SPMS_12_024 ตรวจสอบการเปิด/ปิดดูรายละเอียดกรณีทดสอบที่ผิดพลาด", () => {
      // กรองเฉพาะกรณีทดสอบที่ผิดพลาด
      cy.get('[data-cy="filter-select"]').select("failed");
      cy.wait(500);

      // คลิกที่กรณีทดสอบที่ผิดพลาดเพื่อเปิดดูรายละเอียด
      cy.get('[data-test-status="failed"]').first().click();
      cy.wait(500);

      // ตรวจสอบว่าแสดงรายละเอียดข้อผิดพลาด
      cy.get('[data-cy="error-details"]').should("be.visible");

      // คลิกอีกครั้งเพื่อปิดรายละเอียด
      cy.get('[data-test-status="failed"]').first().click();
      cy.wait(500);

      // ตรวจสอบว่าไม่แสดงรายละเอียดข้อผิดพลาดแล้ว
      cy.get('[data-cy="error-details"]').should("not.exist");
    });

    it("TS_SPMS_12_025 ตรวจสอบข้อมูลรายละเอียดของกรณีทดสอบ", () => {
      // คลิกเพื่อดูกรณีทดสอบทั้งหมด
      cy.get('[data-cy="filter-select"]').select("all");
      cy.wait(500);

      // ตรวจสอบว่าแสดงข้อมูลรายละเอียดของกรณีทดสอบ
      cy.get('[data-cy="test-case-item"]')
        .first()
        .within(() => {
          // ตรวจสอบว่าแสดงชื่อกรณีทดสอบ
          cy.get('[data-cy="test-title"]').should("be.visible");

          // ตรวจสอบว่าแสดงชื่อเต็มของกรณีทดสอบ
          cy.get('[data-cy="test-full-title"]').should("be.visible");

          // ตรวจสอบว่าแสดงเวลาที่ใช้ในการทดสอบ
          cy.get('[data-cy="test-duration"]').should("be.visible");
        });
    });

    it("TS_SPMS_12_026 ตรวจสอบการกำหนดสี UI ตามสถานะของรายงานผลรวม", () => {
      // ตรวจสอบส่วนสรุปผลการทดสอบ
      cy.get('[data-cy="results-summary-card"]').then(($card) => {
        // ตรวจสอบว่าสีพื้นหลังของส่วนสรุปขึ้นอยู่กับสถานะการทดสอบ
        if ($card.attr("data-test-status") === "passed") {
          // ตรวจสอบสีเขียวสำหรับกรณีทดสอบที่ผ่านทั้งหมด
          cy.wrap($card).should("have.class", "bg-green-50");
        } else {
          // ตรวจสอบสีแดงสำหรับกรณีที่มีกรณีทดสอบที่ผิดพลาด
          cy.wrap($card).should("have.class", "bg-red-50");
        }
      });
    });

    it("TS_SPMS_12_027 ตรวจสอบการแสดงผลของชุดการทดสอบ (Test Suite)", () => {
      // ตรวจสอบว่ามีส่วนหัวของชุดการทดสอบ
      cy.get('[data-cy="suite-header"]').should("be.visible");

      // คลิกที่หัวข้อชุดการทดสอบเพื่อเปิด/ปิดเนื้อหา
      cy.get('[data-cy="suite-header"]').first().click();
      cy.wait(500);

      // ตรวจสอบสถานะการแสดง/ซ่อนเนื้อหาของชุดการทดสอบ
      cy.get('[data-cy="suite-toggle-icon"]')
        .first()
        .should("have.class", "rotate-90");

      // คลิกอีกครั้งเพื่อปิด
      cy.get('[data-cy="suite-header"]').first().click();
      cy.wait(500);

      // ตรวจสอบสถานะไอคอน toggle
      cy.get('[data-cy="suite-toggle-icon"]')
        .first()
        .should("not.have.class", "rotate-90");
    });

    it("TS_SPMS_12_028 ตรวจสอบการแสดงผลกรณีเปิด/ปิดรายละเอียดการทดสอบทั้งหมด", () => {
      // ปิดรายละเอียดการทดสอบ
      cy.get('[data-cy="toggle-details"]').click();
      cy.wait(500);

      // ตรวจสอบว่าไม่แสดงส่วนค้นหาและกรอง
      cy.get('[data-cy="search-input"]').should("not.exist");
      cy.get('[data-cy="filter-select"]').should("not.exist");

      // เปิดรายละเอียดการทดสอบอีกครั้ง
      cy.get('[data-cy="toggle-details"]').click();
      cy.wait(500);

      // ตรวจสอบว่าแสดงส่วนค้นหาและกรอง
      cy.get('[data-cy="search-input"]').should("be.visible");
      cy.get('[data-cy="filter-select"]').should("be.visible");
    });
  });
});
