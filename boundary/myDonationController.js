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

setupDropdown("donateMenuBtn", "donateDropdown");
setupDropdown("fundraiseMenuBtn", "fundraiseDropdown");
setupDropdown("aboutMenuBtn", "aboutDropdown");
setupDropdown("profileMenuBtn", "profileDropdown");

/* =========================
   LOGIN / PROFILE
========================= */
const signinHeaderBtn = document.getElementById("signinHeaderBtn");
const profileDropdown = document.getElementById("profileDropdown");
const headerAvatar = document.getElementById("headerAvatar");
const headerName = document.getElementById("headerName");
const signOutBtn = document.getElementById("signOutBtn");

function getLoggedInUser() {
  const saved = localStorage.getItem("loggedInUser");

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    localStorage.removeItem("loggedInUser");
    return null;
  }
}

function isLoggedIn() {
  const user = getLoggedInUser();
  return user && user.user_id;
}

function requireLogin(event) {
  if (isLoggedIn()) {
    return;
  }

  event.preventDefault();
  alert("Please sign in first to continue.");
  window.location.href = "login.html";
}

document.querySelectorAll(".auth-required").forEach(function (link) {
  link.addEventListener("click", requireLogin);
});

function renderHeaderAuth() {
  const user = getLoggedInUser();

  if (!user) {
    if (signinHeaderBtn) signinHeaderBtn.classList.remove("hidden");
    if (profileDropdown) profileDropdown.classList.add("hidden");

    if (headerAvatar) headerAvatar.textContent = "U";
    if (headerName) headerName.textContent = "User";
    return;
  }

  if (signinHeaderBtn) signinHeaderBtn.classList.add("hidden");
  if (profileDropdown) profileDropdown.classList.remove("hidden");

  const firstName = user.f_name || "";
  const email = user.email || "";
  const initial = (firstName || email || "U").charAt(0).toUpperCase();

  if (headerAvatar) headerAvatar.textContent = initial;
  if (headerName) headerName.textContent = firstName || "User";
}

if (signOutBtn) {
  signOutBtn.addEventListener("click", function (event) {
    event.preventDefault();
    localStorage.removeItem("loggedInUser");
    window.location.href = "homepage.html";
  });
}

renderHeaderAuth();

if (!isLoggedIn()) {
  alert("Please sign in first to view your donations.");
  window.location.href = "login.html";
}

/* =========================
   API / ELEMENTS
========================= */
const API_BASE_URL = "http://localhost:3000";

const donationTableBody = document.getElementById("donationTableBody");
const donationSearch = document.getElementById("donationSearch");

const totalCampaigns = document.getElementById("totalCampaigns");
const totalDonations = document.getElementById("totalDonations");
const firstDonation = document.getElementById("firstDonation");
const latestDonation = document.getElementById("latestDonation");

const startDateInput = document.getElementById("startDateInput");
const endDateInput = document.getElementById("endDateInput");
const applyDateFilterBtn = document.getElementById("applyDateFilterBtn");
const clearDateFilterBtn = document.getElementById("clearDateFilterBtn");
const paginationBox = document.getElementById("paginationBox");

/* =========================
   STATE
========================= */
const RECORDS_PER_PAGE = 5;

let currentPage = 1;

// This stores data from backend view/search controller
let backendDonationRecords = [];

// This stores data after local date filter
let donationRecords = [];

let activeStartDate = "";
let activeEndDate = "";

/* =========================
   HELPERS
========================= */
function formatDisplayDate(dateValue) {
  if (!dateValue) return "-";

  const dateObj = new Date(dateValue);

  if (Number.isNaN(dateObj.getTime())) {
    return "-";
  }

  const d = String(dateObj.getDate()).padStart(2, "0");

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const m = months[dateObj.getMonth()];
  const y = dateObj.getFullYear();

  return d + " " + m + " " + y;
}

function getDateOnlyTime(dateValue) {
  const dateObj = new Date(dateValue);

  if (Number.isNaN(dateObj.getTime())) {
    return 0;
  }

  return new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate()
  ).getTime();
}

function getDateTime(dateValue) {
  const dateObj = new Date(dateValue);

  if (Number.isNaN(dateObj.getTime())) {
    return 0;
  }

  return dateObj.getTime();
}

function getCategoryClass(categoryName) {
  if (!categoryName) {
    return "others";
  }

  const category = categoryName.toLowerCase();

  if (category.includes("health") || category.includes("medical")) {
    return "health";
  }

  if (category.includes("education")) {
    return "education";
  }

  if (category.includes("animal")) {
    return "animals";
  }

  if (category.includes("disaster") || category.includes("relief")) {
    return "disaster";
  }

  if (category.includes("community")) {
    return "community";
  }

  return "others";
}

/* =========================
   LOCAL DATE RANGE FILTER
========================= */
function applyDateRangeFilter(records) {
  let filteredRecords = records.slice();

  if (activeStartDate) {
    const startTime = new Date(activeStartDate + "T00:00:00").getTime();

    filteredRecords = filteredRecords.filter(function (record) {
      return getDateOnlyTime(record.date) >= startTime;
    });
  }

  if (activeEndDate) {
    const endTime = new Date(activeEndDate + "T00:00:00").getTime();

    filteredRecords = filteredRecords.filter(function (record) {
      return getDateOnlyTime(record.date) <= endTime;
    });
  }

  return filteredRecords;
}

/* =========================
   VIEW DONATION HISTORY
   GET /donations/:user_id
========================= */
async function loadDonationHistoryFromDatabase() {
  const user = getLoggedInUser();

  if (!user || !user.user_id) {
    return;
  }

  if (donationTableBody) {
    donationTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-row">Loading donations...</td>
      </tr>
    `;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/donations/${user.user_id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load donations.");
    }

    backendDonationRecords = Array.isArray(data) ? data : data.donations || [];

    currentPage = 1;
    renderDonations();
  } catch (error) {
    console.error("Load donation history error:", error);

    backendDonationRecords = [];
    donationRecords = [];

    if (donationTableBody) {
      donationTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-row">Failed to load donations.</td>
        </tr>
      `;
    }

    renderStats([]);
    renderPagination([]);
  }
}

/* =========================
   SEARCH DONATION HISTORY
   GET /donations/:user_id/search/:keyword
========================= */
async function searchDonationHistoryFromDatabase() {
  const user = getLoggedInUser();

  if (!user || !user.user_id) {
    return;
  }

  const keyword = donationSearch ? donationSearch.value.trim() : "";

  if (keyword === "") {
    await loadDonationHistoryFromDatabase();
    return;
  }

  if (donationTableBody) {
    donationTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-row">Searching donations...</td>
      </tr>
    `;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/donations/${user.user_id}/search/${encodeURIComponent(keyword)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to search donations.");
    }

    backendDonationRecords = Array.isArray(data) ? data : data.donations || [];

    currentPage = 1;
    renderDonations();
  } catch (error) {
    console.error("Search donation history error:", error);

    backendDonationRecords = [];
    donationRecords = [];

    if (donationTableBody) {
      donationTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-row">Failed to search donations.</td>
        </tr>
      `;
    }

    renderStats([]);
    renderPagination([]);
  }
}

/* =========================
   STATS
========================= */
function renderStats(records) {
  const uniqueCampaignIds = new Set(
    records.map(function (record) {
      return record.activity_id;
    })
  );

  if (totalCampaigns) {
    totalCampaigns.textContent = uniqueCampaignIds.size;
  }

  if (totalDonations) {
    totalDonations.textContent = records.length;
  }

  if (records.length === 0) {
    if (firstDonation) firstDonation.textContent = "-";
    if (latestDonation) latestDonation.textContent = "-";
    return;
  }

  const sortedOldestFirst = records.slice().sort(function (a, b) {
    return getDateTime(a.date) - getDateTime(b.date);
  });

  const firstRecord = sortedOldestFirst[0];
  const latestRecord = sortedOldestFirst[sortedOldestFirst.length - 1];

  if (firstDonation) {
    firstDonation.textContent = formatDisplayDate(firstRecord.date);
  }

  if (latestDonation) {
    latestDonation.textContent = formatDisplayDate(latestRecord.date);
  }
}

/* =========================
   TABLE
========================= */
function renderTable(records) {
  if (!donationTableBody) return;

  donationTableBody.innerHTML = "";

  if (records.length === 0) {
    donationTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-row">No donation record found.</td>
      </tr>
    `;
    return;
  }

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const pageRecords = records.slice(startIndex, endIndex);

  pageRecords.forEach(function (record) {
    const row = document.createElement("tr");

    const campaignTitle = record.activity_name || "Untitled Campaign";
    const campaignDesc = record.description || "";
    const categoryName = record.category_name || "Others";
    const categoryClass = getCategoryClass(categoryName);
    const amount = Number(record.amount) || 0;

    row.innerHTML = `
      <td>
        <div class="campaign-cell no-image-campaign-cell">
          <div>
            <div class="campaign-cell-title">${campaignTitle}</div>
            <div class="campaign-cell-desc">${campaignDesc}</div>
          </div>
        </div>
      </td>

      <td>
        <span class="category-pill ${categoryClass}">
          ${categoryName}
        </span>
      </td>

      <td>${formatDisplayDate(record.date)}</td>

      <td>SGD ${amount.toFixed(2)}</td>

      <td>
        <span class="status-pill">Successful</span>
      </td>

      <td>
        <button class="view-campaign-btn" data-id="${record.activity_id}" type="button">
          👁 View Campaign
        </button>
      </td>
    `;

    donationTableBody.appendChild(row);
  });

  document.querySelectorAll(".view-campaign-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      window.location.href = "myDonationView.html?id=" + button.dataset.id;
    });
  });
}

/* =========================
   PAGINATION
========================= */
function renderPagination(records) {
  if (!paginationBox) return;

  paginationBox.innerHTML = "";

  const totalPages = Math.ceil(records.length / RECORDS_PER_PAGE);

  if (totalPages <= 1) {
    return;
  }

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "page-btn";
  prevBtn.textContent = "‹";
  prevBtn.disabled = currentPage === 1;

  prevBtn.addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      renderDonations();
    }
  });

  paginationBox.appendChild(prevBtn);

  for (let page = 1; page <= totalPages; page++) {
    const pageBtn = document.createElement("button");
    pageBtn.type = "button";
    pageBtn.className = "page-btn" + (page === currentPage ? " active" : "");
    pageBtn.textContent = page;

    pageBtn.addEventListener("click", function () {
      currentPage = page;
      renderDonations();
    });

    paginationBox.appendChild(pageBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "page-btn";
  nextBtn.textContent = "›";
  nextBtn.disabled = currentPage === totalPages;

  nextBtn.addEventListener("click", function () {
    if (currentPage < totalPages) {
      currentPage++;
      renderDonations();
    }
  });

  paginationBox.appendChild(nextBtn);
}

/* =========================
   MAIN RENDER
========================= */
function renderDonations() {
  donationRecords = applyDateRangeFilter(backendDonationRecords);

  const totalPages = Math.ceil(donationRecords.length / RECORDS_PER_PAGE) || 1;

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  renderStats(donationRecords);
  renderTable(donationRecords);
  renderPagination(donationRecords);
}

/* =========================
   EVENTS
========================= */
if (donationSearch) {
  donationSearch.addEventListener("input", function () {
    currentPage = 1;
    searchDonationHistoryFromDatabase();
  });
}

if (applyDateFilterBtn) {
  applyDateFilterBtn.addEventListener("click", function () {
    activeStartDate = startDateInput ? startDateInput.value : "";
    activeEndDate = endDateInput ? endDateInput.value : "";

    if (activeStartDate && activeEndDate && activeStartDate > activeEndDate) {
      alert("Start date cannot be later than end date.");
      return;
    }

    currentPage = 1;
    renderDonations();
  });
}

if (clearDateFilterBtn) {
  clearDateFilterBtn.addEventListener("click", function () {
    if (startDateInput) startDateInput.value = "";
    if (endDateInput) endDateInput.value = "";

    activeStartDate = "";
    activeEndDate = "";
    currentPage = 1;

    renderDonations();
  });
}

/* =========================
   CLOSE DROPDOWNS
========================= */
document.addEventListener("click", function () {
  document.querySelectorAll(".nav-dropdown").forEach(function (item) {
    item.classList.remove("open");
  });
});

/* =========================
   START PAGE
========================= */
loadDonationHistoryFromDatabase();