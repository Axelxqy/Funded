/* =========================
   HEADER NAV DROPDOWNS
========================= */
const navDropdowns = document.querySelectorAll(".nav-dropdown");
const profileDropdown = document.getElementById("profileDropdown");
const profileBtn = document.getElementById("profileBtn");

navDropdowns.forEach(function (dropdown) {
  const button = dropdown.querySelector(".nav-button");

  if (!button) return;

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
    }
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
    }
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
   CLOSE DROPDOWNS WHEN CLICK OUTSIDE
========================= */
document.addEventListener("click", function (event) {
  navDropdowns.forEach(function (dropdown) {
    dropdown.classList.remove("open");
  });

  if (profileDropdown) {
    profileDropdown.classList.remove("open");
  }

  if (categorySelect && !categorySelect.contains(event.target)) {
    categorySelect.classList.remove("open");
  }
});