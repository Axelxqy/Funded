/* =========================
   HEADER NAV DROPDOWNS
========================= */
const navDropdowns = document.querySelectorAll(".nav-dropdown");

navDropdowns.forEach(function (dropdown) {
  const button = dropdown.querySelector(".nav-button");

  if (!button) return;

  button.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    navDropdowns.forEach(function (item) {
      if (item !== dropdown) {
        item.classList.remove("open");
      }
    });

    dropdown.classList.toggle("open");
  });

  const menu = dropdown.querySelector(".nav-dropdown-menu");

  if (menu) {
    menu.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  }
});

/* =========================
   CLOSE DROPDOWNS WHEN CLICK OUTSIDE
========================= */
document.addEventListener("click", function () {
  navDropdowns.forEach(function (dropdown) {
    dropdown.classList.remove("open");
  });

  closeAllMoreMenus();

  if (statusFilterDropdown) {
    statusFilterDropdown.classList.remove("open");
  }
});

/* =========================
   LOGIN CHECK + HEADER USER
========================= */
function getLoggedInUser() {
  const savedUser = localStorage.getItem("loggedInUser");

  if (!savedUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(savedUser);

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

function protectMyCampaignPage() {
  const loggedInUser = getLoggedInUser();

  if (!loggedInUser || !getLoggedInUserId()) {
    alert("Please login first to view your campaigns.");
    window.location.href = "login.html";
    return null;
  }

  return loggedInUser;
}

function updateHeaderUser() {
  const loggedInUser = getLoggedInUser();

  if (!loggedInUser) return;

  const headerName = document.getElementById("headerName");
  const headerAvatar = document.getElementById("headerAvatar");

  const firstName = loggedInUser.f_name || "";
  const email = loggedInUser.email || "";

  if (headerName) {
    headerName.textContent = firstName || email || "User";
  }

  if (headerAvatar) {
    headerAvatar.textContent =
      firstName.charAt(0).toUpperCase() ||
      email.charAt(0).toUpperCase() ||
      "U";
  }
}

/* =========================
   SIGN OUT
========================= */
const signOutBtn = document.getElementById("signOutBtn");

if (signOutBtn) {
  signOutBtn.addEventListener("click", function (event) {
    event.preventDefault();
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  });
}

/* =========================
   CAMPAIGN STATE
========================= */
const API_BASE_URL = "http://localhost:3000";

const myCampaignList = document.getElementById("myCampaignList");
const searchInput = document.getElementById("myCampaignSearchInput");
const searchBtn = document.getElementById("myCampaignSearchBtn");

const statusFilterDropdown = document.getElementById("statusFilterDropdown");
const statusFilterBtn = document.getElementById("statusFilterBtn");
const statusFilterOptions = document.querySelectorAll(".status-filter-option");

const campaignsPerPage = 5;

let currentPage = 1;
let allCampaigns = [];
let filteredCampaigns = [];
let selectedStatusFilter = "all";

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
   LOAD MY CAMPAIGNS
   GET /fra/my/:userId
========================= */
document.addEventListener("DOMContentLoaded", async function () {
  const loggedInUser = protectMyCampaignPage();

  if (!loggedInUser) return;

  updateHeaderUser();
  await loadMyCampaignsFromDatabase();
});

async function loadMyCampaignsFromDatabase() {
  try {
    const userId = getLoggedInUserId();

    if (!userId) {
      alert("Please login first to view your campaigns.");
      window.location.href = "login.html";
      return;
    }

    if (myCampaignList) {
      myCampaignList.innerHTML = `
        <p class="empty-message">Loading campaigns...</p>
      `;
    }

    const response = await fetch(`${API_BASE_URL}/fra/my/${userId}`);
    const data = await readJsonResponse(response);

    if (!response.ok) {
      alert(data.message || "Failed to load campaigns.");
      return;
    }

    allCampaigns = Array.isArray(data) ? data : data.activities || [];

    selectedStatusFilter = "all";
    updateStatusFilterButton("all");

    applyCurrentFilter();
    updateCampaignStats(allCampaigns);
  } catch (error) {
    console.error("Load campaigns error:", error);
    alert("Cannot connect to backend.");
  }
}

/* =========================
   STATUS FILTER DROPDOWN
========================= */
if (statusFilterBtn && statusFilterDropdown) {
  statusFilterBtn.addEventListener("click", function (event) {
    event.stopPropagation();

    closeAllMoreMenus();

    navDropdowns.forEach(function (dropdown) {
      dropdown.classList.remove("open");
    });

    statusFilterDropdown.classList.toggle("open");
  });
}

statusFilterOptions.forEach(function (option) {
  option.addEventListener("click", async function (event) {
    event.stopPropagation();

    const status = option.dataset.status || "all";

    selectedStatusFilter = status;
    updateStatusFilterButton(status);

    statusFilterDropdown.classList.remove("open");

    if (status === "complete") {
      await loadCompleteCampaignsFromController();
      return;
    }

    applyCurrentFilter();
  });
});

function updateStatusFilterButton(status) {
  if (!statusFilterBtn) return;

  if (status === "ongoing") {
    statusFilterBtn.textContent = "Ongoing ▼";
  } else if (status === "complete") {
    statusFilterBtn.textContent = "Complete ▼";
  } else {
    statusFilterBtn.textContent = "Status ▼";
  }
}

/* =========================
   LOAD COMPLETED THROUGH CONTROLLER
   GET /fra/completed
========================= */
async function loadCompleteCampaignsFromController() {
  const userId = getLoggedInUserId();

  if (!userId) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  try {
    currentPage = 1;

    if (myCampaignList) {
      myCampaignList.innerHTML = `
        <p class="empty-message">Loading completed campaigns...</p>
      `;
    }

    const response = await fetch(`${API_BASE_URL}/fra/completed`);
    const data = await readJsonResponse(response);

    if (!response.ok) {
      alert(data.message || "Failed to load completed campaigns.");
      return;
    }

    const results = Array.isArray(data) ? data : data.activities || [];

    filteredCampaigns = results.filter(function (activity) {
      return String(activity.created_by) === String(userId);
    });

    displayCampaignsByPage(currentPage);
    renderPagination();
  } catch (error) {
    console.error("Load completed campaigns error:", error);
    alert("Cannot connect to backend while loading completed campaigns.");
  }
}

/* =========================
   APPLY ALL / ONGOING FILTER
========================= */
function applyCurrentFilter() {
  currentPage = 1;

  if (selectedStatusFilter === "ongoing") {
    filteredCampaigns = allCampaigns.filter(function (activity) {
      return !isCampaignEnded(activity);
    });
  } else {
    filteredCampaigns = allCampaigns.slice();
  }

  displayCampaignsByPage(currentPage);
  renderPagination();
}

/* =========================
   SEARCH THROUGH CONTROLLER
   ALL:
   GET /fra/search/:name

   COMPLETE:
   GET /fra/completed/search/:name
========================= */
async function searchMyCampaignsFromController() {
  const userId = getLoggedInUserId();
  const keyword = searchInput ? searchInput.value.trim() : "";

  if (!userId) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  currentPage = 1;

  if (keyword === "") {
    if (selectedStatusFilter === "complete") {
      await loadCompleteCampaignsFromController();
      return;
    }

    await loadMyCampaignsFromDatabase();
    return;
  }

  try {
    if (myCampaignList) {
      myCampaignList.innerHTML = `
        <p class="empty-message">Searching campaigns...</p>
      `;
    }

    let searchUrl = `${API_BASE_URL}/fra/search/${encodeURIComponent(keyword)}`;

    if (selectedStatusFilter === "complete") {
      searchUrl = `${API_BASE_URL}/fra/completed/search/${encodeURIComponent(
        keyword
      )}`;
    }

    const response = await fetch(searchUrl);
    const data = await readJsonResponse(response);

    if (!response.ok) {
      alert(data.message || "Failed to search campaigns.");
      return;
    }

    const results = Array.isArray(data) ? data : data.activities || [];

    let userResults = results.filter(function (activity) {
      return String(activity.created_by) === String(userId);
    });

    if (selectedStatusFilter === "ongoing") {
      userResults = userResults.filter(function (activity) {
        return !isCampaignEnded(activity);
      });
    }

    filteredCampaigns = userResults;

    displayCampaignsByPage(currentPage);
    renderPagination();
  } catch (error) {
    console.error("Search campaigns error:", error);
    alert("Cannot connect to backend while searching.");
  }
}

/* =========================
   SEARCH BUTTON / ENTER KEY
========================= */
if (searchBtn) {
  searchBtn.addEventListener("click", function () {
    searchMyCampaignsFromController();
  });
}

if (searchInput) {
  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      searchMyCampaignsFromController();
    }
  });

  searchInput.addEventListener("input", function () {
    if (searchInput.value.trim() === "") {
      if (selectedStatusFilter === "complete") {
        loadCompleteCampaignsFromController();
      } else {
        loadMyCampaignsFromDatabase();
      }
    }
  });
}

/* =========================
   UPDATE STATS
========================= */
function updateCampaignStats(activities) {
  const totalCampaignCount = document.getElementById("totalCampaignCount");
  const activeCampaignCount = document.getElementById("activeCampaignCount");
  const completedCampaignCount = document.getElementById(
    "completedCampaignCount"
  );

  const total = activities.length;

  const active = activities.filter(function (activity) {
    return !isCampaignEnded(activity);
  }).length;

  const completed = activities.filter(function (activity) {
    return isCampaignEnded(activity);
  }).length;

  if (totalCampaignCount) {
    totalCampaignCount.textContent = total;
  }

  if (activeCampaignCount) {
    activeCampaignCount.textContent = active;
  }

  if (completedCampaignCount) {
    completedCampaignCount.textContent = completed;
  }
}

/* =========================
   HELPERS
========================= */
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
  if (!endDate) return 0;

  const today = new Date();
  const end = makeLocalDateFromSql(endDate);

  if (!end) return 0;

  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const difference = end - today;
  const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24));

  return daysLeft > 0 ? daysLeft : 0;
}

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

function isCampaignDateEnded(endDate) {
  if (!endDate) return false;

  const today = new Date();
  const end = makeLocalDateFromSql(endDate);

  if (!end) return false;

  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return end <= today;
}

function isCampaignStatusEnded(status) {
  if (!status) return false;

  const value = String(status).trim().toLowerCase();

  return (
    value === "completed" ||
    value === "complete" ||
    value === "ended" ||
    value === "end"
  );
}

function isCampaignEnded(activity) {
  const currentAmount = Number(activity.current_amount) || 0;
  const goalAmount = Number(activity.fundraise_goal) || 0;

  const endedByAmount = goalAmount > 0 && currentAmount >= goalAmount;
  const endedByDate = isCampaignDateEnded(activity.end_date);
  const endedByStatus = isCampaignStatusEnded(activity.status);

  return endedByAmount || endedByDate || endedByStatus;
}

function formatCategoryName(categoryName) {
  if (!categoryName) return "Others";

  const name = categoryName.toLowerCase();

  if (name.includes("medical") || name.includes("health")) return "Health";
  if (name.includes("education")) return "Education";
  if (name.includes("animal")) return "Animals";
  if (name.includes("emergency")) return "Disaster";
  if (name.includes("disaster") || name.includes("relief")) return "Disaster";
  if (name.includes("community")) return "Community";
  if (name.includes("environment")) return "Community";

  return categoryName;
}

function getCategoryClass(categoryName) {
  const category = formatCategoryName(categoryName).toLowerCase();

  if (category === "health") return "health";
  if (category === "education") return "education";
  if (category === "animals") return "animals";
  if (category === "disaster") return "disaster";
  if (category === "community") return "community";

  return "others";
}

/* =========================
   DISPLAY CAMPAIGNS
========================= */
function displayCampaigns(activities) {
  if (!myCampaignList) return;

  if (!activities || activities.length === 0) {
    myCampaignList.innerHTML = `
      <p class="empty-message">No campaign found.</p>
    `;
    return;
  }

  myCampaignList.innerHTML = activities
    .map(function (activity) {
      const goal = Number(activity.fundraise_goal || 0);
      const current = Number(activity.current_amount || 0);
      const progress = calculateProgress(current, goal);

      const category = formatCategoryName(activity.category_name);
      const categoryClass = getCategoryClass(activity.category_name);

      const viewsCount = Number(activity.views_count) || 0;

      const ended = isCampaignEnded(activity);
      const statusText = ended ? "Ended" : "Active";
      const statusClass = ended ? "ended" : "active";

      const daysLeft = calculateDaysLeft(activity.end_date);
      const durationText = ended ? "Ended" : daysLeft + " days left";

      const description =
        activity.description || "No campaign description provided.";

      const editButtonHtml = ended
        ? `
          <button 
            class="edit-btn disabled" 
            type="button"
            onclick="event.stopPropagation(); alert('Ended campaign cannot be edited.');"
          >
            Edit
          </button>
        `
        : `
          <button 
            class="edit-btn" 
            type="button"
            onclick="event.stopPropagation(); editCampaign(${activity.activity_id})"
          >
            Edit
          </button>
        `;

      return `
        <article 
          class="campaign-card no-image-campaign-card category-${categoryClass}" 
          onclick="viewCampaign(${activity.activity_id})"
        >
          <div class="card-accent"></div>

          <div class="card-body no-image-card-body">
            <div class="card-top-row">
              <div class="category-view-wrap">
                <span class="category-pill ${categoryClass}">
                  ${category}
                </span>

                <span class="view-count-pill" title="Number of views">
                  <i class="fa-regular fa-eye"></i>
                  ${viewsCount}
                </span>
              </div>

              <span class="status-pill ${statusClass}">
                ${statusText}
              </span>
            </div>

            <div class="card-title">
              ${activity.activity_name || "Untitled Campaign"}
            </div>

            <p class="card-desc">
              ${description}
            </p>

            <div class="creator-box">
              <div class="creator-avatar">
                ${(activity.activity_name || "C").charAt(0).toUpperCase()}
              </div>

              <div class="creator-info">
                <div class="creator-name">Your Campaign</div>
                <div class="creator-email">${activity.category_name || "No category"}</div>
              </div>
            </div>

            <div class="amount-row">
              <div>
                <div class="amount-label">Raised</div>
                <div class="amount-value">${formatMoney(current)}</div>
              </div>

              <div class="goal-box">
                <div class="amount-label">Goal</div>
                <div class="goal-value">${formatMoney(goal)}</div>
              </div>
            </div>

            <div class="progress-info-row">
              <span>${progress}% funded</span>
              <span>⏳ ${durationText}</span>
            </div>

            <div class="progress-track">
              <div class="progress-bar" style="width:${progress}%"></div>
            </div>

            <div class="card-actions">
              <button 
                class="view-btn" 
                type="button"
                onclick="event.stopPropagation(); viewCampaign(${activity.activity_id})"
              >
                <i class="fa-regular fa-eye"></i>
                View
              </button>

              ${editButtonHtml}

              <div class="more-menu-wrap">
                <button 
                  class="more-btn" 
                  type="button"
                  onclick="event.stopPropagation(); toggleMoreMenu(${activity.activity_id})"
                >
                  <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>

                <div class="more-menu" id="moreMenu-${activity.activity_id}">
                  <button
                    class="delete-option-btn"
                    type="button"
                    onclick="event.stopPropagation(); deleteCampaign(${activity.activity_id})"
                  >
                    <i class="fa-regular fa-trash-can"></i>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

/* =========================
   MORE MENU
========================= */
function closeAllMoreMenus() {
  document.querySelectorAll(".more-menu").forEach(function (menu) {
    menu.classList.remove("show");
  });
}

function toggleMoreMenu(activityId) {
  const selectedMenu = document.getElementById("moreMenu-" + activityId);

  if (!selectedMenu) return;

  const alreadyOpen = selectedMenu.classList.contains("show");

  closeAllMoreMenus();

  if (!alreadyOpen) {
    selectedMenu.classList.add("show");
  }
}

/* =========================
   DELETE CAMPAIGN
   DELETE /fra/:id
========================= */
async function deleteCampaign(activityId) {
  const campaign = allCampaigns.find(function (activity) {
    return Number(activity.activity_id) === Number(activityId);
  });

  const campaignName = campaign
    ? campaign.activity_name || "this campaign"
    : "this campaign";

  const confirmDelete = confirm(
    `Are you sure you want to delete "${campaignName}"?`
  );

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/fra/${activityId}`, {
      method: "DELETE",
    });

    const data = await readJsonResponse(response);

    if (!response.ok) {
      alert(data.message || "Failed to delete campaign.");
      return;
    }

    allCampaigns = allCampaigns.filter(function (activity) {
      return Number(activity.activity_id) !== Number(activityId);
    });

    filteredCampaigns = filteredCampaigns.filter(function (activity) {
      return Number(activity.activity_id) !== Number(activityId);
    });

    updateCampaignStats(allCampaigns);

    const totalPages = Math.max(
      1,
      Math.ceil(filteredCampaigns.length / campaignsPerPage)
    );

    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    displayCampaignsByPage(currentPage);
    renderPagination();

    alert("Campaign deleted successfully.");
  } catch (error) {
    console.error("Delete campaign error:", error);
    alert("Cannot connect to backend while deleting campaign.");
  }
}

/* =========================
   PAGINATION
========================= */
function displayCampaignsByPage(page) {
  const start = (page - 1) * campaignsPerPage;
  const end = start + campaignsPerPage;

  const campaignsToShow = filteredCampaigns.slice(start, end);
  displayCampaigns(campaignsToShow);
}

function renderPagination() {
  const pagination = document.querySelector(".pagination");

  if (!pagination) return;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCampaigns.length / campaignsPerPage)
  );

  pagination.style.display = "flex";

  let pageButtons = "";

  for (let i = 1; i <= totalPages; i++) {
    pageButtons += `
      <button 
        class="${i === currentPage ? "active-page" : ""}" 
        onclick="changePage(${i})"
      >
        ${i}
      </button>
    `;
  }

  pagination.innerHTML = `
    <button 
      onclick="changePage(${currentPage - 1})" 
      ${currentPage === 1 ? "disabled" : ""}
    >
      <i class="fa-solid fa-chevron-left"></i>
    </button>

    ${pageButtons}

    <button 
      onclick="changePage(${currentPage + 1})" 
      ${currentPage === totalPages ? "disabled" : ""}
    >
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;
}

function changePage(page) {
  const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage);

  if (page < 1 || page > totalPages) return;

  currentPage = page;
  displayCampaignsByPage(currentPage);
  renderPagination();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/* =========================
   BUTTON ACTIONS
========================= */
function viewCampaign(activityId) {
  localStorage.setItem("selectedActivityId", activityId);
  window.location.href = "campaignDetail.html?id=" + activityId;
}

function editCampaign(activityId) {
  const campaign = allCampaigns.find(function (activity) {
    return Number(activity.activity_id) === Number(activityId);
  });

  if (campaign && isCampaignEnded(campaign)) {
    alert("Ended campaign cannot be edited.");
    return;
  }

  localStorage.setItem("editActivityId", activityId);
  window.location.href = "startCampaign.html";
}