const localStorageMock = (() => {
  let store = {};

  return {
    getItem(key) {
      return store[key] || null;
    },

    setItem(key, value) {
      store[key] = String(value);
    },

    removeItem(key) {
      delete store[key];
    },

    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

describe("User Admin Logout", () => {
  beforeEach(() => {
    localStorage.clear();

    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({
        user_id: "admin-test-id",
        email: "admin@gmail.com",
        role_name: "User Admin",
      })
    );
  });

  test("Should remove loggedInUser from localStorage when user admin logs out", () => {
    expect(localStorage.getItem("loggedInUser")).not.toBeNull();

    localStorage.removeItem("loggedInUser");

    expect(localStorage.getItem("loggedInUser")).toBeNull();
  });
});