/* =========================
   ACCOUNT RETAIN ISSUE  
========================= */

if (!sessionStorage.getItem("booted")) {
  localStorage.removeItem("loggedInUser");
  sessionStorage.setItem("booted", "true");
}

/* =========================
   LOGIN CHECK
========================= */
function getLoggedInUser() {
  const savedUser = localStorage.getItem("loggedInUser");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch (error) {
    console.error("Invalid loggedInUser data:", error);
    localStorage.removeItem("loggedInUser");
    return null;
  }
}

function isLoggedIn() {
  const user = getLoggedInUser();

  if (!user || !user.user_id) {
    return false;
  }

  return true;
}

function getUserRole() {
  const user = getLoggedInUser();

  if (!user || !user.role_name) {
    return "";
  }

  return user.role_name.toLowerCase().trim();
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

  event.preventDefault();
  event.stopPropagation();

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

// If user is Fundraiser, disable Donee button
setupDropdown("donateMenuBtn", "donateDropdown", blockDonateIfFundraiser);

// If user is Donee, disable Fundraise button
setupDropdown("fundraiseMenuBtn", "fundraiseDropdown", blockFundraiseIfDonee);

// Normal dropdowns
setupDropdown("aboutMenuBtn", "aboutDropdown");
setupDropdown("profileMenuBtn", "profileDropdown");

document.addEventListener("click", function () {
  document.querySelectorAll(".nav-dropdown").forEach(function (item) {
    item.classList.remove("open");
  });
});

/* =========================
   DISABLE LINKS BASED ON ROLE
========================= */
function protectHomepageLinks() {
  const allLinks = document.querySelectorAll("a");

  allLinks.forEach(function (link) {
    const href = link.getAttribute("href");

    if (!href) return;

    const lowerHref = href.toLowerCase();

    // Donee pages / donate pages
    const isDoneeLink =
      lowerHref.includes("browsecampaign.html") ||
      lowerHref.includes("mydonation.html") ||
      lowerHref.includes("campaigndetail.html");

    // Fundraiser pages
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

protectHomepageLinks();

/* =========================
   PROTECT LINKS THAT NEED LOGIN
========================= */
document.querySelectorAll(".auth-required").forEach(function (link) {
  link.addEventListener("click", function (event) {
    requireLogin(event);
  });
});

/* =========================
   SIGN IN / PROFILE DISPLAY
========================= */
const signinHeaderBtn = document.getElementById("signinHeaderBtn");
const profileDropdown = document.getElementById("profileDropdown");
const headerAvatar = document.getElementById("headerAvatar");
const headerName = document.getElementById("headerName");
const signOutBtn = document.getElementById("signOutBtn");

function renderHeaderAuth() {
  const user = getLoggedInUser();

  if (!user) {
    if (signinHeaderBtn) {
      signinHeaderBtn.classList.remove("hidden");
    }

    if (profileDropdown) {
      profileDropdown.classList.add("hidden");
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
   SCROLL ANIMATION
========================= */
const observer = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal, .reveal-stagger").forEach(function (element) {
  observer.observe(element);
});