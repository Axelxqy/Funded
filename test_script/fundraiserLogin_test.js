/**
 * @jest-environment node
 */

const request = require("supertest");
const app = require("../index");
const pool = require("../helper/db.js");

let fundraiserAccount;
let consoleErrorSpy;

describe("Fund Raiser Login", () => {
  beforeAll(async () => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

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
      WHERE ua.suspended = false
        AND (
          LOWER(up.role_name) LIKE '%fund%'
          OR LOWER(up.role_name) = 'user'
        )
      LIMIT 1;
      `
    );

    fundraiserAccount = result.rows[0];
  });

  test("Should allow fund raiser to login with valid email and password", async () => {
    expect(fundraiserAccount).toBeDefined();

    const response = await request(app)
      .post("/auth/login")
      .send({
        email: fundraiserAccount.email,
        password: fundraiserAccount.password,
      });

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("user_id");
    expect(response.body.user).toHaveProperty("email");
    expect(response.body.user).toHaveProperty("role_name");

    expect(response.body.user.email).toBe(fundraiserAccount.email);

    const returnedRole = response.body.user.role_name.toLowerCase();

    expect(
      returnedRole.includes("fund") || returnedRole === "user"
    ).toBe(true);
  });

  test("Should not allow fund raiser to login with wrong password", async () => {
    expect(fundraiserAccount).toBeDefined();

    const response = await request(app)
      .post("/auth/login")
      .send({
        email: fundraiserAccount.email,
        password: "WrongPassword123!",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  test("Should not allow login with unregistered email", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "notexist_fundraiser@gmail.com",
        password: "Test123!",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message");
  });
});

afterAll(async () => {
  if (consoleErrorSpy) {
    consoleErrorSpy.mockRestore();
  }

  await pool.end();
});