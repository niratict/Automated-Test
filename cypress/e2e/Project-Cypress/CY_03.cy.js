/// <reference types="cypress" />

context("Network Requests", () => {
  beforeEach(() => {
    cy.visit("https://example.cypress.io/commands/network-requests");
  });

  // จัดการคำขอ HTTP ในแอพของคุณ

  it("TS_CY_03_001 cy.request() - ทำคำขอ XHR", () => {
    // https://on.cypress.io/request
    cy.request("https://jsonplaceholder.cypress.io/comments").should(
      (response) => {
        expect(response.status).to.eq(200);
        // เซิร์ฟเวอร์บางครั้งได้รับความคิดเห็นเพิ่มเติมที่โพสต์จากเครื่องอื่น
        // ซึ่งถูกส่งคืนเป็น 1 ออบเจกต์เพิ่มเติม
        expect(response.body)
          .to.have.property("length")
          .and.be.oneOf([500, 501]);
        expect(response).to.have.property("headers");
        expect(response).to.have.property("duration");
      }
    );
  });

  it("TS_CY_03_002 cy.request() - ตรวจสอบการตอบสนองโดยใช้ไวยากรณ์ BDD", () => {
    cy.request("https://jsonplaceholder.cypress.io/comments").then(
      (response) => {
        // https://on.cypress.io/assertions
        expect(response).property("status").to.equal(200);
        expect(response)
          .property("body")
          .to.have.property("length")
          .and.be.oneOf([500, 501]);
        expect(response).to.include.keys("headers", "duration");
      }
    );
  });

  it("TS_CY_03_003 cy.request() กับพารามิเตอร์การค้นหา", () => {
    // จะดำเนินการคำขอ
    // https://jsonplaceholder.cypress.io/comments?postId=1&id=3
    cy.request({
      url: "https://jsonplaceholder.cypress.io/comments",
      qs: {
        postId: 1,
        id: 3,
      },
    })
      .its("body")
      .should("be.an", "array")
      .and("have.length", 1)
      .its("0") // ให้ผลลัพธ์เป็นองค์ประกอบแรกของอาร์เรย์
      .should("contain", {
        postId: 1,
        id: 3,
      });
  });

  it("TS_CY_03_004 cy.request() - ส่งผลลัพธ์ไปยังคำขอที่สอง", () => {
    // ก่อนอื่น มาหา userId ของผู้ใช้คนแรกที่เรามี
    cy.request("https://jsonplaceholder.cypress.io/users?_limit=1")
      .its("body") // ให้ผลลัพธ์เป็นออบเจกต์การตอบสนอง
      .its("0") // ให้ผลลัพธ์เป็นองค์ประกอบแรกของรายการที่ส่งคืน
      // คำสั่งสองคำสั่งด้านบน its('body').its('0')
      // สามารถเขียนเป็น its('body.0')
      // ถ้าคุณไม่สนใจการตรวจสอบ TypeScript
      .then((user) => {
        expect(user).property("id").to.be.a("number");
        // สร้างโพสต์ใหม่ในนามของผู้ใช้
        cy.request("POST", "https://jsonplaceholder.cypress.io/posts", {
          userId: user.id,
          title: "Cypress Test Runner",
          body: "Fast, easy and reliable testing for anything that runs in a browser.",
        });
      })
      // หมายเหตุว่าค่าที่นี่คือค่าที่ส่งคืนจากคำขอที่ 2
      // ซึ่งเป็นออบเจกต์โพสต์ใหม่
      .then((response) => {
        expect(response).property("status").to.equal(201); // สร้างเอนทิตีใหม่
        expect(response).property("body").to.contain({
          title: "Cypress Test Runner",
        });

        // เราไม่รู้ id โพสต์ที่แน่นอน - รู้แค่ว่าจะมีค่า > 100
        // เนื่องจาก JSONPlaceholder มีโพสต์ที่สร้างไว้ 100 โพสต์
        expect(response.body)
          .property("id")
          .to.be.a("number")
          .and.to.be.gt(100);

        // เราไม่รู้ user id ที่นี่ - เนื่องจากอยู่ในขอบเขตด้านบน
        // ดังนั้นในการทดสอบนี้เพียงแค่ยืนยันว่ามีคุณสมบัตินั้นอยู่
        expect(response.body).property("userId").to.be.a("number");
      });
  });

  it("TS_CY_03_005 cy.request() - บันทึกการตอบสนองในบริบทการทดสอบที่แชร์", () => {
    // https://on.cypress.io/variables-and-aliases
    cy.request("https://jsonplaceholder.cypress.io/users?_limit=1")
      .its("body")
      .its("0") // ให้ผลลัพธ์เป็นองค์ประกอบแรกของรายการที่ส่งคืน
      .as("user") // บันทึกออบเจกต์ในบริบทการทดสอบ
      .then(function () {
        // หมายเหตุ 👀
        //  ในขณะที่คอลแบ็กนี้ทำงาน คำสั่ง "as('user')"
        //  ได้บันทึกออบเจกต์ผู้ใช้ในบริบทการทดสอบแล้ว
        //  ในการเข้าถึงบริบทการทดสอบ เราต้องใช้
        //  รูปแบบคอลแบ็ก "function () { ... }"
        //  มิฉะนั้น "this" จะชี้ไปที่ออบเจกต์ที่ผิดหรือไม่ได้กำหนด!
        cy.request("POST", "https://jsonplaceholder.cypress.io/posts", {
          userId: this.user.id,
          title: "Cypress Test Runner",
          body: "Fast, easy and reliable testing for anything that runs in a browser.",
        })
          .its("body")
          .as("post"); // บันทึกโพสต์ใหม่จากการตอบสนอง
      })
      .then(function () {
        // เมื่อคอลแบ็กนี้ทำงาน คำสั่ง API "cy.request" ทั้งสองได้เสร็จสิ้นแล้ว
        // และบริบทการทดสอบมีออบเจกต์ "user" และ "post" ที่ตั้งค่าไว้
        // มาตรวจสอบพวกมัน
        expect(this.post, "post has the right user id")
          .property("userId")
          .to.equal(this.user.id);
      });
  });

  it("TS_CY_03_006 cy.intercept() - กำหนดเส้นทางการตอบสนองไปยังคำขอที่ตรงกัน", () => {
    // https://on.cypress.io/intercept

    let message = "whoa, this comment does not exist";

    // รับฟัง GET ไปยัง comments/1
    cy.intercept("GET", "**/comments/*").as("getComment");

    // เรามีโค้ดที่รับความคิดเห็นเมื่อ
    // ปุ่มถูกคลิกใน scripts.js
    cy.get(".network-btn").click();

    // https://on.cypress.io/wait
    cy.wait("@getComment")
      .its("response.statusCode")
      .should("be.oneOf", [200, 304]);

    // รับฟัง POST ไปยัง comments
    cy.intercept("POST", "**/comments").as("postComment");

    // เรามีโค้ดที่โพสต์ความคิดเห็นเมื่อ
    // ปุ่มถูกคลิกใน scripts.js
    cy.get(".network-post").click();
    cy.wait("@postComment").should(({ request, response }) => {
      expect(request.body).to.include("email");
      expect(request.headers).to.have.property("content-type");
      expect(response && response.body).to.have.property(
        "name",
        "Using POST in cy.intercept()"
      );
    });

    // จำลองการตอบสนองไปยัง PUT comments/ ****
    cy.intercept(
      {
        method: "PUT",
        url: "**/comments/*",
      },
      {
        statusCode: 404,
        body: { error: message },
        headers: { "access-control-allow-origin": "*" },
        delayMs: 500,
      }
    ).as("putComment");

    // เรามีโค้ดที่ใส่ความคิดเห็นเมื่อ
    // ปุ่มถูกคลิกใน scripts.js
    cy.get(".network-put").click();

    cy.wait("@putComment");

    // ตรรกะ statusCode 404 ของเราใน scripts.js ทำงาน
    cy.get(".network-put-comment").should("contain", message);
  });
});
