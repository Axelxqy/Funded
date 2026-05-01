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

  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch (error) {
    localStorage.removeItem("loggedInUser");
    return null;
  }
}

function renderHeaderProfile() {
  const user = getLoggedInUser();

  if (!user) {
    if (headerAvatar) headerAvatar.textContent = "U";
    if (headerName) headerName.textContent = "User";
    return;
  }

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
   HELPERS
========================= */
function getCampaignIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id"));
}

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

function getCategoryClass(categoryName) {
  if (!categoryName) return "others";

  const category = categoryName.toLowerCase();

  if (category.includes("health") || category.includes("medical")) return "health";
  if (category.includes("education")) return "education";
  if (category.includes("animal")) return "animals";
  if (category.includes("disaster") || category.includes("relief")) return "disaster";
  if (category.includes("community")) return "community";

  return "others";
}

function getStatusClass(status) {
  if (!status) return "status-active";

  const value = status.toLowerCase();

  if (value === "completed") {
    return "status-completed";
  }

  return "status-active";
}

function getStatusText(status) {
  if (!status) return "Active";

  if (status.toLowerCase() === "completed") {
    return "Completed";
  }

  return "Active";
}

/* =========================
   LOAD FROM DATABASE
========================= */
async function loadDonationViewFromDatabase() {
  const user = getLoggedInUser();

  if (!user || !user.user_id) {
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
      `${API_BASE_URL}/donations/user/${user.user_id}/activity/${currentCampaignId}`
    );

    const data = await response.json();

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
  const statusText = getStatusText(currentCampaign.status);
  const statusClass = getStatusClass(currentCampaign.status);

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
    campaignStartedOn.textContent = formatDisplayDate(currentCampaign.start_date);
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