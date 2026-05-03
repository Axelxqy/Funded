function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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
    if (signinHeaderBtn) {
      signinHeaderBtn.classList.remove("hidden");
    }

    if (profileDropdown) {
      profileDropdown.classList.add("hidden");
    }

    if (headerAvatar) {
      headerAvatar.textContent = "U";
    }

    if (headerName) {
      headerName.textContent = "User";
    }

    return;
  }

  if (signinHeaderBtn) {
    signinHeaderBtn.classList.add("hidden");
  }

  if (profileDropdown) {
    profileDropdown.classList.remove("hidden");
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

renderHeaderAuth();

/* =========================
   API / STATE
========================= */
const API_BASE_URL = "http://localhost:3000";

let currentCampaignId = null;
let currentCampaign = null;
let activityDonations = [];

const backBtn = document.getElementById("backBtn");

const detailTitle = document.getElementById("detailTitle");
const detailOrg = document.getElementById("detailOrg");
const detailEmail = document.getElementById("detailEmail");
const detailHeart = document.getElementById("detailHeart");
const detailRaised = document.getElementById("detailRaised");
const detailGoal = document.getElementById("detailGoal");
const detailProgressBar = document.getElementById("detailProgressBar");
const detailDonors = document.getElementById("detailDonors");
const detailDays = document.getElementById("detailDays");
const detailAbout = document.getElementById("detailAbout");
const detailViews = document.getElementById("detailViews");
const detailShortlisted = document.getElementById("detailShortlisted");

const scrollDonateBtn = document.getElementById("scrollDonateBtn");
const donatePanel = document.getElementById("donatePanel");
const donationInput = document.getElementById("donationInput");
const donationSummary = document.getElementById("donationSummary");
const donateNowBtn = document.getElementById("donateNowBtn");
const anonymousCheckbox = document.getElementById("anonymousCheckbox");

const donorsPanel = document.getElementById("donorsPanel");
const detailTabs = document.querySelectorAll(".detail-tab");
const detailPanels = document.querySelectorAll(".detail-panel");

/* =========================
   HELPERS
========================= */
function getCampaignIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const idFromUrl = Number(params.get("id"));

  if (idFromUrl) {
    return idFromUrl;
  }

  return Number(localStorage.getItem("selectedActivityId"));
}

function formatMoney(amount) {
  const value = Number(amount) || 0;

  return "$" + value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function calculateProgress(currentAmount, goalAmount) {
  const current = Number(currentAmount) || 0;
  const goal = Number(goalAmount) || 0;

  if (goal <= 0) {
    return 0;
  }

  const progress = Math.round((current / goal) * 100);

  return progress > 100 ? 100 : progress;
}

function calculateDaysLeft(endDate) {
  if (!endDate) {
    return 0;
  }

  const today = new Date();
  const end = new Date(endDate);

  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const difference = end - today;
  const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));

  return daysLeft > 0 ? daysLeft : 0;
}

function isCampaignDateEnded(endDate) {
  if (!endDate) {
    return false;
  }

  const today = new Date();
  const end = new Date(endDate);

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

function isCampaignDonationClosed() {
  if (!currentCampaign) {
    return true;
  }

  const currentAmount = Number(currentCampaign.current_amount) || 0;
  const goalAmount = Number(currentCampaign.fundraise_goal) || 0;

  const goalReached = goalAmount > 0 && currentAmount >= goalAmount;
  const dateEnded = isCampaignDateEnded(currentCampaign.end_date);
  const statusEnded = isCampaignStatusEnded(currentCampaign.status);

  return goalReached || dateEnded || statusEnded;
}

function getClosedReasonMessage() {
  if (!currentCampaign) {
    return "This campaign cannot receive donations.";
  }

  const currentAmount = Number(currentCampaign.current_amount) || 0;
  const goalAmount = Number(currentCampaign.fundraise_goal) || 0;

  if (isCampaignStatusEnded(currentCampaign.status)) {
    return "This campaign has ended and cannot receive donations.";
  }

  if (goalAmount > 0 && currentAmount >= goalAmount) {
    return "This campaign has reached its target amount and cannot receive more donations.";
  }

  if (isCampaignDateEnded(currentCampaign.end_date)) {
    return "This campaign has ended and cannot receive donations.";
  }

  return "This campaign cannot receive donations.";
}

function formatDateTime(dateValue) {
  const now = dateValue ? new Date(dateValue) : new Date();

  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();

  let h = now.getHours();
  const min = String(now.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";

  h = h % 12 || 12;

  return d + "/" + m + "/" + y + " " + h + ":" + min + " " + ap;
}

/* =========================
   FAVOURITE LOCAL STORAGE
========================= */
function getFavoriteIds() {
  const saved = localStorage.getItem("fav_id");

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved).map(function (id) {
      return Number(id);
    });
  } catch (error) {
    return [];
  }
}

function saveFavoriteIds(ids) {
  localStorage.setItem("fav_id", JSON.stringify(ids));
}

function isFavorite(id) {
  return getFavoriteIds().includes(Number(id));
}

function updateHeart() {
  if (!detailHeart) return;

  detailHeart.textContent = isFavorite(currentCampaignId) ? "❤" : "♡";
  detailHeart.classList.toggle("active", isFavorite(currentCampaignId));
}

function toggleFavorite(id) {
  let favoriteIds = getFavoriteIds();

  if (favoriteIds.includes(Number(id))) {
    favoriteIds = favoriteIds.filter(function (favoriteId) {
      return favoriteId !== Number(id);
    });
  } else {
    favoriteIds.push(Number(id));
  }

  saveFavoriteIds(favoriteIds);
  updateHeart();
}

/* =========================
   DETAIL TABS
========================= */
function activateDetailTab(panelId) {
  detailTabs.forEach(function (tab) {
    tab.classList.toggle("active", tab.dataset.panel === panelId);
  });

  detailPanels.forEach(function (panel) {
    panel.classList.toggle("active", panel.id === panelId);
  });
}

/* =========================
   LOAD CAMPAIGN DETAIL
========================= */
async function loadCampaignDetail() {
  currentCampaignId = getCampaignIdFromUrl();

  if (!currentCampaignId) {
    alert("Campaign ID is missing.");
    window.location.href = "browseCampaign.html";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/fra/${currentCampaignId}`);
    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to load campaign detail.");
      window.location.href = "browseCampaign.html";
      return;
    }

    currentCampaign = data.activity || data;

    renderCampaignDetail();
    updateHeart();

    await loadActivityDonations();
    renderDonors();
    await loadAnalytics();
    
    trackView();
    trackShortlistedView();

  } catch (error) {
    console.error("Load campaign detail error:", error);
    alert("Failed to load campaign detail.");
    window.location.href = "browseCampaign.html";
  }
}

async function loadActivityDonations() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/donations/activity/${currentCampaignId}`
    );

    if (!response.ok) {
      activityDonations = [];
      return;
    }

    const data = await response.json();

    activityDonations = Array.isArray(data) ? data : data.donations || [];
  } catch (error) {
    console.error("Load donors error:", error);
    activityDonations = [];
  }
}

async function loadAnalytics() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/analytics/${currentCampaignId}`
    );

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    if (detailViews) {
      detailViews.textContent = data.views_count ?? 0;
    }

    if (detailShortlisted) {
      detailShortlisted.textContent = data.shortlisted_count ?? 0;
    }

  } catch (error) {
    console.error("Load analytics error:", error);
  }
}

function renderCampaignDetail() {
  if (!currentCampaign) return;

  const creatorName = `${currentCampaign.creator_f_name || ""} ${
    currentCampaign.creator_l_name || ""
  }`.trim();

  const currentAmount = Number(currentCampaign.current_amount) || 0;
  const goalAmount = Number(currentCampaign.fundraise_goal) || 0;
  const donorCount = Number(currentCampaign.donor_count) || 0;
  const progress = calculateProgress(currentAmount, goalAmount);
  const daysLeft = calculateDaysLeft(currentCampaign.end_date);
  const remainingAmount = goalAmount - currentAmount;

  if (detailTitle) {
    detailTitle.textContent =
      currentCampaign.activity_name || "Untitled Campaign";
  }

  if (detailOrg) {
    detailOrg.textContent = "👤 " + (creatorName || "Unknown Creator");
  }

  if (detailEmail) {
    detailEmail.textContent =
      "✉️ " + (currentCampaign.creator_email || "No email available");
  }

  if (detailRaised) {
    detailRaised.textContent = formatMoney(currentAmount);
  }

  if (detailGoal) {
    detailGoal.textContent = "raised of " + formatMoney(goalAmount);
  }

  if (detailProgressBar) {
    detailProgressBar.style.width = progress + "%";
  }

  if (detailDonors) {
    detailDonors.textContent = donorCount;
  }

  if (detailDays) {
    if (isCampaignDonationClosed()) {
      detailDays.textContent = "Ended";
    } else {
      detailDays.textContent = daysLeft;
    }
  }

  if (detailAbout) {
    detailAbout.textContent = currentCampaign.description || "";
  }

  if (donationInput) {
    donationInput.max = Math.max(remainingAmount, 0);
  }

  /*
    Keep your original donation section design.
    Do not disable input.
    Do not change placeholder.
    Do not change button style.
    Only block donation when user clicks Donate Now.
  */

  if (donateNowBtn) {
    if (remainingAmount <= 0) {
      donateNowBtn.disabled = true;
      donateNowBtn.textContent = "Campaign Goal Reached";
    } else {
      donateNowBtn.disabled = false;
      donateNowBtn.textContent = "Donate Now";
    }
  }
}

function renderDonors() {
  if (!donorsPanel) return;

  if (!activityDonations || activityDonations.length === 0) {
    donorsPanel.innerHTML = `<div class="no-donors">No donor donate yet</div>`;
    return;
  }

  donorsPanel.innerHTML = activityDonations
    .map(function (donation) {
      const fullName = `${donation.f_name || ""} ${
        donation.l_name || ""
      }`.trim();

      const donorName = fullName || "Anonymous";
      const amount = Number(donation.amount) || 0;

      return `
        <div class="donor-card">
          <div class="donor-icon">❤</div>

          <div>
            <div class="donor-main">
              ${donorName} - donated $${amount.toFixed(2)}
            </div>

            <div class="donor-time">${formatDateTime(donation.date)}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

/* =========================
   EVENT LISTENERS
========================= */
if (backBtn) {
  backBtn.addEventListener("click", function () {
    window.location.href = "browseCampaign.html";
  });
}

if (detailHeart) {
  detailHeart.addEventListener("click", function () {
    toggleFavorite(currentCampaignId);
  });
}

detailTabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    activateDetailTab(tab.dataset.panel);
  });
});

if (scrollDonateBtn) {
  scrollDonateBtn.addEventListener("click", function () {
    if (!isLoggedIn()) {
      alert("Please sign in first before making a donation.");
      window.location.href = "login.html";
      return;
    }

    if (isCampaignDonationClosed()) {
      alert(getClosedReasonMessage());
      return;
    }

    activateDetailTab("donatePanel");

    if (donatePanel) {
      donatePanel.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
}

if (donationInput) {
  donationInput.addEventListener("input", function () {
    const value = Number(donationInput.value) || 0;

    if (isCampaignDonationClosed()) {
      if (donationSummary) {
        donationSummary.textContent = "SGD " + value.toFixed(2);
      }
      return;
    }

    if (currentCampaign) {
      const currentAmount = Number(currentCampaign.current_amount) || 0;
      const goalAmount = Number(currentCampaign.fundraise_goal) || 0;
      const remainingAmount = goalAmount - currentAmount;

      if (value > remainingAmount) {
        donationSummary.textContent =
          "SGD " +
          value.toFixed(2) +
          " exceeds remaining SGD " +
          remainingAmount.toFixed(2);

        return;
      }
    }

    if (donationSummary) {
      donationSummary.textContent = "SGD " + value.toFixed(2);
    }
  });
}

if (donateNowBtn) {
  donateNowBtn.addEventListener("click", async function () {
    if (!isLoggedIn()) {
      alert("Please sign in first before making a donation.");
      window.location.href = "login.html";
      return;
    }

    if (isCampaignDonationClosed()) {
      alert(getClosedReasonMessage());
      return;
    }

    const user = getLoggedInUser();
    const amount = Number(donationInput.value) || 0;

    if (amount <= 0) {
      alert("Please enter a donation amount first.");
      return;
    }

    const currentAmount = Number(currentCampaign.current_amount) || 0;
    const goalAmount = Number(currentCampaign.fundraise_goal) || 0;
    const remainingAmount = goalAmount - currentAmount;

    if (amount > remainingAmount) {
      alert(
        "Donation amount exceeds the remaining campaign goal. You can only donate up to SGD " +
          remainingAmount.toFixed(2)
      );
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.user_id,
          activity_id: currentCampaignId,
          amount: amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Donation failed.");
        return;
      }

      donationInput.value = "";

      if (donationSummary) {
        donationSummary.textContent = "SGD 0";
      }

      if (anonymousCheckbox) {
        anonymousCheckbox.checked = false;
      }

      await loadCampaignDetail();

      activateDetailTab("donorsPanel");

      alert("Donation successful. Thank you for your support!");
    } catch (error) {
      console.error("Donation error:", error);
      alert("Server error while donating.");
    }
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

let viewTracked = false;
let shortlistedTracked = false;

let hasScrolledEnough = false;
let hasStayedEnough = false;

let shortlistListenerAttached = false;
let shortlistTimerStarted = false;

const MIN_TIME_MS = 20000;
const MIN_SCROLL_PERCENT = 30;


// NORMAL VIEW 
function trackView() {
  if (!currentCampaignId) return;

  const user = getLoggedInUser();
  const user_id = user?.user_id;

  //Block invalid / missing email
  if (!user_id) return;

  const key = `view_${currentCampaignId}_${user_id}`;

  // prevent duplicate views per email per session
  const now = Date.now();
  const lastViewed = Number(localStorage.getItem(key)) || 0;

  // 10 min cooldown (adjust if needed)
  const COOLDOWN = 10 * 60 * 1000;

  if (now - lastViewed < COOLDOWN) return;

  localStorage.setItem(key, now);
  viewTracked = true;

  fetch(`${API_BASE_URL}/analytics/${currentCampaignId}/view`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ user_id })
  })
  .then(() => console.log("View recorded"))
  .catch(err => console.error("View failed:", err));
}


// SHORTLISTED 
function trackShortlistedView() {
  if (!currentCampaignId || shortlistedTracked) return;

  const user = getLoggedInUser();
  const user_id = user?.user_id;

  if (!user_id) return;

  const key = `shortlisted_${currentCampaignId}_${user_id}`;

  hasScrolledEnough = false;
  hasStayedEnough = false;

  // Time condition
  setTimeout(() => {
    hasStayedEnough = true;
    tryTrigger();
  }, MIN_TIME_MS);

  // Scroll condition
  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    if (docHeight <= 0) return;

    const scrollPercent = (scrollTop / docHeight) * 100;

    if (scrollPercent >= MIN_SCROLL_PERCENT) {
      hasScrolledEnough = true;
      tryTrigger();
      window.removeEventListener("scroll", onScroll);
    }
  }

  window.addEventListener("scroll", onScroll);

  async function tryTrigger() {
    if (shortlistedTracked) return;

    if (!(hasScrolledEnough && hasStayedEnough)) return;

    // Block duplicates ONLY after success condition met
    if (sessionStorage.getItem(key)) return;

    shortlistedTracked = true;
    sessionStorage.setItem(key, "true");

    try {
      await fetch(`${API_BASE_URL}/analytics/${currentCampaignId}/shortlisted`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      });

      await loadAnalytics();

    } catch (err) {
      console.error("Shortlist failed:", err);
    }
  }
}

/* =========================
   START PAGE
========================= */
loadCampaignDetail();