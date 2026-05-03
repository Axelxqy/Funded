/* ============================================================
   PLATFORM REPORTS FRONTEND CONTROLLER
   Place in: boundary/platformReportsController.js
============================================================ */

window.addEventListener("DOMContentLoaded", () => {
  setupDropdown("profileMenuBtn", "profileDropdown");
  renderHeaderProfile();
  setupSignOut();
});

/* ============================================================
   HEADER PROFILE
============================================================ */
function setupDropdown(buttonId, dropdownId) {
  const button = document.getElementById(buttonId);
  const dropdown = document.getElementById(dropdownId);

  if (!button || !dropdown) return;

  button.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

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

document.addEventListener("click", function () {
  document.querySelectorAll(".nav-dropdown").forEach(function (item) {
    item.classList.remove("open");
  });
});

function getLoggedInUser() {
  const saved = localStorage.getItem("loggedInUser");

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    return null;
  }
}

function renderHeaderProfile() {
  const headerAvatar = document.getElementById("headerAvatar");
  const headerName = document.getElementById("headerName");

  const user = getLoggedInUser();

  if (!user) {
    if (headerAvatar) headerAvatar.textContent = "P";
    if (headerName) headerName.textContent = "Platform Manager";
    return;
  }

  const firstName = user.f_name || "";
  const email = user.email || "";
  const role = user.role_name || "";
  const initial = (firstName || email || "P").charAt(0).toUpperCase();

  if (headerAvatar) headerAvatar.textContent = initial;
  if (headerName) headerName.textContent = firstName || role || "Platform Manager";
}

function setupSignOut() {
  const signOutBtn = document.getElementById("signOutBtn");

  if (!signOutBtn) return;

  signOutBtn.addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.removeItem("loggedInUser");
    sessionStorage.removeItem("hh_session");

    window.location.href = "login.html";
  });
}

/* ============================================================
   REPORT TABS
============================================================ */
function switchReport(button, tab) {
  document.querySelectorAll(".report-tab").forEach((item) => {
    item.classList.remove("active");
  });

  button.classList.add("active");

  document.querySelectorAll(".report-section").forEach((section) => {
    section.classList.add("hidden");
  });

  const activeSection = document.getElementById("report-" + tab);

  if (activeSection) {
    activeSection.classList.remove("hidden");
  }
}