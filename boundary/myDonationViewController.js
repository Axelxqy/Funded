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

document.addEventListener("click", function () {
  document.querySelectorAll(".nav-dropdown").forEach(function (item) {
    item.classList.remove("open");
  });
});

/* =========================
   HEADER PROFILE
========================= */
const headerAvatar = document.getElementById("headerAvatar");
const headerName = document.getElementById("headerName");
const signOutBtn = document.getElementById("signOutBtn");

function getLoggedInUser() {
  const saved = localStorage.getItem("loggedInUser");

  if (!saved) return null;

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
    startedOn: "10 Apr 2026",
    image:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80",
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
    startedOn: "15 Apr 2026",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
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
    startedOn: "18 Apr 2026",
    image:
      "https://images.unsplash.com/photo-1618477462146-050d2767eac4?auto=format&fit=crop&w=900&q=80",
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
    startedOn: "20 Apr 2026",
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
    shortDesc:
      "Support medical treatment and care for rescued animals in need through this SOSD fundraiser.",
    about:
      "Donations help cover rescue, surgery, medicine, foster care, recovery treatment, and ongoing medical support for vulnerable animals."
  }
];

/* =========================
   ELEMENTS
========================= */
const campaignImage = document.getElementById("campaignImage");
const campaignTitle = document.getElementById("campaignTitle");
const campaignCategory = document.getElementById("campaignCategory");
const campaignOrg = document.getElementById("campaignOrg");
const campaignShortDesc = document.getElementById("campaignShortDesc");
const supportMessage = document.getElementById("supportMessage");

const campaignStartedOn = document.getElementById("campaignStartedOn");
const sideCategory = document.getElementById("sideCategory");

const campaignAbout = document.getElementById("campaignAbout");
const donationTableBody = document.getElementById("donationTableBody");

const backBtn = document.getElementById("backBtn");
const backTopBtn = document.getElementById("backTopBtn");
const viewFullCampaignBtn = document.getElementById("viewFullCampaignBtn");

let currentCampaign = null;

/* =========================
   LOCAL STORAGE
========================= */
function getDonationRecords() {
  const saved = localStorage.getItem("donation_records");

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    return [];
  }
}

function getCampaignIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id")) || 1;
}

function getDonationsForCampaign(campaignId) {
  return getDonationRecords().filter(function (record) {
    return Number(record.campaign_id) === Number(campaignId);
  });
}

/* =========================
   RENDER PAGE
========================= */
function renderDonationView() {
  const campaignId = getCampaignIdFromUrl();

  currentCampaign =
    campaigns.find(function (campaign) {
      return campaign.id === campaignId;
    }) || campaigns[0];

  const donations = getDonationsForCampaign(currentCampaign.id);

  campaignImage.src = currentCampaign.image;
  campaignTitle.textContent = currentCampaign.title;

  campaignCategory.textContent = currentCampaign.category;
  campaignCategory.className = "category-pill " + currentCampaign.categoryClass;

  campaignOrg.textContent = "Organized by " + currentCampaign.org + " ✅";
  campaignShortDesc.textContent = currentCampaign.shortDesc;
  campaignStartedOn.textContent = currentCampaign.startedOn;
  sideCategory.textContent = currentCampaign.category;
  campaignAbout.textContent = currentCampaign.about;

  if (donations.length === 0) {
    supportMessage.className = "support-message no-support-message";
    supportMessage.innerHTML = `
      <span class="support-title">No donation yet</span>
      You have not donated to this campaign yet.
    `;

    donationTableBody.innerHTML = `
      <tr>
        <td colspan="4">No donation record found.</td>
      </tr>
    `;

    return;
  }

  const latestDonation = donations[0];

  supportMessage.className = "support-message";
  supportMessage.innerHTML = `
    <span class="support-title">♡ Thank you for your support!</span>
    You recently donated <strong>SGD ${latestDonation.amount}</strong>
    to this campaign on ${latestDonation.date}. Every contribution makes a real difference.
  `;

  donationTableBody.innerHTML = donations
    .map(function (donation) {
      return `
        <tr>
          <td>${donation.date}</td>
          <td>SGD ${donation.amount}</td>
          <td>${donation.payment_method}</td>
          <td>
            <span class="status-pill status-success">${donation.status}</span>
          </td>
        </tr>
      `;
    })
    .join("");
}

/* =========================
   BUTTONS
========================= */
function goBackToMyDonations() {
  window.location.href = "myDonation.html";
}

if (backBtn) {
  backBtn.addEventListener("click", goBackToMyDonations);
}

if (backTopBtn) {
  backTopBtn.addEventListener("click", goBackToMyDonations);
}

if (viewFullCampaignBtn) {
  viewFullCampaignBtn.addEventListener("click", function () {
    if (!currentCampaign) return;
    window.location.href = "campaignDetail.html?id=" + currentCampaign.id;
  });
}

renderDonationView();