/* ============================================================
   PROFILE PAGE CONTROLLER
   Place in: boundary/profilePage.js

   Uses:
   GET /users/:id
   PUT /users/:id
   GET /profiles/:id
============================================================ */

/* =========================
   ELEMENTS
========================= */
const userIdInput = document.getElementById("userIdInput");
const profileIdInput = document.getElementById("profileIdInput");

const firstNameInput = document.getElementById("firstNameInput");
const lastNameInput = document.getElementById("lastNameInput");
const dobInput = document.getElementById("dobInput");
const phoneInput = document.getElementById("phoneInput");
const roleInput = document.getElementById("roleInput");

const profileForm = document.getElementById("profileForm");
const editProfileBtn = document.getElementById("editProfileBtn");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const profileMessage = document.getElementById("profileMessage");

const profileFullName = document.getElementById("profileFullName");
const profileEmail = document.getElementById("profileEmail");
const profileAvatar = document.getElementById("profileAvatar");

const headerAvatar = document.getElementById("headerAvatar");
const headerName = document.getElementById("headerName");
const signOutBtn = document.getElementById("signOutBtn");

const adminBackBtn = document.getElementById("adminBackBtn");
const publicNavItems = document.querySelectorAll(".public-nav-item");

/* =========================
   LOCAL STORAGE
========================= */
function getLoggedInUser() {
  const saved = localStorage.getItem("loggedInUser");

  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved);

    if (parsed && parsed.user && parsed.user.user_id) {
      return parsed.user;
    }

    return parsed;
  } catch (error) {
    localStorage.removeItem("loggedInUser");
    return null;
  }
}

function saveLoggedInUser(user) {
  localStorage.setItem("loggedInUser", JSON.stringify(user));
}

function getLoggedInUserId() {
  const user = getLoggedInUser();

  if (!user) {
    return null;
  }

  return user.user_id || user.userId || user.id || null;
}

function isLoggedIn() {
  return getLoggedInUserId() !== null;
}

function getUserRole() {
  const user = getLoggedInUser();

  if (!user || !user.role_name) {
    return "";
  }

  return String(user.role_name).toLowerCase().trim();
}

function isDonee() {
  return getUserRole() === "donee";
}

function isFundraiser() {
  const role = getUserRole();

  return (
    role === "fundraiser" ||
    role === "fund raiser" ||
    role === "fund_raiser"
  );
}

function requireLogin(event) {
  if (isLoggedIn()) {
    return true;
  }

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  alert("Please sign in first to continue.");
  window.location.href = "login.html";

  return false;
}

/* =========================
   ROLE BLOCKING
========================= */
function blockFundraiseIfDonee(event) {
  if (!isLoggedIn()) {
    return requireLogin(event);
  }

  if (isDonee()) {
    event.preventDefault();
    event.stopPropagation();

    alert("Donee users cannot access Fundraise functions.");
    return false;
  }

  return true;
}

function blockDonateIfFundraiser(event) {
  if (!isLoggedIn()) {
    return requireLogin(event);
  }

  if (isFundraiser()) {
    event.preventDefault();
    event.stopPropagation();

    alert("Fundraiser users cannot access Donee functions.");
    return false;
  }

  return true;
}

/* =========================
   DROPDOWN SETUP
========================= */
function setupDropdown(buttonId, dropdownId, blockFunction) {
  const button = document.getElementById(buttonId);
  const dropdown = document.getElementById(dropdownId);

  if (!button || !dropdown) return;

  button.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    if (blockFunction) {
      const allowed = blockFunction(event);

      if (!allowed) {
        return;
      }
    }

    document.querySelectorAll(".nav-dropdown").forEach(function (item) {
      if (item !== dropdown) {
        item.classList.remove("open");
      }
    });

    dropdown.classList.toggle("open");
  });

  dropdown.addEventListener("click", function (event) {
    event.stopPropagation();
  });
}

/* =========================
   HEADER DROPDOWNS
========================= */

// Fundraiser cannot open Donee dropdown
setupDropdown("donateMenuBtn", "donateDropdown", blockDonateIfFundraiser);

// Donee cannot open Fundraise dropdown
setupDropdown("fundraiseMenuBtn", "fundraiseDropdown", blockFundraiseIfDonee);

// Normal dropdowns
setupDropdown("aboutMenuBtn", "aboutDropdown");
setupDropdown("profileMenuBtn", "profileDropdown");

document.addEventListener("click", function () {
  document.querySelectorAll(".nav-dropdown").forEach(function (item) {
    item.classList.remove("open");
  });
});

/* =========================
   PROTECT LINKS BASED ON ROLE
========================= */
function protectRoleLinks() {
  const allLinks = document.querySelectorAll("a");

  allLinks.forEach(function (link) {
    const href = link.getAttribute("href");

    if (!href) return;

    const lowerHref = href.toLowerCase();

    const isDoneeLink =
      lowerHref.includes("browsecampaign.html") ||
      lowerHref.includes("mydonation.html") ||
      lowerHref.includes("mydonationview.html") ||
      lowerHref.includes("campaigndetail.html");

    const isFundraiserLink =
      lowerHref.includes("startcampaign.html") ||
      lowerHref.includes("mycampaign.html");

    if (isDoneeLink) {
      link.addEventListener("click", function (event) {
        blockDonateIfFundraiser(event);
      });
    }

    if (isFundraiserLink) {
      link.addEventListener("click", function (event) {
        blockFundraiseIfDonee(event);
      });
    }
  });
}

protectRoleLinks();

/* =========================
   HELPERS
========================= */
function setMessage(message, isError = false) {
  if (!profileMessage) return;

  profileMessage.textContent = message;
  profileMessage.classList.toggle("error", isError);
}

function setInputsDisabled(disabled) {
  if (firstNameInput) firstNameInput.disabled = disabled;
  if (lastNameInput) lastNameInput.disabled = disabled;
  if (dobInput) dobInput.disabled = disabled;
  if (phoneInput) phoneInput.disabled = disabled;

  // Role is always read-only
  if (roleInput) {
    roleInput.disabled = true;
  }

  if (saveProfileBtn) {
    saveProfileBtn.disabled = disabled;
  }
}

function formatDateForInput(dob) {
  if (!dob) return "";

  return String(dob).split("T")[0];
}

async function readJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      message: text,
    };
  }
}

function isAdminOrPlatformManager(roleName) {
  const role = String(roleName || "").toLowerCase();

  return (
    role.includes("admin") ||
    role.includes("platform manager")
  );
}

function applyRoleBasedHeader(roleName) {
  const isAdminRole = isAdminOrPlatformManager(roleName);

  publicNavItems.forEach(function (item) {
    item.classList.toggle("hidden", isAdminRole);
  });

  if (adminBackBtn) {
    adminBackBtn.classList.toggle("hidden", !isAdminRole);
  }
}

function goBackForAdminRole(roleName) {
  const role = String(roleName || "").toLowerCase();

  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  if (role.includes("platform manager")) {
    window.location.href = "categoryManagement.html";
    return;
  }

  if (role.includes("admin")) {
    window.location.href = "userManagement.html";
    return;
  }

  window.location.href = "homepage.html";
}

if (adminBackBtn) {
  adminBackBtn.addEventListener("click", function () {
    const roleName = roleInput ? roleInput.value : "";
    goBackForAdminRole(roleName);
  });
}

/* =========================
   LOAD ROLE NAME
========================= */
async function loadRoleName(user) {
  if (user.role_name) {
    return user.role_name;
  }

  if (!user.profile_id) {
    return "No Role";
  }

  try {
    const response = await fetch(`/profiles/${user.profile_id}`);
    const profile = await readJsonResponse(response);

    if (!response.ok || !profile) {
      return "No Role";
    }

    return profile.role_name || "No Role";
  } catch (error) {
    console.error("Load role error:", error);
    return "No Role";
  }
}

/* =========================
   RENDER USER
========================= */
async function renderUser(user) {
  const firstName = user.f_name || "";
  const lastName = user.l_name || "";
  const email = user.email || "";
  const phone = user.phone || "";
  const dob = user.dob || "";
  const profileId = user.profile_id || "";

  const roleName = await loadRoleName(user);

  const updatedStorageUser = {
    ...user,
    role_name: roleName,
  };

  saveLoggedInUser(updatedStorageUser);

  applyRoleBasedHeader(roleName);

  const fullName = `${firstName} ${lastName}`.trim() || "User";
  const initial = (firstName || email || "U").charAt(0).toUpperCase();

  if (userIdInput) userIdInput.value = user.user_id || "";
  if (profileIdInput) profileIdInput.value = profileId;

  if (firstNameInput) firstNameInput.value = firstName;
  if (lastNameInput) lastNameInput.value = lastName;
  if (dobInput) dobInput.value = formatDateForInput(dob);
  if (phoneInput) phoneInput.value = phone;
  if (roleInput) roleInput.value = roleName;

  if (profileFullName) profileFullName.textContent = fullName;
  if (profileEmail) profileEmail.textContent = email;
  if (profileAvatar) profileAvatar.textContent = initial;

  if (headerAvatar) {
    headerAvatar.textContent = initial;
  }

  if (headerName) {
    headerName.textContent = firstName || roleName || "User";
  }
}

/* =========================
   LOAD USER DETAILS
   GET /users/:id
========================= */
async function loadProfile() {
  const loggedInUser = getLoggedInUser();

  if (!loggedInUser || !loggedInUser.user_id) {
    setMessage("No logged in user found. Please login again.", true);
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`/users/${loggedInUser.user_id}`);
    const data = await readJsonResponse(response);

    if (!response.ok) {
      setMessage(data.message || "Failed to load profile.", true);
      return;
    }

    if (!data) {
      setMessage("User profile was not found.", true);
      return;
    }

    await renderUser(data);
    setInputsDisabled(true);
    setMessage("");
  } catch (error) {
    console.error("Load profile error:", error);
    setMessage("Cannot connect to server.", true);
  }
}

/* =========================
   EDIT PROFILE
========================= */
if (editProfileBtn) {
  editProfileBtn.addEventListener("click", function () {
    setInputsDisabled(false);
    setMessage("You can now edit your personal information. Role cannot be modified here.", false);
  });
}

/* =========================
   UPDATE USER DETAILS
   PUT /users/:id
========================= */
if (profileForm) {
  profileForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const userId = userIdInput.value;
    const profileId = profileIdInput.value;

    const updatedUser = {
      f_name: firstNameInput.value.trim(),
      l_name: lastNameInput.value.trim(),
      dob: dobInput.value,
      phone: phoneInput.value.trim(),
      email: profileEmail.textContent.trim(),
      profile_id: profileId,
    };

    if (
      !updatedUser.f_name ||
      !updatedUser.l_name ||
      !updatedUser.dob ||
      !updatedUser.phone
    ) {
      setMessage("Please fill in all fields.", true);
      return;
    }

    try {
      const response = await fetch(`/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        setMessage(data.message || "Failed to update profile.", true);
        return;
      }

      await renderUser(data);
      setInputsDisabled(true);
      setMessage("Profile updated successfully.", false);
    } catch (error) {
      console.error("Update profile error:", error);
      setMessage("Cannot connect to server.", true);
    }
  });
}

/* =========================
   SIGN OUT
========================= */
if (signOutBtn) {
  signOutBtn.addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.removeItem("loggedInUser");

    window.location.href = "login.html";
  });
}

/* =========================
   START PAGE
========================= */
setInputsDisabled(true);
loadProfile();