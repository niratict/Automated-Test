// cypress/e2e/profile.spec.js

/**
 * ชุดทดสอบสำหรับหน้า Profile
 * รหัส Story: SPMS_11
 */

describe("หน้าจัดการโปรไฟล์", () => {
  const testUser = {
    email: "test005@tester.com",
    password: "123456",
  };

  beforeEach(() => {
    // เข้าสู่ระบบก่อนทดสอบ
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type(testUser.email);
    cy.get('[data-cy="login-password"]').type(testUser.password);
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าได้เปลี่ยนเส้นทางไปที่ /mainpage
    cy.url().should("include", "/mainpage");

    // ไปที่หน้า Profile
    cy.visit("/profile");
    cy.url().should("include", "/profile");
  });

  /**
   * การทดสอบการแสดงผลองค์ประกอบพื้นฐานของหน้า Profile
   */
  describe("ทดสอบการแสดงผลองค์ประกอบพื้นฐานของหน้าโปรไฟล์", () => {
    it("TS_SPMS_11_001 ตรวจสอบการแสดงองค์ประกอบพื้นฐานของหน้า Profile", () => {
      // ตรวจสอบว่าหน้าโปรไฟล์แสดงผลถูกต้อง
      cy.get('[data-cy="profile-page"]').should("be.visible");
      cy.get('[data-cy="profile-role"]').should("be.visible");
      cy.get('[data-cy="profile-image"]').should("be.visible");
      cy.get('[data-cy="profile-name"]').should("be.visible");
      cy.get('[data-cy="profile-email"]').should("be.visible");
      cy.get('[data-cy="profile-created-at"]').should("be.visible");
    });

    it("TS_SPMS_11_002 ตรวจสอบว่าอีเมลที่แสดงตรงกับอีเมลที่ใช้เข้าสู่ระบบ", () => {
      cy.get('[data-cy="profile-email"]').should("contain", testUser.email);
    });
  });

  /**
   * การทดสอบฟังก์ชันการแก้ไขโปรไฟล์
   */
  describe("การทดสอบฟังก์ชันการแก้ไขโปรไฟล์", () => {
    it("TS_SPMS_11_003 ตรวจสอบการเปิดโหมดแก้ไขโปรไฟล์", () => {
      // คลิกปุ่มแก้ไขโปรไฟล์
      cy.get('[data-cy="edit-profile-btn"]').click();

      // ตรวจสอบว่าฟอร์มแก้ไขโปรไฟล์ปรากฏขึ้น
      cy.get('[data-cy="name-input"]').should("be.visible");
      cy.get('[data-cy="email-input"]').should("be.visible").and("be.disabled");
      cy.get('[data-cy="save-profile-btn"]').should("be.visible");
      cy.get('[data-cy="cancel-edit-btn"]').should("be.visible");
    });

    it("TS_SPMS_11_004 ตรวจสอบการยกเลิกการแก้ไขโปรไฟล์", () => {
      // คลิกปุ่มแก้ไขโปรไฟล์
      cy.get('[data-cy="edit-profile-btn"]').click();

      // บันทึกชื่อปัจจุบันเพื่อเปรียบเทียบ
      cy.get('[data-cy="profile-name"]').invoke("text").as("originalName");

      // ป้อนชื่อใหม่ในฟอร์ม
      cy.get('[data-cy="name-input"]').clear().type("Test Name Changed");

      // คลิกปุ่มยกเลิก
      cy.get('[data-cy="cancel-edit-btn"]').click();

      // ตรวจสอบว่าโหมดแก้ไขถูกปิด
      cy.get('[data-cy="name-input"]').should("not.exist");

      // ตรวจสอบว่าชื่อไม่ถูกเปลี่ยนแปลง
      cy.get("@originalName").then((originalName) => {
        cy.get('[data-cy="profile-name"]').should("have.text", originalName);
      });
    });

    it("TS_SPMS_11_005 ตรวจสอบการบันทึกโปรไฟล์โดยใช้ชื่อที่ถูกต้อง", () => {
      // คลิกปุ่มแก้ไขโปรไฟล์
      cy.get('[data-cy="edit-profile-btn"]').click();

      // ป้อนชื่อใหม่ที่ถูกต้อง
      const newName = "ทดสอบชื่อใหม่ " + Date.now();
      cy.get('[data-cy="name-input"]').clear().type(newName);

      // สร้าง stub สำหรับ API request
      cy.intercept("PUT", "/api/profile", {
        statusCode: 200,
        body: { success: true, message: "Profile updated successfully" },
      }).as("updateProfile");

      // คลิกปุ่มบันทึก
      cy.get('[data-cy="save-profile-btn"]').click();

      // รอให้ API request เสร็จสิ้น
      cy.wait("@updateProfile");

      // ตรวจสอบว่าชื่อถูกอัปเดตในหน้า UI
      cy.get('[data-cy="profile-name"]').should("have.text", newName);
    });

    it("TS_SPMS_11_006 ตรวจสอบการแสดงข้อผิดพลาดเมื่อบันทึกโปรไฟล์โดยใช้ชื่อที่ไม่ถูกต้อง", () => {
      // คลิกปุ่มแก้ไขโปรไฟล์
      cy.get('[data-cy="edit-profile-btn"]').click();

      // ป้อนชื่อที่ไม่ถูกต้อง (เช่น ป่อนค่าว่าง)
      cy.get('[data-cy="name-input"]').clear();

      // คลิกปุ่มบันทึก
      cy.get('[data-cy="save-profile-btn"]').click();

      // ตรวจสอบว่ามีข้อความแสดงข้อผิดพลาด
      cy.get('[data-cy="name-error"]').should("be.visible");
    });
  });

  /**
   * การทดสอบฟังก์ชันการเปลี่ยนรหัสผ่าน
   */
  describe("การทดสอบฟังก์ชันการเปลี่ยนรหัสผ่าน", () => {
    it("TS_SPMS_11_007 ตรวจสอบการเปิดโมดัลเปลี่ยนรหัสผ่าน", () => {
      // คลิกปุ่มเปลี่ยนรหัสผ่าน
      cy.get('[data-cy="change-password-btn"]').click();

      // ตรวจสอบว่าโมดัลเปลี่ยนรหัสผ่านปรากฏขึ้น
      cy.get('[data-cy="password-modal"]').should("be.visible");
      cy.get('[data-cy="current-password-input"]').should("be.visible");
      cy.get('[data-cy="new-password-input"]').should("be.visible");
      cy.get('[data-cy="confirm-password-input"]').should("be.visible");
    });

    it("TS_SPMS_11_008 ตรวจสอบการยกเลิกการเปลี่ยนรหัสผ่าน", () => {
      // คลิกปุ่มเปลี่ยนรหัสผ่าน
      cy.get('[data-cy="change-password-btn"]').click();

      // ป้อนข้อมูลในฟอร์ม
      cy.get('[data-cy="current-password-input"]').type("123456");
      cy.get('[data-cy="new-password-input"]').type("newpassword123");
      cy.get('[data-cy="confirm-password-input"]').type("newpassword123");

      // คลิกปุ่มยกเลิก
      cy.get('[data-cy="cancel-password-change"]').click();

      // ตรวจสอบว่าโมดัลถูกปิด
      cy.get('[data-cy="password-modal"]').should("not.exist");
    });

    it("TS_SPMS_11_009 ตรวจสอบการเปลี่ยนรหัสผ่านสำเร็จ", () => {
      // คลิกปุ่มเปลี่ยนรหัสผ่าน
      cy.get('[data-cy="change-password-btn"]').click();

      // ป้อนข้อมูลในฟอร์ม
      cy.get('[data-cy="current-password-input"]').type("123456");
      cy.get('[data-cy="new-password-input"]').type("newpassword123");
      cy.get('[data-cy="confirm-password-input"]').type("newpassword123");

      // สร้าง stub สำหรับ API request
      cy.intercept("PUT", "/api/profile/password", {
        statusCode: 200,
        body: { success: true, message: "Password updated successfully" },
      }).as("updatePassword");

      // คลิกปุ่มยืนยัน
      cy.get('[data-cy="confirm-password-change"]').click();

      // รอให้ API request เสร็จสิ้น
      cy.wait("@updatePassword");

      // ตรวจสอบว่าโมดัลถูกปิด
      cy.get('[data-cy="password-modal"]').should("not.exist");
    });

    it("TS_SPMS_11_010 ตรวจสอบการแสดงข้อผิดพลาดเมื่อรหัสผ่านปัจจุบันไม่ถูกต้อง", () => {
      // คลิกปุ่มเปลี่ยนรหัสผ่าน
      cy.get('[data-cy="change-password-btn"]').click();

      // ป้อนข้อมูลในฟอร์มโดยใช้รหัสผ่านปัจจุบันที่ไม่ถูกต้อง
      cy.get('[data-cy="current-password-input"]').type("wrongpassword");
      cy.get('[data-cy="new-password-input"]').type("newpassword123");
      cy.get('[data-cy="confirm-password-input"]').type("newpassword123");

      // สร้าง stub สำหรับ API request
      cy.intercept("PUT", "/api/profile/password", {
        statusCode: 400,
        body: { success: false, message: "Current password is incorrect" },
      }).as("failedUpdatePassword");

      // คลิกปุ่มยืนยัน
      cy.get('[data-cy="confirm-password-change"]').click();

      // รอให้ API request เสร็จสิ้น
      cy.wait("@failedUpdatePassword");

      // ตรวจสอบว่ามีข้อความแสดงข้อผิดพลาด
      cy.get('[data-cy="current-password-error"]').should("be.visible");
    });

    it("TS_SPMS_11_011 ตรวจสอบการแสดงข้อผิดพลาดเมื่อรหัสผ่านใหม่และการยืนยันไม่ตรงกัน", () => {
      // คลิกปุ่มเปลี่ยนรหัสผ่าน
      cy.get('[data-cy="change-password-btn"]').click();

      // ป้อนข้อมูลในฟอร์มโดยรหัสผ่านใหม่และการยืนยันไม่ตรงกัน
      cy.get('[data-cy="current-password-input"]').type("123456");
      cy.get('[data-cy="new-password-input"]').type("newpassword123");
      cy.get('[data-cy="confirm-password-input"]').type("differentpassword");

      // คลิกปุ่มยืนยัน
      cy.get('[data-cy="confirm-password-change"]').click();

      // ตรวจสอบว่ามีข้อความแสดงข้อผิดพลาด
      cy.get('[data-cy="confirm-password-error"]').should("be.visible");
    });
  });

  /**
   * การทดสอบฟังก์ชันการจัดการรูปโปรไฟล์
   */
  describe("การทดสอบฟังก์ชันการจัดการรูปโปรไฟล์", () => {
    it("TS_SPMS_11_012 ตรวจสอบการเปิดโมดัลอัปโหลดรูปโปรไฟล์", () => {
      // คลิกปุ่มเปลี่ยนรูปโปรไฟล์
      cy.get('[data-cy="change-image-btn"]').click();

      // ตรวจสอบว่าโมดัลอัปโหลดรูปภาพปรากฏขึ้น
      cy.get('[data-cy="upload-image-modal"]').should("be.visible");
      cy.get('[data-cy="choose-image-btn"]').should("be.visible");
    });

    it("TS_SPMS_11_013 ตรวจสอบการอัปโหลดรูปโปรไฟล์", () => {
      // เตรียมไฟล์สำหรับการอัปโหลด
      cy.fixture("test-image.jpg", "binary").then((fileContent) => {
        cy.get('[data-cy="change-image-btn"]').click();

        // จำลองการอัปโหลดไฟล์
        cy.get('[data-cy="image-input"]').attachFile({
          fileContent,
          fileName: "test-image.jpg",
          mimeType: "image/jpeg",
        });

        // ตรวจสอบว่าพรีวิวรูปภาพปรากฏขึ้น
        cy.get('[data-cy="new-image-preview"]').should("be.visible");

        // สร้าง stub สำหรับ API request
        cy.intercept("POST", "/api/profile/image", {
          statusCode: 200,
          body: { success: true, message: "Image uploaded successfully" },
        }).as("uploadImage");

        // คลิกปุ่มบันทึกรูปภาพ
        cy.get('[data-cy="confirm-upload-btn"]').click();

        // รอให้ API request เสร็จสิ้น
        cy.wait("@uploadImage");

        // ตรวจสอบว่าโมดัลถูกปิด
        cy.get('[data-cy="upload-image-modal"]').should("not.exist");
      });
    });

    it("TS_SPMS_11_014 ตรวจสอบการลบรูปโปรไฟล์", () => {
      // คลิกปุ่มเปลี่ยนรูปโปรไฟล์
      cy.get('[data-cy="change-image-btn"]').click();

      // ตรวจเงื่อนไขว่ามีรูปโปรไฟล์อยู่แล้วหรือไม่
      cy.get("body").then(($body) => {
        // หากมีปุ่มลบรูปภาพในโมดัล แสดงว่ามีรูปโปรไฟล์อยู่แล้ว
        if ($body.find('[data-cy="delete-image-from-modal-btn"]').length > 0) {
          // คลิกปุ่มลบรูปภาพ
          cy.get('[data-cy="delete-image-from-modal-btn"]').click();

          // ตรวจสอบว่าโมดัลยืนยันการลบปรากฏขึ้น
          cy.get('[data-cy="delete-image-confirm-modal"]').should("be.visible");

          // สร้าง stub สำหรับ API request
          cy.intercept("DELETE", "/api/profile/image", {
            statusCode: 200,
            body: { success: true, message: "Image deleted successfully" },
          }).as("deleteImage");

          // คลิกปุ่มยืนยันการลบ
          cy.get('[data-cy="confirm-delete-btn"]').click();

          // รอให้ API request เสร็จสิ้น
          cy.wait("@deleteImage");

          // ตรวจสอบว่าโมดัลยืนยันการลบถูกปิด
          cy.get('[data-cy="delete-image-confirm-modal"]').should("not.exist");
        } else {
          // ข้ามการทดสอบหากไม่มีรูปโปรไฟล์
          cy.log("No profile image to delete, skipping this test");
        }
      });
    });

    it("TS_SPMS_11_015 ตรวจสอบการยกเลิกการลบรูปโปรไฟล์", () => {
      // คลิกปุ่มเปลี่ยนรูปโปรไฟล์
      cy.get('[data-cy="change-image-btn"]').click();

      // ตรวจเงื่อนไขว่ามีรูปโปรไฟล์อยู่แล้วหรือไม่
      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="delete-image-from-modal-btn"]').length > 0) {
          // คลิกปุ่มลบรูปภาพ
          cy.get('[data-cy="delete-image-from-modal-btn"]').click();

          // ตรวจสอบว่าโมดัลยืนยันการลบปรากฏขึ้น
          cy.get('[data-cy="delete-image-confirm-modal"]').should("be.visible");

          // คลิกปุ่มยกเลิก
          cy.get('[data-cy="cancel-delete-btn"]').click();

          // ตรวจสอบว่าโมดัลยืนยันการลบถูกปิด
          cy.get('[data-cy="delete-image-confirm-modal"]').should("not.exist");

          // ตรวจสอบว่ายังคงอยู่ในโมดัลอัปโหลดรูปภาพ
          cy.get('[data-cy="upload-image-modal"]').should("be.visible");
        } else {
          cy.log("No profile image to delete, skipping this test");
        }
      });
    });
  });

  /**
   * การทดสอบการแสดงผลและการทำงานของส่วนโปรเจกต์
   */
  describe("การทดสอบการแสดงผลและการทำงานของส่วนโปรเจกต์", () => {
    it("TS_SPMS_11_016 ตรวจสอบการแสดงผลตารางโปรเจกต์หรือข้อความเมื่อไม่มีโปรเจกต์", () => {
      // ตรวจเงื่อนไขว่ามีโปรเจกต์หรือไม่
      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="projects-table"]').length > 0) {
          // กรณีที่มีโปรเจกต์
          cy.get('[data-cy="projects-table"]').should("be.visible");
          cy.get('[data-cy="projects-table"] tbody tr').should(
            "have.length.at.least",
            1
          );
        } else {
          // กรณีที่ไม่มีโปรเจกต์
          cy.get('[data-cy="no-projects-message"]').should("be.visible");
        }
      });
    });
  });

  /**
   * การทดสอบการจัดการข้อผิดพลาด
   */
  describe("การทดสอบการจัดการข้อผิดพลาด", () => {
    it("TS_SPMS_11_017 ตรวจสอบการแสดงและการปิดข้อความแจ้งเตือนความผิดพลาด", () => {
      // จำลองการเกิดข้อผิดพลาด โดยสร้างสถานการณ์ที่ทำให้เกิดข้อผิดพลาด
      // เช่น ทดสอบการแก้ไขโปรไฟล์แต่ API ตอบกลับด้วยข้อผิดพลาด
      cy.get('[data-cy="edit-profile-btn"]').click();

      // สร้าง stub ที่จำลองการตอบกลับแบบข้อผิดพลาด
      cy.intercept("PUT", "/api/profile", {
        statusCode: 500,
        body: { success: false, message: "Server error occurred" },
      }).as("updateProfileError");

      // คลิกปุ่มบันทึก
      cy.get('[data-cy="save-profile-btn"]').click();

      // รอให้ API request เสร็จสิ้น
      cy.wait("@updateProfileError");

      // ตรวจสอบว่าข้อความแจ้งเตือนความผิดพลาดปรากฏขึ้น
      cy.get('[data-cy="profile-error"]').should("be.visible");

      // คลิกปุ่มปิดข้อความแจ้งเตือน
      cy.get('[data-cy="close-error"]').click();

      // ตรวจสอบว่าข้อความแจ้งเตือนถูกปิดไป
      cy.get('[data-cy="profile-error"]').should("not.exist");
    });
  });

  /**
   * การทดสอบการแสดงรูปภาพขนาดใหญ่
   */
  describe("การทดสอบการแสดงรูปภาพขนาดใหญ่", () => {
    it("TS_SPMS_11_018 ตรวจสอบการเปิดและปิดโมดัลแสดงรูปภาพขนาดใหญ่", () => {
      // ตรวจเงื่อนไขว่ามีรูปโปรไฟล์หรือไม่
      cy.get('[data-cy="profile-image"] img').then(($img) => {
        if ($img.length > 0) {
          // คลิกที่รูปโปรไฟล์เพื่อเปิดโมดัลแสดงรูปภาพขนาดใหญ่
          cy.get('[data-cy="profile-image"] img').click();

          // ตรวจสอบว่าโมดัลแสดงรูปภาพขนาดใหญ่ปรากฏขึ้น
          cy.get('[data-cy="image-preview-modal"]').should("be.visible");

          // คลิกปุ่มปิดโมดัล
          cy.get('[data-cy="close-preview-btn"]').click();

          // ตรวจสอบว่าโมดัลถูกปิด
          cy.get('[data-cy="image-preview-modal"]').should("not.exist");
        } else {
          cy.log("No profile image available, skipping this test");
        }
      });
    });
  });

  /**
   * การทดสอบฟังก์ชันการสลับการแสดงรหัสผ่าน
   */
  describe("การทดสอบฟังก์ชันการสลับการแสดงรหัสผ่าน", () => {
    it("TS_SPMS_11_019 ตรวจสอบการสลับการแสดงรหัสผ่านในโมดัลเปลี่ยนรหัสผ่าน", () => {
      // คลิกปุ่มเปลี่ยนรหัสผ่าน
      cy.get('[data-cy="change-password-btn"]').click();

      // ป้อนรหัสผ่านในช่องรหัสผ่านปัจจุบัน
      cy.get('[data-cy="current-password-input"]').type("testpassword");

      // ตรวจสอบว่าตอนแรกช่องรหัสผ่านเป็นประเภท password (ซ่อนรหัสผ่าน)
      cy.get('[data-cy="current-password-input"]').should(
        "have.attr",
        "type",
        "password"
      );

      // คลิกปุ่มสลับการแสดงรหัสผ่าน
      cy.get('[data-cy="toggle-current-password"]').click();

      // ตรวจสอบว่าช่องรหัสผ่านเปลี่ยนเป็นประเภท text (แสดงรหัสผ่าน)
      cy.get('[data-cy="current-password-input"]').should(
        "have.attr",
        "type",
        "text"
      );

      // คลิกปุ่มสลับการแสดงรหัสผ่านอีกครั้ง
      cy.get('[data-cy="toggle-current-password"]').click();

      // ตรวจสอบว่าช่องรหัสผ่านเปลี่ยนกลับเป็นประเภท password
      cy.get('[data-cy="current-password-input"]').should(
        "have.attr",
        "type",
        "password"
      );
    });
  });
});
