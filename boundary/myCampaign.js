/* =========================
   HEADER NAV DROPDOWNS
========================= */
const navDropdowns = document.querySelectorAll(".nav-dropdown");
const profileDropdown = document.getElementById("profileDropdown");
const profileBtn = document.getElementById("profileBtn");

navDropdowns.forEach(function (dropdown) {
  const button = dropdown.querySelector(".nav-button");

  button.addEventListener("click", function (event) {
    event.stopPropagation();

    navDropdowns.forEach(function (item) {
      if (item !== dropdown) {
        item.classList.remove("open");
      }
    });

    if (profileDropdown) {
      profileDropdown.classList.remove("open");
    }

    dropdown.classList.toggle("open");
  });
});

/* =========================
   PROFILE DROPDOWN
========================= */
if (profileDropdown && profileBtn) {
  profileBtn.addEventListener("click", function (event) {
    event.stopPropagation();

    navDropdowns.forEach(function (dropdown) {
      dropdown.classList.remove("open");
    });

    profileDropdown.classList.toggle("open");
  });
}

/* =========================
   CLOSE DROPDOWNS WHEN CLICK OUTSIDE
========================= */
document.addEventListener("click", function () {
  navDropdowns.forEach(function (dropdown) {
    dropdown.classList.remove("open");
  });

  if (profileDropdown) {
    profileDropdown.classList.remove("open");
  }
});