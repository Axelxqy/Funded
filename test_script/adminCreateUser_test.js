/**
 * @jest-environment node
 */

const request = require("supertest");
const app = require("../index");
const pool = require("../helper/db.js");

let userRole;
let consoleErrorSpy;

describe("User Admin Create User Account", () => {
  beforeAll(async () => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await pool.query(
      `
      SELECT profile_id, role_name
      FROM public.user_profile
      WHERE LOWER(role_name) = 'user'
      LIMIT 1;
      `
    );

    userRole = result.rows[0];
  });

  test("Should allow user admin to create a new user account", async () => {
    expect(userRole).toBeDefined();
    expect(userRole.role_name.toLowerCase()).toBe("user");

    const uniqueEmail = `testuser_${Date.now()}@gmail.com`;

    const response = await request(app)
      .post("/users")
      .send({
        email: uniqueEmail,
        password: "Test123!",
        f_name: "Test",
        l_name: "User",
        dob: "2004-01-01",
        phone: "1234567890",
        profile_id: userRole.profile_id,
      });

    expect(response.statusCode).toBe(201);

    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("user");

    expect(response.body.user).toHaveProperty("user_id");
    expect(response.body.user).toHaveProperty("email");
    expect(response.body.user).toHaveProperty("f_name");
    expect(response.body.user).toHaveProperty("l_name");
    expect(response.body.user).toHaveProperty("profile_id");

    expect(response.body.user.email).toBe(uniqueEmail);
    expect(response.body.user.f_name).toBe("Test");
    expect(response.body.user.l_name).toBe("User");
    expect(Number(response.body.user.profile_id)).toBe(Number(userRole.profile_id));
  });

  test("Should not create user account with duplicate email", async () => {
    const email = `duplicate_${Date.now()}@gmail.com`;

    const firstResponse = await request(app)
      .post("/users")
      .send({
        email: email,
        password: "Test123!",
        f_name: "First",
        l_name: "User",
        dob: "2004-01-01",
        phone: "1234567890",
        profile_id: userRole.profile_id,
      });

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await request(app)
      .post("/users")
      .send({
        email: email,
        password: "Test123!",
        f_name: "Second",
        l_name: "User",
        dob: "2004-01-01",
        phone: "1234567890",
        profile_id: userRole.profile_id,
      });

    expect(secondResponse.statusCode).toBe(400);
    expect(secondResponse.body).toHaveProperty("message");
    expect(secondResponse.body.message).toContain("Email already exists");
  });

  test("Should not create user account when required fields are missing", async () => {
    const response = await request(app)
      .post("/users")
      .send({
        email: `missing_${Date.now()}@gmail.com`,
        password: "Test123!",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("All fields are required");
  });
});

afterAll(async () => {
  if (consoleErrorSpy) {
    consoleErrorSpy.mockRestore();
  }

  await pool.end();
});