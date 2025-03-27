describe("Navbar Tests", () => {
  beforeEach(() => {
    // เริ่มต้นที่หน้าเข้าสู่ระบบและทำการล็อกอิน
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type("test005@tester.com");
    cy.get('[data-cy="login-password"]').type("123456");
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าเข้าสู่หน้า dashboard หรือไม่
    cy.url().should("include", "/mainpage");
  });

  it("TS_SPMS_10_001 ตรวจสอบการแสดงผล Navbar บนหน้าจอขนาดใหญ่", () => {
    // ปรับขนาดหน้าจอให้เป็นขนาดใหญ่
    cy.viewport(1280, 800);

    // ตรวจสอบองค์ประกอบพื้นฐานของ Navbar
    cy.get('[data-cy="navbar"]').should("be.visible");
    cy.get('[data-cy="app-logo"]').should("be.visible");
    cy.get('[data-cy="desktop-nav-menu"]').should("be.visible");
    cy.get('[data-cy="user-menu-button"]').should("be.visible");

    // ตรวจสอบเมนูบนหน้าจอขนาดใหญ่
    cy.get('[data-cy="mobile-menu-button"]').should("not.be.visible");
  });

  it("TS_SPMS_10_002 ตรวจสอบการแสดงผล Navbar บนหน้าจอมือถือ", () => {
    // ปรับขนาดหน้าจอให้เป็นขนาดมือถือ
    cy.viewport(375, 667);

    // ตรวจสอบองค์ประกอบพื้นฐานของ Navbar บนมือถือ
    cy.get('[data-cy="navbar"]').should("be.visible");
    cy.get('[data-cy="app-logo"]').should("be.visible");
    cy.get('[data-cy="mobile-menu-button"]').should("be.visible");
    cy.get('[data-cy="desktop-nav-menu"]').should("not.be.visible");

    // คลิกที่ปุ่มเมนูมือถือและตรวจสอบว่าเมนูแสดงขึ้นมาหรือไม่
    cy.get('[data-cy="mobile-menu-button"]').click();
    cy.get('[data-cy="mobile-menu-panel"]').should("be.visible");

    // ตรวจสอบรายการเมนูในเมนูมือถือ
    cy.get('[data-cy="mobile-nav-item-หน้าหลัก"]').should("be.visible");
    cy.get('[data-cy="mobile-nav-item-ผลการทดสอบ"]').should("be.visible");

    // ทดสอบการปิดเมนูมือถือ
    cy.get('[data-cy="mobile-close-button"]').click();
    cy.get('[data-cy="mobile-menu-panel"]').should("not.be.visible");
  });

  it("TS_SPMS_10_003 ตรวจสอบการนำทางเมื่อคลิกที่เมนูหน้าหลัก", () => {
    // คลิกที่เมนูหน้าหลัก
    cy.get('[data-cy="nav-item-หน้าหลัก"]').click();

    // ตรวจสอบ URL ว่าตรงกับเส้นทางที่ควรจะเป็นหรือไม่
    cy.url().should("include", "/dashboard");

    // ตรวจสอบว่าเมนูได้รับการเน้นว่าเป็นเมนูปัจจุบันหรือไม่
    cy.get('[data-cy="nav-item-หน้าหลัก"]').should("have.class", "bg-blue-700");
  });

  it("TS_SPMS_10_004 ตรวจสอบการนำทางเมื่อคลิกที่เมนูผลการทดสอบ", () => {
    // คลิกที่เมนูผลการทดสอบ
    cy.get('[data-cy="nav-item-ผลการทดสอบ"]').click();

    // ตรวจสอบ URL ว่าตรงกับเส้นทางที่ควรจะเป็นหรือไม่
    cy.url().should("include", "/test-dashboard");

    // ตรวจสอบว่าเมนูได้รับการเน้นว่าเป็นเมนูปัจจุบันหรือไม่
    cy.get('[data-cy="nav-item-ผลการทดสอบ"]').should(
      "have.class",
      "bg-blue-700"
    );
  });

  it("TS_SPMS_10_005 ตรวจสอบการใช้งานเมนูผู้ใช้", () => {
    // คลิกที่ปุ่มเมนูผู้ใช้
    cy.get('[data-cy="user-menu-button"]').click();

    // ตรวจสอบว่าเมนูดรอปดาวน์แสดงขึ้นมาหรือไม่
    cy.get('[data-cy="user-dropdown-menu"]').should("be.visible");

    // ตรวจสอบรายการในเมนูผู้ใช้
    cy.get('[data-cy="profile-menu-item"]').should("be.visible");
    cy.get('[data-cy="logout-menu-item"]').should("be.visible");

    // คลิกที่พื้นที่อื่นและตรวจสอบว่าเมนูปิดหรือไม่
    cy.get("body").click(0, 0);
    cy.get('[data-cy="user-dropdown-menu"]').should("not.be.visible");
  });

  it("TS_SPMS_10_006 ตรวจสอบการนำทางไปยังหน้าโปรไฟล์", () => {
    // คลิกที่ปุ่มเมนูผู้ใช้
    cy.get('[data-cy="user-menu-button"]').click();

    // คลิกที่เมนูโปรไฟล์
    cy.get('[data-cy="profile-menu-item"]').click();

    // ตรวจสอบ URL ว่าตรงกับเส้นทางที่ควรจะเป็นหรือไม่
    cy.url().should("include", "/profile");
  });

  it("TS_SPMS_10_007 ตรวจสอบการออกจากระบบ", () => {
    // คลิกที่ปุ่มเมนูผู้ใช้
    cy.get('[data-cy="user-menu-button"]').click();

    // คลิกที่เมนูออกจากระบบ
    cy.get('[data-cy="logout-menu-item"]').click();

    // ตรวจสอบว่ากลับไปยังหน้าเข้าสู่ระบบหรือไม่
    cy.url().should("include", "/login");
  });

  it("TS_SPMS_10_008 ตรวจสอบการเลื่อน Navbar เมื่อเลื่อนหน้าจอ", () => {
    // ตรวจสอบสถานะเริ่มต้นของ Navbar
    cy.get('[data-cy="navbar"]').should("not.have.class", "bg-black/90");

    // จำลองการเลื่อนหน้าจอ
    cy.scrollTo(0, 100);

    // ตรวจสอบว่า Navbar เปลี่ยนสถานะเมื่อเลื่อนหน้าจอหรือไม่
    cy.get('[data-cy="navbar"]').should("have.class", "bg-black/90");
  });

  it("TS_SPMS_10_009 ตรวจสอบการนำทางบนหน้าจอมือถือ", () => {
    // ปรับขนาดหน้าจอให้เป็นขนาดมือถือ
    cy.viewport(375, 667);

    // เปิดเมนูมือถือ
    cy.get('[data-cy="mobile-menu-button"]').click();

    // คลิกที่เมนูผลการทดสอบบนมือถือ
    cy.get('[data-cy="mobile-nav-item-ผลการทดสอบ"]').click();

    // ตรวจสอบ URL ว่าตรงกับเส้นทางที่ควรจะเป็นหรือไม่
    cy.url().should("include", "/test-dashboard");
  });

  it("TS_SPMS_10_010 ตรวจสอบการทำงานของเมนูเพิ่มเติมบนหน้าจอขนาด laptop", () => {
    // ปรับขนาดหน้าจอให้เป็นขนาด laptop
    cy.viewport(1024, 768);

    // ตรวจสอบว่ามีปุ่มเมนูเพิ่มเติมหรือไม่ (ขึ้นอยู่กับจำนวนเมนูและบทบาทของผู้ใช้)
    cy.get("body").then(($body) => {
      if ($body.find('[data-cy="more-menu-button"]').length > 0) {
        // ถ้ามีปุ่มเมนูเพิ่มเติม
        cy.get('[data-cy="more-menu-button"]').click();
        cy.get('[data-cy="more-menu-dropdown"]').should("be.visible");

        // คลิกที่พื้นที่อื่นและตรวจสอบว่าเมนูปิดหรือไม่
        cy.get("body").click(0, 0);
        cy.get('[data-cy="more-menu-dropdown"]').should("not.be.visible");
      } else {
        // ถ้าไม่มีปุ่มเมนูเพิ่มเติม (อาจเป็นเพราะเมนูมีไม่เกิน 4 รายการหรือหน้าจอใหญ่พอ)
        cy.log("ไม่มีปุ่มเมนูเพิ่มเติมบนหน้าจอปัจจุบัน");
      }
    });
  });

  it("TS_SPMS_10_011 ตรวจสอบการนำทางเมื่อคลิกที่โลโก้", () => {
    // คลิกที่เมนูผลการทดสอบก่อน เพื่อให้แน่ใจว่าไม่ได้อยู่ที่หน้าหลักแล้ว
    cy.get('[data-cy="nav-item-ผลการทดสอบ"]').click();
    cy.url().should("include", "/test-dashboard");

    // คลิกที่โลโก้
    cy.get('[data-cy="app-logo"]').click();

    // ตรวจสอบว่ากลับไปยังหน้าหลักหรือไม่
    cy.url().should("include", "/dashboard");
  });

  it("TS_SPMS_10_012 ตรวจสอบการแสดงชื่อผู้ใช้ในเมนูผู้ใช้", () => {
    // ตรวจสอบว่าชื่อผู้ใช้แสดงใน user menu button
    cy.viewport(1280, 800); // ตั้งค่าหน้าจอให้ใหญ่พอที่จะแสดงชื่อผู้ใช้

    // ตรวจสอบว่ามีการแสดงชื่อผู้ใช้หรือไม่ (แสดงเฉพาะบนหน้าจอขนาดใหญ่)
    cy.get('[data-cy="user-menu-button"] span').should("contain.text"); // ตรวจสอบว่ามีข้อความแสดงอยู่
  });

  it("TS_SPMS_10_013 ตรวจสอบการแสดงเมนูตามบทบาทของผู้ใช้", () => {
    // ตรวจสอบเมนูตามบทบาทผู้ใช้ที่ล็อกอินมา
    cy.window().then((win) => {
      // ดึงข้อมูลผู้ใช้จาก localStorage หรือ sessionStorage
      const authDataStr =
        win.localStorage.getItem("auth") || win.sessionStorage.getItem("auth");

      if (authDataStr) {
        const authData = JSON.parse(authDataStr);
        const userRole = authData.user?.role;

        // ตรวจสอบตามบทบาท
        if (userRole === "Admin") {
          // ตรวจสอบเมนูที่ผู้ดูแลระบบควรมองเห็น
          cy.get('[data-cy="nav-item-โปรเจกต์"]').should("exist");
          cy.get('[data-cy="nav-item-สปรินต์"]').should("exist");
          cy.get('[data-cy="nav-item-ไฟล์ทดสอบ"]').should("exist");
          cy.get('[data-cy="nav-item-ผู้ใช้งาน"]').should("exist");
          cy.get('[data-cy="nav-item-บันทึกการดำเนินการ"]').should("exist");
        } else if (userRole === "Tester") {
          // ตรวจสอบเมนูที่ผู้ทดสอบควรมองเห็น
          cy.get('[data-cy="nav-item-ไฟล์ทดสอบ"]').should("exist");
          cy.get('[data-cy="nav-item-โปรเจกต์"]').should("not.exist");
          cy.get('[data-cy="nav-item-ผู้ใช้งาน"]').should("not.exist");
        } else {
          // สำหรับบทบาทอื่นๆ
          cy.log(`ตรวจสอบเมนูสำหรับบทบาท: ${userRole}`);
        }
      } else {
        cy.log("ไม่พบข้อมูลการเข้าสู่ระบบในที่เก็บข้อมูลท้องถิ่น");
      }
    });
  });

  it("TS_SPMS_10_014 ตรวจสอบการปรับเปลี่ยนการแสดงผลตามขนาดหน้าจอ", () => {
    // ทดสอบกับหน้าจอขนาดต่างๆ

    // หน้าจอขนาดใหญ่ (Desktop)
    cy.viewport(1920, 1080);
    cy.get('[data-cy="desktop-nav-menu"]').should("be.visible");
    cy.get('[data-cy="mobile-menu-button"]').should("not.be.visible");

    // หน้าจอขนาดกลาง (Tablet)
    cy.viewport(768, 1024);
    cy.get('[data-cy="desktop-nav-menu"]').should("be.visible");
    cy.get('[data-cy="mobile-menu-button"]').should("not.be.visible");

    // หน้าจอขนาดเล็ก (Mobile)
    cy.viewport(375, 667);
    cy.get('[data-cy="desktop-nav-menu"]').should("not.be.visible");
    cy.get('[data-cy="mobile-menu-button"]').should("be.visible");
  });

  it("TS_SPMS_10_015 ตรวจสอบการเน้นเมนูที่กำลังใช้งานอยู่", () => {
    // ตรวจสอบว่าเมนูหน้าหลักได้รับการเน้นเป็นเมนูปัจจุบันหรือไม่
    cy.get('[data-cy="nav-item-หน้าหลัก"]').should("have.class", "bg-blue-700");

    // คลิกที่เมนูผลการทดสอบ
    cy.get('[data-cy="nav-item-ผลการทดสอบ"]').click();

    // ตรวจสอบว่าเมนูผลการทดสอบได้รับการเน้นเป็นเมนูปัจจุบันหรือไม่
    cy.get('[data-cy="nav-item-ผลการทดสอบ"]').should(
      "have.class",
      "bg-blue-700"
    );

    // ตรวจสอบว่าเมนูหน้าหลักไม่ได้รับการเน้นอีกต่อไป
    cy.get('[data-cy="nav-item-หน้าหลัก"]').should(
      "not.have.class",
      "bg-blue-700"
    );
  });
});
