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
   HEADER PROFILE
========================= */
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

/* =========================
   CAMPAIGN DATA
========================= */
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
    shortDesc: "Help us provide nutritious meals for children in need. Your support ensures that no child goes to bed hungry.",
    about: "We aim to provide healthy and balanced meals to children from underprivileged families and vulnerable communities."
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
    shortDesc: "Help us bring health, joy and connection to vulnerable seniors through our kindness initiative.",
    about: "This initiative supports elderly members of the community."
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
    shortDesc: "Your support helps provide urgent relief aid and humanitarian assistance for affected communities.",
    about: "Funds raised will support emergency relief operations."
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
    shortDesc: "Support medical treatment and care for rescued animals in need through this SOSD fundraiser.",
    about: "Donations help cover rescue, surgery, medicine, foster care, and recovery treatment."
  }
];

/* =========================
   DONATION DATA
========================= */
const donationRecords = [
  {
    campaignId: 1,
    amount: 100,
    date: "20 May 2026",
    paymentMethod: "PayNow",
    status: "Successful"
  },
  {
    campaignId: 4,
    amount: 30,
    date: "05 May 2026",
    paymentMethod: "Credit Card",
    status: "Successful"
  },
  {
    campaignId: 2,
    amount: 50,
    date: "28 Apr 2026",
    paymentMethod: "Credit Card",
    status: "Successful"
  },
  {
    campaignId: 2,
    amount: 25,
    date: "18 Apr 2026",
    paymentMethod: "PayNow",
    status: "Successful"
  },
  {
    campaignId: 3,
    amount: 80,
    date: "12 Apr 2026",
    paymentMethod: "PayNow",
    status: "Successful"
  }
];

const donationTableBody = document.getElementById("donationTableBody");
const donationSearch = document.getElementById("donationSearch");

const totalCampaigns = document.getElementById("totalCampaigns");
const totalDonations = document.getElementById("totalDonations");
const firstDonation = document.getElementById("firstDonation");
const latestDonation = document.getElementById("latestDonation");

function getCampaignById(id) {
  return campaigns.find(function (campaign) {
    return campaign.id === id;
  });
}

function renderStats(records) {
  const uniqueCampaignIds = new Set(
    records.map(function (record) {
      return record.campaignId;
    })
  );

  totalCampaigns.textContent = uniqueCampaignIds.size;
  totalDonations.textContent = records.length;
  firstDonation.textContent = records.length ? records[records.length - 1].date : "-";
  latestDonation.textContent = records.length ? records[0].date : "-";
}

function renderDonations() {
  const keyword = donationSearch.value.toLowerCase();

  const visibleRecords = donationRecords.filter(function (record) {
    const campaign = getCampaignById(record.campaignId);

    if (!campaign) {
      return false;
    }

    return (
      campaign.title.toLowerCase().includes(keyword) ||
      campaign.category.toLowerCase().includes(keyword) ||
      record.date.toLowerCase().includes(keyword)
    );
  });

  renderStats(donationRecords);
  donationTableBody.innerHTML = "";

  if (visibleRecords.length === 0) {
    donationTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-row">No donation record found.</td>
      </tr>
    `;
    return;
  }

  visibleRecords.forEach(function (record) {
    const campaign = getCampaignById(record.campaignId);

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <div class="campaign-cell">
          <img src="${campaign.image}" alt="${campaign.title}" class="campaign-thumb" />
          <div>
            <div class="campaign-cell-title">${campaign.title}</div>
            <div class="campaign-cell-desc">${campaign.shortDesc}</div>
          </div>
        </div>
      </td>

      <td>
        <span class="category-pill ${campaign.categoryClass}">
          ${campaign.category}
        </span>
      </td>

      <td>${record.date}</td>
      <td>SGD ${record.amount}</td>

      <td>
        <span class="status-pill">${record.status}</span>
      </td>

      <td>
        <button class="view-campaign-btn" data-id="${campaign.id}" type="button">
          👁 View Campaign
        </button>
      </td>
    `;

    donationTableBody.appendChild(row);
  });

  document.querySelectorAll(".view-campaign-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      window.location.href = "mydonationView.html?id=" + button.dataset.id;
    });
  });
}

if (donationSearch) {
  donationSearch.addEventListener("input", renderDonations);
}

/* =========================
   CLOSE DROPDOWNS
========================= */
document.addEventListener("click", function () {
  document.querySelectorAll(".nav-dropdown").forEach(function (item) {
    item.classList.remove("open");
  });
});

renderDonations();