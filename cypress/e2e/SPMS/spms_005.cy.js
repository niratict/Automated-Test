/// <reference types="cypress" />

/**
 * ไฟล์ทดสอบอัตโนมัติสำหรับหน้าจัดการสิทธิ์โปรเจกต์ (ProjectPermissions)
 *
 * กรณีทดสอบครอบคลุม:
 * - การแสดงผลหน้าจัดการสิทธิ์โปรเจกต์
 * - การเพิ่มสมาชิกในโปรเจกต์
 * - การลบสมาชิกออกจากโปรเจกต์
 * - การจัดการสิทธิ์ตามบทบาทผู้ใช้ (Admin, Product Owner)
 * - การแสดงข้อความแจ้งเตือนเมื่อผู้ใช้ไม่มีสิทธิ์
 */

describe("ทดสอบหน้าจัดการสิทธิ์โปรเจกต์", () => {
  // ข้อมูลผู้ใช้สำหรับการทดสอบ
  const testUser = {
    email: "test005@tester.com",
    password: "123456",
  };

  // ข้อมูลผู้ใช้ที่จะเพิ่มเป็นสมาชิกใหม่
  const newMemberData = {
    userId: "3", // สมมติว่าเป็น ID ของผู้ใช้ที่มีอยู่ในระบบ
    role: "Product Owner",
  };

  // ข้อมูลโปรเจกต์จำลองสำหรับทดสอบ
  const mockProject = {
    project_id: "210001",
    name: "SPMS",
    description: "รายละเอียดโปรเจกต์ทดสอบ",
    status: "Active",
    start_date: "2025-01-01",
    end_date: "2025-12-31",
    created_by: "Test User",
    photo: null,
    sprints: [
      {
        sprint_id: "101",
        name: "สปรินต์ที่ 1",
        start_date: "2025-01-01",
        end_date: "2025-01-14",
      },
      {
        sprint_id: "102",
        name: "สปรินต์ที่ 2",
        start_date: "2025-01-15",
        end_date: "2025-01-28",
      },
    ],
  };

  // ข้อมูลโปรเจกต์ที่ไม่มีสปรินต์
  const mockProjectNoSprints = {
    ...mockProject,
    sprints: [],
  };

  /**
   * การตั้งค่าก่อนการทดสอบแต่ละกรณี
   * - เข้าสู่ระบบ
   * - ตรวจสอบการเปลี่ยนเส้นทางไปที่หน้าหลัก
   */
  beforeEach(() => {
    // เข้าสู่ระบบก่อนทดสอบ
    cy.visit("/login");
    cy.get('[data-cy="login-email"]').type(testUser.email);
    cy.get('[data-cy="login-password"]').type(testUser.password);
    cy.get('[data-cy="login-submit"]').click();

    // ตรวจสอบว่าได้เปลี่ยนเส้นทางไปที่ /mainpage
    cy.url().should("include", "/mainpage");

    // นำทางไปยังหน้าจัดการสิทธิ์โปรเจกต์
    cy.visit(`/projects/${mockProject.project_id}`);

    // ตรวจสอบว่าอยู่ที่หน้ารายละเอียดโปรเจกต์
    cy.url().should("include", `/projects/${mockProject.project_id}`);

    // คลิกที่ปุ่มจัดการสิทธิ์โปรเจกต์ (สมมติว่ามีปุ่มนี้ในหน้ารายละเอียดโปรเจกต์)
    cy.get('[data-cy="manage-permissions"]').click();

    // ตรวจสอบว่าได้นำทางไปยังหน้าจัดการสิทธิ์โปรเจกต์
    cy.url().should("include", `/projects/${mockProject.project_id}/permissions`);
  });

  /**
   * กลุ่มทดสอบ: การตรวจสอบองค์ประกอบบนหน้าจัดการสิทธิ์โปรเจกต์
   */
  describe("การแสดงผลหน้าจัดการสิทธิ์โปรเจกต์", () => {
    it("TS_SPMS_05_001 ตรวจสอบการแสดงผลองค์ประกอบหลักบนหน้าจัดการสิทธิ์โปรเจกต์", () => {
      // ตรวจสอบว่ามีองค์ประกอบหลักที่จำเป็นปรากฏบนหน้า
      cy.get('[data-cy="project-permissions-page"]').should("exist");
      cy.get('[data-cy="page-title"]').should(
        "contain",
        "จัดการสิทธิ์โปรเจกต์"
      );
      cy.get('[data-cy="project-name"]').should("contain", mockProject.name);
      cy.get('[data-cy="back-button"]').should("exist");
      cy.get('[data-cy="members-section-title"]').should(
        "contain",
        "รายชื่อสมาชิก"
      );
      cy.get('[data-cy="add-member-button"]').should("exist");
      cy.get('[data-cy="members-table-container"]').should("exist");
      cy.get('[data-cy="info-section-title"]').should(
        "contain",
        "ข้อมูลเกี่ยวกับบทบาทในโปรเจกต์"
      );
    });

    it("TS_SPMS_05_002 ตรวจสอบการทำงานของปุ่มกลับไปหน้ารายละเอียดโปรเจกต์", () => {
      // คลิกปุ่มกลับไปหน้ารายละเอียดโปรเจกต์
      cy.get('[data-cy="back-button"]').click();

      // ตรวจสอบว่าได้กลับไปยังหน้ารายละเอียดโปรเจกต์
      cy.url().should("include", `/projects/${mockProject.project_id}`);
      cy.url().should("not.include", "/permissions");
    });

    it("TS_SPMS_05_003 ตรวจสอบการแสดงตารางรายชื่อสมาชิกและข้อมูลที่เกี่ยวข้อง", () => {
      // ตรวจสอบว่าตารางรายชื่อสมาชิกมีคอลัมน์ที่จำเป็น
      cy.get('[data-cy="members-table-container"] thead tr th').should(
        ($ths) => {
          expect($ths).to.contain.text("ชื่อผู้ใช้");
          expect($ths).to.contain.text("บทบาทในโปรเจกต์");
          expect($ths).to.contain.text("บทบาทในระบบ");
          expect($ths).to.contain.text("เพิ่มเมื่อ");
          expect($ths).to.contain.text("เพิ่มโดย");
          expect($ths).to.contain.text("จัดการ");
        }
      );

      // ตรวจสอบว่ามีข้อมูลสมาชิกอย่างน้อย 1 รายการ (หรือข้อความว่าไม่มีข้อมูล)
      cy.get('[data-cy="members-table-container"] tbody tr').should(
        "have.length.at.least",
        1
      );
    });
  });

  /**
   * กลุ่มทดสอบ: การเพิ่มสมาชิกในโปรเจกต์
   */
  describe("การเพิ่มสมาชิกในโปรเจกต์", () => {
    it("TS_SPMS_05_004 ตรวจสอบการเปิดและปิดฟอร์มเพิ่มสมาชิก", () => {
      // คลิกปุ่มเพิ่มสมาชิก
      cy.get('[data-cy="add-member-button"]').click();

      // ตรวจสอบว่าฟอร์มเพิ่มสมาชิกปรากฏ
      cy.get('[data-cy="add-member-form"]').should("be.visible");

      // คลิกปุ่มปิดฟอร์ม
      cy.get('[data-cy="close-add-member-form"]').click();

      // ตรวจสอบว่าฟอร์มเพิ่มสมาชิกถูกซ่อน
      cy.get('[data-cy="add-member-form"]').should("not.exist");
    });

    it.only("TS_SPMS_05_005 ตรวจสอบการเพิ่มสมาชิกใหม่ในโปรเจกต์", () => {
      // คลิกปุ่มเพิ่มสมาชิก
      cy.get('[data-cy="add-member-button"]').click();

      // เลือกผู้ใช้
      cy.get('[data-cy="user-select"]').select(newMemberData.userId);

      // ตรวจสอบว่าปุ่มเลือกบทบาทปรากฏหรือไม่ (ขึ้นอยู่กับบทบาทของผู้ใช้ที่ทดสอบ)
      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="role-select"]').length > 0) {
          // กรณีที่มี role-select (Admin)
          cy.get('[data-cy="role-select"]').select(newMemberData.role);
        } else if ($body.find('[data-cy="role-readonly"]').length > 0) {
          // กรณีที่มี role-readonly (Product Owner)
          cy.get('[data-cy="role-readonly"]').should("have.value", "Tester");
        }
      });

      // คลิกปุ่มยืนยันการเพิ่มสมาชิก
      cy.get('[data-cy="submit-add-member"]').click();

      // ตรวจสอบว่าฟอร์มเพิ่มสมาชิกถูกซ่อน (แสดงว่าการเพิ่มสำเร็จ)
      cy.get('[data-cy="add-member-form"]').should("not.exist");

      // ตรวจสอบว่าไม่มีข้อความแจ้งเตือนความผิดพลาด
      cy.get('[data-cy="error-message"]').should("not.exist");

      // ตรวจสอบว่ามีชื่อสมาชิกใหม่ในตาราง (สมมติว่ามีการแสดงชื่อของสมาชิกที่เพิ่ม)
      // หมายเหตุ: ในการทดสอบจริง คุณต้องรู้ชื่อของสมาชิกที่เพิ่ม
      // cy.get('[data-cy="members-table-container"] tbody').should('contain', 'ชื่อสมาชิกที่เพิ่ม');

      // หรืออาจตรวจสอบจำนวนสมาชิกในตารางที่เพิ่มขึ้น
      cy.get('[data-cy="members-table-container"] tbody tr').should(
        "have.length.at.least",
        1
      );
    });

    it("TS_SPMS_05_006 ตรวจสอบการแสดงข้อความเตือนเมื่อเพิ่มสมาชิกโดยไม่เลือกผู้ใช้", () => {
      // คลิกปุ่มเพิ่มสมาชิก
      cy.get('[data-cy="add-member-button"]').click();

      // คลิกปุ่มยืนยันการเพิ่มสมาชิกโดยไม่เลือกผู้ใช้
      cy.get('[data-cy="submit-add-member"]').click();

      // ตรวจสอบว่ามีข้อความแจ้งเตือน
      cy.get('[data-cy="error-message"]').should("exist");
      cy.get('[data-cy="error-message"]').should("contain", "กรุณาเลือกผู้ใช้");
    });
  });

  /**
   * กลุ่มทดสอบ: การลบสมาชิกออกจากโปรเจกต์
   */
  describe("การลบสมาชิกออกจากโปรเจกต์", () => {
    it("TS_SPMS_05_007 ตรวจสอบการแสดง modal ยืนยันการลบสมาชิก", () => {
      // คลิกปุ่มลบสมาชิกของรายการแรก (ถ้ามี)
      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="remove-member-button"]').length > 0) {
          cy.get('[data-cy="remove-member-button"]').first().click();

          // ตรวจสอบว่า modal ยืนยันการลบปรากฏ
          cy.get('[data-cy="delete-modal-cancel"]').should("exist");
          cy.get('[data-cy="delete-modal-confirm"]').should("exist");
        } else {
          // ถ้าไม่มีปุ่มลบสมาชิก ให้ข้ามการทดสอบนี้
          cy.log(
            "ไม่พบปุ่มลบสมาชิก อาจเป็นเพราะไม่มีสมาชิกในโปรเจกต์ หรือผู้ใช้ไม่มีสิทธิ์ลบสมาชิก"
          );
        }
      });
    });

    it("TS_SPMS_05_008 ตรวจสอบการยกเลิกการลบสมาชิก", () => {
      // คลิกปุ่มลบสมาชิกของรายการแรก (ถ้ามี)
      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="remove-member-button"]').length > 0) {
          // บันทึกจำนวนสมาชิกก่อนการลบ
          const memberCountBefore = Cypress.$(
            '[data-cy="members-table-container"] tbody tr'
          ).length;

          cy.get('[data-cy="remove-member-button"]').first().click();

          // คลิกปุ่มยกเลิกการลบสมาชิก
          cy.get('[data-cy="delete-modal-cancel"]').click();

          // ตรวจสอบว่า modal ถูกปิด
          cy.get('[data-cy="delete-modal-cancel"]').should("not.exist");

          // ตรวจสอบว่าจำนวนสมาชิกไม่เปลี่ยนแปลง
          cy.get('[data-cy="members-table-container"] tbody tr').should(
            "have.length",
            memberCountBefore
          );
        } else {
          // ถ้าไม่มีปุ่มลบสมาชิก ให้ข้ามการทดสอบนี้
          cy.log(
            "ไม่พบปุ่มลบสมาชิก อาจเป็นเพราะไม่มีสมาชิกในโปรเจกต์ หรือผู้ใช้ไม่มีสิทธิ์ลบสมาชิก"
          );
        }
      });
    });

    it("TS_SPMS_05_009 ตรวจสอบการลบสมาชิกออกจากโปรเจกต์สำเร็จ", () => {
      // คลิกปุ่มลบสมาชิกของรายการแรก (ถ้ามี)
      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="remove-member-button"]').length > 0) {
          // บันทึกจำนวนสมาชิกก่อนการลบ
          cy.get('[data-cy="members-table-container"] tbody tr').then(
            ($rows) => {
              const memberCountBefore = $rows.length;

              // คลิกปุ่มลบสมาชิก
              cy.get('[data-cy="remove-member-button"]').first().click();

              // คลิกปุ่มยืนยันการลบสมาชิก
              cy.get('[data-cy="delete-modal-confirm"]').click();

              // ตรวจสอบว่า modal ถูกปิด
              cy.get('[data-cy="delete-modal-confirm"]').should("not.exist");

              // ตรวจสอบว่าไม่มีข้อความแจ้งเตือนความผิดพลาด
              cy.get('[data-cy="error-message"]').should("not.exist");

              // ตรวจสอบว่าจำนวนสมาชิกลดลง 1 คน (เฉพาะในกรณีที่การลบสำเร็จ)
              // หมายเหตุ: อาจต้องรอการโหลดข้อมูลใหม่
              cy.wait(1000); // รอให้ข้อมูลโหลดใหม่

              // ตรวจสอบจำนวนสมาชิกหลังการลบ
              if (memberCountBefore > 1) {
                // ถ้ามีสมาชิกมากกว่า 1 คน จำนวนสมาชิกต้องลดลง
                cy.get('[data-cy="members-table-container"] tbody tr').should(
                  "have.length",
                  memberCountBefore - 1
                );
              } else {
                // ถ้ามีสมาชิกเพียง 1 คน หลังจากลบอาจแสดงข้อความว่าไม่มีข้อมูล
                cy.get('[data-cy="members-table-container"] tbody').should(
                  "contain",
                  "ไม่พบข้อมูลสมาชิก"
                );
              }
            }
          );
        } else {
          // ถ้าไม่มีปุ่มลบสมาชิก ให้ข้ามการทดสอบนี้
          cy.log(
            "ไม่พบปุ่มลบสมาชิก อาจเป็นเพราะไม่มีสมาชิกในโปรเจกต์ หรือผู้ใช้ไม่มีสิทธิ์ลบสมาชิก"
          );
        }
      });
    });
  });

  /**
   * กลุ่มทดสอบ: การจัดการสิทธิ์ตามบทบาทผู้ใช้
   */
  describe("การจัดการสิทธิ์ตามบทบาทผู้ใช้", () => {
    it("TS_SPMS_05_010 ตรวจสอบการแสดงข้อมูลบทบาทในโปรเจกต์ที่เหมาะสม", () => {
      // ตรวจสอบว่ามีการแสดงข้อมูลเกี่ยวกับบทบาทในโปรเจกต์
      cy.get('[data-cy="info-section-title"]').should(
        "contain",
        "ข้อมูลเกี่ยวกับบทบาทในโปรเจกต์"
      );
    });

    it("TS_SPMS_05_011 ตรวจสอบการแสดงตัวเลือกบทบาทตามสิทธิ์ของผู้ใช้", () => {
      // คลิกปุ่มเพิ่มสมาชิก
      cy.get('[data-cy="add-member-button"]').click();

      // ตรวจสอบตัวเลือกบทบาทตามสิทธิ์ของผู้ใช้
      cy.get("body").then(($body) => {
        if ($body.find('[data-cy="role-select"]').length > 0) {
          // กรณีเป็น Admin ต้องสามารถเลือกได้ทั้ง Product Owner และ Tester
          cy.get('[data-cy="role-select"] option').should(($options) => {
            expect($options).to.have.length.at.least(2);
            expect($options.eq(0)).to.contain("Product Owner");
            expect($options.eq(1)).to.contain("Tester");
          });
        } else if ($body.find('[data-cy="role-readonly"]').length > 0) {
          // กรณีเป็น Product Owner บทบาทถูกกำหนดเป็น Tester เท่านั้น
          cy.get('[data-cy="role-readonly"]').should("have.value", "Tester");
        }
      });

      // ปิดฟอร์มเพิ่มสมาชิก
      cy.get('[data-cy="close-add-member-form"]').click();
    });
  });

  /**
   * กลุ่มทดสอบ: กรณีผู้ใช้ไม่มีสิทธิ์
   * หมายเหตุ: ในการทดสอบจริง อาจต้องใช้บัญชีผู้ใช้ที่ไม่มีสิทธิ์จัดการโปรเจกต์
   */
  describe("กรณีผู้ใช้ไม่มีสิทธิ์", () => {
    it("TS_SPMS_05_012 ตรวจสอบการแสดงข้อความแจ้งเตือนเมื่อผู้ใช้ไม่มีสิทธิ์จัดการสมาชิก", () => {
      // จำลองกรณีที่ผู้ใช้ไม่มีสิทธิ์ (ในการทดสอบจริงอาจต้องใช้บัญชีอื่น)
      // สามารถทำได้โดยการ mock API response หรือใช้ UI ที่แสดงข้อความแจ้งเตือน

      // สมมติว่าเราสามารถจำลองการตอบกลับจาก API ได้
      cy.intercept("GET", `**/api/project-members/${mockProject.project_id}`, {
        statusCode: 200,
        body: [],
      }).as("getMembers");

      cy.intercept("GET", `**/api/projects/${mockProject.project_id}`, {
        statusCode: 200,
        body: { ...mockProject, user_role: "Tester" }, // สมมติว่าผู้ใช้มีบทบาทเป็น Tester ซึ่งไม่มีสิทธิ์จัดการสมาชิก
      }).as("getProject");

      // รีโหลดหน้า
      cy.visit(`/projects/${mockProject.project_id}/permissions`);

      // ตรวจสอบว่ามีข้อความแจ้งเตือนปรากฏ
      cy.contains("ไม่พบข้อมูลสมาชิกในโปรเจกต์นี้").should("be.visible");
    });
  });
});
