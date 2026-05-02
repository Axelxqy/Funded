/* =========================
   HEADER NAV DROPDOWNS
========================= */
const navDropdowns = document.querySelectorAll(".nav-dropdown");
const profileDropdown = document.getElementById("profileDropdown");

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

  if (headerName) {
    headerName.textContent = firstName || email || "User";
  }

  if (headerAvatar) {
    headerAvatar.textContent =
      firstName.charAt(0).toUpperCase() ||
      email.charAt(0).toUpperCase() ||
      "U";
  }
}

/* =========================
   SIGN OUT
========================= */
const signOutBtn = document.getElementById("signOutBtn");

if (signOutBtn) {
  signOutBtn.addEventListener("click", function (event) {
    event.preventDefault();
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("editActivityId");
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
const descriptionStar = document.getElementById("descriptionStar");

const submitCampaignBtn =
  document.getElementById("submitCampaignBtn") ||
  document.querySelector(".submit-btn");

const cancelCampaignBtn =
  document.getElementById("cancelCampaignBtn") ||
  document.querySelector(".cancel-btn");

/* =========================
   EDIT MODE STATE
========================= */
let isEditMode = false;
let editActivityId = localStorage.getItem("editActivityId");

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
    event.preventDefault();
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
    event.preventDefault();
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

let startPicker = null;
let endPicker = null;

if (startDateInput && endDateInput) {
  endPicker = flatpickr("#endDate", {
    dateFormat: "F j, Y",
    minDate: "today",
    disableMobile: true,
    monthSelectorType: "static",
    showMonths: 1,
    onChange: function () {
      checkDurationStar();
    },
  });

  startPicker = flatpickr("#startDate", {
    dateFormat: "F j, Y",
    minDate: "today",
    disableMobile: true,
    monthSelectorType: "static",
    showMonths: 1,
    onChange: function (selectedDates) {
      if (selectedDates.length > 0 && endPicker) {
        endPicker.set("minDate", selectedDates[0]);
      }

      checkDurationStar();
    },
  });
}

/* =========================
   DESCRIPTION WORD COUNT
========================= */
const campaignDescription = document.getElementById("campaignDescription");
const descriptionCount = document.getElementById("descriptionCount");

function updateDescriptionCount() {
  if (!campaignDescription || !descriptionCount) return;

  const text = campaignDescription.value.trim();
  const wordCount = text === "" ? 0 : text.split(/\s+/).length;

  descriptionCount.textContent = wordCount + " / 1000 Words";
}

if (campaignDescription && descriptionCount) {
  campaignDescription.addEventListener("input", function () {
    updateDescriptionCount();
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
   DATABASE HELPERS
========================= */
const campaignForm = document.querySelector(".campaign-form");
const API_BASE_URL = "http://localhost:3000";

function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function makeLocalDateFromSql(dateValue) {
  if (!dateValue) return null;

  const dateOnly = String(dateValue).split("T")[0];
  const parts = dateOnly.split("-");

  if (parts.length !== 3) return null;

  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);

  const localDate = new Date(year, month, day);

  if (Number.isNaN(localDate.getTime())) {
    return null;
  }

  return localDate;
}

function makeLocalDateFromDisplay(dateText) {
  if (!dateText) return null;

  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function convertDateToSql(dateText, picker) {
  if (picker && picker.selectedDates && picker.selectedDates.length > 0) {
    return formatDateLocal(picker.selectedDates[0]);
  }

  if (!dateText) return null;

  const date = makeLocalDateFromDisplay(dateText);

  if (!date) return null;

  return formatDateLocal(date);
}

function formatDateForFlatpickr(dateValue) {
  const date = makeLocalDateFromSql(dateValue);

  if (!date) return "";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

async function readJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      message: text,
    };
  }
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

function applyKnownOrOtherCategory(categoryName) {
  if (!categoryName || !categorySelect || !categoryText || !categoryValue) return;

  const knownCategoryId = getCategoryId(categoryName);

  categoryOptions.forEach(function (option) {
    const optionValue = option.getAttribute("data-value");

    if (optionValue === categoryName) {
      option.classList.add("selected");
    } else {
      option.classList.remove("selected");
    }
  });

  if (knownCategoryId) {
    categorySelect.classList.remove("typing-mode");
    categoryText.textContent = categoryName;
    categoryValue.value = categoryName;

    if (otherCategoryInput) {
      otherCategoryInput.value = "";
    }
  } else {
    categorySelect.classList.add("typing-mode");
    categoryText.textContent = "Others:";
    categoryValue.value = categoryName;

    if (otherCategoryInput) {
      otherCategoryInput.value = categoryName;
    }
  }

  checkCategoryStar();
}

/* =========================
   LOAD EDIT DATA
   GET /fra/:id
========================= */
async function loadEditCampaignData() {
  if (!editActivityId) return;

  isEditMode = true;

  if (submitCampaignBtn) {
    submitCampaignBtn.textContent = "Save Changes";
  }

  if (cancelCampaignBtn) {
    cancelCampaignBtn.textContent = "Cancel Edit";
  }

  try {
    const response = await fetch(`${API_BASE_URL}/fra/${editActivityId}`);
    const data = await readJsonResponse(response);

    if (!response.ok) {
      alert(data.message || "Failed to load campaign data.");
      localStorage.removeItem("editActivityId");
      window.location.href = "myCampaign.html";
      return;
    }

    const activity = data.activity || data;

    if (campaignTitle) {
      campaignTitle.value = activity.activity_name || "";
      toggleStar(campaignTitle, titleStar);
    }

    if (fundraisingGoal) {
      fundraisingGoal.value = activity.fundraise_goal || "";
      toggleStar(fundraisingGoal, goalStar);
    }

    if (campaignDescription) {
      campaignDescription.value = activity.description || "";
      toggleStar(campaignDescription, descriptionStar);
      updateDescriptionCount();
    }

    const startDateObj = makeLocalDateFromSql(activity.start_date);
    const endDateObj = makeLocalDateFromSql(activity.end_date);

    if (startPicker && startDateObj) {
      startPicker.set("minDate", null);
      startPicker.setDate(startDateObj, false);
    } else if (startDateInput && startDateObj) {
      startDateInput.value = formatDateForFlatpickr(activity.start_date);
    }

    if (endPicker && endDateObj) {
      if (startDateObj) {
        endPicker.set("minDate", startDateObj);
      }

      endPicker.setDate(endDateObj, false);
    } else if (endDateInput && endDateObj) {
      endDateInput.value = formatDateForFlatpickr(activity.end_date);
    }

    checkDurationStar();
    applyKnownOrOtherCategory(activity.category_name);
  } catch (error) {
    console.error("Load edit campaign error:", error);
    alert("Cannot load campaign data.");
  }
}

/* =========================
   CANCEL / CANCEL EDIT
========================= */
if (cancelCampaignBtn) {
  cancelCampaignBtn.addEventListener("click", function () {
    localStorage.removeItem("editActivityId");
    window.location.href = "myCampaign.html";
  });
}

/* =========================
   SUBMIT CREATE / EDIT
   POST /fra
   PUT /fra/:id
========================= */
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
    const start_date = convertDateToSql(startDateInput.value, startPicker);
    const end_date = convertDateToSql(endDateInput.value, endPicker);
    const description = campaignDescription.value.trim();

    if (
      !activity_name ||
      !categoryName ||
      !fundraise_goal ||
      !start_date ||
      !end_date ||
      !description
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (Number(fundraise_goal) <= 0) {
      alert("Fundraising goal must be greater than 0.");
      return;
    }

    const requestUrl = isEditMode
      ? `${API_BASE_URL}/fra/${editActivityId}`
      : `${API_BASE_URL}/fra`;

    const requestMethod = isEditMode ? "PUT" : "POST";

    try {
      console.log("Date before save:", {
        start_date: start_date,
        end_date: end_date,
      });

      const requestBody = {
        activity_name: activity_name,
        category_id: category_id,
        category_name: categoryName,
        fundraise_goal: fundraise_goal,
        start_date: start_date,
        end_date: end_date,
        description: description,
        status: "Ongoing",
      };

      if (!isEditMode) {
        requestBody.created_by = loggedInUser.user_id;
        requestBody.current_amount = 0;
      }

      const response = await fetch(requestUrl, {
        method: requestMethod,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        alert(data.message || "Failed to save campaign.");
        return;
      }

      alert(
        isEditMode
          ? "Campaign updated successfully."
          : "Campaign created successfully."
      );

      localStorage.removeItem("editActivityId");
      window.location.href = "myCampaign.html";
    } catch (error) {
      console.error("Save campaign error:", error);
      alert("Cannot connect to backend.");
    }
  });
}

/* =========================
   PAGE INIT
========================= */
document.addEventListener("DOMContentLoaded", function () {
  protectFundraiserPage();
  updateHeaderUser();
  loadEditCampaignData();
});