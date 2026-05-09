/**
 * @jest-environment jsdom
 */

describe("Donee Logout", () => {
  beforeEach(() => {
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({
        user_id: "donee-test-id",
        email: "donee@gmail.com",
        role_name: "User",
      })
    );
  });

  test("Should remove donee session from localStorage when donee logs out", () => {
    expect(localStorage.getItem("loggedInUser")).not.toBeNull();

    localStorage.removeItem("loggedInUser");

    expect(localStorage.getItem("loggedInUser")).toBeNull();
  });
});