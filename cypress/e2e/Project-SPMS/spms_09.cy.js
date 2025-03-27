describe("โปรไฟล์ผู้ใช้งาน - การทดสอบอัตโนมัติ", () => {
  beforeEach(() => {
    // เริ่มต้นที่หน้าเข้าสู่ระบบและทำการล็อกอิน
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type("test005@tester.com");
    cy.get('[data-cy="login-password"]').type("123456");
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าเข้าสู่หน้า dashboard หรือไม่
    cy.url().should("include", "/mainpage");
    // กด navbar เพื่อไปหน้าโปรไฟล์
    cy.get('[data-cy="user-menu-button"]').click();
    cy.get('[data-cy="profile-menu-item"]').click();

    // ตรวจสอบว่าอยู่ที่หน้าโปรไฟล์
    cy.get('[data-cy="profile-page"]').should("be.visible");
  });

  it("TS_SPMS_08_001 ตรวจสอบการแสดงข้อมูลโปรไฟล์พื้นฐานถูกต้อง", () => {
    // ตรวจสอบว่ามีการแสดงข้อมูลพื้นฐานของผู้ใช้งาน
    cy.get('[data-cy="profile-name"]').should("be.visible");
    cy.get('[data-cy="profile-email"]').should("be.visible");
    cy.get('[data-cy="profile-created-at"]').should("be.visible");
    cy.get('[data-cy="profile-role"]').should("be.visible");

    // ตรวจสอบภาพโปรไฟล์
    cy.get('[data-cy="profile-image"]').should("be.visible");
  });

  it("TS_SPMS_08_002 ทดสอบการเปิดโหมดแก้ไขและยกเลิกการแก้ไขโปรไฟล์", () => {
    // คลิกปุ่มแก้ไขโปรไฟล์
    cy.get('[data-cy="edit-profile-btn"]').click();

    // ตรวจสอบว่าอินพุตชื่อเป็นแบบแก้ไขได้
    cy.get('[data-cy="name-input"]').should("not.be.disabled");

    // เปลี่ยนชื่อผู้ใช้เป็นค่าทดสอบ
    cy.get('[data-cy="name-input"]').clear().type("ชื่อทดสอบ");

    // กดปุ่มยกเลิก
    cy.get('[data-cy="cancel-edit-btn"]').click();

    // ตรวจสอบว่ากลับมาเป็นโหมดอ่านอย่างเดียว
    cy.get('[data-cy="name-input"]').should("be.disabled");

    // ตรวจสอบว่าชื่อไม่เปลี่ยนแปลง (กลับไปเป็นค่าเดิม)
    cy.get('[data-cy="name-input"]').should("not.have.value", "ชื่อทดสอบ");
  });

  it("TS_SPMS_08_003 ทดสอบการแก้ไขชื่อโปรไฟล์และบันทึก", () => {
    // จดจำชื่อเดิมไว้เปรียบเทียบและเปลี่ยนกลับในภายหลัง
    let originalName;
    cy.get('[data-cy="profile-name"]')
      .invoke("text")
      .then((text) => {
        originalName = text;
      });

    // คลิกปุ่มแก้ไขโปรไฟล์
    cy.get('[data-cy="edit-profile-btn"]').click();

    // เปลี่ยนชื่อผู้ใช้เป็นชื่อทดสอบใหม่
    const newName = "ชื่อทดสอบ-" + new Date().getTime();
    cy.get('[data-cy="name-input"]').clear().type(newName);

    // บันทึกการเปลี่ยนแปลง
    cy.get('[data-cy="save-profile-btn"]').click();

    // รอให้การบันทึกเสร็จสิ้น (ดูจากปุ่มแก้ไขที่จะกลับมาแสดง)
    cy.get('[data-cy="edit-profile-btn"]', { timeout: 10000 }).should(
      "be.visible"
    );

    // ตรวจสอบว่าชื่อเปลี่ยนเป็นชื่อใหม่
    cy.get('[data-cy="profile-name"]').should("contain", newName);

    // เปลี่ยนกลับเป็นชื่อเดิม (ทำความสะอาดข้อมูลทดสอบ)
    cy.get('[data-cy="edit-profile-btn"]').click();
    cy.get('[data-cy="name-input"]').clear().type(originalName);
    cy.get('[data-cy="save-profile-btn"]').click();
  });

  it("TS_SPMS_08_004 ทดสอบการตรวจสอบความถูกต้องของชื่อ - ชื่อว่าง", () => {
    // คลิกปุ่มแก้ไขโปรไฟล์
    cy.get('[data-cy="edit-profile-btn"]').click();

    // ลบชื่อให้เป็นค่าว่าง
    cy.get('[data-cy="name-input"]').clear();

    // บันทึกการเปลี่ยนแปลง
    cy.get('[data-cy="save-profile-btn"]').click();

    // ตรวจสอบว่ามีข้อความแจ้งเตือนว่าชื่อต้องไม่เป็นค่าว่าง
    cy.get('[data-cy="name-error"]')
      .should("be.visible")
      .and("contain", "โปรดระบุชื่อ");
  });

  it("TS_SPMS_08_005 ทดสอบการเปิดโมดัลเปลี่ยนรหัสผ่าน", () => {
    // คลิกปุ่มเปลี่ยนรหัสผ่าน
    cy.get('[data-cy="change-password-btn"]').click();

    // ตรวจสอบว่าโมดัลเปลี่ยนรหัสผ่านแสดงขึ้น
    cy.get('[data-cy="password-modal"]').should("be.visible");

    // ตรวจสอบองค์ประกอบในโมดัลเปลี่ยนรหัสผ่าน
    cy.get('[data-cy="current-password-input"]').should("be.visible");
    cy.get('[data-cy="new-password-input"]').should("be.visible");
    cy.get('[data-cy="confirm-password-input"]').should("be.visible");
    cy.get('[data-cy="confirm-password-change"]').should("be.visible");
    cy.get('[data-cy="cancel-password-change"]').should("be.visible");

    // ปิดโมดัล
    cy.get('[data-cy="close-password-modal"]').click();
    cy.get('[data-cy="password-modal"]').should("not.exist");
  });

  it("TS_SPMS_08_006 ทดสอบการตรวจสอบความถูกต้องของรหัสผ่านใหม่ - รหัสผ่านไม่ตรงกัน", () => {
    // คลิกปุ่มเปลี่ยนรหัสผ่าน
    cy.get('[data-cy="change-password-btn"]').click();

    // กรอกรหัสผ่านปัจจุบัน
    cy.get('[data-cy="current-password-input"]').type("123456");

    // กรอกรหัสผ่านใหม่
    cy.get('[data-cy="new-password-input"]').type("Test12345");

    // กรอกรหัสผ่านยืนยันที่ไม่ตรงกับรหัสผ่านใหม่
    cy.get('[data-cy="confirm-password-input"]').type("Test67890");

    // คลิกปุ่มยืนยัน
    cy.get('[data-cy="confirm-password-change"]').click();

    // ตรวจสอบข้อความแจ้งเตือนว่ารหัสผ่านไม่ตรงกัน
    cy.get('[data-cy="confirm-password-error"]')
      .should("be.visible")
      .and("contain", "รหัสผ่านไม่ตรงกัน");
  });

  it("TS_SPMS_08_007 ทดสอบการตรวจสอบความถูกต้องของรหัสผ่านใหม่ - รหัสผ่านไม่ปลอดภัย", () => {
    // คลิกปุ่มเปลี่ยนรหัสผ่าน
    cy.get('[data-cy="change-password-btn"]').click();

    // กรอกรหัสผ่านปัจจุบัน
    cy.get('[data-cy="current-password-input"]').type("123456");

    // กรอกรหัสผ่านใหม่ที่ไม่ปลอดภัย (ไม่มีตัวพิมพ์ใหญ่)
    cy.get('[data-cy="new-password-input"]').type("test12345");

    // กรอกรหัสผ่านยืนยัน
    cy.get('[data-cy="confirm-password-input"]').type("test12345");

    // คลิกปุ่มยืนยัน
    cy.get('[data-cy="confirm-password-change"]').click();

    // ตรวจสอบข้อความแจ้งเตือนเกี่ยวกับความปลอดภัยของรหัสผ่าน
    cy.get('[data-cy="new-password-error"]')
      .should("be.visible")
      .and("contain", "รหัสผ่านจะต้องมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข");
  });

  it("TS_SPMS_08_008 ทดสอบการตรวจสอบความถูกต้องของรหัสผ่านใหม่ - รหัสผ่านสั้นเกินไป", () => {
    // คลิกปุ่มเปลี่ยนรหัสผ่าน
    cy.get('[data-cy="change-password-btn"]').click();

    // กรอกรหัสผ่านปัจจุบัน
    cy.get('[data-cy="current-password-input"]').type("123456");

    // กรอกรหัสผ่านใหม่ที่สั้นเกินไป
    cy.get('[data-cy="new-password-input"]').type("Test12");

    // กรอกรหัสผ่านยืนยัน
    cy.get('[data-cy="confirm-password-input"]').type("Test12");

    // คลิกปุ่มยืนยัน
    cy.get('[data-cy="confirm-password-change"]').click();

    // ตรวจสอบข้อความแจ้งเตือนว่ารหัสผ่านสั้นเกินไป
    cy.get('[data-cy="new-password-error"]')
      .should("be.visible")
      .and("contain", "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
  });

  it("TS_SPMS_08_009 ทดสอบการยกเลิกการเปลี่ยนรหัสผ่าน", () => {
    // คลิกปุ่มเปลี่ยนรหัสผ่าน
    cy.get('[data-cy="change-password-btn"]').click();

    // กรอกข้อมูลในฟอร์ม
    cy.get('[data-cy="current-password-input"]').type("123456");
    cy.get('[data-cy="new-password-input"]').type("Test12345");
    cy.get('[data-cy="confirm-password-input"]').type("Test12345");

    // คลิกปุ่มยกเลิก
    cy.get('[data-cy="cancel-password-change"]').click();

    // ตรวจสอบว่าโมดัลถูกปิด
    cy.get('[data-cy="password-modal"]').should("not.exist");
  });

  it("TS_SPMS_08_010 ทดสอบการกดปุ่มแสดง/ซ่อนรหัสผ่าน", () => {
    // คลิกปุ่มเปลี่ยนรหัสผ่าน
    cy.get('[data-cy="change-password-btn"]').click();

    // กรอกรหัสผ่านปัจจุบัน
    cy.get('[data-cy="current-password-input"]').type("123456");

    // ตรวจสอบว่าเริ่มต้นเป็นรูปแบบซ่อนรหัสผ่าน
    cy.get('[data-cy="current-password-input"]').should(
      "have.attr",
      "type",
      "password"
    );

    // คลิกปุ่มแสดงรหัสผ่าน
    cy.get('[data-cy="toggle-current-password"]').click();

    // ตรวจสอบว่าเปลี่ยนเป็นแสดงรหัสผ่าน
    cy.get('[data-cy="current-password-input"]').should(
      "have.attr",
      "type",
      "text"
    );

    // คลิกปุ่มซ่อนรหัสผ่าน
    cy.get('[data-cy="toggle-current-password"]').click();

    // ตรวจสอบว่ากลับไปเป็นซ่อนรหัสผ่าน
    cy.get('[data-cy="current-password-input"]').should(
      "have.attr",
      "type",
      "password"
    );

    // ปิดโมดัล
    cy.get('[data-cy="close-password-modal"]').click();
  });

  it("TS_SPMS_08_011 ทดสอบการเปิดดูรูปภาพโปรไฟล์ขนาดใหญ่", () => {
    // ตรวจสอบว่ามีรูปโปรไฟล์หรือไม่ และดำเนินการตามสถานะ
    cy.get('[data-cy="profile-image"]').then(($img) => {
      // ถ้ามีรูปโปรไฟล์แล้ว
      if ($img.find("img").length > 0) {
        // คลิกที่รูปโปรไฟล์เพื่อเปิดโมดัลแสดงรูปขนาดใหญ่
        cy.get('[data-cy="profile-image"]').click();

        // ตรวจสอบว่าโมดัลแสดงรูปขนาดใหญ่ปรากฏ
        cy.get('[data-cy="image-preview-modal"]').should("be.visible");

        // ปิดโมดัล
        cy.get('[data-cy="close-preview-btn"]').click();

        // ตรวจสอบว่าโมดัลถูกปิด
        cy.get('[data-cy="image-preview-modal"]').should("not.exist");
      } else {
        // ถ้ายังไม่มีรูปโปรไฟล์ ให้ข้ามการทดสอบนี้
        cy.log("ไม่มีรูปโปรไฟล์อยู่ในระบบ จึงข้ามการทดสอบโมดัลแสดงรูปภาพ");
      }
    });
  });

  it("TS_SPMS_08_012 ทดสอบการอัปโหลดรูปภาพโปรไฟล์", () => {
    // เตรียมไฟล์ทดสอบ
    cy.fixture("test-profile.jpg", "base64")
      .then(Cypress.Blob.base64StringToBlob)
      .then((blob) => {
        // สร้าง File object จาก blob
        const testFile = new File([blob], "test-profile.jpg", {
          type: "image/jpeg",
        });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(testFile);

        // อัปโหลดไฟล์รูปภาพ
        cy.get('[data-cy="image-input"]').then((input) => {
          input[0].files = dataTransfer.files;
          cy.wrap(input).trigger("change", { force: true });
        });

        // ตรวจสอบว่าปุ่มยืนยันการอัปโหลดปรากฏ
        cy.get('[data-cy="confirm-upload-btn"]').should("be.visible");

        // คลิกปุ่มยืนยันการอัปโหลด
        cy.get('[data-cy="confirm-upload-btn"]').click();

        // รอให้การอัปโหลดเสร็จสิ้น
        cy.get('[data-cy="profile-image"] img', { timeout: 10000 }).should(
          "be.visible"
        );
      });
  });

  it("TS_SPMS_08_013 ทดสอบการลบรูปภาพโปรไฟล์", () => {
    // ตรวจสอบว่ามีรูปโปรไฟล์หรือไม่
    cy.get('[data-cy="profile-image"]').then(($img) => {
      // ถ้ามีรูปโปรไฟล์แล้ว
      if ($img.find("img").length > 0) {
        // คลิกปุ่มลบรูปภาพ
        cy.get('[data-cy="delete-image-btn"]').click();

        // รอให้การลบเสร็จสิ้น
        cy.get('[data-cy="profile-image"] img').should("not.exist");

        // ตรวจสอบว่ารูปภาพถูกลบ (ไอคอนผู้ใช้จะแสดงแทน)
        cy.get('[data-cy="profile-image"] svg').should("be.visible");
      } else {
        // ถ้ายังไม่มีรูปโปรไฟล์ ให้ข้ามการทดสอบนี้
        cy.log("ไม่มีรูปโปรไฟล์อยู่ในระบบ จึงข้ามการทดสอบการลบรูปภาพ");
      }
    });
  });

  // ทดสอบกรณีพิเศษ - ทดสอบการจัดการข้อความแจ้งเตือนความผิดพลาด
  it("TS_SPMS_08_014 ทดสอบการปิดข้อความแจ้งเตือนความผิดพลาด", () => {
    // ใช้ cy.window() เพื่อเข้าถึง window object และจำลองข้อผิดพลาด
    cy.window().then((win) => {
      // จำลองการแสดงข้อความแจ้งเตือนความผิดพลาด
      win.document.querySelector('[data-cy="profile-page"]').innerHTML += `
        <div data-cy="profile-error" class="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span class="text-sm sm:text-base text-red-700">ทดสอบข้อความแจ้งเตือนความผิดพลาด</span>
          <button data-cy="close-error" class="ml-auto hover:bg-red-100 p-1 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-red-500">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;
    });

    // ตรวจสอบว่าข้อความแจ้งเตือนความผิดพลาดแสดงอยู่
    cy.get('[data-cy="profile-error"]').should("be.visible");

    // คลิกปุ่มปิดข้อความแจ้งเตือนความผิดพลาด
    cy.get('[data-cy="close-error"]').click();

    // ตรวจสอบว่าข้อความแจ้งเตือนความผิดพลาดถูกปิด
    cy.get('[data-cy="profile-error"]').should("not.exist");
  });
});
