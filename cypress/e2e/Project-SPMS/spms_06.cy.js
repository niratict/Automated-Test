describe("Users Page Tests", () => {
  beforeEach(() => {
    // เริ่มต้นที่หน้าเข้าสู่ระบบและทำการล็อกอิน
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type("test005@tester.com");
    cy.get('[data-cy="login-password"]').type("123456");
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าเข้าสู่หน้า dashboard หรือไม่
    cy.url().should("include", "/mainpage");
    // กด navbar เพื่อไปหน้า ผู้ใช้งาน
    cy.get('[data-cy="more-menu-button"]').click();
    cy.get('[data-cy="more-menu-item-ผู้ใช้งาน"]').click();
  });

  it("TS_SPMS_06_001 ตรวจสอบการแสดงผลองค์ประกอบหลักของหน้าผู้ใช้งาน", () => {
    // ตรวจสอบว่าอยู่ที่หน้าผู้ใช้งาน
    cy.url().should("include", "/users");

    // ตรวจสอบองค์ประกอบหลัก
    cy.get('[data-cy="page-title"]').should("contain", "การจัดการผู้ใช้");
    cy.get('[data-cy="search-filter-container"]').should("be.visible");
    cy.get('[data-cy="search-input"]').should("be.visible");
    cy.get('[data-cy="users-grid"]').should("be.visible");
    cy.get('[data-cy="add-user-button"]')
      .should("be.visible")
      .and("contain", "เพิ่มผู้ใช้");
  });

  it("TS_SPMS_06_002 ตรวจสอบการค้นหาผู้ใช้งานด้วยชื่อหรืออีเมล", () => {
    // ค้นหาด้วยข้อความที่ควรมีผลลัพธ์
    cy.get('[data-cy="search-input"]').clear().type("test");
    cy.wait(500); // รอให้การค้นหาทำงาน

    // ตรวจสอบว่ามีการแสดงผลลัพธ์
    cy.get('[data-cy="users-grid"]')
      .children()
      .should("have.length.at.least", 1);

    // ค้นหาด้วยข้อความที่ไม่ควรมีผลลัพธ์
    cy.get('[data-cy="search-input"]').clear().type("nonexistentuserxyz");
    cy.wait(500);

    // ตรวจสอบว่าไม่มีผลลัพธ์
    cy.get('[data-cy="no-results-message"]')
      .should("be.visible")
      .and("contain", "ไม่พบผู้ใช้งานที่ตรงกับเกณฑ์การค้นหา");
  });

  it("TS_SPMS_06_003 ตรวจสอบการกรองผู้ใช้งานตามบทบาท", () => {
    // เปิดตัวกรองบน mobile view (ถ้าจำเป็น)
    cy.viewport("iphone-6");
    cy.get('button[aria-label="Toggle filters"]').click();

    // เลือกกรองตามบทบาท Admin
    cy.get('[data-cy="role-filter"]').select("Admin");
    cy.wait(500);

    // ตรวจสอบผลลัพธ์ที่กรองแล้ว
    cy.get('[data-cy^="user-role-"]').each(($el) => {
      cy.wrap($el).should("contain", "Admin");
    });

    // เปลี่ยนไปกรองบทบาท Tester
    cy.get('[data-cy="role-filter"]').select("Tester");
    cy.wait(500);

    // ตรวจสอบผลลัพธ์ใหม่
    cy.get('[data-cy^="user-role-"]').each(($el) => {
      cy.wrap($el).should("contain", "Tester");
    });

    // กลับไปดูทุกบทบาท
    cy.get('[data-cy="role-filter"]').select("");
    cy.wait(500);

    // ตรวจสอบว่ามีข้อมูลแสดง
    cy.get('[data-cy="users-grid"]')
      .children()
      .should("have.length.at.least", 1);
  });

  it("TS_SPMS_06_004 ตรวจสอบการเปลี่ยนหน้าด้วยปุ่มนำทาง", () => {
    // ตรวจสอบว่ามีข้อมูลมากพอที่จะมีหลายหน้า (ถ้าไม่มีข้อมูลพอ ทดสอบไม่ได้)
    cy.get('[data-cy="pagination-container"]').then(($pagination) => {
      if ($pagination.length) {
        // กรณีมีหลายหน้า
        cy.get('[data-cy="page-indicator"]')
          .invoke("text")
          .then((text) => {
            const pageInfo = text.match(/\d+\/(\d+)/);
            if (pageInfo && parseInt(pageInfo[1]) > 1) {
              // ไปยังหน้าถัดไป
              cy.get('[data-cy="next-page-button"]').click();
              cy.get('[data-cy="page-indicator"]').should("contain", "หน้า 2/");

              // กลับมาหน้าแรก
              cy.get('[data-cy="prev-page-button"]').click();
              cy.get('[data-cy="page-indicator"]').should("contain", "หน้า 1/");
            }
          });
      } else {
        // กรณีมีแค่หน้าเดียว ข้ามการทดสอบนี้
        cy.log("ไม่มีการแบ่งหน้า เนื่องจากข้อมูลไม่มากพอ");
      }
    });
  });

  it("TS_SPMS_06_005 ตรวจสอบการแสดงข้อมูลของผู้ใช้ในการ์ด", () => {
    // ตรวจสอบข้อมูลในการ์ดผู้ใช้แรก
    cy.get('[data-cy^="user-card-"]')
      .first()
      .within(() => {
        // ตรวจสอบว่ามีชื่อผู้ใช้
        cy.get("h3").should("not.be.empty");

        // ตรวจสอบว่ามีบทบาท
        cy.get('[data-cy^="user-role-"]').should("be.visible");

        // ตรวจสอบว่ามีอีเมล
        cy.get('[data-cy^="user-email-"]').should("be.visible");

        // ตรวจสอบว่ามีวันที่สร้าง
        cy.get('[data-cy^="user-created-at-"]').should("be.visible");

        // ตรวจสอบว่ามีปุ่มดูรายละเอียด
        cy.get('[data-cy^="view-user-"]')
          .should("be.visible")
          .and("contain", "ดูละเอียดเพิ่มเติม");
      });
  });

  it("TS_SPMS_06_006 ตรวจสอบการกดปุ่มดูรายละเอียดผู้ใช้", () => {
    // กดปุ่มดูรายละเอียดของผู้ใช้คนแรก
    cy.get('[data-cy^="view-user-"]').first().click();

    // ตรวจสอบว่านำทางไปยังหน้ารายละเอียดผู้ใช้
    cy.url().should("include", "/users/");

    // กลับไปยังหน้าผู้ใช้
    cy.go("back");
    cy.url().should("include", "/users");
  });

  it("TS_SPMS_06_007 ตรวจสอบการกดปุ่มเพิ่มผู้ใช้", () => {
    // กดปุ่มเพิ่มผู้ใช้
    cy.get('[data-cy="add-user-button"]').click();

    // ตรวจสอบว่านำทางไปยังหน้าสร้างผู้ใช้
    cy.url().should("include", "/users/create");

    // กลับไปยังหน้าผู้ใช้
    cy.go("back");
    cy.url().should("include", "/users");
  });

  it("TS_SPMS_06_008 ตรวจสอบความถูกต้องของสีที่แสดงตามบทบาท", () => {
    // เปิดตัวกรองบน mobile view (ถ้าจำเป็น)
    cy.viewport("iphone-6");
    cy.get('button[aria-label="Toggle filters"]').click();

    // ตรวจสอบสีของบทบาท Admin
    cy.get('[data-cy="role-filter"]').select("Admin");
    cy.wait(500);
    cy.get('[data-cy^="user-role-"]')
      .first()
      .should("have.class", "text-red-800");

    // ตรวจสอบสีของบทบาท Tester
    cy.get('[data-cy="role-filter"]').select("Tester");
    cy.wait(500);
    cy.get('[data-cy^="user-role-"]')
      .first()
      .should("have.class", "text-green-800");

    // ตรวจสอบสีของบทบาท Viewer
    cy.get('[data-cy="role-filter"]').select("Viewer");
    cy.wait(500);
    cy.get('[data-cy^="user-role-"]')
      .first()
      .should("have.class", "text-blue-800");
  });

  it("TS_SPMS_06_009 ตรวจสอบการตอบสนองของการแสดงผลบนอุปกรณ์มือถือ", () => {
    // ตั้งค่าหน้าจอขนาดมือถือ
    cy.viewport("iphone-6");

    // ตรวจสอบว่าปุ่มตัวกรองแสดงและสามารถกดได้
    cy.get('button[aria-label="Toggle filters"]').should("be.visible").click();

    // ตรวจสอบว่าส่วนตัวกรองแสดงหลังกดปุ่ม
    cy.get('[data-cy="role-filter"]').should("be.visible");

    // กดปุ่มอีกครั้งเพื่อซ่อนตัวกรอง
    cy.get('button[aria-label="Toggle filters"]').click();

    // ตรวจสอบว่าส่วนตัวกรองถูกซ่อน
    cy.get('[data-cy="role-filter"]').should("not.be.visible");
  });

  it("TS_SPMS_06_010 ตรวจสอบการรวมกันของการค้นหาและการกรอง", () => {
    // ค้นหาและกรองพร้อมกัน
    cy.get('[data-cy="search-input"]').clear().type("test");

    // เปิดตัวกรองบน mobile view (ถ้าจำเป็น)
    cy.viewport("iphone-6");
    cy.get('button[aria-label="Toggle filters"]').click();

    // เลือกกรองตามบทบาท
    cy.get('[data-cy="role-filter"]').select("Admin");
    cy.wait(500);

    // ตรวจสอบผลลัพธ์ว่าตรงตามทั้งการค้นหาและการกรอง
    cy.get('[data-cy^="user-email-"]').each(($el) => {
      cy.wrap($el).invoke("text").should("include", "test");
    });

    cy.get('[data-cy^="user-role-"]').each(($el) => {
      cy.wrap($el).should("contain", "Admin");
    });

    // ล้างการค้นหา
    cy.get('[data-cy="search-input"]').clear();

    // กลับไปดูทุกบทบาท
    cy.get('[data-cy="role-filter"]').select("");
  });

  it("TS_SPMS_06_011 ตรวจสอบการแสดงข้อความเมื่อไม่พบผู้ใช้", () => {
    // ค้นหาด้วยข้อความที่ไม่มีอยู่ในระบบ
    cy.get('[data-cy="search-input"]').clear().type("nonexistentuserxyz123456");
    cy.wait(500);

    // ตรวจสอบข้อความแจ้งเตือน
    cy.get('[data-cy="no-results-message"]')
      .should("be.visible")
      .and("contain", "ไม่พบผู้ใช้งานที่ตรงกับเกณฑ์การค้นหา");
  });
});
