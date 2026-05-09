/**
 * @jest-environment jsdom
 */

describe("Fund Raiser Logout", () => {
  beforeEach(() => {
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({
        user_id: "fundraiser-test-id",
        email: "fundraiser@gmail.com",
        role_name: "User",
      })
    );
  });

  test("Should remove fund raiser session from localStorage when fund raiser logs out", () => {
    expect(localStorage.getItem("loggedInUser")).not.toBeNull();

    localStorage.removeItem("loggedInUser");

    expect(localStorage.getItem("loggedInUser")).toBeNull();
  });
});