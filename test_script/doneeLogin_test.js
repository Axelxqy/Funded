/**
 * @jest-environment node
 */

const request = require("supertest");
const app = require("../index");
const pool = require("../helper/db.js");

let doneeAccount;
let consoleErrorSpy;

describe("Donee Login", () => {
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
        AND LOWER(up.role_name) = 'user'
      LIMIT 1;
      `
    );

    doneeAccount = result.rows[0];
  });

  test("Should allow donee to login with valid email and password", async () => {
    expect(doneeAccount).toBeDefined();
    expect(doneeAccount.role_name.toLowerCase()).toBe("user");

    const response = await request(app)
      .post("/auth/login")
      .send({
        email: doneeAccount.email,
        password: doneeAccount.password,
      });

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("user_id");
    expect(response.body.user).toHaveProperty("email");
    expect(response.body.user).toHaveProperty("role_name");

    expect(response.body.user.email).toBe(doneeAccount.email);
    expect(response.body.user.role_name.toLowerCase()).toBe("user");
  });

  test("Should not allow donee to login with wrong password", async () => {
    expect(doneeAccount).toBeDefined();

    const response = await request(app)
      .post("/auth/login")
      .send({
        email: doneeAccount.email,
        password: "WrongPassword123!",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  test("Should not allow login with unregistered email", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "notexist_donee@gmail.com",
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