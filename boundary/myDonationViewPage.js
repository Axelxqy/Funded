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

document.addEventListener("click", function () {
  document.querySelectorAll(".nav-dropdown").forEach(function (item) {
    item.classList.remove("open");
  });
});

/* =========================
   HEADER PROFILE
========================= */
const headerAvatar = document.getElementById("headerAvatar");
const headerName = document.getElementById("headerName");
const signOutBtn = document.getElementById("signOutBtn");

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

function getLoggedInUserId() {
  const user = getLoggedInUser();

  if (!user) {
    return null;
  }

  return user.user_id || user.userId || user.id || null;
}

function renderHeaderProfile() {
  const user = getLoggedInUser();

  if (!user) {
    if (headerAvatar) {
      headerAvatar.textContent = "U";
    }

    if (headerName) {
      headerName.textContent = "User";
    }

    return;
  }

  const firstName = user.f_name || "";
  const email = user.email || "";
  const initial = (firstName || email || "U").charAt(0).toUpperCase();

  if (headerAvatar) {
    headerAvatar.textContent = initial;
  }

  if (headerName) {
    headerName.textContent = firstName || "User";
  }
}

if (signOutBtn) {
  signOutBtn.addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.removeItem("loggedInUser");

    window.location.href = "homepage.html";
  });
}

renderHeaderProfile();

/* =========================
   API / ELEMENTS
========================= */
const API_BASE_URL = "http://localhost:3000";

const campaignTitle = document.getElementById("campaignTitle");
const campaignCategory = document.getElementById("campaignCategory");
const campaignOrg = document.getElementById("campaignOrg");
const campaignShortDesc = document.getElementById("campaignShortDesc");
const supportMessage = document.getElementById("supportMessage");

const campaignStatus = document.getElementById("campaignStatus");
const campaignStartedOn = document.getElementById("campaignStartedOn");
const sideCategory = document.getElementById("sideCategory");

const campaignAbout = document.getElementById("campaignAbout");
const donationTableBody = document.getElementById("donationTableBody");

const backBtn = document.getElementById("backBtn");
const backTopBtn = document.getElementById("backTopBtn");
const viewFullCampaignBtn = document.getElementById("viewFullCampaignBtn");

let currentCampaignId = null;
let currentCampaign = null;
let campaignDonations = [];

/* =========================
   SAFE JSON
========================= */
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

/* =========================
   HELPERS
========================= */
function getCampaignIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id"));
}

function makeLocalDateFromSql(dateValue) {
  if (!dateValue) {
    return null;
  }

  const dateOnly = String(dateValue).split("T")[0];
  const parts = dateOnly.split("-");

  if (parts.length !== 3) {
    const fallbackDate = new Date(dateValue);

    if (Number.isNaN(fallbackDate.getTime())) {
      return null;
    }

    return new Date(
      fallbackDate.getFullYear(),
      fallbackDate.getMonth(),
      fallbackDate.getDate()
    );
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);

  const localDate = new Date(year, month, day);

  if (Number.isNaN(localDate.getTime())) {
    return null;
  }

  return localDate;
}

function formatDisplayDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const dateObj = makeLocalDateFromSql(dateValue);

  if (!dateObj) {
    return "-";
  }

  const d = String(dateObj.getDate()).padStart(2, "0");

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const m = months[dateObj.getMonth()];
  const y = dateObj.getFullYear();

  return d + " " + m + " " + y;
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

function isCampaignDateEnded(endDate) {
  if (!endDate) {
    return false;
  }

  const today = new Date();
  const end = makeLocalDateFromSql(endDate);

  if (!end) {
    return false;
  }

  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return end <= today;
}

function isCampaignStatusEnded(status) {
  if (!status) {
    return false;
  }

  const value = String(status).trim().toLowerCase();

  return (
    value === "completed" ||
    value === "complete" ||
    value === "ended" ||
    value === "end"
  );
}

function isCampaignEnded(campaign) {
  if (!campaign) {
    return false;
  }

  const currentAmount = Number(campaign.current_amount) || 0;
  const goalAmount = Number(campaign.fundraise_goal) || 0;

  const endedByAmount = goalAmount > 0 && currentAmount >= goalAmount;
  const endedByDate = isCampaignDateEnded(campaign.end_date);
  const endedByStatus = isCampaignStatusEnded(campaign.status);

  return endedByAmount || endedByDate || endedByStatus;
}

function getStatusClass(campaign) {
  if (isCampaignEnded(campaign)) {
    return "status-completed";
  }

  return "status-active";
}

function getStatusText(campaign) {
  if (isCampaignEnded(campaign)) {
    return "Completed";
  }

  return "Active";
}

/* =========================
   LOAD FROM DATABASE
   GET /donations/user/:user_id/activity/:activity_id
========================= */
async function loadDonationViewFromDatabase() {
  const userId = getLoggedInUserId();

  if (!userId) {
    alert("Please sign in first to view your donation.");
    window.location.href = "login.html";
    return;
  }

  currentCampaignId = getCampaignIdFromUrl();

  if (!currentCampaignId) {
    alert("Campaign ID is missing.");
    window.location.href = "myDonation.html";
    return;
  }

  if (donationTableBody) {
    donationTableBody.innerHTML = `
      <tr>
        <td colspan="4">Loading donation details...</td>
      </tr>
    `;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/donations/user/${userId}/activity/${currentCampaignId}`
    );

    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Failed to load donation view.");
    }

    campaignDonations = Array.isArray(data) ? data : data.donations || [];

    if (campaignDonations.length === 0) {
      alert("No donation record found for this campaign.");
      window.location.href = "myDonation.html";
      return;
    }

    currentCampaign = campaignDonations[0];

    renderDonationView();
  } catch (error) {
    console.error("Load donation view error:", error);
    alert("Failed to load donation details.");
    window.location.href = "myDonation.html";
  }
}

/* =========================
   RENDER PAGE
========================= */
function renderDonationView() {
  if (!currentCampaign) return;

  const categoryName = currentCampaign.category_name || "Others";
  const categoryClass = getCategoryClass(categoryName);
  const statusText = getStatusText(currentCampaign);
  const statusClass = getStatusClass(currentCampaign);

  if (campaignTitle) {
    campaignTitle.textContent =
      currentCampaign.activity_name || "Untitled Campaign";
  }

  if (campaignCategory) {
    campaignCategory.textContent = categoryName;
    campaignCategory.className = "category-pill " + categoryClass;
  }

  if (campaignOrg) {
    campaignOrg.textContent = "Supported campaign";
  }

  if (campaignShortDesc) {
    campaignShortDesc.textContent = currentCampaign.description || "";
  }

  if (campaignStatus) {
    campaignStatus.textContent = statusText;
    campaignStatus.className = "status-pill " + statusClass;
  }

  if (campaignStartedOn) {
    campaignStartedOn.textContent = formatDisplayDate(
      currentCampaign.start_date
    );
  }

  if (sideCategory) {
    sideCategory.textContent = categoryName;
  }

  if (campaignAbout) {
    campaignAbout.textContent = currentCampaign.description || "";
  }

  renderSupportMessage();
  renderDonationTable();
}

function renderSupportMessage() {
  if (!supportMessage) return;

  if (!campaignDonations || campaignDonations.length === 0) {
    supportMessage.className = "support-message no-support-message";
    supportMessage.innerHTML = `
      <span class="support-title">No donation yet</span>
      You have not donated to this campaign yet.
    `;

    return;
  }

  const latestDonation = campaignDonations[0];
  const latestAmount = Number(latestDonation.amount) || 0;

  supportMessage.className = "support-message";
  supportMessage.innerHTML = `
    <span class="support-title">♡ Thank you for your support!</span>
    You recently donated <strong>SGD ${latestAmount.toFixed(2)}</strong>
    to this campaign on ${formatDisplayDate(latestDonation.date)}.
  `;
}

function renderDonationTable() {
  if (!donationTableBody) return;

  if (!campaignDonations || campaignDonations.length === 0) {
    donationTableBody.innerHTML = `
      <tr>
        <td colspan="4">No donation record found.</td>
      </tr>
    `;

    return;
  }

  donationTableBody.innerHTML = campaignDonations
    .map(function (donation) {
      const amount = Number(donation.amount) || 0;

      return `
        <tr>
          <td>${formatDisplayDate(donation.date)}</td>
          <td>SGD ${amount.toFixed(2)}</td>
          <td>${donation.payment_method || "Credit or debit"}</td>
          <td>
            <span class="status-pill status-success">
              ${donation.donation_status || "Successful"}
            </span>
          </td>
        </tr>
      `;
    })
    .join("");
}

/* =========================
   BUTTONS
========================= */
function goBackToMyDonations() {
  window.location.href = "myDonation.html";
}

if (backBtn) {
  backBtn.addEventListener("click", goBackToMyDonations);
}

if (backTopBtn) {
  backTopBtn.addEventListener("click", goBackToMyDonations);
}

if (viewFullCampaignBtn) {
  viewFullCampaignBtn.addEventListener("click", function () {
    window.location.href = "myDonation.html";
  });
}

/* =========================
   START PAGE
========================= */
loadDonationViewFromDatabase();