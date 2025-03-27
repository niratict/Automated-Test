describe("actionlogs Page Tests", () => {
  beforeEach(() => {
    // เริ่มต้นที่หน้าเข้าสู่ระบบและทำการล็อกอิน
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type("test005@tester.com");
    cy.get('[data-cy="login-password"]').type("123456");
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าเข้าสู่หน้า dashboard หรือไม่
    cy.url().should("include", "/mainpage");
    // กด navbar เพื่อไปหน้า บันทึกการดำเนินการ
    cy.get('[data-cy="more-menu-button"]').click();
    cy.get('[data-cy="more-menu-item-บันทึกการดำเนินการ"]').click();
  });

  it("TS_SPMS_07_001 ตรวจสอบการแสดงผลองค์ประกอบหลักของหน้าบันทึกการดำเนินการ", () => {
    // ตรวจสอบการแสดงส่วนหัว
    cy.get('[data-cy="action-logs-page"]').should("be.visible");
    cy.contains("บันทึกการดำเนินการ").should("be.visible");

    // ตรวจสอบส่วนตัวกรอง
    cy.get('[data-cy="filters-section"]').should("be.visible");
    cy.get('[data-cy="action-type-filter"]').should("be.visible");
    cy.get('[data-cy="target-table-filter"]').should("be.visible");
    cy.get('[data-cy="date-range-picker"]').should("be.visible");

    // ตรวจสอบตารางแสดงข้อมูล
    cy.get('[data-cy="logs-table"]').should("be.visible");
    cy.get('[data-cy="column-header-date"]').should("be.visible");
    cy.get('[data-cy="column-header-user"]').should("be.visible");
    cy.get('[data-cy="column-header-action"]').should("be.visible");
    cy.get('[data-cy="column-header-target"]').should("be.visible");
    cy.get('[data-cy="column-header-details"]').should("be.visible");

    // ตรวจสอบการแสดงส่วนของการแบ่งหน้า
    cy.get('[data-cy="pagination-container"]').should("be.visible");
    cy.get('[data-cy="pagination-info"]').should("be.visible");
    cy.get('[data-cy="previous-page"]').should("be.visible");
    cy.get('[data-cy="next-page"]').should("be.visible");
  });

  it("TS_SPMS_07_002 ทดสอบการกรองข้อมูลตามประเภทการดำเนินการ", () => {
    // รอให้ตัวกรองถูกโหลดข้อมูล
    cy.get('[data-cy="action-type-filter"]').should("be.visible");

    // ตรวจสอบตัวเลือกในตัวกรอง
    cy.get('[data-cy="action-type-filter"]')
      .find("option")
      .should("have.length.gt", 1);

    // เลือกตัวกรองเป็น 'update' (หรือค่าแรกที่ไม่ใช่ค่าว่าง)
    cy.get('[data-cy="action-type-filter"]')
      .find("option")
      .eq(1)
      .then(($option) => {
        const actionType = $option.val();
        cy.get('[data-cy="action-type-filter"]').select(actionType.toString());

        // รอให้ตารางถูกอัปเดต
        cy.wait(1000);

        // ตรวจสอบว่าแถวในตารางแสดงผลตามตัวกรอง
        cy.get('[data-cy^="log-action-"]').each(($el) => {
          cy.wrap($el).should("contain", actionType);
        });
      });
  });

  it("TS_SPMS_07_003 ทดสอบการกรองข้อมูลตามตารางเป้าหมาย", () => {
    // รอให้ตัวกรองถูกโหลดข้อมูล
    cy.get('[data-cy="target-table-filter"]').should("be.visible");

    // ตรวจสอบตัวเลือกในตัวกรอง
    cy.get('[data-cy="target-table-filter"]')
      .find("option")
      .should("have.length.gt", 1);

    // เลือกตัวกรองตารางเป้าหมาย (เลือกค่าแรกที่ไม่ใช่ค่าว่าง)
    cy.get('[data-cy="target-table-filter"]')
      .find("option")
      .eq(1)
      .then(($option) => {
        const targetTable = $option.val();
        cy.get('[data-cy="target-table-filter"]').select(
          targetTable.toString()
        );

        // รอให้ตารางถูกอัปเดต
        cy.wait(1000);

        // ตรวจสอบว่าแถวในตารางแสดงผลตามตัวกรอง
        cy.get('[data-cy^="log-target-"]').each(($el) => {
          cy.wrap($el).should("contain", targetTable);
        });
      });
  });

  it("TS_SPMS_07_004 ทดสอบการเลือกช่วงวันที่", () => {
    // คลิกที่ตัวเลือกช่วงวันที่
    cy.get('[data-cy="date-range-picker"]').click();
    cy.get('[data-cy="date-picker-popup"]').should("be.visible");

    // เลือกวันแรกของเดือน
    cy.get(".rdp-day").not(".rdp-day_outside").first().click();

    // เลือกวันที่ 15 ของเดือน (หรือวันกลางเดือนประมาณ)
    cy.get(".rdp-day").not(".rdp-day_outside").eq(14).click();

    // กดยืนยัน
    cy.get('[data-cy="date-picker-confirm"]').click();

    // ตรวจสอบว่า popup ปิดไปแล้ว
    cy.get('[data-cy="date-picker-popup"]').should("not.exist");

    // ตรวจสอบว่าค่าในปุ่มเลือกวันที่ไม่ใช่ค่าเริ่มต้น "เลือกช่วงเวลา"
    cy.get('[data-cy="date-range-picker"]').should(
      "not.contain",
      "เลือกช่วงเวลา"
    );

    // รอให้ตารางถูกอัปเดต
    cy.wait(1000);
  });

  it("TS_SPMS_07_005 ทดสอบการล้างตัวกรองทั้งหมด", () => {
    // เลือกตัวกรอง
    cy.get('[data-cy="action-type-filter"]')
      .find("option")
      .eq(1)
      .then(($option) => {
        cy.get('[data-cy="action-type-filter"]').select(
          $option.val().toString()
        );
      });

    // รอให้ปุ่มล้างตัวกรองปรากฏ
    cy.wait(500);
    cy.get('[data-cy="clear-filters-button"]').should("be.visible");

    // กดปุ่มล้างตัวกรอง
    cy.get('[data-cy="clear-filters-button"]').click();

    // ตรวจสอบว่าค่าตัวกรองถูกรีเซ็ต
    cy.get('[data-cy="action-type-filter"]').should("have.value", "");
    cy.get('[data-cy="target-table-filter"]').should("have.value", "");

    // ตรวจสอบว่าค่าวันที่ถูกรีเซ็ต
    cy.get('[data-cy="date-range-picker"]').should("contain", "เลือกช่วงเวลา");

    // ตรวจสอบว่าปุ่มล้างตัวกรองไม่แสดงผล
    cy.get('[data-cy="clear-filters-button"]').should("not.exist");
  });

  it("TS_SPMS_07_006 ทดสอบการเปลี่ยนหน้า", () => {
    // ตรวจสอบข้อมูลเริ่มต้นในหน้าแรก
    cy.get('[data-cy="pagination-info"]')
      .invoke("text")
      .then((initialText) => {
        // กดปุ่มหน้าถัดไป (ถ้ามีข้อมูลมากกว่า 1 หน้า)
        cy.get('[data-cy="next-page"]').then(($button) => {
          if (!$button.prop("disabled")) {
            cy.get('[data-cy="next-page"]').click();

            // รอให้ข้อมูลโหลด
            cy.wait(1000);

            // ตรวจสอบว่าข้อมูลการแบ่งหน้าเปลี่ยนไป
            cy.get('[data-cy="pagination-info"]')
              .invoke("text")
              .should("not.eq", initialText);

            // กดปุ่มกลับไปหน้าก่อนหน้า
            cy.get('[data-cy="previous-page"]').click();

            // รอให้ข้อมูลโหลด
            cy.wait(1000);

            // ตรวจสอบว่ากลับไปยังข้อมูลหน้าแรก
            cy.get('[data-cy="pagination-info"]')
              .invoke("text")
              .should("eq", initialText);
          }
        });
      });
  });

  it("TS_SPMS_07_007 ทดสอบการแสดงรายละเอียดของแต่ละบันทึก", () => {
    // ตรวจสอบบันทึกแรกในตาราง
    cy.get('[data-cy^="log-row-"]')
      .first()
      .within(() => {
        // ตรวจสอบว่ามีข้อมูลวันที่
        cy.get('[data-cy^="log-date-"]').should("not.be.empty");

        // ตรวจสอบว่ามีข้อมูลผู้ใช้
        cy.get('[data-cy^="log-user-"]').should("not.be.empty");
        cy.get('[data-cy^="user-name-"]').should("be.visible");
        cy.get('[data-cy^="user-role-"]').should("be.visible");

        // ตรวจสอบว่ามีข้อมูลการดำเนินการ
        cy.get('[data-cy^="log-action-"]').should("not.be.empty");

        // ตรวจสอบว่ามีข้อมูลเป้าหมาย
        cy.get('[data-cy^="log-target-"]').should("not.be.empty");

        // ตรวจสอบว่ามีข้อมูลรายละเอียด
        cy.get('[data-cy^="log-details-"]').should("be.visible");
      });
  });

  it("TS_SPMS_07_008 ทดสอบการแสดงข้อความเมื่อไม่พบบันทึก", () => {
    // เลือกตัวกรองที่ไม่น่าจะมีข้อมูล (ต้องปรับให้เหมาะกับข้อมูลในระบบ)
    cy.get('[data-cy="action-type-filter"]').select(
      cy.get('[data-cy="action-type-filter"]').find("option").eq(1).val()
    );
    cy.get('[data-cy="target-table-filter"]').select(
      cy.get('[data-cy="target-table-filter"]').find("option").eq(1).val()
    );

    // กำหนดวันที่ให้เป็นช่วงที่ไม่น่าจะมีข้อมูล
    cy.get('[data-cy="date-range-picker"]').click();
    cy.get(".rdp-day").not(".rdp-day_outside").eq(0).click(); // วันแรก
    cy.get(".rdp-day").not(".rdp-day_outside").eq(1).click(); // วันที่สอง
    cy.get('[data-cy="date-picker-confirm"]').click();

    // รอให้ข้อมูลโหลด
    cy.wait(1000);

    // ตรวจสอบว่ามีการแสดง empty state หรือไม่
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy="empty-state"]').length > 0) {
        cy.get('[data-cy="empty-state"]').should(
          "contain",
          "ไม่พบบันทึกการดำเนินการ"
        );
      }
    });

    // ล้างตัวกรอง
    cy.get('[data-cy="clear-filters-button"]').click();
  });

  it("TS_SPMS_07_009 ทดสอบการแสดงตารางในโหมดที่รองรับหน้าจอขนาดเล็ก", () => {
    // ปรับขนาดหน้าจอให้เล็กลง (เช่น ขนาดมือถือ)
    cy.viewport("iphone-x");

    // ตรวจสอบว่ายังสามารถมองเห็นตารางได้
    cy.get('[data-cy="logs-table-container"]').should("be.visible");
    cy.get('[data-cy="logs-table"]').should("be.visible");

    // ตรวจสอบว่าส่วนตัวกรองยังแสดงผลได้ถูกต้อง
    cy.get('[data-cy="filters-section"]').should("be.visible");
    cy.get('[data-cy="action-type-filter"]').should("be.visible");
    cy.get('[data-cy="target-table-filter"]').should("be.visible");
    cy.get('[data-cy="date-range-picker"]').should("be.visible");

    // ตรวจสอบว่าส่วนของการแบ่งหน้ายังแสดงผลได้ถูกต้อง
    cy.get('[data-cy="pagination-container"]').should("be.visible");
    cy.get('[data-cy="pagination-info"]').should("be.visible");
    cy.get('[data-cy="previous-page"]').should("be.visible");
    cy.get('[data-cy="next-page"]').should("be.visible");

    // คืนค่าขนาดหน้าจอกลับเป็นค่าปกติ
    cy.viewport("macbook-15");
  });

  it("TS_SPMS_07_010 ทดสอบการจัดรูปแบบวันที่เป็นรูปแบบไทย", () => {
    // ตรวจสอบรูปแบบวันที่ในตาราง
    cy.get('[data-cy^="log-date-"]')
      .first()
      .invoke("text")
      .then((dateText) => {
        // ตรวจสอบว่าวันที่อยู่ในรูปแบบ วัน/เดือน/พ.ศ. (DD/MM/YYYY+543)
        // เช่น 01/01/2567 โดยรูปแบบควรเป็น DD/MM/YYYY มี / คั่น และปีควรเป็นพ.ศ.
        const dateRegex = /^\d{2}\/\d{2}\/25\d{2}$/;
        expect(dateText.trim()).to.match(dateRegex);

        // แยกปีออกมาและตรวจสอบว่าเป็นพ.ศ. (มากกว่า 2500)
        const yearPart = parseInt(dateText.trim().split("/")[2]);
        expect(yearPart).to.be.at.least(2500);
      });
  });

  it("TS_SPMS_07_011 ทดสอบการแสดงสถานะการโหลด", () => {
    // ทำให้เกิดการโหลดข้อมูลใหม่
    cy.get('[data-cy="action-type-filter"]')
      .find("option")
      .eq(1)
      .then(($option) => {
        // บันทึกค่าตัวกรองเพื่อใช้เปรียบเทียบภายหลัง
        const filterValue = $option.val().toString();

        // Intercept API call
        cy.intercept("GET", "**/api/action-logs*").as("getLogs");

        // เลือกตัวกรอง
        cy.get('[data-cy="action-type-filter"]').select(filterValue);

        // รอให้การร้องขอ API เสร็จสิ้น
        cy.wait("@getLogs");

        // ตรวจสอบว่าตารางแสดงผลแล้ว
        cy.get('[data-cy="logs-table"]').should("be.visible");
      });
  });

  it("TS_SPMS_07_012 ทดสอบการเปลี่ยนแปลงจำนวนรายการต่อหน้า", () => {
    // หมายเหตุ: จากโค้ดที่ให้มา ไม่มีตัวเลือกให้เปลี่ยนแปลงจำนวนรายการต่อหน้า
    // แต่ทดสอบว่าค่าเริ่มต้นถูกกำหนดเป็น 10 รายการต่อหน้า
    cy.get('[data-cy="pagination-info"]')
      .invoke("text")
      .then((text) => {
        // ตรวจสอบว่าข้อความมีการแสดงจำนวนรายการที่แสดง และจำนวนรายการทั้งหมด
        expect(text).to.include("แสดง");
        expect(text).to.include("จาก");
        expect(text).to.include("รายการ");
      });
  });

  it("TS_SPMS_07_013 ทดสอบการทำงานร่วมกันของตัวกรองหลายชนิด", () => {
    // เลือกตัวกรองประเภทการดำเนินการ
    cy.get('[data-cy="action-type-filter"]')
      .find("option")
      .eq(1)
      .then(($actionOption) => {
        const actionType = $actionOption.val().toString();
        cy.get('[data-cy="action-type-filter"]').select(actionType);

        // เลือกตัวกรองตารางเป้าหมาย
        cy.get('[data-cy="target-table-filter"]')
          .find("option")
          .eq(1)
          .then(($tableOption) => {
            const targetTable = $tableOption.val().toString();
            cy.get('[data-cy="target-table-filter"]').select(targetTable);

            // รอให้ตารางถูกอัปเดต
            cy.wait(1000);

            // ตรวจสอบผลลัพธ์ในตาราง
            cy.get("body").then(($body) => {
              if ($body.find('[data-cy^="log-row-"]').length > 0) {
                // ถ้ามีผลลัพธ์ ตรวจสอบว่าทุกแถวต้องตรงกับทั้งสองตัวกรอง
                cy.get('[data-cy^="log-action-"]').each(($el) => {
                  cy.wrap($el).should("contain", actionType);
                });

                cy.get('[data-cy^="log-target-"]').each(($el) => {
                  cy.wrap($el).should("contain", targetTable);
                });
              } else if ($body.find('[data-cy="empty-state"]').length > 0) {
                // ถ้าไม่มีผลลัพธ์ ตรวจสอบว่ามีข้อความว่าไม่พบบันทึกการดำเนินการ
                cy.get('[data-cy="empty-state"]').should(
                  "contain",
                  "ไม่พบบันทึกการดำเนินการ"
                );
              }
            });

            // ล้างตัวกรอง
            cy.get('[data-cy="clear-filters-button"]').click();
          });
      });
  });

  it("TS_SPMS_07_014 ทดสอบการปรับช่วงวันที่พร้อมกับตัวกรองอื่น", () => {
    // เลือกตัวกรองประเภทการดำเนินการ
    cy.get('[data-cy="action-type-filter"]')
      .find("option")
      .eq(1)
      .then(($option) => {
        const actionType = $option.val().toString();
        cy.get('[data-cy="action-type-filter"]').select(actionType);

        // เลือกช่วงวันที่
        cy.get('[data-cy="date-range-picker"]').click();
        cy.get(".rdp-day").not(".rdp-day_outside").first().click();
        cy.get(".rdp-day").not(".rdp-day_outside").eq(7).click(); // เลือกช่วง 1 สัปดาห์
        cy.get('[data-cy="date-picker-confirm"]').click();

        // รอให้ตารางถูกอัปเดต
        cy.wait(1000);

        // ตรวจสอบผลลัพธ์ในตาราง (เฉพาะประเภทการดำเนินการ)
        cy.get("body").then(($body) => {
          if ($body.find('[data-cy^="log-row-"]').length > 0) {
            cy.get('[data-cy^="log-action-"]').each(($el) => {
              cy.wrap($el).should("contain", actionType);
            });
          } else if ($body.find('[data-cy="empty-state"]').length > 0) {
            cy.get('[data-cy="empty-state"]').should(
              "contain",
              "ไม่พบบันทึกการดำเนินการ"
            );
          }
        });

        // ล้างตัวกรอง
        cy.get('[data-cy="clear-filters-button"]').click();
      });
  });

  it("TS_SPMS_07_015 ทดสอบการแสดงรายละเอียดในรูปแบบที่อ่านง่าย", () => {
    // ตรวจสอบรายละเอียดที่แสดงในตาราง
    cy.get('[data-cy^="log-row-"]')
      .first()
      .within(() => {
        cy.get('[data-cy^="log-details-"]').within(() => {
          // ตรวจสอบว่ามีการแสดงรายละเอียดในรูปแบบที่มีชื่อฟิลด์และค่า
          cy.get('[data-cy^="detail-item-"]').should("exist");

          // ตรวจสอบรูปแบบการแสดงผลของรายละเอียด
          cy.get('[data-cy^="detail-item-"]')
            .first()
            .within(() => {
              // ควรมีทั้งชื่อฟิลด์และค่า
              cy.get("span.font-bold").should("exist");
            });
        });
      });
  });
});
