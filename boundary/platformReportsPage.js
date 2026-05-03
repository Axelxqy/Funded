/* ============================================================
   PLATFORM REPORTS FRONTEND CONTROLLER
   Place in: boundary/platformReportsPage.js
============================================================ */

const API_BASE_URL = "http://localhost:3000";

let dailyReport = null;
let weeklyReport = null;
let monthlyReport = null;

window.addEventListener("DOMContentLoaded", async function () {
  setupDropdown("profileMenuBtn", "profileDropdown");
  renderHeaderProfile();
  setupSignOut();

  await loadAllReports();
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
    const parsed = JSON.parse(saved);

    if (parsed && parsed.user && parsed.user.user_id) {
      return parsed.user;
    }

    return parsed;
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
   SAFE JSON
============================================================ */
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

/* ============================================================
   LOAD REPORTS
============================================================ */
async function loadAllReports() {
  await loadDailyReport();
  await loadWeeklyReport();
  await loadMonthlyReport();

  renderDailyReport();
  renderWeeklyReport();
  renderMonthlyReport();
}

async function loadDailyReport() {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/daily`);
    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Failed to load daily report.");
    }

    dailyReport = data;
  } catch (error) {
    console.error("Daily report error:", error);
    dailyReport = {
      summary: {
        new_users: 0,
        new_campaigns: 0,
        total_donations: 0,
        total_views: 0,
      },
      logs: [],
    };
  }
}

async function loadWeeklyReport() {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/weekly`);
    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Failed to load weekly report.");
    }

    weeklyReport = data;
  } catch (error) {
    console.error("Weekly report error:", error);
    weeklyReport = {
      summary: {
        new_users: 0,
        new_campaigns: 0,
        total_donations: 0,
        total_views: 0,
      },
      rows: [],
    };
  }
}

async function loadMonthlyReport() {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/monthly`);
    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Failed to load monthly report.");
    }

    monthlyReport = data;
  } catch (error) {
    console.error("Monthly report error:", error);
    monthlyReport = {
      summary: {
        new_users: 0,
        new_campaigns: 0,
        total_donations: 0,
        total_views: 0,
      },
      rows: [],
    };
  }
}

/* ============================================================
   RENDER HELPERS
============================================================ */
function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatMoney(value) {
  return "SGD " + Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function safeText(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function getStatusClass(status) {
  const value = String(status || "").toLowerCase();

  if (
    value.includes("success") ||
    value.includes("active") ||
    value.includes("viewed") ||
    value.includes("ongoing")
  ) {
    return "status-active";
  }

  if (
    value.includes("suspend") ||
    value.includes("failed") ||
    value.includes("ended")
  ) {
    return "status-suspended";
  }

  return "status-active";
}

function setStatValues(sectionId, summary, periodText) {
  const section = document.getElementById(sectionId);

  if (!section) return;

  const values = section.querySelectorAll(".stat-value");
  const labels = section.querySelectorAll(".stat-label");

  if (values[0]) values[0].textContent = formatNumber(summary.new_users);
  if (values[1]) values[1].textContent = formatNumber(summary.new_campaigns);
  if (values[2]) values[2].textContent = formatMoney(summary.total_donations);
  if (values[3]) values[3].textContent = formatNumber(summary.total_views);

  if (labels[0]) labels[0].textContent = "New Users " + periodText;
  if (labels[1]) labels[1].textContent = "Campaigns " + periodText;
  if (labels[2]) labels[2].textContent = "Donations " + periodText;
  if (labels[3]) labels[3].textContent = "Page Views " + periodText;
}

/* ============================================================
   RENDER DAILY
============================================================ */
function renderDailyReport() {
  if (!dailyReport) return;

  setStatValues("report-daily", dailyReport.summary, "Today");

  const section = document.getElementById("report-daily");

  if (!section) return;

  const tbody = section.querySelector("tbody");

  if (!tbody) return;

  const logs = dailyReport.logs || [];

  if (logs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">No activity log today.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = logs
    .map(function (log) {
      return `
        <tr>
          <td>${formatTime(log.log_time)}</td>
          <td>${safeText(log.user_name)}</td>
          <td>${safeText(log.action)}</td>
          <td>
            <span class="status-badge ${getStatusClass(log.status)}">
              ${safeText(log.status)}
            </span>
          </td>
        </tr>
      `;
    })
    .join("");
}

/* ============================================================
   RENDER WEEKLY
============================================================ */
function renderWeeklyReport() {
  if (!weeklyReport) return;

  setStatValues("report-weekly", weeklyReport.summary, "This Week");

  const section = document.getElementById("report-weekly");

  if (!section) return;

  const tbody = section.querySelector("tbody");

  if (!tbody) return;

  const rows = weeklyReport.rows || [];

  if (rows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">No weekly report found.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rows
    .map(function (row) {
      return `
        <tr>
          <td>${safeText(row.label).trim()}</td>
          <td>${formatNumber(row.new_users)}</td>
          <td>${formatMoney(row.total_donations)}</td>
          <td>${formatNumber(row.new_campaigns)}</td>
          <td>${formatNumber(row.total_views)}</td>
        </tr>
      `;
    })
    .join("");
}

/* ============================================================
   RENDER MONTHLY
============================================================ */
function renderMonthlyReport() {
  if (!monthlyReport) return;

  setStatValues("report-monthly", monthlyReport.summary, "This Month");

  const section = document.getElementById("report-monthly");

  if (!section) return;

  const tbody = section.querySelector("tbody");

  if (!tbody) return;

  const rows = monthlyReport.rows || [];

  if (rows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">No monthly report found.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rows
    .map(function (row) {
      return `
        <tr>
          <td>${safeText(row.label)}</td>
          <td>${formatNumber(row.new_users)}</td>
          <td>${formatMoney(row.total_donations)}</td>
          <td>${formatNumber(row.new_campaigns)}</td>
          <td>${formatNumber(row.total_views)}</td>
        </tr>
      `;
    })
    .join("");
}

/* ============================================================
   REPORT TABS
============================================================ */
function switchReport(button, tab) {
  document.querySelectorAll(".report-tab").forEach(function (item) {
    item.classList.remove("active");
  });

  button.classList.add("active");

  document.querySelectorAll(".report-section").forEach(function (section) {
    section.classList.add("hidden");
  });

  const activeSection = document.getElementById("report-" + tab);

  if (activeSection) {
    activeSection.classList.remove("hidden");
  }
}