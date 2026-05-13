/* =========================
   LOGIN / ROLE CHECK
========================= */
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

function getUserRole() {
  const user = getLoggedInUser();

  if (!user || !user.role_name) {
    return "";
  }

  return String(user.role_name).toLowerCase().trim();
}

function isDonee() {
  return getUserRole() === "donee";
}

function isFundraiser() {
  const role = getUserRole();

  return (
    role === "fundraiser" ||
    role === "fund raiser" ||
    role === "fund_raiser"
  );
}

function requireLogin(event) {
  if (isLoggedIn()) {
    return true;
  }

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  alert("Please sign in first to continue.");
  window.location.href = "login.html";

  return false;
}

/* =========================
   ROLE BLOCKING
========================= */
function blockFundraiseIfDonee(event) {
  if (!isLoggedIn()) {
    return requireLogin(event);
  }

  if (isDonee()) {
    event.preventDefault();
    event.stopPropagation();

    alert("Donee users cannot access Fundraise functions.");
    return false;
  }

  return true;
}

function blockDonateIfFundraiser(event) {
  if (!isLoggedIn()) {
    return requireLogin(event);
  }

  if (isFundraiser()) {
    event.preventDefault();
    event.stopPropagation();

    alert("Fundraiser users cannot access Donee functions.");
    return false;
  }

  return true;
}

/* =========================
   DROPDOWN SETUP
========================= */
function setupDropdown(buttonId, dropdownId, blockFunction) {
  const button = document.getElementById(buttonId);
  const dropdown = document.getElementById(dropdownId);

  if (!button || !dropdown) return;

  button.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    if (blockFunction) {
      const allowed = blockFunction(event);

      if (!allowed) {
        return;
      }
    }

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

/* =========================
   HEADER DROPDOWNS
========================= */

// Fundraiser cannot open Donee dropdown
setupDropdown("donateMenuBtn", "donateDropdown", blockDonateIfFundraiser);

// Donee cannot open Fundraise dropdown
setupDropdown("fundraiseMenuBtn", "fundraiseDropdown", blockFundraiseIfDonee);

// Normal dropdowns
setupDropdown("aboutMenuBtn", "aboutDropdown");
setupDropdown("profileMenuBtn", "profileDropdown");

/* =========================
   PROTECT LINKS BASED ON ROLE
========================= */
function protectRoleLinks() {
  const allLinks = document.querySelectorAll("a");

  allLinks.forEach(function (link) {
    const href = link.getAttribute("href");

    if (!href) return;

    const lowerHref = href.toLowerCase();

    const isDoneeLink =
      lowerHref.includes("browsecampaign.html") ||
      lowerHref.includes("mydonation.html") ||
      lowerHref.includes("mydonationview.html") ||
      lowerHref.includes("campaigndetail.html");

    const isFundraiserLink =
      lowerHref.includes("startcampaign.html") ||
      lowerHref.includes("mycampaign.html");

    if (isDoneeLink) {
      link.addEventListener("click", function (event) {
        blockDonateIfFundraiser(event);
      });
    }

    if (isFundraiserLink) {
      link.addEventListener("click", function (event) {
        blockFundraiseIfDonee(event);
      });
    }
  });
}

protectRoleLinks();

/* =========================
   HEADER PROFILE
========================= */
const headerAvatar = document.getElementById("headerAvatar");
const headerName = document.getElementById("headerName");
const signOutBtn = document.getElementById("signOutBtn");

function renderHeaderProfile() {
  const user = getLoggedInUser();

  if (!user) {
    if (headerAvatar) {
      headerAvatar.textContent = "U";
    }

    if (headerName) {
      headerName.textContent = "User";
    }

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
  signOutBtn.addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.removeItem("loggedInUser");

    window.location.href = "homepage.html";
  });
}

renderHeaderProfile();

/* =========================
   CLOSE DROPDOWNS
========================= */
document.addEventListener("click", function () {
  document.querySelectorAll(".nav-dropdown").forEach(function (item) {
    item.classList.remove("open");
  });
});