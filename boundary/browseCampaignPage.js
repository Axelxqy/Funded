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

function isLoggedIn() {
  return getLoggedInUserId() !== null;
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
   API / CAMPAIGN DATA
========================= */
const API_BASE_URL = "http://localhost:3000";
const CATEGORY_API = `${API_BASE_URL}/fra/categories`;

let campaigns = [];
let favoriteIds = [];
let categoryList = [];

let activeCampaignTab = "all";
let activeCategory = "all";
let searchKeyword = "";

const campaignGrid = document.getElementById("campaignGrid");
const exploreText = document.getElementById("exploreText");
const campaignTabs = document.querySelectorAll(".campaign-tab");
const campaignSearch = document.getElementById("campaignSearch");
const searchBtn = document.getElementById("searchBtn");

const causesDropdown = document.getElementById("causesDropdown");
const causesBtn = document.getElementById("causesBtn");
const causesMenu = document.getElementById("causesMenu");
const resultCountBtn = document.getElementById("resultCountBtn");

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
   LOAD CATEGORY FILTER
   GET /fra/categories
========================= */
async function loadCategoriesForFilter() {
  if (!causesMenu) return;

  try {
    const response = await fetch(CATEGORY_API);
    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Failed to load categories.");
    }

    categoryList = Array.isArray(data) ? data : data.categories || [];

    renderCategoryMenu();
  } catch (error) {
    console.error("Load categories error:", error);

    categoryList = [];
    renderCategoryMenu();
  }
}

function renderCategoryMenu() {
  if (!causesMenu) return;

  let html = `
    <button class="chip-item active" data-category="all" type="button">
      All
    </button>
  `;

  categoryList.forEach(function (category) {
    html += `
      <button
        class="chip-item"
        data-category="${category.category_id}"
        type="button"
      >
        ${category.name}
      </button>
    `;
  });

  causesMenu.innerHTML = html;

  attachCategoryEvents();
}

function attachCategoryEvents() {
  if (!causesMenu) return;

  causesMenu.querySelectorAll(".chip-item").forEach(function (item) {
    item.addEventListener("click", function (event) {
      event.stopPropagation();

      activeCategory = item.dataset.category || "all";

      causesMenu.querySelectorAll(".chip-item").forEach(function (chip) {
        chip.classList.remove("active");
      });

      item.classList.add("active");

      if (causesBtn) {
        causesBtn.textContent = item.textContent.trim() + " ▼";
      }

      if (causesDropdown) {
        causesDropdown.classList.remove("open");
      }

      updateCategoryUrl();
      renderCards();
    });
  });
}

function getCategoryNameById(categoryId, fallbackName) {
  const matched = categoryList.find(function (category) {
    return String(category.category_id) === String(categoryId);
  });

  if (matched) {
    return matched.name;
  }

  return fallbackName || "Others";
}

function getCategoryIdFromActivity(activity) {
  if (activity.category_id) {
    return String(activity.category_id);
  }

  if (activity.category_name) {
    const matched = categoryList.find(function (category) {
      return String(category.name).toLowerCase() === String(activity.category_name).toLowerCase();
    });

    if (matched) {
      return String(matched.category_id);
    }
  }

  return "";
}

function makeCategoryClass(categoryName) {
  if (!categoryName) return "others";

  return (
    String(categoryName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "others"
  );
}

/* =========================
   LOAD FAV IDS FROM DATABASE
========================= */
async function loadFavoriteIdsFromDatabase() {
  const userId = getLoggedInUserId();

  if (!userId) {
    favoriteIds = [];
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/fav/${userId}`);
    const data = await readJsonResponse(response);

    if (!response.ok) {
      console.error("Load favourite ids failed:", data);
      favoriteIds = [];
      return;
    }

    const favourites = Array.isArray(data) ? data : data.favourites || [];

    favoriteIds = favourites.map(function (fav) {
      return Number(fav.activity_id);
    });
  } catch (error) {
    console.error("Load favourite ids error:", error);
    favoriteIds = [];
  }
}

/* =========================
   LOAD ALL FRA FROM DATABASE
========================= */
async function loadActivitiesFromDatabase() {
  if (campaignGrid) {
    campaignGrid.innerHTML = `<div class="empty-message">Loading campaigns...</div>`;
  }

  try {
    await loadFavoriteIdsFromDatabase();

    const response = await fetch(`${API_BASE_URL}/fra`);
    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Failed to load campaigns.");
    }

    console.log("Browse campaigns from backend:", data);

    const activities = Array.isArray(data) ? data : data.activities || [];

    campaigns = activities.map(function (activity) {
      return mapActivityToCampaign(activity);
    });

    renderCards();
  } catch (error) {
    console.error("Load campaigns error:", error);

    if (campaignGrid) {
      campaignGrid.innerHTML = `
        <div class="empty-message">
          Failed to load campaigns from server.
        </div>
      `;
    }

    updateResultCount(0);

    if (exploreText) {
      exploreText.textContent = "Explore 0 campaigns";
    }
  }
}

/* =========================
   SEARCH FRA FROM DATABASE
========================= */
async function searchActivitiesFromDatabase() {
  const activity_name = campaignSearch ? campaignSearch.value.trim() : "";

  searchKeyword = activity_name;

  if (activity_name === "") {
    await loadActivitiesFromDatabase();
    return;
  }

  if (campaignGrid) {
    campaignGrid.innerHTML = `<div class="empty-message">Searching campaigns...</div>`;
  }

  try {
    await loadFavoriteIdsFromDatabase();

    const response = await fetch(
      `${API_BASE_URL}/fra/search/${encodeURIComponent(activity_name)}`
    );

    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Failed to search campaigns.");
    }

    console.log("FRA search result:", data);

    const activities = Array.isArray(data) ? data : data.activities || [];

    campaigns = activities.map(function (activity) {
      return mapActivityToCampaign(activity);
    });

    renderCards();
  } catch (error) {
    console.error("Search FRA error:", error);

    if (campaignGrid) {
      campaignGrid.innerHTML = `
        <div class="empty-message">
          Failed to search campaigns.
        </div>
      `;
    }

    updateResultCount(0);

    if (exploreText) {
      exploreText.textContent = "Explore 0 campaigns";
    }
  }
}

/* =========================
   MAP ACTIVITY TO CARD
========================= */
function mapActivityToCampaign(activity) {
  const goal = Number(activity.fundraise_goal) || 0;
  const currentAmount = Number(activity.current_amount) || 0;

  const creatorName = `${activity.creator_f_name || ""} ${
    activity.creator_l_name || ""
  }`.trim();

  const daysLeft = calculateDaysLeft(
    activity.start_date,
    activity.end_date
  );
  const endedByAmount = goal > 0 && currentAmount >= goal;
  const endedByDate = isCampaignDateEnded(activity.end_date);
  const isEnded = endedByAmount || endedByDate;

  let progress = 0;

  if (goal > 0) {
    progress = Math.round((currentAmount / goal) * 100);
  }

  if (progress > 100) {
    progress = 100;
  }

  const categoryId = getCategoryIdFromActivity(activity);
  const categoryName = getCategoryNameById(categoryId, activity.category_name);

  return {
    id: Number(activity.activity_id),
    title: activity.activity_name || "Untitled Campaign",

    categoryId: categoryId,
    category: categoryName,
    categoryClass: makeCategoryClass(categoryName),

    org: creatorName || "Unknown Creator",
    email: activity.creator_email || "No email available",

    raisedAmount: currentAmount,
    goalAmount: goal,
    raised: "$" + currentAmount.toLocaleString(),
    goal: "$" + goal.toLocaleString(),
    donors: Number(activity.donor_count) || 0,

    daysLeft: daysLeft,
    durationText: isEnded ? "Ended" : daysLeft + " days left",

    progress: progress,
    shortDesc: activity.description || "",
    about: activity.description || "",

    status: isEnded ? "Ended" : "Active",
    statusClass: isEnded ? "ended" : "active",

    endedByAmount: endedByAmount,
    endedByDate: endedByDate,
    isEnded: isEnded,

    startDate: activity.start_date,
    endDate: activity.end_date,
    createdBy: activity.created_by,
  };
}

/* =========================
   HELPER FUNCTIONS
========================= */
function makeLocalDateFromSql(dateValue) {
  if (!dateValue) return null;

  const dateOnly = String(dateValue).split("T")[0];
  const parts = dateOnly.split("-");

  if (parts.length !== 3) return null;

  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);

  const localDate = new Date(year, month, day);

  if (Number.isNaN(localDate.getTime())) {
    return null;
  }

  return localDate;
}

function calculateDaysLeft(startDate, endDate) {
  if (!endDate) {
    return 0;
  }

  const today = new Date();
  const start = makeLocalDateFromSql(startDate);
  const end = makeLocalDateFromSql(endDate);

  if (!end) {
    return 0;
  }

  today.setHours(0, 0, 0, 0);

  if (start) {
    start.setHours(0, 0, 0, 0);
  }

  end.setHours(0, 0, 0, 0);

  let baseDate = today;

  // campaign not started yet
  if (start && start > today) {
    baseDate = start;
  }

  const difference = end - baseDate;
  const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));

  return daysLeft > 0 ? daysLeft : 0;
}

function isCampaignDateEnded(endDate) {
  if (!endDate) return false;

  const today = new Date();
  const end = makeLocalDateFromSql(endDate);

  if (!end) return false;

  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return end <= today;
}

function getStatusText(status) {
  if (!status) return "Active";

  const value = String(status).toLowerCase();

  if (value === "ended" || value === "completed" || value === "complete") {
    return "Ended";
  }

  return "Active";
}

function getStatusClass(status) {
  if (!status) return "active";

  const value = String(status).toLowerCase();

  if (value === "ended" || value === "completed" || value === "complete") {
    return "ended";
  }

  return "active";
}

/* =========================
   CATEGORY FROM URL
========================= */
function applyCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const selectedCategory = params.get("category");

  if (!selectedCategory || selectedCategory === "all") {
    activeCategory = "all";

    if (causesBtn) {
      causesBtn.textContent = "Causes ▼";
    }

    setActiveCategoryChip("all");
    return;
  }

  const matched = categoryList.find(function (category) {
    return String(category.category_id) === String(selectedCategory);
  });

  if (!matched) {
    activeCategory = "all";

    if (causesBtn) {
      causesBtn.textContent = "Causes ▼";
    }

    setActiveCategoryChip("all");
    return;
  }

  activeCategory = String(matched.category_id);

  if (causesBtn) {
    causesBtn.textContent = matched.name + " ▼";
  }

  setActiveCategoryChip(activeCategory);
}

function setActiveCategoryChip(categoryId) {
  if (!causesMenu) return;

  causesMenu.querySelectorAll(".chip-item").forEach(function (item) {
    item.classList.toggle(
      "active",
      String(item.dataset.category || "all") === String(categoryId)
    );
  });
}

function updateCategoryUrl() {
  if (activeCategory === "all") {
    window.history.replaceState(null, "", "browseCampaign.html");
    return;
  }

  window.history.replaceState(
    null,
    "",
    "browseCampaign.html?category=" + encodeURIComponent(activeCategory)
  );
}

/* =========================
   FAVOURITES
========================= */
function isFavorite(id) {
  return favoriteIds.includes(Number(id));
}

async function toggleFavorite(id) {
  const userId = getLoggedInUserId();

  if (!userId) {
    alert("Please sign in first to save favourite campaign.");
    window.location.href = "login.html";
    return;
  }

  const activityId = Number(id);

  if (!activityId) {
    alert("Invalid campaign selected.");
    return;
  }

  if (isFavorite(activityId)) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/fav/user/${userId}/activity/${activityId}`,
        {
          method: "DELETE",
        }
      );

      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove favourite campaign.");
      }

      favoriteIds = favoriteIds.filter(function (favoriteId) {
        return Number(favoriteId) !== activityId;
      });

      renderCards();
    } catch (error) {
      console.error("Remove favourite error:", error);
      alert("Failed to remove favourite campaign.");
    }

    return;
  }

  try {
    const saveRequest = {
      user_id: userId,
      activity_id: activityId,
    };

    console.log("Saving favourite request:", saveRequest);

    const response = await fetch(`${API_BASE_URL}/fav`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveRequest),
    });

    const data = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Failed to save favourite campaign.");
    }

    favoriteIds.push(activityId);
    renderCards();
  } catch (error) {
    console.error("Save favourite error:", error);
    alert("Failed to save favourite campaign.");
  }
}

/* =========================
   FILTERING
========================= */
function getVisibleCampaigns() {
  let visibleCampaigns = campaigns.slice();

  if (activeCampaignTab === "favorite") {
    visibleCampaigns = visibleCampaigns.filter(function (campaign) {
      return isFavorite(campaign.id);
    });
  }

  if (activeCategory !== "all") {
    visibleCampaigns = visibleCampaigns.filter(function (campaign) {
      return String(campaign.categoryId) === String(activeCategory);
    });
  }

  return visibleCampaigns;
}

/* =========================
   RESULT COUNT
========================= */
function updateResultCount(count) {
  if (resultCountBtn) {
    resultCountBtn.textContent = count;
  }
}

/* =========================
   RENDER CAMPAIGNS
========================= */
function renderCards() {
  if (!campaignGrid) return;

  campaignGrid.innerHTML = "";

  const visibleCampaigns = getVisibleCampaigns();
  const count = visibleCampaigns.length;

  updateResultCount(count);

  if (exploreText) {
    const categoryText =
      activeCategory === "all"
        ? ""
        : " in " + getCategoryNameById(activeCategory, "Selected Category");

    exploreText.textContent =
      "Explore " +
      count +
      " campaign" +
      (count === 1 ? "" : "s") +
      categoryText;
  }

  if (visibleCampaigns.length === 0) {
    campaignGrid.innerHTML = `<div class="empty-message">No campaign found.</div>`;
    return;
  }

  visibleCampaigns.forEach(function (campaign) {
    const card = document.createElement("article");

    card.className =
      "campaign-card no-image-campaign-card category-" + campaign.categoryClass;

    card.innerHTML = `
      <div class="card-accent"></div>

      <div class="card-body no-image-card-body">
        <div class="card-top-row">
          <span class="category-pill ${campaign.categoryClass}">
            ${campaign.category}
          </span>

          <button class="heart-btn ${isFavorite(campaign.id) ? "active" : ""}" data-id="${campaign.id}" type="button">
            ${isFavorite(campaign.id) ? "❤" : "♡"}
          </button>
        </div>

        <div class="card-title">${campaign.title}</div>

        <p class="card-desc">
          ${campaign.shortDesc || "No campaign description provided."}
        </p>

        <div class="creator-box">
          <div class="creator-avatar">
            ${(campaign.org || "U").charAt(0).toUpperCase()}
          </div>

          <div class="creator-info">
            <div class="creator-name">${campaign.org}</div>
            <div class="creator-email">${campaign.email}</div>
          </div>
        </div>

        <div class="amount-row">
          <div>
            <div class="amount-label">Raised</div>
            <div class="amount-value">${campaign.raised}</div>
          </div>

          <div class="goal-box">
            <div class="amount-label">Goal</div>
            <div class="goal-value">${campaign.goal}</div>
          </div>
        </div>

        <div class="progress-info-row">
          <span>${campaign.progress}% funded</span>
          <span class="status-pill ${campaign.statusClass}">
            ${campaign.status}
          </span>
        </div>

        <div class="progress-track">
          <div class="progress-bar" style="width:${campaign.progress}%"></div>
        </div>

        <div class="card-footer">
          <span>👥 ${campaign.donors} donors</span>
          <span>⏳ ${campaign.durationText}</span>
        </div>
      </div>
    `;

    card.addEventListener("click", function (event) {
      if (event.target.classList.contains("heart-btn")) return;

      window.location.href = "campaignDetail.html?id=" + campaign.id;
    });

    const heartBtn = card.querySelector(".heart-btn");

    if (heartBtn) {
      heartBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleFavorite(campaign.id);
      });
    }

    campaignGrid.appendChild(card);
  });
}

/* =========================
   TABS
========================= */
campaignTabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    campaignTabs.forEach(function (item) {
      item.classList.remove("active");
    });

    tab.classList.add("active");
    activeCampaignTab = tab.dataset.tab || "all";
    renderCards();
  });
});

/* =========================
   CAUSES DROPDOWN
========================= */
if (causesBtn && causesDropdown) {
  causesBtn.addEventListener("click", function (event) {
    event.stopPropagation();

    document.querySelectorAll(".nav-dropdown").forEach(function (item) {
      item.classList.remove("open");
    });

    causesDropdown.classList.toggle("open");
  });
}

/* =========================
   SEARCH
========================= */
if (searchBtn && campaignSearch) {
  searchBtn.addEventListener("click", function () {
    searchActivitiesFromDatabase();
  });

  campaignSearch.addEventListener("input", function () {
    searchActivitiesFromDatabase();
  });
}

/* =========================
   CLOSE DROPDOWNS
========================= */
document.addEventListener("click", function () {
  document.querySelectorAll(".nav-dropdown").forEach(function (item) {
    item.classList.remove("open");
  });

  if (causesDropdown) {
    causesDropdown.classList.remove("open");
  }
});

/* =========================
   START PAGE
========================= */
async function startBrowsePage() {
  await loadCategoriesForFilter();
  applyCategoryFromUrl();
  await loadActivitiesFromDatabase();
}

startBrowsePage();