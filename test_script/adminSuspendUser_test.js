/**
 * @jest-environment node
 *
 * User Story #6 - User Admin Suspends User Account
 *
 * Normal Flow : Admin suspends an existing active user → suspended toggles to true
 * AF1         : User Not Found → 400 + "User not found."
 * AF2         : Invalid Input (non-numeric ID) → 400
 */

const request = require("supertest");
const app = require("../index");
const pool = require("../helper/db.js");

let consoleErrorSpy;
let testUserId;

// ---------------------------------------------------------------------------
// Helper: create a throwaway user to suspend
// ---------------------------------------------------------------------------
async function createTestUser() {
  const profileResult = await pool.query(
    `SELECT profile_id FROM public.user_profile
     WHERE LOWER(role_name) = 'user'
     LIMIT 1;`
  );
  const profileId = profileResult.rows[0].profile_id;

  const uniqueEmail = `suspend_target_${Date.now()}@gmail.com`;

  const response = await request(app)
    .post("/users")
    .send({
      email: uniqueEmail,
      password: "Test123!",
      f_name: "Suspend",
      l_name: "Target",
      dob: "2000-06-15",
      phone: "0123456789",
      profile_id: profileId,
    });

  return response.body.user.user_id;
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------
beforeAll(async () => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  testUserId = await createTestUser();
});

afterAll(async () => {
  if (consoleErrorSpy) consoleErrorSpy.mockRestore();
  await pool.end();
});

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------
describe("Sprint 0 – Functional Tests: #6 User Admin Suspends User Account", () => {

  // -------------------------------------------------------------------------
  // Normal Flow – suspend toggles successfully
  // -------------------------------------------------------------------------
  test("6 UA suspends an existing active user account successfully", async () => {
    expect(testUserId).toBeDefined();

    const response = await request(app)
      .patch(`/users/${testUserId}/suspend`);

    // Route returns the updated user object
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("suspended");

    // suspended should now be true (was false on creation)
    expect(response.body.suspended).toBe(true);
  });

  // -------------------------------------------------------------------------
  // AF1 – User Not Found
  // -------------------------------------------------------------------------
  test("6 System returns error when trying to suspend a non-existent user (AF1)", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000"; // valid UUID but doesn't exist

    const response = await request(app)
      .patch(`/users/${nonExistentId}/suspend`);

    // entity throws "User not found." → route catches → 400
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("User not found");
  });

  // -------------------------------------------------------------------------
  // AF2 – Invalid Input (non-numeric ID)
  // -------------------------------------------------------------------------
  test("6 System returns error when invalid (non-numeric) account ID is provided (AF2)", async () => {
    const invalidId = "abc";

    const response = await request(app)
      .patch(`/users/${invalidId}/suspend`);

    // Postgres rejects non-integer → route catches → 400
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

});


