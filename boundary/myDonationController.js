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

/* If user opens My Donations without login */
if (!isLoggedIn()) {
  alert("Please sign in first to view your donations.");
  window.location.href = "login.html";
}

/* =========================
   CAMPAIGN DATA
========================= */
const campaigns = [
  {
    id: 1,
    title: "Provide Meals for Children",
    category: "Health",
    categoryClass: "health",
    image:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80",
    shortDesc:
      "Help us provide nutritious meals for children in need. Your support ensures that no child goes to bed hungry."
  },
  {
    id: 2,
    title: "Bringing Health, Joy and Connection to Our Seniors",
    category: "Community",
    categoryClass: "community",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
    shortDesc:
      "Help us bring health, joy and connection to vulnerable seniors through our kindness initiative."
  },
  {
    id: 3,
    title: "Support for Relief Operations in Gaza",
    category: "Disaster",
    categoryClass: "disaster",
    image:
      "https://images.unsplash.com/photo-1618477462146-050d2767eac4?auto=format&fit=crop&w=900&q=80",
    shortDesc:
      "Your support helps provide urgent relief aid and humanitarian assistance for affected communities."
  },
  {
    id: 4,
    title: "SOSD Medical Fundraiser 2026/27",
    category: "Animals",
    categoryClass: "animals",
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
    shortDesc:
      "Support medical treatment and care for rescued animals in need through this SOSD fundraiser."
  }
];

/* =========================
   ELEMENTS
========================= */
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
   PAGINATION STATE
========================= */
const RECORDS_PER_PAGE = 5;
let currentPage = 1;
let activeStartDate = "";
let activeEndDate = "";

/* =========================
   HELPERS
========================= */
function getCampaignById(id) {
  return campaigns.find(function (campaign) {
    return Number(campaign.id) === Number(id);
  });
}

function getDonationRecords() {
  const saved = localStorage.getItem("donation_records");

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    return [];
  }
}

function getCurrentUserDonationRecords() {
  const user = getLoggedInUser();

  if (!user) {
    return [];
  }

  return getDonationRecords().filter(function (record) {
    if (!record.user_id) {
      return true;
    }

    return Number(record.user_id) === Number(user.user_id);
  });
}

function getDonationDateObject(record) {
  if (record.date_iso) {
    const dateFromIso = new Date(record.date_iso);

    if (!Number.isNaN(dateFromIso.getTime())) {
      return dateFromIso;
    }
  }

  if (record.donation_id) {
    const dateFromId = new Date(Number(record.donation_id));

    if (!Number.isNaN(dateFromId.getTime())) {
      return dateFromId;
    }
  }

  if (record.date) {
    const dateFromText = new Date(record.date);

    if (!Number.isNaN(dateFromText.getTime())) {
      return dateFromText;
    }
  }

  return new Date();
}

function formatDisplayDate(dateObj) {
  const d = String(dateObj.getDate()).padStart(2, "0");

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const m = months[dateObj.getMonth()];
  const y = dateObj.getFullYear();

  return d + " " + m + " " + y;
}

function formatInputDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");

  return y + "-" + m + "-" + d;
}

function getDateOnlyTime(dateObj) {
  return new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate()
  ).getTime();
}

/* =========================
   FILTER RECORDS
========================= */
function getFilteredDonationRecords() {
  const keyword = donationSearch ? donationSearch.value.toLowerCase().trim() : "";

  let records = getCurrentUserDonationRecords().map(function (record) {
    const campaign = getCampaignById(record.campaign_id);

    return {
      ...record,
      campaign: campaign,
      dateObj: getDonationDateObject(record)
    };
  });

  records = records.filter(function (record) {
    return record.campaign;
  });

  if (keyword !== "") {
    records = records.filter(function (record) {
      return (
        record.campaign.title.toLowerCase().includes(keyword) ||
        record.campaign.category.toLowerCase().includes(keyword) ||
        formatDisplayDate(record.dateObj).toLowerCase().includes(keyword)
      );
    });
  }

  if (activeStartDate) {
    const startTime = new Date(activeStartDate + "T00:00:00").getTime();

    records = records.filter(function (record) {
      return getDateOnlyTime(record.dateObj) >= startTime;
    });
  }

  if (activeEndDate) {
    const endTime = new Date(activeEndDate + "T00:00:00").getTime();

    records = records.filter(function (record) {
      return getDateOnlyTime(record.dateObj) <= endTime;
    });
  }

  records.sort(function (a, b) {
    return b.dateObj.getTime() - a.dateObj.getTime();
  });

  return records;
}

/* =========================
   STATS
========================= */
function renderStats(records) {
  const uniqueCampaignIds = new Set(
    records.map(function (record) {
      return record.campaign_id;
    })
  );

  totalCampaigns.textContent = uniqueCampaignIds.size;
  totalDonations.textContent = records.length;

  if (records.length === 0) {
    firstDonation.textContent = "-";
    latestDonation.textContent = "-";
    return;
  }

  const sortedOldestFirst = records.slice().sort(function (a, b) {
    return a.dateObj.getTime() - b.dateObj.getTime();
  });

  const firstRecord = sortedOldestFirst[0];
  const latestRecord = sortedOldestFirst[sortedOldestFirst.length - 1];

  firstDonation.textContent = formatDisplayDate(firstRecord.dateObj);
  latestDonation.textContent = formatDisplayDate(latestRecord.dateObj);
}

/* =========================
   TABLE
========================= */
function renderTable(records) {
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
    const campaign = record.campaign;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <div class="campaign-cell">
          <img src="${campaign.image}" alt="${campaign.title}" class="campaign-thumb" />
          <div>
            <div class="campaign-cell-title">${campaign.title}</div>
            <div class="campaign-cell-desc">${campaign.shortDesc}</div>
          </div>
        </div>
      </td>

      <td>
        <span class="category-pill ${campaign.categoryClass}">
          ${campaign.category}
        </span>
      </td>

      <td>${formatDisplayDate(record.dateObj)}</td>

      <td>SGD ${Number(record.amount).toFixed(2)}</td>

      <td>
        <span class="status-pill">${record.status || "Successful"}</span>
      </td>

      <td>
        <button class="view-campaign-btn" data-id="${campaign.id}" type="button">
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
  const records = getFilteredDonationRecords();
  const totalPages = Math.ceil(records.length / RECORDS_PER_PAGE) || 1;

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  renderStats(records);
  renderTable(records);
  renderPagination(records);
}

/* =========================
   EVENTS
========================= */
if (donationSearch) {
  donationSearch.addEventListener("input", function () {
    currentPage = 1;
    renderDonations();
  });
}

if (applyDateFilterBtn) {
  applyDateFilterBtn.addEventListener("click", function () {
    activeStartDate = startDateInput.value;
    activeEndDate = endDateInput.value;

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
    startDateInput.value = "";
    endDateInput.value = "";
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

renderDonations();