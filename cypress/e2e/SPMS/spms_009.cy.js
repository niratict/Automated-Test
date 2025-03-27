// สำหรับฝั่ง Cypress
// cypress/e2e/users.cy.js

/// <reference types="cypress" />

// ข้อมูลสำหรับใช้ในการทดสอบ
const testUser = {
  email: "test005@tester.com",
  password: "123456",
};

// ข้อมูลจำลองสำหรับการตอบกลับ API
const mockUsers = [
  {
    user_id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    created_at: "2023-01-01T00:00:00.000Z",
    profile_image: null,
  },
  {
    user_id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Tester",
    created_at: "2023-01-15T00:00:00.000Z",
    profile_image: null,
  },
  {
    user_id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Product Owner",
    created_at: "2023-02-01T00:00:00.000Z",
    profile_image: null,
  },
  {
    user_id: 4,
    name: "Alice Brown",
    email: "alice@example.com",
    role: "Viewer",
    created_at: "2023-02-15T00:00:00.000Z",
    profile_image: null,
  },
  {
    user_id: 5,
    name: "Charlie Wilson",
    email: "charlie@example.com",
    role: "Admin",
    created_at: "2023-03-01T00:00:00.000Z",
    profile_image: null,
  },
  {
    user_id: 6,
    name: "Diana Evans",
    email: "diana@example.com",
    role: "Tester",
    created_at: "2023-03-15T00:00:00.000Z",
    profile_image: null,
  },
  {
    user_id: 7,
    name: "Evan Taylor",
    email: "evan@example.com",
    role: "Product Owner",
    created_at: "2023-04-01T00:00:00.000Z",
    profile_image: null,
  },
];

describe("หน้าจัดการผู้ใช้งาน", () => {
  // ตั้งค่าก่อนเริ่มการทดสอบแต่ละครั้ง
  beforeEach(() => {
    // สร้าง Mock API Response
    cy.intercept("GET", "**/api/users", {
      statusCode: 200,
      body: mockUsers,
    }).as("getUsers");

    // เข้าสู่ระบบก่อนทดสอบ
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type(testUser.email);
    cy.get('[data-cy="login-password"]').type(testUser.password);
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าได้เปลี่ยนเส้นทางไปที่ /mainpage
    cy.url().should("include", "/mainpage");

    // นำทางไปที่หน้าผู้ใช้
    cy.visit("/users");
    cy.wait("@getUsers");
  });

  // กลุ่มทดสอบการเข้าถึงหน้า
  describe("การทดสอบการเข้าถึงหน้าและสิทธิ์", () => {
    it("TS_SPMS_09_001 ผู้ดูแลระบบสามารถเข้าถึงหน้าจัดการผู้ใช้ได้", () => {
      // ตรวจสอบว่า URL เป็น /users
      cy.url().should("include", "/users");

      // ตรวจสอบองค์ประกอบหลักของหน้า
      cy.get('[data-cy="page-title"]').should("be.visible");
      cy.get('[data-cy="users-grid"]').should("be.visible");
    });

    it("TS_SPMS_09_002 ผู้ใช้ที่ไม่ใช่ผู้ดูแลระบบไม่สามารถเข้าถึงหน้าจัดการผู้ใช้", () => {
      // Mock ผู้ใช้ที่มีบทบาทไม่ใช่ Admin
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          token: "mock-token",
          role: "Tester",
          name: "Test User",
        })
      );

      // รีโหลดหน้า
      cy.reload();

      // ตรวจสอบว่าแสดงข้อความปฏิเสธการเข้าถึง
      cy.get('[data-cy="access-denied-container"]').should("be.visible");
      cy.contains("Access Denied").should("be.visible");
    });
  });

  // กลุ่มทดสอบการแสดงผลและองค์ประกอบหน้า
  describe("การทดสอบการแสดงผลและองค์ประกอบของหน้า", () => {
    it("TS_SPMS_09_003 หน้าจัดการผู้ใช้แสดงองค์ประกอบที่ถูกต้องครบถ้วน", () => {
      // ตรวจสอบส่วนหัวหน้า
      cy.get('[data-cy="page-title"]').should("contain", "การจัดการผู้ใช้");

      // ตรวจสอบปุ่มการทำงาน
      cy.get('[data-cy="refresh-button"]').should("be.visible");
      cy.get('[data-cy="add-user-button"]')
        .should("be.visible")
        .and("contain", "เพิ่มผู้ใช้");

      // ตรวจสอบส่วนค้นหาและกรอง
      cy.get('[data-cy="search-filter-container"]').should("be.visible");
      cy.get('[data-cy="search-input"]').should("be.visible");
      cy.get('[data-cy="role-filter"]').should("be.visible");

      // ตรวจสอบว่ามีการแสดงผู้ใช้
      cy.get('[data-cy="users-grid"]').should("be.visible");
      cy.get('[data-cy="users-grid"]').children().should("have.length", 6); // แสดง 6 คนต่อหน้า
    });

    it("TS_SPMS_09_004 การแสดงการตอบสนองของหน้าเมื่อกำลังโหลดข้อมูล", () => {
      // Mock การโหลดข้อมูลที่ใช้เวลานาน
      cy.intercept("GET", "**/api/users", (req) => {
        req.reply({ delay: 1000 });
      }).as("getSlowUsers");

      // รีเฟรชหน้า
      cy.get('[data-cy="refresh-button"]').click();

      // ตรวจสอบการแสดงผลระหว่างโหลด
      cy.get('[data-cy="loading-spinner"]').should("be.visible");
    });

    it("TS_SPMS_09_005 การแสดงข้อความเมื่อไม่พบผู้ใช้ตามเงื่อนไขการค้นหา", () => {
      // ค้นหาด้วยข้อมูลที่ไม่มีในระบบ
      cy.get('[data-cy="search-input"]').type("ไม่มีผู้ใช้ชื่อนี้");

      // ตรวจสอบว่าแสดงข้อความไม่พบผู้ใช้
      cy.get('[data-cy="no-results-message"]').should("be.visible");
      cy.contains("ไม่พบผู้ใช้งาน").should("be.visible");

      // ทดสอบการล้างการค้นหา
      cy.contains("ล้างการค้นหา").click();
      cy.get('[data-cy="search-input"]').should("have.value", "");
      cy.get('[data-cy="no-results-message"]').should("not.exist");
    });
  });

  // กลุ่มทดสอบฟังก์ชั่นการค้นหาและกรองข้อมูล
  describe.only("การทดสอบฟังก์ชั่นการค้นหาและกรองข้อมูล", () => {
    it.only("TS_SPMS_09_006 การค้นหาผู้ใช้ตามชื่อ", () => {
      // ค้นหาผู้ใช้ตามชื่อ
      cy.get('[data-cy="search-input"]').type("John Doe");

      // ตรวจสอบผลลัพธ์การค้นหา
      cy.get('[data-cy="users-grid"]').children().should("have.length", 1);
      cy.contains("John Doe").should("be.visible");
    });

    it("TS_SPMS_09_007 การค้นหาผู้ใช้ตามอีเมล", () => {
      // ค้นหาผู้ใช้ตามอีเมล
      cy.get('[data-cy="search-input"]').type("jane@example");

      // ตรวจสอบผลลัพธ์การค้นหา
      cy.get('[data-cy="users-grid"]').children().should("have.length", 1);
      cy.contains("Jane Smith").should("be.visible");
    });

    it("TS_SPMS_09_008 การกรองผู้ใช้ตามบทบาท", () => {
      // กรองผู้ใช้ตามบทบาท Tester
      cy.get('[data-cy="role-filter"]').select("Tester");

      // ตรวจสอบผลลัพธ์การกรอง
      cy.get('[data-cy^="user-role-"]').each(($el) => {
        cy.wrap($el).should("contain", "Tester");
      });
    });

    it("TS_SPMS_09_009 การใช้ทั้งการค้นหาและกรองพร้อมกัน", () => {
      // กรองผู้ใช้ตามบทบาท Admin
      cy.get('[data-cy="role-filter"]').select("Admin");

      // ค้นหาผู้ใช้ตามชื่อ
      cy.get('[data-cy="search-input"]').type("Charlie");

      // ตรวจสอบผลลัพธ์การกรองและค้นหา
      cy.get('[data-cy="users-grid"]').children().should("have.length", 1);
      cy.contains("Charlie Wilson").should("be.visible");
      cy.get('[data-cy^="user-role-"]').should("contain", "Admin");
    });
  });

  // กลุ่มทดสอบฟังก์ชั่นการแบ่งหน้า
  describe("การทดสอบฟังก์ชั่นการแบ่งหน้า", () => {
    it("TS_SPMS_09_010 การนำทางระหว่างหน้าใช้งานได้ถูกต้อง", () => {
      // ตรวจสอบว่ามีการแสดงเนวิเกชั่นการแบ่งหน้า
      cy.get('[data-cy="pagination-container"]').should("be.visible");

      // ตรวจสอบว่ามีผู้ใช้ 6 คนในหน้าแรก
      cy.get('[data-cy="users-grid"]').children().should("have.length", 6);

      // ไปที่หน้าถัดไป
      cy.get('[data-cy="next-page-button"]').click();

      // ตรวจสอบว่าเปลี่ยนหน้าแล้ว และมีผู้ใช้ 1 คนในหน้าที่ 2
      cy.get('[data-cy="users-grid"]').children().should("have.length", 1);

      // ไปที่หน้าก่อนหน้า
      cy.get('[data-cy="prev-page-button"]').click();

      // ตรวจสอบว่ากลับมาที่หน้าแรก
      cy.get('[data-cy="users-grid"]').children().should("have.length", 6);
    });

    it("TS_SPMS_09_011 การแสดงผลปุ่มแบ่งหน้าเมื่อมีการกรองข้อมูล", () => {
      // กรองผู้ใช้ตามบทบาท Admin
      cy.get('[data-cy="role-filter"]').select("Admin");

      // ตรวจสอบว่ามีผู้ใช้ 2 คนที่มีบทบาท Admin
      cy.get('[data-cy="users-grid"]').children().should("have.length", 2);

      // ตรวจสอบว่าไม่แสดงตัวแบ่งหน้าเมื่อมีผู้ใช้น้อยกว่าหนึ่งหน้า
      cy.get('[data-cy="pagination-container"]').should("not.exist");
    });
  });

  // กลุ่มทดสอบการทำงานของปุ่มและการนำทาง
  describe("การทดสอบการทำงานของปุ่มและการนำทาง", () => {
    it("TS_SPMS_09_012 การคลิกปุ่มรีเฟรชโหลดข้อมูลใหม่", () => {
      // ทดสอบการคลิกปุ่มรีเฟรช
      cy.intercept("GET", "**/api/users").as("refreshUsers");
      cy.get('[data-cy="refresh-button"]').click();

      // ตรวจสอบว่ามีการเรียก API ใหม่
      cy.wait("@refreshUsers");
    });

    it("TS_SPMS_09_013 การคลิกปุ่มเพิ่มผู้ใช้นำทางไปที่หน้าสร้างผู้ใช้", () => {
      // ทดสอบการคลิกปุ่มเพิ่มผู้ใช้
      cy.get('[data-cy="add-user-button"]').click();

      // ตรวจสอบว่านำทางไปที่หน้าสร้างผู้ใช้
      cy.url().should("include", "/users/create");
    });

    it("TS_SPMS_09_014 การคลิกดูรายละเอียดผู้ใช้นำทางไปที่หน้ารายละเอียดผู้ใช้", () => {
      // ทดสอบการคลิกดูรายละเอียดผู้ใช้
      cy.get('[data-cy="view-user-1"]').click();

      // ตรวจสอบว่านำทางไปที่หน้ารายละเอียดผู้ใช้
      cy.url().should("include", "/users/1");
    });
  });

  // กลุ่มทดสอบการจัดการข้อผิดพลาด
  describe("การทดสอบการจัดการข้อผิดพลาด", () => {
    it("TS_SPMS_09_015 การแสดงข้อความเมื่อเกิดข้อผิดพลาดจาก API", () => {
      // Mock ข้อผิดพลาดจาก API
      cy.intercept("GET", "**/api/users", {
        statusCode: 500,
        body: { message: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์" },
      }).as("apiError");

      // รีเฟรชหน้า
      cy.get('[data-cy="refresh-button"]').click();
      cy.wait("@apiError");

      // ตรวจสอบว่าแสดงข้อความผิดพลาด
      cy.get('[data-cy="error-container"]').should("be.visible");
      cy.contains("เกิดข้อผิดพลาด").should("be.visible");
    });

    it("TS_SPMS_09_016 การจัดการกรณีเซสชั่นหมดอายุ", () => {
      // Mock กรณีเซสชั่นหมดอายุ (401)
      cy.intercept("GET", "**/api/users", {
        statusCode: 401,
        body: { message: "Unauthorized" },
      }).as("unauthorized");

      // รีเฟรชหน้า
      cy.get('[data-cy="refresh-button"]').click();
      cy.wait("@unauthorized");

      // ตรวจสอบว่ามีการนำทางกลับไปหน้าเข้าสู่ระบบ
      cy.url().should("include", "/login");
    });
  });

  // กลุ่มทดสอบการแสดงผลองค์ประกอบแบบ Responsive
  describe("การทดสอบการแสดงผลแบบ Responsive", () => {
    it("TS_SPMS_09_017 การแสดงผลบนอุปกรณ์หน้าจอกว้าง", () => {
      // ทดสอบหน้าจอขนาดใหญ่ (Desktop)
      cy.viewport(1200, 800);

      // ตรวจสอบว่าแสดงผลตามที่ออกแบบไว้สำหรับจอใหญ่
      cy.get('[data-cy="search-filter-container"]').should("be.visible");
      cy.get('[data-cy="search-input"]').should("be.visible");
      cy.get('[data-cy="role-filter"]').should("be.visible");

      // ตรวจสอบว่า Grid แสดงหลายคอลัมน์
      cy.get('[data-cy="users-grid"]').should("have.class", "grid-cols-1");
      cy.get('[data-cy="users-grid"]').should("have.class", "sm:grid-cols-2");
      cy.get('[data-cy="users-grid"]').should("have.class", "lg:grid-cols-3");
    });

    it("TS_SPMS_09_018 การแสดงผลบนอุปกรณ์หน้าจอแคบ", () => {
      // ทดสอบหน้าจอขนาดเล็ก (Mobile)
      cy.viewport(360, 640);

      // ตรวจสอบว่าแสดงผลตามที่ออกแบบไว้สำหรับจอเล็ก
      cy.get('[data-cy="search-input"]').should("be.visible");

      // ตรวจสอบว่าส่วนกรองข้อมูลถูกซ่อนและแสดงเมื่อคลิกปุ่ม
      cy.contains("Tester").should("not.be.visible");
      cy.get('button[aria-label="Toggle filters"]').click();
      cy.get('[data-cy="role-filter"]').should("be.visible");

      // ตรวจสอบว่า Grid แสดงเพียงคอลัมน์เดียว
      cy.get('[data-cy="users-grid"]').should("have.class", "grid-cols-1");
    });
  });
});
