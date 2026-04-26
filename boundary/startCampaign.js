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

function protectFundraiserPage() {
  const loggedInUser = getLoggedInUser();

  if (!loggedInUser) {
    alert("Please login first before creating a campaign.");
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

  // Same as homepage: show first name only
  if (headerName) {
    headerName.textContent = firstName || email || "User";
  }

  // Same as homepage: show first letter
  if (headerAvatar) {
    headerAvatar.textContent =
      firstName.charAt(0).toUpperCase() ||
      email.charAt(0).toUpperCase() ||
      "U";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  protectFundraiserPage();
  updateHeaderUser();
});

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
   FORM ELEMENTS
========================= */
const campaignTitle = document.getElementById("campaignTitle");
const fundraisingGoal = document.getElementById("fundraisingGoal");

const titleStar = document.getElementById("titleStar");
const categoryStar = document.getElementById("categoryStar");
const goalStar = document.getElementById("goalStar");
const durationStar = document.getElementById("durationStar");
const imageStar = document.getElementById("imageStar");
const descriptionStar = document.getElementById("descriptionStar");

/* =========================
   REQUIRED STAR CONTROL
========================= */
function toggleStar(inputElement, starElement) {
  if (!inputElement || !starElement) return;

  if (inputElement.value.trim() !== "") {
    starElement.classList.add("hide");
  } else {
    starElement.classList.remove("hide");
  }
}

function checkCategoryStar() {
  if (!categoryValue || !categoryStar) return;

  if (categoryValue.value.trim() !== "") {
    categoryStar.classList.add("hide");
  } else {
    categoryStar.classList.remove("hide");
  }
}

function checkDurationStar() {
  if (!startDateInput || !endDateInput || !durationStar) return;

  if (
    startDateInput.value.trim() !== "" &&
    endDateInput.value.trim() !== ""
  ) {
    durationStar.classList.add("hide");
  } else {
    durationStar.classList.remove("hide");
  }
}

function checkImageStar() {
  if (!campaignImageInput || !imageStar) return;

  if (campaignImageInput.files.length > 0) {
    imageStar.classList.add("hide");
  } else {
    imageStar.classList.remove("hide");
  }
}

/* =========================
   CATEGORY DROPDOWN
========================= */
const categorySelect = document.getElementById("categorySelect");
const categoryBtn = document.getElementById("categoryBtn");
const categoryText = document.getElementById("categoryText");
const categoryValue = document.getElementById("categoryValue");
const otherCategoryInput = document.getElementById("otherCategoryInput");
const otherCategoryArrow = document.getElementById("otherCategoryArrow");
const categoryOptions = document.querySelectorAll(".select-option");

if (categorySelect && categoryBtn) {
  categoryBtn.addEventListener("click", function (event) {
    event.stopPropagation();

    navDropdowns.forEach(function (dropdown) {
      dropdown.classList.remove("open");
    });

    if (profileDropdown) {
      profileDropdown.classList.remove("open");
    }

    categorySelect.classList.toggle("open");
  });
}

if (otherCategoryArrow && categorySelect) {
  otherCategoryArrow.addEventListener("click", function (event) {
    event.stopPropagation();
    categorySelect.classList.toggle("open");
  });
}

categoryOptions.forEach(function (option) {
  option.addEventListener("click", function (event) {
    event.stopPropagation();

    categoryOptions.forEach(function (item) {
      item.classList.remove("selected");
    });

    option.classList.add("selected");

    const selectedValue = option.getAttribute("data-value");

    if (selectedValue === "Others") {
      categorySelect.classList.add("typing-mode");
      categorySelect.classList.remove("open");

      categoryText.textContent = "Others:";
      categoryValue.value = otherCategoryInput.value.trim();

      otherCategoryInput.focus();
      checkCategoryStar();
    } else {
      categorySelect.classList.remove("typing-mode");
      categorySelect.classList.remove("open");

      categoryText.textContent = selectedValue;
      categoryValue.value = selectedValue;

      otherCategoryInput.value = "";
      checkCategoryStar();
    }
  });
});

if (otherCategoryInput) {
  otherCategoryInput.addEventListener("input", function () {
    categoryValue.value = otherCategoryInput.value.trim();
    checkCategoryStar();
  });
}

/* =========================
   DATE PICKER
========================= */
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");

if (startDateInput && endDateInput) {
  const endPicker = flatpickr("#endDate", {
    dateFormat: "F j, Y",
    minDate: "today",
    disableMobile: true,
    monthSelectorType: "static",
    showMonths: 1,
    onChange: function () {
      checkDurationStar();
    },
  });

  flatpickr("#startDate", {
    dateFormat: "F j, Y",
    minDate: "today",
    disableMobile: true,
    monthSelectorType: "static",
    showMonths: 1,
    onChange: function (selectedDates) {
      if (selectedDates.length > 0) {
        endPicker.set("minDate", selectedDates[0]);
      }

      checkDurationStar();
    },
  });
}

/* =========================
   IMAGE UPLOAD PREVIEW
========================= */
const uploadBox = document.getElementById("uploadBox");
const chooseFileBtn = document.getElementById("chooseFileBtn");
const uploadAgainBtn = document.getElementById("uploadAgainBtn");
const campaignImageInput = document.getElementById("campaignImageInput");
const imagePreview = document.getElementById("imagePreview");

function openImagePicker() {
  if (campaignImageInput) {
    campaignImageInput.click();
  }
}

if (chooseFileBtn) {
  chooseFileBtn.addEventListener("click", openImagePicker);
}

if (uploadAgainBtn) {
  uploadAgainBtn.addEventListener("click", openImagePicker);
}

if (campaignImageInput && imagePreview && uploadBox) {
  campaignImageInput.addEventListener("change", function () {
    const file = campaignImageInput.files[0];

    if (!file) {
      checkImageStar();
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file only.");
      campaignImageInput.value = "";
      checkImageStar();
      return;
    }

    const imageURL = URL.createObjectURL(file);

    imagePreview.src = imageURL;
    uploadBox.classList.add("has-image");

    checkImageStar();
  });
}

/* =========================
   DESCRIPTION WORD COUNT
========================= */
const campaignDescription = document.getElementById("campaignDescription");
const descriptionCount = document.getElementById("descriptionCount");

if (campaignDescription && descriptionCount) {
  campaignDescription.addEventListener("input", function () {
    const text = campaignDescription.value.trim();
    const wordCount = text === "" ? 0 : text.split(/\s+/).length;

    descriptionCount.textContent = wordCount + " / 1000 Words";

    toggleStar(campaignDescription, descriptionStar);
  });
}

/* =========================
   NORMAL INPUT REQUIRED STAR
========================= */
if (campaignTitle) {
  campaignTitle.addEventListener("input", function () {
    toggleStar(campaignTitle, titleStar);
  });
}

if (fundraisingGoal) {
  fundraisingGoal.addEventListener("input", function () {
    toggleStar(fundraisingGoal, goalStar);
  });
}

/* =========================
   DATABASE SUBMIT
========================= */
const campaignForm = document.querySelector(".campaign-form");

function convertDateToSql(dateText) {
  if (!dateText) return null;

  const date = new Date(dateText);
  if (isNaN(date.getTime())) return null;

  return date.toISOString().split("T")[0];
}

function getCategoryId(categoryName) {
  const categoryMap = {
    Medical: 1,
    Education: 2,
    Emergency: 3,
    "Animal Welfare": 4,
    Community: 5,
    Environment: 6,
  };

  return categoryMap[categoryName] || null;
}

if (campaignForm) {
  campaignForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const loggedInUser = getLoggedInUser();

    if (!loggedInUser) {
      alert("Please login first before creating a campaign.");
      window.location.href = "login.html";
      return;
    }

    const activity_name = campaignTitle.value.trim();
    const categoryName = categoryValue.value.trim();
    const category_id = getCategoryId(categoryName);
    const fundraise_goal = fundraisingGoal.value.trim();
    const start_date = convertDateToSql(startDateInput.value);
    const end_date = convertDateToSql(endDateInput.value);
    const description = campaignDescription.value.trim();

    if (
      !activity_name ||
      !categoryName ||
      !fundraise_goal ||
      !start_date ||
      !end_date ||
      !description ||
      !campaignImageInput.files ||
      campaignImageInput.files.length === 0
    ) {
      alert("Please fill in all required fields and upload a campaign image.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activity_name,
          category_id,
          category_name: categoryName,
          fundraise_goal,
          start_date,
          end_date,
          description,
          created_by: loggedInUser.user_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create campaign.");
        return;
      }

      alert("Campaign created successfully.");
      window.location.href = "myCampaign.html";
    } catch (error) {
      console.error("Create campaign error:", error);
      alert("Cannot connect to backend.");
    }
  });
}