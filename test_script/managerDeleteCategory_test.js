/**
 * @jest-environment node
 *
 * User Story - Platform Manager Deletes Fundraising Activity Category
 *
 * Normal Flow : Platform Manager deletes an existing category successfully
 * AF1         : Category Not Found → 400 + "Delete failed"
 * AF2         : Invalid Category ID → 400
 */

const request = require("supertest");
const app = require("../index");
const pool = require("../helper/db.js");

let consoleErrorSpy;
let testCategoryId;

// ---------------------------------------------------------------------------
// Helper: create temporary category
// ---------------------------------------------------------------------------
async function createTestCategory() {
  const uniqueName = `Test Category ${Date.now()}`;

  const result = await pool.query(
    `
    INSERT INTO public.activity_category
    (
      name,
      description
    )
    VALUES ($1, $2)
    RETURNING *;
    `,
    [uniqueName, "Temporary category for delete test"]
  );

  return result.rows[0].category_id;
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------
beforeAll(async () => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  testCategoryId = await createTestCategory();
});

afterAll(async () => {
  if (consoleErrorSpy) {
    consoleErrorSpy.mockRestore();
  }

  await pool.end();
});

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------
describe("Sprint 0 – Functional Tests: Delete FRA Category", () => {

  // -------------------------------------------------------------------------
  // Normal Flow
  // -------------------------------------------------------------------------
  test("Platform Manager deletes an existing category successfully", async () => {
    expect(testCategoryId).toBeDefined();

    const response = await request(app)
      .delete(`/fra/categories/${testCategoryId}`);

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("deleted successfully");

    expect(response.body).toHaveProperty("category");
    expect(response.body.category).toHaveProperty("category_id");

    expect(response.body.category.category_id).toBe(testCategoryId);
  });

  // -------------------------------------------------------------------------
  // AF1 – Category Not Found
  // -------------------------------------------------------------------------
  test("System returns error when deleting non-existent category (AF1)", async () => {
    const nonExistentId = 99999999;

    const response = await request(app)
      .delete(`/fra/categories/${nonExistentId}`);

    expect(response.statusCode).toBe(400);

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("Delete failed");
  });

  // -------------------------------------------------------------------------
  // AF2 – Invalid Category ID
  // -------------------------------------------------------------------------
  test("System returns error when invalid category ID is provided (AF2)", async () => {
    const invalidId = "abc";

    const response = await request(app)
      .delete(`/fra/categories/${invalidId}`);

    expect(response.statusCode).toBe(400);

    expect(response.body).toHaveProperty("message");
  });

});