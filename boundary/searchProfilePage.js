/* ============================================================
   SEARCH PROFILE FRONTEND CONTROLLER
   Place in: boundary/searchProfileController.js

   This file connects to:
   GET    /profiles
   GET    /profiles/search/:name
   POST   /profiles
   PUT    /profiles/:id
   PATCH  /profiles/:id/suspend
============================================================ */

const PROFILE_API = "/profiles";

/* ============================================================
   HEADER PROFILE DROPDOWN
============================================================ */
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
  const headerAvatar = document.getElementById("headerAvatar");
  const headerName = document.getElementById("headerName");

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

function setupSignOut() {
  const signOutBtn = document.getElementById("signOutBtn");

  if (!signOutBtn) return;

  signOutBtn.addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.removeItem("loggedInUser");
    sessionStorage.removeItem("hh_session");

    window.location.href = "homepage.html";
  });
}

document.addEventListener("click", function () {
  document.querySelectorAll(".nav-dropdown").forEach(function (item) {
    item.classList.remove("open");
  });
});

/* ============================================================
   STATE
============================================================ */
let allProfiles = [];
let profilesFiltered = [];
let currentProfileId = null;

/* ============================================================
   INIT
============================================================ */
window.addEventListener("DOMContentLoaded", async () => {
  setupDropdown("profileMenuBtn", "profileDropdown");
  renderHeaderProfile();
  setupSignOut();

  await loadProfiles();
});

/* ============================================================
   LOAD ALL PROFILES
   This links to ViewUserProfileController.getAllProfiles()
============================================================ */
async function loadProfiles() {
  try {
    const res = await fetch(PROFILE_API);

    const data = await res.json();

    if (!res.ok) {
      toast(data.message || "Failed to load profiles.", "error");
      return;
    }

    allProfiles = Array.isArray(data) ? data : data.profiles || [];
    profilesFiltered = [...allProfiles];

    renderProfiles();
  } catch (error) {
    console.error("Load profiles error:", error);
    toast("Failed to load profiles.", "error");
  }
}

/* ============================================================
   SEARCH PROFILE
   This links to SearchUserProfileController.searchProfile()
============================================================ */
async function filterProfiles() {
  const q = (document.getElementById("profileSearchInput") || { value: "" }).value.trim();

  if (!q) {
    profilesFiltered = [...allProfiles];
    renderProfiles();
    return;
  }

  try {
    const res = await fetch(`${PROFILE_API}/search/${encodeURIComponent(q)}`);
    const data = await res.json();

    if (!res.ok) {
      toast(data.message || "Failed to search profile.", "error");
      return;
    }

    if (!data) {
      profilesFiltered = [];
    } else if (Array.isArray(data)) {
      profilesFiltered = data;
    } else {
      profilesFiltered = [data];
    }

    renderProfiles();
  } catch (error) {
    console.error("Search profile error:", error);
    toast("Failed to search profile.", "error");
  }
}

/* ============================================================
   RENDER PROFILES
============================================================ */
function renderProfiles() {
  const list = document.getElementById("profileCardList");

  if (!list) return;

  if (profilesFiltered.length === 0) {
    list.innerHTML = `
      <div class="empty-card">
        No profile found.
      </div>
    `;
    return;
  }

  list.innerHTML = profilesFiltered.map((p) => {
    const roleName = p.role_name || "Unknown Role";
    const roleDesc = p.role_desc || "No description.";
    const status = p.suspended ? "Suspended" : "Active";

    return `
      <div class="act-profile-card" onclick="openProfileDetail('${p.profile_id}')">
        <div class="act-card-left">
          <div class="act-card-avatar" style="background:${getProfileColor(roleName)};color:${getProfileStroke(roleName)}">
            ${getProfileIcon(roleName)}
          </div>

          <div class="act-card-info">
            <div class="act-card-title">${roleName}</div>
            <div class="act-card-desc">${roleDesc}</div>
          </div>
        </div>

        <div class="act-card-right">
          <span class="status-badge ${p.suspended ? "status-suspended" : "status-active"}">${status}</span>
          <span>›</span>
        </div>
      </div>
    `;
  }).join("");
}

/* ============================================================
   PROFILE STYLE HELPERS
============================================================ */
function getProfileIcon(roleName) {
  const name = String(roleName).toLowerCase();

  if (name.includes("manager")) return "🖥";
  if (name.includes("admin")) return "⚙️";
  if (name.includes("fundraiser")) return "📢";
  if (name.includes("donee")) return "👤";
  if (name.includes("user")) return "👤";

  return "👥";
}

function getProfileColor(roleName) {
  const name = String(roleName).toLowerCase();

  if (name.includes("manager")) return "#ede9fe";
  if (name.includes("admin")) return "#fef9c3";
  if (name.includes("fundraiser")) return "#dbeafe";
  if (name.includes("donee")) return "#fce7f3";
  if (name.includes("user")) return "#d1fae5";

  return "#f3f4f6";
}

function getProfileStroke(roleName) {
  const name = String(roleName).toLowerCase();

  if (name.includes("manager")) return "#7c3aed";
  if (name.includes("admin")) return "#854d0e";
  if (name.includes("fundraiser")) return "#2563eb";
  if (name.includes("donee")) return "#db2777";
  if (name.includes("user")) return "#059669";

  return "#6b7280";
}

/* ============================================================
   PROFILE DETAILS
============================================================ */
function openProfileDetail(profileId) {
  currentProfileId = profileId;

  const p = allProfiles.find((profile) => String(profile.profile_id) === String(profileId));

  if (!p) {
    toast("Profile not found.", "error");
    return;
  }

  document.getElementById("profileDetailBody").innerHTML = `
    <div class="detail-row">
      <span class="detail-label">Profile ID</span>
      <span class="detail-value">${p.profile_id}</span>
    </div>

    <div class="detail-row">
      <span class="detail-label">Role</span>
      <span class="detail-value">${p.role_name || "—"}</span>
    </div>

    <div class="detail-row">
      <span class="detail-label">Description</span>
      <span class="detail-value">${p.role_desc || "—"}</span>
    </div>

    <div class="detail-row">
      <span class="detail-label">Status</span>
      <span class="detail-value">${p.suspended ? "Suspended" : "Active"}</span>
    </div>
  `;

  openModal("profileDetailModal");
}

/* ============================================================
   CREATE PROFILE
   This links to CreateUserProfileController.createProfile()
============================================================ */
function openCreateProfile() {
  document.getElementById("createProfileName").value = "";
  document.getElementById("createProfileDesc").value = "";

  openModal("createProfileModal");
}

async function saveCreateProfile() {
  const role_name = document.getElementById("createProfileName").value.trim();
  const role_desc = document.getElementById("createProfileDesc").value.trim();

  if (!role_name || !role_desc) {
    toast("Role name and description are required.", "error");
    return;
  }

  try {
    const res = await fetch(PROFILE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role_name,
        role_desc
      })
    });

    const data = await res.json();

    if (!res.ok) {
      toast(data.message || "Failed to create profile.", "error");
      return;
    }

    closeModal("createProfileModal");
    toast("Profile created successfully.", "success");

    await loadProfiles();
  } catch (error) {
    console.error("Create profile error:", error);
    toast("Failed to create profile.", "error");
  }
}

/* ============================================================
   EDIT PROFILE
   This links to UpdateUserProfileController.updateProfile()
============================================================ */
function openProfileEdit() {
  const p = allProfiles.find((profile) => String(profile.profile_id) === String(currentProfileId));

  if (!p) {
    toast("Profile not found.", "error");
    return;
  }

  document.getElementById("profileEditID").value = p.profile_id;
  document.getElementById("profileEditName").value = p.role_name || "";
  document.getElementById("profileEditDesc").value = p.role_desc || "";

  closeModal("profileDetailModal");
  openModal("profileEditModal");
}

async function saveProfileEdit() {
  const profile_id = document.getElementById("profileEditID").value;
  const role_name = document.getElementById("profileEditName").value.trim();
  const role_desc = document.getElementById("profileEditDesc").value.trim();

  if (!profile_id || !role_name || !role_desc) {
    toast("Role name and description are required.", "error");
    return;
  }

  try {
    const res = await fetch(`${PROFILE_API}/${profile_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role_name,
        role_desc
      })
    });

    const data = await res.json();

    if (!res.ok) {
      toast(data.message || "Failed to update profile.", "error");
      return;
    }

    closeModal("profileEditModal");
    toast("Profile updated successfully.", "success");

    await loadProfiles();
  } catch (error) {
    console.error("Update profile error:", error);
    toast("Failed to update profile.", "error");
  }
}

/* ============================================================
   SUSPEND PROFILE
============================================================ */
function openSuspendProfile() {
  const p = allProfiles.find((profile) => String(profile.profile_id) === String(currentProfileId));

  if (!p) {
    toast("Profile not found.", "error");
    return;
  }

  document.getElementById("profileSuspendTitle").textContent = p.suspended
    ? "Activate Profile"
    : "Suspend Profile";

  document.getElementById("profileSuspendMsg").textContent = p.suspended
    ? `Activate the role "${p.role_name}"?`
    : `Suspend the role "${p.role_name}"?`;

  closeModal("profileDetailModal");
  openModal("profileSuspendModal");
}

async function confirmProfileSuspend() {
  if (!currentProfileId) {
    toast("Profile not selected.", "error");
    return;
  }

  try {
    const res = await fetch(`${PROFILE_API}/${currentProfileId}/suspend`, {
      method: "PATCH"
    });

    const data = await res.json();

    if (!res.ok) {
      toast(data.message || "Failed to update profile status.", "error");
      return;
    }

    closeModal("profileSuspendModal");
    toast("Profile status updated.", "success");

    await loadProfiles();
  } catch (error) {
    console.error("Suspend profile error:", error);
    toast("Failed to update profile status.", "error");
  }
}

/* ============================================================
   MODAL HELPERS
============================================================ */
function openModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.classList.add("show");
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.classList.remove("show");
  }
}

/* ============================================================
   TOAST
============================================================ */
function toast(msg, type = "success") {
  const t = document.getElementById("toast");

  if (!t) return;

  t.textContent = msg;
  t.className = `toast ${type}`;

  setTimeout(() => {
    t.classList.add("show");
  }, 10);

  setTimeout(() => {
    t.classList.remove("show");
  }, 2800);
}