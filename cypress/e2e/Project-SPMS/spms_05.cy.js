describe("ไฟล์ทดสอบ Page Tests", () => {
  beforeEach(() => {
    // เริ่มต้นที่หน้าเข้าสู่ระบบและทำการล็อกอิน
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type("test005@tester.com");
    cy.get('[data-cy="login-password"]').type("123456");
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าเข้าสู่หน้า dashboard หรือไม่
    cy.url().should("include", "/mainpage");
    // กด navbar เพื่อไปหน้า ไฟล์ทดสอบ
    cy.get('[data-cy="more-menu-button"]').click();
    cy.get('[data-cy="more-menu-item-ไฟล์ทดสอบ"]').click();
  });

  it("TS_SPMS_05_001 แสดงหน้าไฟล์ทดสอบและองค์ประกอบหลักอย่างถูกต้อง", () => {
    // ตรวจสอบว่าอยู่ที่หน้าไฟล์ทดสอบ
    cy.url().should("include", "/test-files");

    // ตรวจสอบองค์ประกอบหลักของหน้าไฟล์ทดสอบ
    cy.get('[data-cy="test-files-page"]').should("exist");
    cy.contains("การจัดการไฟล์ทดสอบ").should("be.visible");
    cy.get('[data-cy="project-selection-section"]').should("be.visible");
  });

  it("TS_SPMS_05_002 การแสดงรายการโปรเจกต์และการเลือกโปรเจกต์", () => {
    // รอให้ข้อมูลโปรเจกต์โหลดเสร็จ
    cy.get('[data-cy="project-selection-section"]').should("be.visible");

    // ตรวจสอบรายการโปรเจกต์
    cy.get('[data-cy^="project-card-"]').should("have.length.at.least", 1);

    // เลือกโปรเจกต์แรก
    cy.get('[data-cy^="project-card-"]').first().click();

    // ตรวจสอบว่าโปรเจกต์ถูกเลือก (มี class ที่แสดงว่าถูกเลือก)
    cy.get('[data-cy^="project-card-"]')
      .first()
      .should("have.class", "border-blue-500");
  });

  it("TS_SPMS_05_003 การแสดงรายการสปรินต์หลังจากเลือกโปรเจกต์", () => {
    // เลือกโปรเจกต์แรก
    cy.get('[data-cy^="project-card-"]').first().click();

    // ตรวจสอบว่าส่วนของสปรินต์ปรากฏ
    cy.get('[data-cy="sprints-section"]').should("be.visible");

    // ตรวจสอบว่ามีข้อมูลสปรินต์ หรือข้อความแจ้งว่าไม่มีสปรินต์
    cy.get("body").then(($body) => {
      // ตรวจสอบว่ามีสปรินต์หรือไม่
      if ($body.find('[data-cy^="sprint-item-"]').length > 0) {
        cy.get('[data-cy^="sprint-item-"]').should("have.length.at.least", 1);
      } else {
        // ถ้าไม่มีสปรินต์ ควรแสดงข้อความว่าไม่มีสปรินต์
        cy.get('[data-cy="empty-sprints"]').should("be.visible");
        cy.contains("ยังไม่มีสปรินต์ในโปรเจกต์นี้").should("be.visible");
      }
    });
  });

  it("TS_SPMS_05_004 การเลือกสปรินต์และแสดงไฟล์ทดสอบ", () => {
    // เลือกโปรเจกต์แรก
    cy.get('[data-cy^="project-card-"]').first().click();

    // ตรวจสอบว่ามีสปรินต์หรือไม่
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy^="sprint-item-"]').length > 0) {
        // เลือกสปรินต์แรก
        cy.get('[data-cy^="sprint-item-"]').first().click();

        // ตรวจสอบว่าสปรินต์ถูกเลือก
        cy.get('[data-cy^="sprint-item-"]')
          .first()
          .should("have.class", "border-green-500");

        // ตรวจสอบว่าแสดง dashboard และส่วนของไฟล์ทดสอบ
        cy.get('[data-cy="test-stats-dashboard"]').should("exist");
        cy.get('[data-cy="test-files-filter-section"]').should("be.visible");

        // ตรวจสอบว่ามีไฟล์ทดสอบหรือแสดงข้อความว่าไม่มีไฟล์
        cy.get("body").then(($innerBody) => {
          if ($innerBody.find('[data-cy="test-files-grid"]').length > 0) {
            cy.get('[data-cy="test-files-grid"]').should("be.visible");
          } else {
            cy.get('[data-cy="empty-test-files"]').should("be.visible");
            cy.contains("ไม่พบไฟล์ทดสอบในสปรินต์นี้").should("be.visible");
          }
        });
      }
    });
  });

  it("TS_SPMS_05_005 การค้นหาไฟล์ทดสอบ", () => {
    // เลือกโปรเจกต์และสปรินต์ที่มีไฟล์ทดสอบ
    cy.get('[data-cy^="project-card-"]').first().click();

    cy.get("body").then(($body) => {
      if ($body.find('[data-cy^="sprint-item-"]').length > 0) {
        cy.get('[data-cy^="sprint-item-"]').first().click();

        // ตรวจสอบว่ามีไฟล์ทดสอบ
        cy.get("body").then(($innerBody) => {
          if ($innerBody.find('[data-cy^="test-file-"]').length > 0) {
            // จำนวนไฟล์ก่อนค้นหา
            cy.get('[data-cy^="test-file-"]').then(($files) => {
              const initialCount = $files.length;

              // ดึงชื่อของไฟล์แรกเพื่อใช้ในการค้นหา
              cy.get('[data-cy^="test-file-"]')
                .first()
                .find("h3")
                .invoke("text")
                .then((filename) => {
                  // ตัดเอาเฉพาะ 2 ตัวอักษรแรกของชื่อไฟล์เพื่อใช้ค้นหาแบบบางส่วน
                  const searchTerm = filename.trim().substring(0, 2);

                  // ทำการค้นหา
                  cy.get('[data-cy="search-test-files"]').type(searchTerm);

                  // ตรวจสอบผลการค้นหา
                  cy.get('[data-cy="filter-results-count"]').should(
                    "not.contain",
                    "ไม่พบรายการ"
                  );
                  cy.get('[data-cy^="test-file-"]').should("exist");
                });
            });
          }
        });
      }
    });
  });

  it("TS_SPMS_05_006 การเรียงลำดับไฟล์ทดสอบ", () => {
    // เลือกโปรเจกต์และสปรินต์ที่มีไฟล์ทดสอบ
    cy.get('[data-cy^="project-card-"]').first().click();

    cy.get("body").then(($body) => {
      if ($body.find('[data-cy^="sprint-item-"]').length > 0) {
        cy.get('[data-cy^="sprint-item-"]').first().click();

        // ตรวจสอบว่ามีไฟล์ทดสอบมากกว่า 1 ไฟล์
        cy.get("body").then(($innerBody) => {
          if ($innerBody.find('[data-cy^="test-file-"]').length > 1) {
            // คลิกปุ่มเรียงลำดับ
            cy.get('[data-cy="sort-order-button"]').click();

            // เลือกเรียงลำดับจากเก่าสุด
            cy.get('[data-cy="sort-oldest"]').click();

            // ตรวจสอบว่ามีการเปลี่ยนแปลงการเรียงลำดับ (อย่างน้อยปุ่มควรแสดงข้อความที่เปลี่ยนไป)
            cy.get('[data-cy="sort-order-button"]').should(
              "contain",
              "เก่าสุด"
            );

            // เรียงตามชื่อ A-Z
            cy.get('[data-cy="sort-order-button"]').click();
            cy.get('[data-cy="sort-name-asc"]').click();
            cy.get('[data-cy="sort-order-button"]').should("contain", "A-Z");
          }
        });
      }
    });
  });

  it("TS_SPMS_05_007 การทำงานของปุ่มรีเฟรชข้อมูล", () => {
    // เลือกโปรเจกต์และสปรินต์
    cy.get('[data-cy^="project-card-"]').first().click();

    cy.get("body").then(($body) => {
      if ($body.find('[data-cy^="sprint-item-"]').length > 0) {
        cy.get('[data-cy^="sprint-item-"]').first().click();

        // คลิกปุ่มรีเฟรช
        cy.get('[data-cy="refresh-test-files"]').click();

        // ตรวจสอบว่าปุ่มรีเฟรชแสดงสถานะกำลังรีเฟรช (มี class animate-spin)
        cy.get('[data-cy="refresh-test-files"] svg').should(
          "have.class",
          "animate-spin"
        );
      }
    });
  });

  it("TS_SPMS_05_008 การเปิดและปิดส่วนของโปรเจกต์และสปรินต์", () => {
    // ตรวจสอบว่าส่วนโปรเจกต์แสดงอยู่
    cy.get('[data-cy="project-selection-section"]')
      .find('[data-cy^="project-card-"]')
      .should("be.visible");

    // คลิกที่หัวข้อเพื่อซ่อนส่วนโปรเจกต์
    cy.get('[data-cy="project-selection-section"]').find("h2").click();

    // ตรวจสอบว่าส่วนโปรเจกต์ถูกซ่อน
    cy.get('[data-cy="project-selection-section"]')
      .find('[data-cy^="project-card-"]')
      .should("not.be.visible");

    // คลิกอีกครั้งเพื่อแสดงส่วนโปรเจกต์
    cy.get('[data-cy="project-selection-section"]').find("h2").click();

    // ตรวจสอบว่าส่วนโปรเจกต์กลับมาแสดง
    cy.get('[data-cy="project-selection-section"]')
      .find('[data-cy^="project-card-"]')
      .should("be.visible");
  });

  it("TS_SPMS_05_009 การดูรายละเอียดไฟล์ทดสอบ", () => {
    // เลือกโปรเจกต์และสปรินต์ที่มีไฟล์ทดสอบ
    cy.get('[data-cy^="project-card-"]').first().click();

    cy.get("body").then(($body) => {
      if ($body.find('[data-cy^="sprint-item-"]').length > 0) {
        cy.get('[data-cy^="sprint-item-"]').first().click();

        // ตรวจสอบว่ามีไฟล์ทดสอบ
        cy.get("body").then(($innerBody) => {
          if ($innerBody.find('[data-cy^="test-file-"]').length > 0) {
            // คลิกปุ่ม "ดูรายละเอียดเพิ่มเติม" ของไฟล์แรก
            cy.get('[data-cy^="view-detail-button-"]').first().click();

            // ตรวจสอบว่าได้นำทางไปยังหน้ารายละเอียดไฟล์ทดสอบ
            cy.url().should("include", "/test-files/");
          }
        });
      }
    });
  });

  it("TS_SPMS_05_010 การสร้างไฟล์ทดสอบใหม่", () => {
    // เลือกโปรเจกต์และสปรินต์
    cy.get('[data-cy^="project-card-"]').first().click();

    cy.get("body").then(($body) => {
      if ($body.find('[data-cy^="sprint-item-"]').length > 0) {
        cy.get('[data-cy^="sprint-item-"]').first().click();

        // คลิกปุ่มสร้างไฟล์ทดสอบใหม่
        cy.get("body").then(($innerBody) => {
          // ตรวจสอบว่ามีไฟล์ทดสอบหรือไม่
          if ($innerBody.find('[data-cy="empty-test-files"]').length > 0) {
            // กรณีไม่มีไฟล์ทดสอบ
            cy.get('[data-cy="upload-first-test-file-button"]').click();
          } else {
            // กรณีมีไฟล์ทดสอบแล้ว
            cy.get('[data-cy="create-test-file-button"]').click();
          }

          // ตรวจสอบว่าได้นำทางไปยังหน้าสร้างไฟล์ทดสอบ
          cy.url().should("include", "/test-files/create/");
        });
      }
    });
  });

  it("TS_SPMS_05_011 การแสดงสถานะของไฟล์ทดสอบ", () => {
    // เลือกโปรเจกต์และสปรินต์ที่มีไฟล์ทดสอบ
    cy.get('[data-cy^="project-card-"]').first().click();

    cy.get("body").then(($body) => {
      if ($body.find('[data-cy^="sprint-item-"]').length > 0) {
        cy.get('[data-cy^="sprint-item-"]').first().click();

        // ตรวจสอบว่ามีไฟล์ทดสอบ
        cy.get("body").then(($innerBody) => {
          if ($innerBody.find('[data-cy^="test-file-"]').length > 0) {
            // ตรวจสอบว่าไฟล์ทดสอบแต่ละไฟล์แสดงสถานะ (Pass, Fail, Pending)
            cy.get('[data-cy^="test-file-"]')
              .first()
              .then(($file) => {
                // ตรวจสอบว่ามีไอคอนสถานะ Pass, Fail หรือ Pending
                const hasStatus =
                  $file.find('[data-cy="test-status-pass"]').length > 0 ||
                  $file.find('[data-cy="test-status-fail"]').length > 0 ||
                  $file.find('[data-cy="test-status-pending"]').length > 0;

                expect(hasStatus).to.be.true;
              });
          }
        });
      }
    });
  });

  it("TS_SPMS_05_012 การแสดงข้อมูลเมื่อไม่พบโปรเจกต์", () => {
    // จำลองกรณีไม่มีโปรเจกต์โดยการ stub API call
    cy.intercept("GET", "**/api/projects", {
      statusCode: 200,
      body: [], // ส่งค่าเป็น array ว่าง
    }).as("emptyProjects");

    // รีเฟรชหน้า
    cy.reload();

    // รอให้ API ถูกเรียก
    cy.wait("@emptyProjects");

    // ตรวจสอบว่าแสดงข้อความว่าไม่พบโปรเจกต์
    cy.get('[data-cy="project-notfound-1"]').should("be.visible");
    cy.get('[data-cy="project-notfound-1"]').should("contain", "ไม่พบโปรเจกต์");
  });

  it("TS_SPMS_05_013 การแสดงข้อมูลเมื่อไม่พบสปรินต์", () => {
    // เลือกโปรเจกต์แรก
    cy.get('[data-cy^="project-card-"]').first().click();

    // จำลองกรณีไม่มีสปรินต์โดยการ stub API call
    cy.intercept("GET", "**/api/sprints**", {
      statusCode: 200,
      body: [], // ส่งค่าเป็น array ว่าง
    }).as("emptySprints");

    // รอให้ API ถูกเรียก
    cy.wait("@emptySprints");

    // ตรวจสอบว่าแสดงข้อความว่าไม่พบสปรินต์
    cy.get('[data-cy="empty-sprints"]').should("be.visible");
    cy.contains("ยังไม่มีสปรินต์ในโปรเจกต์นี้").should("be.visible");
  });

  it("TS_SPMS_05_014 การแสดง error message เมื่อเกิดข้อผิดพลาดในการดึงข้อมูล", () => {
    // จำลองกรณีเกิดข้อผิดพลาดจาก API
    cy.intercept("GET", "**/api/projects", {
      statusCode: 500,
      body: {
        message: "เซิร์ฟเวอร์มีปัญหา ไม่สามารถดึงข้อมูลได้",
      },
    }).as("errorProjects");

    // รีเฟรชหน้า
    cy.reload();

    // รอให้ API ถูกเรียก
    cy.wait("@errorProjects");

    // ตรวจสอบว่าแสดง error message
    cy.get('[data-cy="error-message"]').should("be.visible");
    cy.get('[data-cy="error-message"]').should("contain", "เกิดข้อผิดพลาด");
  });

  it("TS_SPMS_05_015 การแสดงแดชบอร์ดสถิติการทดสอบ", () => {
    // เลือกโปรเจกต์และสปรินต์
    cy.get('[data-cy^="project-card-"]').first().click();

    cy.get("body").then(($body) => {
      if ($body.find('[data-cy^="sprint-item-"]').length > 0) {
        cy.get('[data-cy^="sprint-item-"]').first().click();

        // ตรวจสอบว่าแดชบอร์ดสถิติแสดงอยู่
        cy.get('[data-cy="test-stats-dashboard"]').should("exist");

        // ตรวจสอบการทำงานของปุ่มซ่อน/แสดงแดชบอร์ด
        cy.get('[data-cy="test-stats-dashboard"]')
          .find("button")
          .then(($button) => {
            if ($button.find('svg[data-cy="chevron-up"]').length > 0) {
              // ถ้าแดชบอร์ดกำลังแสดงอยู่ ให้คลิกเพื่อซ่อน
              cy.wrap($button).click();

              // ตรวจสอบว่าแดชบอร์ดถูกซ่อน
              cy.get('[data-cy="test-stats-dashboard"]')
                .find('[data-cy="dashboard-content"]')
                .should("not.be.visible");
            } else {
              // ถ้าแดชบอร์ดกำลังซ่อนอยู่ ให้คลิกเพื่อแสดง
              cy.wrap($button).click();

              // ตรวจสอบว่าแดชบอร์ดถูกแสดง
              cy.get('[data-cy="test-stats-dashboard"]')
                .find('[data-cy="dashboard-content"]')
                .should("be.visible");
            }
          });
      }
    });
  });
});
