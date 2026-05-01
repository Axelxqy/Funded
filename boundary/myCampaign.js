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
});

/* =========================
   LOGIN CHECK + HEADER USER
========================= */
function getLoggedInUser() {
  return JSON.parse(localStorage.getItem("loggedInUser"));
}

function protectMyCampaignPage() {
  const loggedInUser = getLoggedInUser();

  if (!loggedInUser) {
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
const myCampaignList = document.getElementById("myCampaignList");

const campaignsPerPage = 4;
let currentPage = 1;
let allCampaigns = [];

/* =========================
   LOAD MY CAMPAIGNS
========================= */
document.addEventListener("DOMContentLoaded", async function () {
  const loggedInUser = protectMyCampaignPage();

  if (!loggedInUser) return;

  updateHeaderUser();

  try {
    const response = await fetch(
      `http://localhost:3000/activities/my/${loggedInUser.user_id}`
    );
    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to load campaigns.");
      return;
    }

    allCampaigns = data.activities || [];

    updateCampaignStats(allCampaigns);
    displayCampaignsByPage(currentPage);
    renderPagination();
  } catch (error) {
    console.error("Load campaigns error:", error);
    alert("Cannot connect to backend.");
  }
});

/* =========================
   UPDATE STATS
========================= */
function updateCampaignStats(activities) {
  const totalCampaignCount = document.getElementById("totalCampaignCount");
  const activeCampaignCount = document.getElementById("activeCampaignCount");
  const completedCampaignCount = document.getElementById("completedCampaignCount");

  const total = activities.length;

  const active = activities.filter(function (activity) {
    const status = (activity.status || "").toLowerCase();
    return status === "ongoing" || status === "active";
  }).length;

  const completed = activities.filter(function (activity) {
    const status = (activity.status || "").toLowerCase();
    return status === "completed";
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
   DISPLAY CAMPAIGNS
========================= */
function displayCampaigns(activities) {
  if (!myCampaignList) return;

  if (!activities || activities.length === 0) {
    myCampaignList.innerHTML = `
      <p class="empty-message">No campaign created yet.</p>
    `;
    return;
  }

  myCampaignList.innerHTML = activities
    .map(function (activity) {
      const goal = Number(activity.fundraise_goal || 0);
      const current = Number(activity.current_amount || 0);
      const progress = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

      const statusText = activity.status || "Ongoing";
      const statusClass =
        statusText.toLowerCase() === "completed" ? "completed" : "ongoing";

      return `
        <div class="campaign-card" onclick="viewCampaign(${activity.activity_id})">
          <div class="campaign-top">
            <div>
              <span class="campaign-category">${activity.category_name || "-"}</span>
            </div>

            <span class="status ${statusClass}">${statusText}</span>
          </div>

          <div class="campaign-content">
            <p>Category: ${activity.category_name || "-"}</p>
            <p>Goal: S$ ${goal.toFixed(2)}</p>
            <p>Raised: S$ ${current.toFixed(2)}</p>

            <div class="progress-row">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%;"></div>
              </div>
              <span>${Math.round(progress)}%</span>
            </div>

            <div class="card-actions">
              <button 
                class="view-btn" 
                onclick="event.stopPropagation(); viewCampaign(${activity.activity_id})"
              >
                <i class="fa-regular fa-eye"></i>
                View Details
              </button>

              <button 
                class="edit-btn" 
                onclick="event.stopPropagation(); editCampaign(${activity.activity_id})"
              >
                Edit
              </button>

              <div class="more-wrapper" onclick="event.stopPropagation();">
                <button 
                  class="more-btn" 
                  onclick="toggleCardMenu(event, ${activity.activity_id})"
                >
                  <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>

                <div class="card-menu" id="cardMenu-${activity.activity_id}">
                  <button onclick="deleteCampaign(event, ${activity.activity_id})">
                    <i class="fa-regular fa-trash-can"></i>
                    Delete Campaign
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

/* =========================
   PAGINATION
========================= */
function displayCampaignsByPage(page) {
  const start = (page - 1) * campaignsPerPage;
  const end = start + campaignsPerPage;

  const campaignsToShow = allCampaigns.slice(start, end);
  displayCampaigns(campaignsToShow);
}

function renderPagination() {
  const pagination = document.querySelector(".pagination");

  if (!pagination) return;

  const totalPages = Math.max(
    1,
    Math.ceil(allCampaigns.length / campaignsPerPage)
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
  const totalPages = Math.ceil(allCampaigns.length / campaignsPerPage);

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
  window.location.href = "campaignDetail.html";
}

function editCampaign(activityId) {
  localStorage.setItem("editActivityId", activityId);
  window.location.href = "startCampaign.html";
}

function toggleCardMenu(event, activityId) {
  event.stopPropagation();

  const allMenus = document.querySelectorAll(".card-menu");

  allMenus.forEach(function (menu) {
    if (menu.id !== `cardMenu-${activityId}`) {
      menu.classList.remove("show");
    }
  });

  const menu = document.getElementById(`cardMenu-${activityId}`);

  if (menu) {
    menu.classList.toggle("show");
  }
}

async function deleteCampaign(event, activityId) {
  event.stopPropagation();

  const loggedInUser = getLoggedInUser();

  if (!loggedInUser) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  const confirmDelete = confirm("Are you sure you want to delete this campaign?");

  if (!confirmDelete) return;

  try {
    const response = await fetch(`http://localhost:3000/activities/${activityId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: loggedInUser.user_id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to delete campaign.");
      return;
    }

    alert("Campaign deleted successfully.");

    allCampaigns = allCampaigns.filter(function (campaign) {
      return campaign.activity_id !== activityId;
    });

    const totalPages = Math.max(1, Math.ceil(allCampaigns.length / campaignsPerPage));

    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    updateCampaignStats(allCampaigns);
    displayCampaignsByPage(currentPage);
    renderPagination();
  } catch (error) {
    console.error("Delete campaign error:", error);
    alert("Cannot connect to backend.");
  }
}

document.addEventListener("click", function () {
  const allMenus = document.querySelectorAll(".card-menu");

  allMenus.forEach(function (menu) {
    menu.classList.remove("show");
  });
});