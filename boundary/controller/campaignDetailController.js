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

document.addEventListener("click", function () {
  document.querySelectorAll(".nav-dropdown").forEach(function (item) {
    item.classList.remove("open");
  });
});

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
    image:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80",
    poster:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80",
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
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
    poster:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
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
    image:
      "https://images.unsplash.com/photo-1618477462146-050d2767eac4?auto=format&fit=crop&w=900&q=80",
    poster:
      "https://images.unsplash.com/photo-1593113598332-cd59a93c6132?auto=format&fit=crop&w=900&q=80",
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
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
    poster:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
    shortDesc:
      "Support medical treatment and care for rescued animals in need through this SOSD fundraiser.",
    about:
      "Donations help cover rescue, surgery, medicine, foster care, recovery treatment, and ongoing medical support for vulnerable animals."
  }
];

let currentCampaignId = null;

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
const donationInput = document.getElementById("donationInput");
const donationSummary = document.getElementById("donationSummary");
const donateNowBtn = document.getElementById("donateNowBtn");

const donorsPanel = document.getElementById("donorsPanel");
const detailTabs = document.querySelectorAll(".detail-tab");
const detailPanels = document.querySelectorAll(".detail-panel");

/* =========================
   FAVOURITE LOCAL STORAGE
   Must match browseCampaignController.js
   and favoriteCampaignController.js
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
  updateHeart();
}

/* =========================
   DONORS LOCAL STORAGE
========================= */
function getDonorKey() {
  return "donors_campaign_" + currentCampaignId;
}

function getDonors() {
  const saved = localStorage.getItem(getDonorKey());

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    return [];
  }
}

function saveDonors(donors) {
  localStorage.setItem(getDonorKey(), JSON.stringify(donors));
}

/* =========================
   CAMPAIGN DETAIL
========================= */
function getCampaignIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id")) || 1;
}

function openDetail() {
  currentCampaignId = getCampaignIdFromUrl();

  const campaign =
    campaigns.find(function (item) {
      return item.id === currentCampaignId;
    }) || campaigns[0];

  currentCampaignId = campaign.id;

  detailTitle.textContent = campaign.title;
  detailOrg.textContent = "👤 " + campaign.org;
  detailEmail.textContent = "✉️ " + campaign.email;
  detailMainImg.src = campaign.image;
  detailSideImg.src = campaign.poster;
  detailDesc.textContent = campaign.shortDesc;
  detailRaised.textContent = campaign.raised;
  detailGoal.textContent = "raised of " + campaign.goal;
  detailProgressBar.style.width = campaign.progress + "%";
  detailDonors.textContent = campaign.donors;
  detailDays.textContent = campaign.daysLeft;
  detailAbout.textContent = campaign.about;

  updateHeart();
  renderDonors();
}

function updateHeart() {
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
   DONATION / DONORS
========================= */
function formatDateTime() {
  const now = new Date();

  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();

  let h = now.getHours();
  const min = String(now.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";

  h = h % 12 || 12;

  return d + "/" + m + "/" + y + " " + h + ":" + min + " " + ap;
}

function renderDonors() {
  const donors = getDonors();

  if (donors.length === 0) {
    donorsPanel.innerHTML = `<div class="no-donors">No donor donate yet</div>`;
    return;
  }

  donorsPanel.innerHTML = donors
    .map(function (donor) {
      return `
        <div class="donor-card">
          <div class="donor-icon">❤</div>

          <div>
            <div class="donor-main">
              ${donor.name} - donated $${Number(donor.amount).toFixed(2)}
            </div>

            <div class="donor-time">${donor.time}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

/* =========================
   EVENT LISTENERS
========================= */
backBtn.addEventListener("click", function () {
  window.location.href = "browseCampaign.html";
});

detailHeart.addEventListener("click", function () {
  toggleFavorite(currentCampaignId);
});

detailTabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    activateDetailTab(tab.dataset.panel);
  });
});

scrollDonateBtn.addEventListener("click", function () {
  activateDetailTab("donatePanel");
  document.getElementById("donatePanel").scrollIntoView({
    behavior: "smooth"
  });
});

donationInput.addEventListener("input", function () {
  const value = Number(donationInput.value) || 0;
  donationSummary.textContent = "SGD " + value;
});

donateNowBtn.addEventListener("click", function () {
  const amount = Number(donationInput.value) || 0;

  if (amount <= 0) {
    alert("Please enter a donation amount first.");
    return;
  }

  const donors = getDonors();

  donors.unshift({
    name: "Anonymous",
    amount: amount,
    time: formatDateTime()
  });

  saveDonors(donors);

  donationInput.value = "";
  donationSummary.textContent = "SGD 0";

  activateDetailTab("donorsPanel");
  renderDonors();

  alert("Donation successful. Thank you for your support!");
});

openDetail();