/* ============================================================
   CATEGORY MANAGEMENT FRONTEND CONTROLLER
   Place in: boundary/categoryManagementController.js

   Connects to:
   GET    /fra/categories
   GET    /fra/categories/search/:name
   POST   /fra/categories
   PUT    /fra/categories/:id
   DELETE /fra/categories/:id
============================================================ */

const CATEGORY_API = "/fra/categories";

let catFiltered = [];
let catPage = 1;
const CAT_PER = 10;

/* ============================================================
   INIT
============================================================ */
window.addEventListener("DOMContentLoaded", async () => {
  setupDropdown("profileMenuBtn", "profileDropdown");
  renderHeaderProfile();
  setupSignOut();

  await loadCategories();
});

/* ============================================================
   HEADER PROFILE
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

document.addEventListener("click", function () {
  document.querySelectorAll(".nav-dropdown").forEach(function (item) {
    item.classList.remove("open");
  });
});

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
    if (headerAvatar) headerAvatar.textContent = "P";
    if (headerName) headerName.textContent = "Platform Manager";
    return;
  }

  const firstName = user.f_name || "";
  const email = user.email || "";
  const role = user.role_name || "";
  const initial = (firstName || email || "P").charAt(0).toUpperCase();

  if (headerAvatar) headerAvatar.textContent = initial;
  if (headerName) headerName.textContent = firstName || role || "Platform Manager";
}

function setupSignOut() {
  const signOutBtn = document.getElementById("signOutBtn");

  if (!signOutBtn) return;

  signOutBtn.addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.removeItem("loggedInUser");
    sessionStorage.removeItem("hh_session");

    window.location.href = "login.html";
  });
}

/* ============================================================
   JSON HELPER
============================================================ */
async function readJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      message: text
    };
  }
}

/* ============================================================
   CATEGORY ICON DATA
============================================================ */
const CAT_META = {
  Medical: {
    color: "#fee2e2",
    stroke: "#dc2626",
    path: "M22 12h-4l-3 9L9 3l-3 9H2"
  },
  Education: {
    color: "#dbeafe",
    stroke: "#2563eb",
    path: "M22 10v6M2 10l10-5 10 5-10 5-10-5zM6 12v5c3 3 9 3 12 0v-5"
  },
  Emergency: {
    color: "#fef3c7",
    stroke: "#d97706",
    path: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"
  },
  Animals: {
    color: "#fef9c3",
    stroke: "#b45309",
    path: "M7 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM4.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm15 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM12 13c-3 0-6 2-6 5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2c0-3-3-5-6-5z"
  },
  Community: {
    color: "#ede9fe",
    stroke: "#7c3aed",
    path: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0a3 3 0 0 1 0 6M23 21v-2a4 4 0 0 0-3-3.87"
  },
  Environment: {
    color: "#d1fae5",
    stroke: "#059669",
    path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
  },
  "Others / Miscellaneous": {
    color: "#f3f4f6",
    stroke: "#6b7280",
    path: "M12 12h.01M8 12h.01M16 12h.01"
  }
};

function catSvgIcon(name) {
  const meta = CAT_META[name] || CAT_META["Others / Miscellaneous"];

  return `
    <div class="cat-icon-wrap" style="background:${meta.color}">
      <svg viewBox="0 0 24 24" fill="none" stroke="${meta.stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="${meta.path}"/>
      </svg>
    </div>
  `;
}

/* ============================================================
   NORMALIZE CATEGORY DATA
============================================================ */
function normalizeCategory(raw) {
  return {
    category_id: raw.category_id || raw.id,
    name: raw.name || raw.category_name || "",
    description: raw.description || raw.category_desc || raw.desc || "",
  };
}

/* ============================================================
   LOAD ALL CATEGORIES
============================================================ */
async function loadCategories() {
  const searchInput = document.getElementById("catSearchInput");

  if (searchInput) {
    searchInput.value = "";
  }

  try {
    const response = await fetch(CATEGORY_API);
    const data = await readJsonResponse(response);

    if (!response.ok) {
      toast(data.message || "Failed to load categories.", "error");
      return;
    }

    const categories = Array.isArray(data) ? data : data.categories || [];

    catFiltered = categories.map(normalizeCategory);
    renderCategories(1);
  } catch (error) {
    console.error("Load categories error:", error);
    toast("Cannot connect to category server.", "error");
  }
}

/* ============================================================
   SEARCH CATEGORY
============================================================ */
async function filterCategories() {
  const q = (document.getElementById("catSearchInput").value || "").trim();

  if (!q) {
    await loadCategories();
    return;
  }

  try {
    const response = await fetch(`${CATEGORY_API}/search/${encodeURIComponent(q)}`);
    const data = await readJsonResponse(response);

    if (!response.ok) {
      toast(data.message || "Failed to search categories.", "error");
      return;
    }

    const categories = Array.isArray(data) ? data : data.categories || [];

    catFiltered = categories.map(normalizeCategory);
    renderCategories(1);
  } catch (error) {
    console.error("Search categories error:", error);
    toast("Cannot search categories.", "error");
  }
}

/* ============================================================
   RENDER CATEGORIES
============================================================ */
function renderCategories(page) {
  catPage = page;

  const start = (page - 1) * CAT_PER;
  const slice = catFiltered.slice(start, start + CAT_PER);
  const body = document.getElementById("categoriesBody");

  if (!body) return;

  if (slice.length === 0) {
    body.innerHTML = `
      <tr>
        <td colspan="5" class="empty-row">
          No categories found.
        </td>
      </tr>
    `;
  } else {
    body.innerHTML = slice.map((category, index) => {
      return `
        <tr>
          <td>${start + index + 1}</td>
          <td>${catSvgIcon(category.name)}</td>
          <td style="font-weight:600">${category.name}</td>
          <td>${category.description || "—"}</td>
          <td>
            <div class="actions">
              <button class="action-btn" onclick="openCatEdit('${category.category_id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>

              <button class="action-btn danger" onclick="openCatDelete('${category.category_id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  const total = catFiltered.length;
  const totalPages = Math.max(1, Math.ceil(total / CAT_PER));
  const info = document.getElementById("catPaginationInfo");

  if (info) {
    if (total === 0) {
      info.textContent = "Showing 0 to 0 of 0 categories";
    } else {
      info.textContent = `Showing ${Math.min(start + 1, total)} to ${Math.min(start + CAT_PER, total)} of ${total} categories`;
    }
  }

  renderPager("catPager", page, totalPages, "catGoPage");
}

function catGoPage(page) {
  const totalPages = Math.max(1, Math.ceil(catFiltered.length / CAT_PER));

  if (page < 1 || page > totalPages) return;

  renderCategories(page);
}

/* ============================================================
   ADD CATEGORY
============================================================ */
function openAddCategory() {
  document.getElementById("catModalTitle").textContent = "Add New Category";
  document.getElementById("catEditID").value = "";
  document.getElementById("catEditName").value = "";
  document.getElementById("catEditDesc").value = "";

  openModal("catEditModal");
}

/* ============================================================
   EDIT CATEGORY
============================================================ */
function openCatEdit(categoryId) {
  const category = catFiltered.find((item) => String(item.category_id) === String(categoryId));

  if (!category) {
    toast("Category not found.", "error");
    return;
  }

  document.getElementById("catModalTitle").textContent = "Edit Category";
  document.getElementById("catEditID").value = category.category_id;
  document.getElementById("catEditName").value = category.name;
  document.getElementById("catEditDesc").value = category.description || "";

  openModal("catEditModal");
}

/* ============================================================
   SAVE CATEGORY
============================================================ */
async function saveCategoryEdit() {
  const id = document.getElementById("catEditID").value;
  const name = document.getElementById("catEditName").value.trim();
  const description = document.getElementById("catEditDesc").value.trim();

  if (!name) {
    toast("Category name is required.", "error");
    return;
  }

  const payload = {
    name,
    description,
  };

  try {
    const response = await fetch(id ? `${CATEGORY_API}/${id}` : CATEGORY_API, {
      method: id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await readJsonResponse(response);

    if (!response.ok) {
      toast(data.message || "Failed to save category.", "error");
      return;
    }

    closeModal("catEditModal");

    toast(id ? "Category updated." : "Category added.", "success");

    await loadCategories();
  } catch (error) {
    console.error("Save category error:", error);
    toast("Cannot save category.", "error");
  }
}

/* ============================================================
   DELETE CATEGORY
============================================================ */
function openCatDelete(categoryId) {
  document.getElementById("catDeleteID").value = categoryId;
  openModal("catDeleteModal");
}

async function confirmCatDelete() {
  const id = document.getElementById("catDeleteID").value;

  if (!id) {
    toast("Category ID missing.", "error");
    return;
  }

  try {
    const response = await fetch(`${CATEGORY_API}/${id}`, {
      method: "DELETE",
    });

    const data = await readJsonResponse(response);

    if (!response.ok) {
      toast(data.message || "Failed to delete category.", "error");
      return;
    }

    closeModal("catDeleteModal");
    toast(data.message || "Category deleted.", "success");

    await loadCategories();
  } catch (error) {
    console.error("Delete category error:", error);
    toast("Cannot delete category.", "error");
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
  const toastBox = document.getElementById("toast");

  if (!toastBox) return;

  toastBox.textContent = msg;
  toastBox.className = `toast ${type}`;

  setTimeout(() => {
    toastBox.classList.add("show");
  }, 10);

  setTimeout(() => {
    toastBox.classList.remove("show");
  }, 2800);
}