const request = require("supertest");
const app = require("../index");
const pool = require("../helper/db.js");

let adminAccount;

describe("User Admin Login", () => {
  beforeAll(async () => {
    const result = await pool.query(
      `
      SELECT
        ua.user_id,
        ua.email,
        ua.password,
        ua.f_name,
        ua.l_name,
        ua.profile_id,
        up.role_name
      FROM public.user_account ua
      JOIN public.user_profile up
        ON ua.profile_id = up.profile_id
      WHERE LOWER(up.role_name) LIKE '%admin%'
        AND ua.suspended = false
      LIMIT 1;
      `
    );

    adminAccount = result.rows[0];
  });

  test("Should allow user admin to login with valid email and password", async () => {
    expect(adminAccount).toBeDefined();
    expect(adminAccount.role_name.toLowerCase()).toContain("admin");

    const response = await request(app)
      .post("/auth/login")
      .send({
        email: adminAccount.email,
        password: adminAccount.password,
      });

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("user_id");
    expect(response.body.user).toHaveProperty("email");
    expect(response.body.user).toHaveProperty("role_name");

    expect(response.body.user.email).toBe(adminAccount.email);
    expect(response.body.user.role_name.toLowerCase()).toContain("admin");
  });

  test("Should not allow user admin to login with wrong password", async () => {
    expect(adminAccount).toBeDefined();

    const response = await request(app)
      .post("/auth/login")
      .send({
        email: adminAccount.email,
        password: "WrongPassword123!",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  test("Should not allow login with unregistered email", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "notexist@gmail.com",
        password: "Admin123!",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message");
  });
});

afterAll(async () => {
  await pool.end();
});