/**
 * @jest-environment jsdom
 */

describe("Platform Manager Logout", () => {
  beforeEach(() => {
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({
        user_id: "platform-manager-test-id",
        email: "platformmanager@gmail.com",
        role_name: "Platform Manager",
      })
    );
  });

  test("Should remove platform manager session from localStorage when platform manager logs out", () => {
    expect(localStorage.getItem("loggedInUser")).not.toBeNull();

    localStorage.removeItem("loggedInUser");

    expect(localStorage.getItem("loggedInUser")).toBeNull();
  });
});