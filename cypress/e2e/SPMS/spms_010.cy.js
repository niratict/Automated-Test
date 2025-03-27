// ***********************************************
// cypress/e2e/user-detail.cy.js
// ***********************************************
// ทดสอบหน้า UserDetail อัตโนมัติ
// ทดสอบการแสดงข้อมูลผู้ใช้, การแก้ไขข้อมูล, การเปลี่ยนรหัสผ่าน และการลบผู้ใช้
// ***********************************************

/// <reference types="cypress" />

describe("หน้ารายละเอียดผู้ใช้", () => {
  // ข้อมูลผู้ใช้สำหรับการทดสอบ
  const testUser = {
    email: "test005@tester.com",
    password: "123456",
  };

  // ข้อมูลผู้ใช้ที่จะดูรายละเอียด (ใช้ ID ที่มีอยู่จริงในระบบ)
  const targetUser = {
    id: 2, // สมมติว่ามี user ID 2 ในระบบ
    name: "Test User",
  };

  // สร้าง Stub สำหรับทดสอบการเรียก API
  const setupApiMocks = () => {
    // Mock การเรียก API เพื่อดึงข้อมูลผู้ใช้
    cy.intercept("GET", `**/api/users/${targetUser.id}`, {
      statusCode: 200,
      body: {
        user_id: targetUser.id,
        name: targetUser.name,
        email: "testuser@example.com",
        role: "Tester",
        profile_image: null,
        created_at: "2023-01-01T00:00:00.000Z",
        updated_at: "2023-01-01T00:00:00.000Z",
      },
    }).as("getUserDetails");
  };

  // เตรียมการทดสอบที่ต้องทำก่อนแต่ละกรณีทดสอบ
  beforeEach(() => {
    // เคลียร์คุกกี้และสถานะการเข้าสู่ระบบ
    cy.clearCookies();
    cy.clearLocalStorage();

    // ทำการล็อกอินด้วยการเข้าสู่ระบบจริง
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type(testUser.email);
    cy.get('[data-cy="login-password"]').type(testUser.password);
    cy.get('[data-cy="login-submit"]').click();
    
    // ตรวจสอบว่าได้เข้าสู่ระบบสำเร็จและอยู่ที่หน้า mainpage
    cy.url().should("include", "/mainpage");

    // ตั้งค่า localStorage สำหรับการทดสอบเพิ่มเติม (ถ้าจำเป็น)
    cy.window().then((window) => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          user_id: 1,
          name: "Test Login User",
          email: testUser.email,
          role: "Tester",
          token: "fake-token-for-testing",
        })
      );
    });

    setupApiMocks();
  });

  // ----------------------------------------------
  // กลุ่มทดสอบการเข้าถึงหน้ารายละเอียดผู้ใช้
  // ----------------------------------------------
  describe("การทดสอบการเข้าถึงหน้ารายละเอียดผู้ใช้", () => {
    it("TS_SPMS_10_001 เข้าสู่ระบบและนำทางไปยังหน้ารายละเอียดผู้ใช้", () => {
      // ไม่ต้องล็อกอินซ้ำเพราะมีการล็อกอินใน beforeEach แล้ว
      
      // นำทางไปยังหน้ารายชื่อผู้ใช้
      cy.visit("/users");

      // คลิกที่ผู้ใช้เพื่อดูรายละเอียด
      cy.get(`[data-cy="view-user-${targetUser.id}"]`).click();

      // ตรวจสอบว่าได้เปลี่ยนเส้นทางไปยังหน้ารายละเอียดผู้ใช้
      cy.url().should("include", `/users/${targetUser.id}`);

      // ตรวจสอบว่าหน้ารายละเอียดผู้ใช้แสดงขึ้นมา
      cy.get('[data-cy="user-detail-page"]').should("be.visible");

      // ตรวจสอบการโหลดข้อมูลผู้ใช้
      cy.wait("@getUserDetails");
    });

    it("TS_SPMS_10_002 แสดงสถานะโหลดระหว่างรอข้อมูล", () => {
      // ไม่ต้องล็อกอินซ้ำเพราะมีการล็อกอินใน beforeEach แล้ว
      
      // Mock ให้ API ใช้เวลานานขึ้น
      cy.intercept("GET", `**/api/users/${targetUser.id}`, (req) => {
        req.on("response", (res) => {
          res.setDelay(1000); // หน่วงเวลา 1 วินาที
        });
      }).as("delayedGetUserDetails");

      // เข้าหน้ารายละเอียดผู้ใช้โดยตรง
      cy.visit(`/users/${targetUser.id}`);

      // ตรวจสอบว่าแสดงสถานะโหลด
      cy.get('[data-cy="loading-state"]').should("be.visible");

      // รอจนข้อมูลโหลดเสร็จ
      cy.wait("@delayedGetUserDetails");

      // ตรวจสอบว่าไม่แสดงสถานะโหลดอีกต่อไป
      cy.get('[data-cy="loading-state"]').should("not.exist");
    });

    it("TS_SPMS_10_003 แสดงข้อความเมื่อไม่พบผู้ใช้", () => {
      // Mock API ให้ส่งข้อมูลว่างกลับมา
      cy.intercept("GET", `**/api/users/${targetUser.id}`, {
        statusCode: 200,
        body: null,
      }).as("getUserDetailsEmpty");

      // เข้าหน้ารายละเอียดผู้ใช้
      cy.visit(`/users/${targetUser.id}`);

      // รอการเรียก API
      cy.wait("@getUserDetailsEmpty");

      // ตรวจสอบว่าแสดงข้อความไม่พบผู้ใช้
      cy.get('[data-cy="no-user-state"]').should("be.visible");
      cy.get('[data-cy="no-user-state"]').should("contain", "ไม่พบผู้ใช้");
    });

    it("TS_SPMS_10_004 แสดงข้อผิดพลาดเมื่อ API ตอบกลับด้วยข้อผิดพลาด", () => {
      // Mock API ให้ส่งข้อผิดพลาดกลับมา
      cy.intercept("GET", `**/api/users/${targetUser.id}`, {
        statusCode: 500,
        body: {
          message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้",
        },
      }).as("getUserDetailsError");

      // เข้าหน้ารายละเอียดผู้ใช้
      cy.visit(`/users/${targetUser.id}`);

      // รอการเรียก API
      cy.wait("@getUserDetailsError");

      // ตรวจสอบว่าแสดงข้อความข้อผิดพลาด
      cy.get('[data-cy="error-state"]').should("be.visible");
      cy.get('[data-cy="error-state"]').should("contain", "ข้อผิดพลาด");
    });
  });

  // ----------------------------------------------
  // กลุ่มทดสอบการแสดงข้อมูลผู้ใช้
  // ----------------------------------------------
  describe("การทดสอบการแสดงข้อมูลผู้ใช้", () => {
    beforeEach(() => {
      // เข้าหน้ารายละเอียดผู้ใช้
      cy.visit(`/users/${targetUser.id}`);
      // รอการเรียก API
      cy.wait("@getUserDetails");
    });

    it("TS_SPMS_10_005 แสดงข้อมูลผู้ใช้ถูกต้อง", () => {
      // ตรวจสอบชื่อผู้ใช้
      cy.get('[data-cy="user-name"]').should("contain", targetUser.name);

      // ตรวจสอบอีเมล
      cy.get('[data-cy="user-email"]').should(
        "contain",
        "testuser@example.com"
      );

      // ตรวจสอบบทบาท
      cy.get('[data-cy="user-role"]').should("contain", "Tester");

      // ตรวจสอบวันที่สร้าง
      cy.get('[data-cy="user-created-date"]').should("be.visible");

      // ตรวจสอบวันที่อัปเดต
      cy.get('[data-cy="user-updated-date"]').should("be.visible");
    });

    it("TS_SPMS_10_006 แสดงรูปโปรไฟล์หรือรูปทดแทนเมื่อไม่มีรูปโปรไฟล์", () => {
      // ตรวจสอบว่ามีองค์ประกอบรูปโปรไฟล์
      cy.get('[data-cy="user-profile-image"]').should("be.visible");

      // เนื่องจากไม่มีรูปโปรไฟล์ (null), ควรแสดงไอคอน User ทดแทน
      cy.get('[data-cy="user-profile-image"] svg').should("be.visible");
    });

    it("TS_SPMS_10_007 แสดงปุ่มย้อนกลับและสามารถกลับไปยังหน้ารายชื่อผู้ใช้ได้", () => {
      // ตรวจสอบว่ามีปุ่มย้อนกลับ
      cy.get('[data-cy="back-button"]').should("be.visible");

      // คลิกปุ่มย้อนกลับ
      cy.get('[data-cy="back-button"]').click();

      // ตรวจสอบว่าได้กลับไปยังหน้ารายชื่อผู้ใช้
      cy.url().should("include", "/users");
      cy.url().should("not.include", `/users/${targetUser.id}`);
    });
  });

  // ----------------------------------------------
  // กลุ่มทดสอบการจัดการผู้ใช้ (สำหรับผู้ใช้ที่เป็นเจ้าของโปรไฟล์)
  // ----------------------------------------------
  describe("การทดสอบการจัดการผู้ใช้ (สำหรับผู้ใช้ที่เป็นเจ้าของโปรไฟล์)", () => {
    beforeEach(() => {
      // Mock ให้เป็นเจ้าของโปรไฟล์ (user_id ตรงกับ targetUser.id)
      cy.window().then((window) => {
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            user_id: targetUser.id,
            name: "Self User",
            email: "self@example.com",
            role: "Tester",
            token: "fake-token-for-testing",
          })
        );
      });

      // เข้าหน้ารายละเอียดผู้ใช้
      cy.visit(`/users/${targetUser.id}`);
      // รอการเรียก API
      cy.wait("@getUserDetails");
    });

    it("TS_SPMS_10_008 คลิกปุ่มแก้ไขโปรไฟล์แล้วนำทางไปยังหน้าแก้ไข", () => {
      // ตรวจสอบว่ามีปุ่มแก้ไขโปรไฟล์
      cy.get('[data-cy="edit-profile-button"]').should("be.visible");
      
      // คลิกปุ่มแก้ไขโปรไฟล์
      cy.get('[data-cy="edit-profile-button"]').click();

      // ตรวจสอบว่าได้นำทางไปยังหน้าแก้ไขโปรไฟล์
      cy.url().should("include", `/users/${targetUser.id}/edit`);
    });
  });

  // ----------------------------------------------
  // กลุ่มทดสอบการจัดการผู้ใช้ (สำหรับผู้ดูแลระบบ)
  // ----------------------------------------------
  describe("การทดสอบการจัดการผู้ใช้ (สำหรับผู้ดูแลระบบ)", () => {
    beforeEach(() => {
      // Mock ให้เป็นผู้ดูแลระบบ
      cy.window().then((window) => {
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            user_id: 999, // ID ต่างจาก targetUser.id
            name: "Admin User",
            email: "admin@example.com",
            role: "Admin",
            token: "fake-token-for-testing",
          })
        );
      });

      // เข้าหน้ารายละเอียดผู้ใช้
      cy.visit(`/users/${targetUser.id}`);
      // รอการเรียก API
      cy.wait("@getUserDetails");
    });

    it("TS_SPMS_10_009 แสดงปุ่มลบผู้ใช้สำหรับผู้ดูแลระบบ", () => {
      // ตรวจสอบว่ามีปุ่มลบผู้ใช้
      cy.get('[data-cy="delete-user-button"]').should("be.visible");
    });

    it("TS_SPMS_10_010 เปิดโมดัลยืนยันการลบเมื่อคลิกปุ่มลบผู้ใช้", () => {
      // คลิกปุ่มลบผู้ใช้
      cy.get('[data-cy="delete-user-button"]').click();

      // ตรวจสอบว่าโมดัลยืนยันการลบแสดงขึ้นมา
      cy.get('[data-cy="delete-user-modal"]').should("be.visible");
    });

    it("TS_SPMS_10_011 ยกเลิกการลบผู้ใช้เมื่อคลิกปุ่มยกเลิก", () => {
      // คลิกปุ่มลบผู้ใช้
      cy.get('[data-cy="delete-user-button"]').click();

      // ตรวจสอบว่าโมดัลยืนยันการลบแสดงขึ้นมา
      cy.get('[data-cy="delete-user-modal"]').should("be.visible");

      // คลิกปุ่มยกเลิก
      cy.get('[data-cy="cancel-delete"]').click();

      // ตรวจสอบว่าโมดัลปิดลง
      cy.get('[data-cy="delete-user-modal"]').should("not.exist");
    });

    it("TS_SPMS_10_012 ลบผู้ใช้เมื่อคลิกปุ่มยืนยันการลบ", () => {
      // Mock API สำหรับการลบผู้ใช้
      cy.intercept("DELETE", `**/api/users/${targetUser.id}`, {
        statusCode: 200,
        body: { success: true },
      }).as("deleteUser");

      // คลิกปุ่มลบผู้ใช้
      cy.get('[data-cy="delete-user-button"]').click();

      // ตรวจสอบว่าโมดัลยืนยันการลบแสดงขึ้นมา
      cy.get('[data-cy="delete-user-modal"]').should("be.visible");

      // คลิกปุ่มยืนยันการลบ
      cy.get('[data-cy="confirm-delete"]').click();

      // รอการเรียก API
      cy.wait("@deleteUser");

      // ตรวจสอบว่าได้กลับไปยังหน้ารายชื่อผู้ใช้
      cy.url().should("include", "/users");
      cy.url().should("not.include", `/users/${targetUser.id}`);
    });
  });

  // ----------------------------------------------
  // กลุ่มทดสอบการเข้าถึงเมื่อไม่มีสิทธิ์
  // ----------------------------------------------
  describe("การทดสอบการเข้าถึงเมื่อไม่มีสิทธิ์", () => {
    it("TS_SPMS_10_013 แสดงข้อความไม่มีสิทธิ์เมื่อพยายามเข้าถึงโปรไฟล์ของผู้อื่น", () => {
      // เคลียร์คุกกี้และสถานะการเข้าสู่ระบบ
      cy.clearCookies();
      cy.clearLocalStorage();

      // ทำการล็อกอินด้วยการเข้าสู่ระบบจริงก่อน
      cy.visit("/login");
      cy.get('[data-cy="login-email"]').type(testUser.email);
      cy.get('[data-cy="login-password"]').type(testUser.password);
      cy.get('[data-cy="login-submit"]').click();
      
      // ตรวจสอบว่าได้เข้าสู่ระบบสำเร็จ
      cy.url().should("include", "/mainpage");
      
      // Mock ให้เป็นผู้ใช้ธรรมดา (ไม่ใช่แอดมินและไม่ใช่เจ้าของโปรไฟล์)
      cy.window().then((window) => {
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            user_id: 888, // ID ต่างจาก targetUser.id
            name: "Normal User",
            email: "normal@example.com",
            role: "User", // ไม่ใช่ Admin
            token: "fake-token-for-testing",
          })
        );
      });

      setupApiMocks();
      
      // เข้าหน้ารายละเอียดผู้ใช้
      cy.visit(`/users/${targetUser.id}`);

      // ตรวจสอบว่าแสดงข้อความไม่มีสิทธิ์เข้าถึง
      cy.get('[data-cy="access-denied"]').should("be.visible");
      cy.get('[data-cy="access-denied"]').should(
        "contain",
        "ไม่มีสิทธิ์เข้าถึง"
      );
    });

    it("TS_SPMS_10_014 นำทางกลับไปยังหน้าเข้าสู่ระบบเมื่อไม่ได้ล็อกอิน", () => {
      // ลบข้อมูลการล็อกอิน
      cy.clearLocalStorage();

      // เข้าหน้ารายละเอียดผู้ใช้
      cy.visit(`/users/${targetUser.id}`);

      // ตรวจสอบว่าถูกนำทางกลับไปยังหน้าเข้าสู่ระบบ
      cy.url().should("include", "/login");
    });

    it("TS_SPMS_10_015 นำทางกลับไปยังหน้าเข้าสู่ระบบเมื่อเซสชั่นหมดอายุ", () => {
      // Mock API ให้ส่งข้อผิดพลาดเซสชั่นหมดอายุ
      cy.intercept("GET", `**/api/users/${targetUser.id}`, {
        statusCode: 401,
        body: {
          message: "เซสชั่นหมดอายุ",
        },
      }).as("sessionExpired");

      // เข้าหน้ารายละเอียดผู้ใช้
      cy.visit(`/users/${targetUser.id}`);

      // รอการเรียก API
      cy.wait("@sessionExpired");

      // ตรวจสอบว่าถูกนำทางกลับไปยังหน้าเข้าสู่ระบบ
      cy.url().should("include", "/login");
    });
  });
});
