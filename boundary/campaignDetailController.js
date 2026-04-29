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

  if (!saved) return null;

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
  if (isLoggedIn()) return;

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
const detailMainImg = document.getElementById("detailMainImg");
const detailSideImg = document.getElementById("detailSideImg");
const detailDesc = document.getElementById("detailDesc");
const detailHeart = document.getElementById("detailHeart");
const detailRaised = document.getElementById("detailRaised");
const detailGoal = document.getElementById("detailGoal");
const detailProgressBar = document.getElementById("detailProgressBar");
const detailDonors = document.getElementById("detailDonors");
const detailDays = document.getElementById("detailDays");
const detailAbout = document.getElementById("detailAbout");

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
  return Number(params.get("id"));
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

  if (goal <= 0) return 0;

  const progress = Math.round((current / goal) * 100);

  return progress > 100 ? 100 : progress;
}

function calculateDaysLeft(endDate) {
  if (!endDate) return 0;

  const today = new Date();
  const end = new Date(endDate);

  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const difference = end - today;
  const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));

  return daysLeft > 0 ? daysLeft : 0;
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

function formatCategoryName(categoryName) {
  if (!categoryName) return "Others";

  const name = categoryName.toLowerCase();

  if (name.includes("medical") || name.includes("health")) return "Health";
  if (name.includes("education")) return "Education";
  if (name.includes("animal")) return "Animals";
  if (name.includes("disaster") || name.includes("relief")) return "Disaster";
  if (name.includes("community")) return "Community";

  return categoryName;
}

function getCategoryImage(categoryName) {
  const category = formatCategoryName(categoryName);

  if (category === "Health") {
    return "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80";
  }

  if (category === "Education") {
    return "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80";
  }

  if (category === "Animals") {
    return "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80";
  }

  if (category === "Disaster") {
    return "https://images.unsplash.com/photo-1593113598332-cd59a93c6132?auto=format&fit=crop&w=900&q=80";
  }

  if (category === "Community") {
    return "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80";
  }

  return "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80";
}

function getDonorDisplayName() {
  const user = getLoggedInUser();

  if (!user) return "Anonymous";

  if (anonymousCheckbox && anonymousCheckbox.checked) {
    return "Anonymous";
  }

  const firstName = user.f_name || "";
  const lastName = user.l_name || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "Anonymous";
}

/* =========================
   FAVOURITE LOCAL STORAGE
========================= */
function getFavoriteIds() {
  const saved = localStorage.getItem("fav_id");

  if (!saved) return [];

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

function updateHeart() {
  if (!detailHeart) return;

  detailHeart.textContent = isFavorite(currentCampaignId) ? "❤" : "♡";
  detailHeart.classList.toggle("active", isFavorite(currentCampaignId));
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
    const response = await fetch(`${API_BASE_URL}/activities/${currentCampaignId}`);

    if (!response.ok) {
      throw new Error("Failed to load campaign detail.");
    }

    const data = await response.json();

    currentCampaign = data.activity;

    await loadActivityDonations();

    renderCampaignDetail();
    updateHeart();
    renderDonors();
  } catch (error) {
    console.error("Load campaign detail error:", error);
    alert("Failed to load campaign detail.");
    window.location.href = "browseCampaign.html";
  }
}

async function loadActivityDonations() {
  const response = await fetch(`${API_BASE_URL}/donations/activity/${currentCampaignId}`);

  if (!response.ok) {
    activityDonations = [];
    return;
  }

  const data = await response.json();

  activityDonations = data.donations || [];
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

  const image = getCategoryImage(currentCampaign.category_name);

  detailTitle.textContent = currentCampaign.activity_name || "Untitled Campaign";
  detailOrg.textContent = "👤 " + (creatorName || "Unknown Creator");
  detailEmail.textContent =
    "✉️ " + (currentCampaign.creator_email || "No email available");

  detailMainImg.src = image;
  detailSideImg.src = image;

  detailDesc.textContent = currentCampaign.description || "";
  detailRaised.textContent = formatMoney(currentAmount);
  detailGoal.textContent = "raised of " + formatMoney(goalAmount);
  detailProgressBar.style.width = progress + "%";
  detailDonors.textContent = donorCount;
  detailDays.textContent = daysLeft;
  detailAbout.textContent = currentCampaign.description || "";

  const remainingAmount = goalAmount - currentAmount;

  if (donationInput) {
    donationInput.max = Math.max(remainingAmount, 0);
  }

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

  if (activityDonations.length === 0) {
    donorsPanel.innerHTML = `<div class="no-donors">No donor donate yet</div>`;
    return;
  }

  donorsPanel.innerHTML = activityDonations
    .map(function (donation) {
      const fullName = `${donation.f_name || ""} ${donation.l_name || ""}`.trim();
      const donorName = fullName || "Anonymous";

      return `
        <div class="donor-card">
          <div class="donor-icon">❤</div>

          <div>
            <div class="donor-main">
              ${donorName} - donated $${Number(donation.amount).toFixed(2)}
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

    donationSummary.textContent = "SGD " + value.toFixed(2);
  });
}

if (donateNowBtn) {
  donateNowBtn.addEventListener("click", async function () {
    if (!isLoggedIn()) {
      alert("Please sign in first before making a donation.");
      window.location.href = "login.html";
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
      donationSummary.textContent = "SGD 0";

      if (anonymousCheckbox) {
        anonymousCheckbox.checked = false;
      }

      await loadCampaignDetail();

      activateDetailTab("donorsPanel");

      alert("Donation successful. Thank you for your support!");

      window.location.href = "myDonation.html";
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

/* =========================
   START PAGE
========================= */
loadCampaignDetail();