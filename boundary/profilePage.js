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

const userIdInput = document.getElementById("userIdInput");
const firstNameInput = document.getElementById("firstNameInput");
const lastNameInput = document.getElementById("lastNameInput");
const dobInput = document.getElementById("dobInput");
const phoneInput = document.getElementById("phoneInput");

const profileForm = document.getElementById("profileForm");
const editProfileBtn = document.getElementById("editProfileBtn");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const profileMessage = document.getElementById("profileMessage");

const profileFullName = document.getElementById("profileFullName");
const profileEmail = document.getElementById("profileEmail");
const profileAvatar = document.getElementById("profileAvatar");

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

function saveLoggedInUser(user) {
  localStorage.setItem("loggedInUser", JSON.stringify(user));
}

function setMessage(message, isError = false) {
  if (!profileMessage) return;

  profileMessage.textContent = message;
  profileMessage.classList.toggle("error", isError);
}

function setInputsDisabled(disabled) {
  firstNameInput.disabled = disabled;
  lastNameInput.disabled = disabled;
  dobInput.disabled = disabled;
  phoneInput.disabled = disabled;
  saveProfileBtn.disabled = disabled;
}

function formatDateForInput(dob) {
  if (!dob) return "";

  const date = new Date(dob);

  if (Number.isNaN(date.getTime())) {
    return dob;
  }

  return date.toISOString().split("T")[0];
}

function renderUser(user) {
  const firstName = user.f_name || "";
  const lastName = user.l_name || "";
  const email = user.email || "";
  const phone = user.phone || "";
  const dob = user.dob || "";

  const fullName = `${firstName} ${lastName}`.trim() || "User";
  const initial = (firstName || email || "U").charAt(0).toUpperCase();

  userIdInput.value = user.user_id || "";
  firstNameInput.value = firstName;
  lastNameInput.value = lastName;
  dobInput.value = formatDateForInput(dob);
  phoneInput.value = phone;

  profileFullName.textContent = fullName;
  profileEmail.textContent = email;
  profileAvatar.textContent = initial;

  if (headerAvatar) {
    headerAvatar.textContent = initial;
  }

  if (headerName) {
    headerName.textContent = firstName || "User";
  }
}

async function loadProfile() {
  const loggedInUser = getLoggedInUser();

  if (!loggedInUser || !loggedInUser.user_id) {
    setMessage("No logged in user found. Please login again.", true);
    return;
  }

  try {
    const response = await fetch(`/auth/profile/${loggedInUser.user_id}`);
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Failed to load profile.", true);
      return;
    }

    saveLoggedInUser(data.user);
    renderUser(data.user);
    setInputsDisabled(true);
    setMessage("");
  } catch (error) {
    console.error("Load profile error:", error);
    setMessage("Cannot connect to server.", true);
  }
}

editProfileBtn.addEventListener("click", function () {
  setInputsDisabled(false);
  setMessage("You can now edit your personal information.", false);
});

profileForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const userId = userIdInput.value;

  const updatedUser = {
    f_name: firstNameInput.value.trim(),
    l_name: lastNameInput.value.trim(),
    dob: dobInput.value,
    phone: phoneInput.value.trim()
  };

  if (!updatedUser.f_name || !updatedUser.l_name || !updatedUser.dob || !updatedUser.phone) {
    setMessage("Please fill in all fields.", true);
    return;
  }

  try {
    const response = await fetch(`/auth/profile/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedUser)
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Failed to update profile.", true);
      return;
    }

    saveLoggedInUser(data.user);
    renderUser(data.user);
    setInputsDisabled(true);
    setMessage("Profile updated successfully.", false);
  } catch (error) {
    console.error("Update profile error:", error);
    setMessage("Cannot connect to server.", true);
  }
});

if (signOutBtn) {
  signOutBtn.addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.removeItem("loggedInUser");

    window.location.href = "homepage.html";
  });
}

setInputsDisabled(true);
loadProfile();