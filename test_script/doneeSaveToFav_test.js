/**
 * @jest-environment node
 */

const request = require("supertest");
const app = require("../index");
const pool = require("../helper/db.js");

let userRole;
let doneeUser;
let fundraisingActivity;
let consoleErrorSpy;

describe("Donee Save Fundraising Activity to Favourites", () => {
  beforeAll(async () => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Get normal user role
    const roleResult = await pool.query(
      `
      SELECT profile_id, role_name
      FROM public.user_profile
      WHERE LOWER(role_name) = 'user'
      LIMIT 1;
      `
    );

    userRole = roleResult.rows[0];

    expect(userRole).toBeDefined();
    expect(userRole.role_name.toLowerCase()).toBe("user");

    // Create test user / donee account
    const uniqueEmail = `donee_${Date.now()}@gmail.com`;

    const userResponse = await request(app)
      .post("/users")
      .send({
        email: uniqueEmail,
        password: "Test123!",
        f_name: "Test",
        l_name: "Donee",
        dob: "2004-01-01",
        phone: "1234567890",
        profile_id: userRole.profile_id,
      });

    expect(userResponse.statusCode).toBe(201);

    doneeUser = userResponse.body.user;

    expect(doneeUser).toBeDefined();
    expect(doneeUser).toHaveProperty("user_id");

    // Get one existing fundraising activity
    const activityResult = await pool.query(
      `
      SELECT activity_id
      FROM public.fr_activity
      LIMIT 1;
      `
    );

    fundraisingActivity = activityResult.rows[0];

    expect(fundraisingActivity).toBeDefined();
    expect(fundraisingActivity).toHaveProperty("activity_id");
  });

  beforeEach(async () => {
    if (doneeUser && fundraisingActivity) {
      await pool.query(
        `
        DELETE FROM public.fav_fra
        WHERE user_id = $1 AND activity_id = $2;
        `,
        [doneeUser.user_id, fundraisingActivity.activity_id]
      );
    }
  });

  test("Should allow donee to save a fundraising activity to favourites", async () => {
    const response = await request(app)
      .post("/fav")
      .send({
        user_id: doneeUser.user_id,
        activity_id: fundraisingActivity.activity_id,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("message");

    const checkResult = await pool.query(
      `
      SELECT fav_id, user_id, activity_id
      FROM public.fav_fra
      WHERE user_id = $1 AND activity_id = $2;
      `,
      [doneeUser.user_id, fundraisingActivity.activity_id]
    );

    expect(checkResult.rows.length).toBe(1);
    expect(Number(checkResult.rows[0].activity_id)).toBe(
      Number(fundraisingActivity.activity_id)
    );
    expect(checkResult.rows[0].user_id).toBe(doneeUser.user_id);
  });

  test("Should allow donee to view saved favourite fundraising activities", async () => {
    await request(app)
      .post("/fav")
      .send({
        user_id: doneeUser.user_id,
        activity_id: fundraisingActivity.activity_id,
      });

    const response = await request(app).get(`/fav/${doneeUser.user_id}`);

    expect(response.statusCode).toBe(200);

    const checkResult = await pool.query(
      `
      SELECT fav_id, user_id, activity_id
      FROM public.fav_fra
      WHERE user_id = $1 AND activity_id = $2;
      `,
      [doneeUser.user_id, fundraisingActivity.activity_id]
    );

    expect(checkResult.rows.length).toBe(1);
  });

  test("Should allow donee to remove a saved fundraising activity from favourites", async () => {
    await request(app)
      .post("/fav")
      .send({
        user_id: doneeUser.user_id,
        activity_id: fundraisingActivity.activity_id,
      });

    const deleteResponse = await request(app).delete(
      `/fav/user/${doneeUser.user_id}/activity/${fundraisingActivity.activity_id}`
    );

    expect([200, 204]).toContain(deleteResponse.statusCode);

    const checkResult = await pool.query(
      `
      SELECT fav_id, user_id, activity_id
      FROM public.fav_fra
      WHERE user_id = $1 AND activity_id = $2;
      `,
      [doneeUser.user_id, fundraisingActivity.activity_id]
    );

    expect(checkResult.rows.length).toBe(0);
  });
});

afterAll(async () => {
  if (doneeUser) {
    await pool.query(
      `
      DELETE FROM public.fav_fra
      WHERE user_id = $1;
      `,
      [doneeUser.user_id]
    );
  }

  if (doneeUser) {
    await pool.query(
      `
      DELETE FROM public.user_account
      WHERE user_id = $1;
      `,
      [doneeUser.user_id]
    );
  }

  if (consoleErrorSpy) {
    consoleErrorSpy.mockRestore();
  }

  await pool.end();
});