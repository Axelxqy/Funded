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

const campaigns = [
  {
    id: 1,
    title: "Provide Meals for Children",
    category: "Health",
    categoryClass: "health",
    org: "Helping Hands Foundation",
    email: "meals@helpinghands.org",
    raised: "$350,604",
    goal: "$1,000,000",
    donors: 2608,
    daysLeft: 50,
    progress: 52,
    image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 2,
    title: "Bringing Health, Joy and Connection to Our Seniors",
    category: "Community",
    categoryClass: "community",
    org: "Sian Chay Medical Institution",
    email: "sianchay@gmail.com",
    raised: "$102,901",
    goal: "$500,000",
    donors: 1007,
    daysLeft: 30,
    progress: 21,
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 3,
    title: "Support for Relief Operations in Gaza",
    category: "Disaster",
    categoryClass: "disaster",
    org: "Singapore Red Cross Society",
    email: "redcross@gmail.com",
    raised: "$390,815",
    goal: "$500,000",
    donors: 1561,
    daysLeft: 18,
    progress: 74,
    image: "https://images.unsplash.com/photo-1618477462146-050d2767eac4?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 4,
    title: "SOSD Medical Fundraiser 2026/27",
    category: "Animals",
    categoryClass: "animals",
    org: "SOSD",
    email: "sosd@gmail.com",
    raised: "$9,899",
    goal: "$150,000",
    donors: 55,
    daysLeft: 42,
    progress: 7,
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80"
  }
];

let activeCategory = "all";

const favoriteGrid = document.getElementById("favoriteGrid");
const emptyBox = document.getElementById("emptyBox");
const favoriteCountText = document.getElementById("favoriteCountText");

const causesDropdown = document.getElementById("causesDropdown");
const causesBtn = document.getElementById("causesBtn");

/* =========================
   FAVOURITE LOCAL STORAGE
========================= */
function getFavoriteIds() {
  const saved = localStorage.getItem("fav_id");

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    return [];
  }
}

function saveFavoriteIds(ids) {
  localStorage.setItem("fav_id", JSON.stringify(ids));
}

function removeFavorite(id) {
  const favoriteIds = getFavoriteIds().filter(function (favoriteId) {
    return favoriteId !== id;
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
    return favoriteIds.includes(campaign.id);
  });

  if (activeCategory !== "all") {
    favoriteCampaigns = favoriteCampaigns.filter(function (campaign) {
      return campaign.category === activeCategory;
    });
  }

  return favoriteCampaigns;
}

/* =========================
   RENDER FAVOURITES
========================= */
function renderFavoriteCampaigns() {
  if (!favoriteGrid) return;

  const favoriteCampaigns = getVisibleFavoriteCampaigns();

  favoriteGrid.innerHTML = "";

  if (favoriteCountText) {
    favoriteCountText.textContent = "Explore favorite campaigns";
  }

  if (favoriteCampaigns.length === 0) {
    if (emptyBox) {
      emptyBox.style.display = "block";
      emptyBox.textContent = "No favorite campaigns yet";
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

    card.querySelector(".heart-btn").addEventListener("click", function (event) {
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
    causesDropdown.classList.toggle("open");
  });
}

document.querySelectorAll(".chip-item").forEach(function (item) {
  item.addEventListener("click", function (event) {
    event.stopPropagation();

    activeCategory = item.dataset.category || "all";
    causesBtn.textContent = item.textContent + " ▼";
    causesDropdown.classList.remove("open");

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

renderFavoriteCampaigns();