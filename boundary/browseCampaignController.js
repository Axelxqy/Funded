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

  if (headerAvatar) {
    headerAvatar.textContent = initial;
  }

  if (headerName) {
    headerName.textContent = firstName || "User";
  }
}

if (signOutBtn) {
  signOutBtn.addEventListener("click", function () {
    localStorage.removeItem("loggedInUser");
  });
}

renderHeaderProfile();

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
    image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80",
    poster: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80",
    shortDesc:
      "Help us provide nutritious meals for children in need. Your support ensures that no child goes to bed hungry.",
    about:
      "We aim to provide healthy and balanced meals to children from underprivileged families and vulnerable communities. Proper nutrition is essential for their growth, learning, and overall well-being. Your donation will help us prepare and deliver meals, source essential ingredients, and support long-term food programs."
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
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
    poster: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
    shortDesc:
      "Help us bring health, joy and connection to vulnerable seniors through our kindness initiative.",
    about:
      "This initiative supports elderly members of the community by funding check-ups, companionship activities, outreach services, and well-being programmes that reduce loneliness and improve quality of life."
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
    image: "https://images.unsplash.com/photo-1618477462146-050d2767eac4?auto=format&fit=crop&w=900&q=80",
    poster: "https://images.unsplash.com/photo-1593113598332-cd59a93c6132?auto=format&fit=crop&w=900&q=80",
    shortDesc:
      "Your support helps provide urgent relief aid and humanitarian assistance for affected communities.",
    about:
      "Funds raised will support emergency relief operations, humanitarian logistics, medical assistance, and essential supplies for affected families and communities."
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
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
    poster: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
    shortDesc:
      "Support medical treatment and care for rescued animals in need through this SOSD fundraiser.",
    about:
      "Donations help cover rescue, surgery, medicine, foster care, recovery treatment, and ongoing medical support for vulnerable animals."
  }
];

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

function isFavorite(id) {
  return getFavoriteIds().includes(id);
}

function toggleFavorite(id) {
  let favoriteIds = getFavoriteIds();

  if (favoriteIds.includes(id)) {
    favoriteIds = favoriteIds.filter(function (favoriteId) {
      return favoriteId !== id;
    });
  } else {
    favoriteIds.push(id);
  }

  saveFavoriteIds(favoriteIds);
  renderCards();
}

function getVisibleCampaigns() {
  let visibleCampaigns = campaigns.slice();

  if (activeCampaignTab === "favorite") {
    visibleCampaigns = visibleCampaigns.filter(function (campaign) {
      return isFavorite(campaign.id);
    });
  }

  if (activeCategory !== "all") {
    visibleCampaigns = visibleCampaigns.filter(function (campaign) {
      return campaign.category === activeCategory;
    });
  }

  if (searchKeyword.trim() !== "") {
    const keyword = searchKeyword.toLowerCase();

    visibleCampaigns = visibleCampaigns.filter(function (campaign) {
      return (
        campaign.title.toLowerCase().includes(keyword) ||
        campaign.org.toLowerCase().includes(keyword) ||
        campaign.category.toLowerCase().includes(keyword)
      );
    });
  }

  return visibleCampaigns;
}

function renderCards() {
  if (!campaignGrid) return;

  campaignGrid.innerHTML = "";

  const visibleCampaigns = getVisibleCampaigns();

  if (exploreText) {
    exploreText.textContent =
      "Explore " +
      visibleCampaigns.length +
      " campaign" +
      (visibleCampaigns.length === 1 ? "" : "s");
  }

  if (visibleCampaigns.length === 0) {
    campaignGrid.innerHTML = `<div class="empty-message">No campaign found.</div>`;
    return;
  }

  visibleCampaigns.forEach(function (campaign) {
    const card = document.createElement("article");
    card.className = "campaign-card";

    card.innerHTML = `
      <div class="card-image" style="background-image:url('${campaign.image}')">
        <button class="heart-btn ${isFavorite(campaign.id) ? "active" : ""}" data-id="${campaign.id}" type="button">
          ${isFavorite(campaign.id) ? "❤" : "♡"}
        </button>
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
      toggleFavorite(campaign.id);
    });

    campaignGrid.appendChild(card);
  });
}

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
    causesBtn.textContent = item.textContent + " ▼";
    causesDropdown.classList.remove("open");

    renderCards();
  });
});

if (searchBtn && campaignSearch) {
  searchBtn.addEventListener("click", function () {
    searchKeyword = campaignSearch.value;
    renderCards();
  });

  campaignSearch.addEventListener("input", function () {
    searchKeyword = campaignSearch.value;
    renderCards();
  });
}

document.addEventListener("click", function () {
  document.querySelectorAll(".nav-dropdown").forEach(function (item) {
    item.classList.remove("open");
  });

  if (causesDropdown) {
    causesDropdown.classList.remove("open");
  }
});

renderCards();