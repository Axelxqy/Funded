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
   API / CAMPAIGN DATA
========================= */
const API_BASE_URL = "http://localhost:3000";

let campaigns = [];
let activeCategory = "all";

const favoriteGrid = document.getElementById("favoriteGrid");
const emptyBox = document.getElementById("emptyBox");
const favoriteCountText = document.getElementById("favoriteCountText");
const resultCountBtn = document.getElementById("resultCountBtn");

const causesDropdown = document.getElementById("causesDropdown");
const causesBtn = document.getElementById("causesBtn");

/* =========================
   LOAD ACTIVITIES FROM DATABASE
========================= */
async function loadActivitiesFromDatabase() {
  if (favoriteGrid) {
    favoriteGrid.innerHTML = "";
  }

  if (emptyBox) {
    emptyBox.style.display = "block";
    emptyBox.textContent = "Loading favorite campaigns...";
  }

  try {
    const response = await fetch(`${API_BASE_URL}/activities`);

    if (!response.ok) {
      throw new Error("Failed to load campaigns.");
    }

    const data = await response.json();

    campaigns = data.activities.map(function (activity) {
      const goal = Number(activity.fundraise_goal) || 0;
      const currentAmount = Number(activity.current_amount) || 0;

      const creatorName = `${activity.creator_f_name || ""} ${
        activity.creator_l_name || ""
      }`.trim();

      let progress = 0;

      if (goal > 0) {
        progress = Math.round((currentAmount / goal) * 100);
      }

      if (progress > 100) {
        progress = 100;
      }

      return {
        id: activity.activity_id,
        title: activity.activity_name || "Untitled Campaign",
        category: formatCategoryName(activity.category_name),
        categoryClass: getCategoryClass(activity.category_name),

        org: creatorName || "Unknown Creator",
        email: activity.creator_email || "No email available",

        raised: "$" + currentAmount.toLocaleString(),
        goal: "$" + goal.toLocaleString(),
        donors: 0,
        daysLeft: calculateDaysLeft(activity.end_date),
        progress: progress,
        image: getCategoryImage(activity.category_name),
        shortDesc: activity.description || "",
        about: activity.description || "",
        status: activity.status || "Ongoing",
        startDate: activity.start_date,
        endDate: activity.end_date,
        createdBy: activity.created_by,
      };
    });

    renderFavoriteCampaigns();
  } catch (error) {
    console.error("Load favorite campaigns error:", error);

    updateResultCount(0);

    if (favoriteCountText) {
      favoriteCountText.textContent = "Explore 0 favorite campaigns";
    }

    if (favoriteGrid) {
      favoriteGrid.style.display = "none";
    }

    if (emptyBox) {
      emptyBox.style.display = "block";
      emptyBox.textContent = "Failed to load campaigns from server.";
    }
  }
}

/* =========================
   HELPER FUNCTIONS
========================= */
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

function formatCategoryName(categoryName) {
  if (!categoryName) return "Others";

  const name = categoryName.toLowerCase();

  if (name.includes("medical") || name.includes("health")) {
    return "Health";
  }

  if (name.includes("education")) {
    return "Education";
  }

  if (name.includes("animal")) {
    return "Animals";
  }

  if (name.includes("disaster") || name.includes("relief")) {
    return "Disaster";
  }

  if (name.includes("community")) {
    return "Community";
  }

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

function removeFavorite(id) {
  const favoriteIds = getFavoriteIds().filter(function (favoriteId) {
    return favoriteId !== Number(id);
  });

  saveFavoriteIds(favoriteIds);
  renderFavoriteCampaigns();
}

/* =========================
   FILTER FAVOURITES
========================= */
function getVisibleFavoriteCampaigns() {
  const favoriteIds = getFavoriteIds();

  let favoriteCampaigns = campaigns.filter(function (campaign) {
    return favoriteIds.includes(Number(campaign.id));
  });

  if (activeCategory !== "all") {
    favoriteCampaigns = favoriteCampaigns.filter(function (campaign) {
      return campaign.category === activeCategory;
    });
  }

  return favoriteCampaigns;
}

/* =========================
   RESULT COUNT
========================= */
function updateResultCount(count) {
  if (resultCountBtn) {
    resultCountBtn.textContent = count + " ▼";
  }
}

/* =========================
   RENDER FAVOURITES
========================= */
function renderFavoriteCampaigns() {
  if (!favoriteGrid) return;

  const favoriteCampaigns = getVisibleFavoriteCampaigns();
  const count = favoriteCampaigns.length;

  favoriteGrid.innerHTML = "";
  updateResultCount(count);

  if (favoriteCountText) {
    const categoryText = activeCategory === "all" ? "" : " in " + activeCategory;

    favoriteCountText.textContent =
      "Explore " +
      count +
      " favorite campaign" +
      (count === 1 ? "" : "s") +
      categoryText;
  }

  if (favoriteCampaigns.length === 0) {
    if (emptyBox) {
      emptyBox.style.display = "block";
      emptyBox.textContent =
        activeCategory === "all"
          ? "No favorite campaigns yet"
          : "No favorite campaigns found in " + activeCategory;
    }

    favoriteGrid.style.display = "none";
    return;
  }

  if (emptyBox) {
    emptyBox.style.display = "none";
  }

  favoriteGrid.style.display = "grid";

  favoriteCampaigns.forEach(function (campaign) {
    const card = document.createElement("article");
    card.className = "campaign-card";

    card.innerHTML = `
      <div class="card-image" style="background-image:url('${campaign.image}')">
        <button class="heart-btn active" data-id="${campaign.id}" type="button">❤</button>
      </div>

      <div class="card-body">
        <div class="card-title">${campaign.title}</div>
        <div class="card-line">👤 ${campaign.org}</div>
        <div class="card-line">✉️ ${campaign.email}</div>

        <div class="card-amount">
          <strong>${campaign.raised}</strong> raised of ${campaign.goal}
        </div>

        <div class="progress-track">
          <div class="progress-bar" style="width:${campaign.progress}%"></div>
        </div>

        <div class="card-footer">
          <span>${campaign.donors} donors</span>
          <span>${campaign.daysLeft} days left</span>
        </div>
      </div>
    `;

    card.addEventListener("click", function (event) {
      if (event.target.classList.contains("heart-btn")) return;

      window.location.href = "campaignDetail.html?id=" + campaign.id;
    });

    const heartBtn = card.querySelector(".heart-btn");

    heartBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      removeFavorite(campaign.id);
    });

    favoriteGrid.appendChild(card);
  });
}

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

document.querySelectorAll(".chip-item").forEach(function (item) {
  item.addEventListener("click", function (event) {
    event.stopPropagation();

    activeCategory = item.dataset.category || "all";

    if (causesBtn) {
      causesBtn.textContent = item.textContent + " ▼";
    }

    if (causesDropdown) {
      causesDropdown.classList.remove("open");
    }

    renderFavoriteCampaigns();
  });
});

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
loadActivitiesFromDatabase();