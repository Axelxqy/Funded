/* ============================================================
   USER MANAGEMENT FRONTEND CONTROLLER
   Place in: boundary/userManagementController.js

   Uses index.js routes:
   app.use("/users", userRoutes);
   app.use("/profiles", profileRoutes);
============================================================ */

const USER_ACCOUNT_API = "/users";
const USER_PROFILE_API = "/profiles";

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
let allUsers = [];
let filtered = [];
let allProfiles = [];
let curPage = 1;
const PER = 5;

/* ============================================================
   INIT
============================================================ */
window.addEventListener("DOMContentLoaded", async () => {
  setupDropdown("profileMenuBtn", "profileDropdown");
  renderHeaderProfile();
  setupSignOut();

  await loadProfiles();
  populateRoleDropdowns();
  await loadUsers();
});

/* ============================================================
   PROFILE / ROLE FUNCTIONS
============================================================ */
async function loadProfiles() {
  try {
    const res = await fetch(USER_PROFILE_API);

    const data = await res.json();

    if (!res.ok) {
      toast(data.message || "Failed to load roles.", "error");
      return [];
    }

    allProfiles = Array.isArray(data) ? data : data.profiles || [];

    return allProfiles;
  } catch (error) {
    console.error("Failed to load profiles:", error);
    toast("Failed to load roles from database.", "error");
    allProfiles = [];
    return [];
  }
}

function getAvailableProfiles() {
  return allProfiles.filter(function (profile) {
    return profile && profile.role_name && profile.suspended !== true;
  });
}

function populateRoleDropdowns(selectedRole = "") {
  const roleFilter = document.getElementById("roleFilter");
  const addRole = document.getElementById("addRole");
  const editRole = document.getElementById("editRole");

  const profiles = getAvailableProfiles();

  if (roleFilter) {
    roleFilter.innerHTML = `<option value="">All Roles</option>`;

    profiles.forEach(function (profile) {
      const option = document.createElement("option");
      option.value = profile.role_name;
      option.textContent = profile.role_name;
      roleFilter.appendChild(option);
    });
  }

  if (addRole) {
    addRole.innerHTML = "";

    profiles.forEach(function (profile) {
      const option = document.createElement("option");
      option.value = profile.role_name;
      option.textContent = profile.role_name;
      addRole.appendChild(option);
    });
  }

  if (editRole) {
    editRole.innerHTML = "";

    profiles.forEach(function (profile) {
      const option = document.createElement("option");
      option.value = profile.role_name;
      option.textContent = profile.role_name;
      editRole.appendChild(option);
    });

    if (selectedRole) {
      editRole.value = selectedRole;
    }
  }
}

function findProfileByRoleName(roleName) {
  return allProfiles.find(function (profile) {
    return String(profile.role_name || "").toLowerCase() === String(roleName).toLowerCase();
  });
}

async function getProfileIdByRoleName(roleName) {
  await loadProfiles();

  const profile = findProfileByRoleName(roleName);

  if (!profile || !profile.profile_id) {
    throw new Error("Selected role does not exist.");
  }

  return profile.profile_id;
}

/* ============================================================
   LOAD USERS FROM DATABASE
============================================================ */
async function loadUsers() {
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.value = "";
  }

  try {
    const res = await fetch(USER_ACCOUNT_API);

    const data = await res.json();

    if (!res.ok) {
      toast(data.message || "Failed to load users.", "error");
      return;
    }

    allUsers = Array.isArray(data) ? data : data.users || [];
    filtered = [...allUsers];

    renderTable(1);
  } catch (err) {
    console.error("Failed to load users:", err);
    toast("Failed to load users from database.", "error");
  }
}

/* ============================================================
   USER FILTER
============================================================ */
function filterUsers() {
  const q = (document.getElementById("searchInput") || { value: "" }).value.toLowerCase();
  const r = (document.getElementById("roleFilter") || { value: "" }).value;
  const st = (document.getElementById("statusFilter") || { value: "" }).value;

  filtered = allUsers.filter((u) => {
    const name = `${u.f_name || ""} ${u.l_name || ""}`.toLowerCase();
    const email = (u.email || "").toLowerCase();
    const role = getDisplayRole(u);
    const status = u.suspended ? "Suspended" : "Active";

    const matchesSearch =
      !q ||
      name.includes(q) ||
      email.includes(q) ||
      role.toLowerCase().includes(q);

    const matchesRole = !r || role === r;
    const matchesStatus = !st || status === st;

    return matchesSearch && matchesRole && matchesStatus;
  });

  renderTable(1);
}

/* ============================================================
   DISPLAY HELPERS
============================================================ */
function getDisplayRole(user) {
  return user.role_name || "No Role";
}

function getRoleBadgeClass(role) {
  const roleLower = String(role || "").toLowerCase();

  if (roleLower.includes("admin")) {
    return "badge-fundraiser";
  }

  if (roleLower.includes("manager")) {
    return "badge-admin";
  }

  return "badge-donee";
}

function formatDateOnly(value) {
  if (!value) return "—";

  return String(value).split("T")[0];
}

/* ============================================================
   RENDER USER TABLE
============================================================ */
function renderTable(page) {
  curPage = page;

  const start = (page - 1) * PER;
  const slice = filtered.slice(start, start + PER);
  const body = document.getElementById("usersBody");

  if (!body) return;

  if (slice.length === 0) {
    body.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;color:#888;padding:24px;">
          No users found.
        </td>
      </tr>
    `;
  } else {
    body.innerHTML = slice.map((u) => {
      const role = getDisplayRole(u);
      const status = u.suspended ? "Suspended" : "Active";
      const dob = formatDateOnly(u.dob);

      return `
        <tr>
          <td>
            <div class="user-cell">
              <div class="user-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              ${u.f_name || ""} ${u.l_name || ""}
            </div>
          </td>

          <td>${u.email || "—"}</td>

          <td>
            <span class="badge ${getRoleBadgeClass(role)}">${role}</span>
          </td>

          <td>
            <span class="status-badge status-${status.toLowerCase()}">${status}</span>
          </td>

          <td>${dob}</td>

          <td>
            <div class="actions">
              <button class="action-btn" title="View" onclick="openView('${u.user_id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>

              <button class="action-btn" title="Edit" onclick="openEdit('${u.user_id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>

              <button class="action-btn ${u.suspended ? "" : "danger"}" title="${u.suspended ? "Activate" : "Suspend"}" onclick="openSuspend('${u.user_id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <circle cx="10" cy="7" r="4"/>
                  <path d="M4 21v-2a4 4 0 0 1 4-4h4"/>
                  <line x1="17" y1="15" x2="21" y2="19" stroke-width="2"/>
                  <line x1="21" y1="15" x2="17" y2="19" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PER));

  const info = document.getElementById("paginationInfo");

  if (info) {
    if (total === 0) {
      info.textContent = "Showing 0 to 0 of 0 users";
    } else {
      info.textContent = `Showing ${Math.min(start + 1, total)} to ${Math.min(start + PER, total)} of ${total} users`;
    }
  }

  renderPager("pager", page, totalPages, "goPage");
}

function goPage(p) {
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER));

  if (p < 1 || p > totalPages) return;

  renderTable(p);
}

/* ============================================================
   ADD USER
============================================================ */
async function openAddUser() {
  document.getElementById("addFName").value = "";
  document.getElementById("addLName").value = "";
  document.getElementById("addEmail").value = "";
  document.getElementById("addPassword").value = "";
  document.getElementById("addPhone").value = "";
  document.getElementById("addDob").value = "";

  await loadProfiles();
  populateRoleDropdowns();

  openModal("addUserModal");
}

async function saveAddUser() {
  const f_name = document.getElementById("addFName").value.trim();
  const l_name = document.getElementById("addLName").value.trim();
  const email = document.getElementById("addEmail").value.trim();
  const password = document.getElementById("addPassword").value;
  const phone = document.getElementById("addPhone").value.trim();
  const dob = document.getElementById("addDob").value;
  const role = document.getElementById("addRole").value;

  if (!f_name || !l_name || !email || !password || !phone || !dob || !role) {
    toast("Please fill in all required fields.", "error");
    return;
  }

  try {
    const profile_id = await getProfileIdByRoleName(role);

    const res = await fetch(USER_ACCOUNT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        f_name,
        l_name,
        dob,
        phone,
        profile_id
      })
    });

    const data = await res.json();

    if (!res.ok) {
      toast(data.message || "Failed to add user.", "error");
      return;
    }

    toast("User added successfully.", "success");
    closeModal("addUserModal");

    await loadUsers();
  } catch (err) {
    console.error("Failed to add user:", err);
    toast(err.message || "Failed to add user.", "error");
  }
}

/* ============================================================
   VIEW USER
============================================================ */
function openView(uid) {
  const u = allUsers.find((user) => String(user.user_id) === String(uid));
  if (!u) return;

  const role = getDisplayRole(u);
  const status = u.suspended ? "Suspended" : "Active";

  document.getElementById("viewBody").innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <div class="user-avatar" style="width:46px;height:46px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:26px;height:26px">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      </div>

      <div>
        <div style="font-size:16px;font-weight:700;">
          ${u.f_name || ""} ${u.l_name || ""}
        </div>
        <div style="font-size:12px;color:#999;">
          ${u.email || "—"}
        </div>
      </div>
    </div>

    <div class="detail-row">
      <span class="detail-label">Role</span>
      <span class="detail-value">${role}</span>
    </div>

    <div class="detail-row">
      <span class="detail-label">Status</span>
      <span class="detail-value">${status}</span>
    </div>

    <div class="detail-row">
      <span class="detail-label">Phone</span>
      <span class="detail-value">${u.phone || "—"}</span>
    </div>

    <div class="detail-row">
      <span class="detail-label">Date of Birth</span>
      <span class="detail-value">${formatDateOnly(u.dob)}</span>
    </div>
  `;

  openModal("viewModal");
}

/* ============================================================
   EDIT USER
============================================================ */
async function openEdit(uid) {
  const u = allUsers.find((user) => String(user.user_id) === String(uid));
  if (!u) return;

  const role = getDisplayRole(u);

  await loadProfiles();
  populateRoleDropdowns(role);

  document.getElementById("editUID").value = uid;
  document.getElementById("editFName").value = u.f_name || "";
  document.getElementById("editLName").value = u.l_name || "";
  document.getElementById("editEmail").value = u.email || "";
  document.getElementById("editPhone").value = u.phone || "";
  document.getElementById("editDob").value = formatDateOnly(u.dob) === "—" ? "" : formatDateOnly(u.dob);
  document.getElementById("editRole").value = role;
  document.getElementById("editStatus").value = u.suspended ? "Suspended" : "Active";

  openModal("editModal");
}

async function saveEdit() {
  const uid = document.getElementById("editUID").value;
  const f_name = document.getElementById("editFName").value.trim();
  const l_name = document.getElementById("editLName").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const phone = document.getElementById("editPhone").value.trim();
  const dob = document.getElementById("editDob").value;
  const role = document.getElementById("editRole").value;
  const status = document.getElementById("editStatus").value;

  const currentUser = allUsers.find((u) => String(u.user_id) === String(uid));

  if (!currentUser) {
    toast("User not found.", "error");
    return;
  }

  if (!f_name || !l_name || !email || !phone || !dob || !role) {
    toast("Please fill in all required fields.", "error");
    return;
  }

  try {
    const profile_id = await getProfileIdByRoleName(role);

    const res = await fetch(`${USER_ACCOUNT_API}/${uid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        f_name,
        l_name,
        email,
        phone,
        dob,
        profile_id
      })
    });

    const data = await res.json();

    if (!res.ok) {
      toast(data.message || "Failed to update user.", "error");
      return;
    }

    if (Boolean(currentUser.suspended) !== (status === "Suspended")) {
      await fetch(`${USER_ACCOUNT_API}/${uid}/suspend`, {
        method: "PATCH"
      });
    }

    toast("User updated.", "success");
    closeModal("editModal");

    await loadUsers();
  } catch (err) {
    console.error("Failed to update user:", err);
    toast(err.message || "Failed to update user.", "error");
  }
}

/* ============================================================
   SUSPEND USER
============================================================ */
function openSuspend(uid) {
  const u = allUsers.find((user) => String(user.user_id) === String(uid));
  if (!u) return;

  const isSuspended = u.suspended;

  document.getElementById("suspendUID").value = uid;

  document.getElementById("suspendTitle").textContent = isSuspended
    ? "Activate User"
    : "Suspend User";

  document.getElementById("suspendMsg").textContent = isSuspended
    ? `Reactivate ${u.f_name} ${u.l_name}'s account?`
    : `Suspend ${u.f_name} ${u.l_name}'s account?`;

  document.getElementById("suspendSub").textContent = isSuspended
    ? "They will regain platform access."
    : "They will lose platform access immediately.";

  document.getElementById("suspendConfirmBtn").textContent = isSuspended
    ? "Activate"
    : "Suspend";

  openModal("suspendModal");
}

async function confirmSuspend() {
  const uid = document.getElementById("suspendUID").value;

  try {
    const res = await fetch(`${USER_ACCOUNT_API}/${uid}/suspend`, {
      method: "PATCH"
    });

    if (!res.ok) {
      throw new Error("Failed to update status.");
    }

    toast("User status updated.", "success");
    closeModal("suspendModal");

    await loadUsers();
  } catch (err) {
    console.error("Failed to update status:", err);
    toast("Failed to update status.", "error");
  }
}

/* ============================================================
   SHARED PAGER
============================================================ */
function renderPager(id, page, totalPages, fn) {
  const el = document.getElementById(id);

  if (!el) return;

  let html = `
    <button class="page-btn" onclick="${fn}(${page - 1})" ${page <= 1 ? "disabled" : ""}>
      &#8249;
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="page-btn ${i === page ? "active" : ""}" onclick="${fn}(${i})">
        ${i}
      </button>
    `;
  }

  html += `
    <button class="page-btn" onclick="${fn}(${page + 1})" ${page >= totalPages ? "disabled" : ""}>
      &#8250;
    </button>
  `;

  el.innerHTML = html;
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