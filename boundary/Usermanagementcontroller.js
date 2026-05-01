/* ============================================================
   USER MANAGEMENT FRONTEND CONTROLLER
   Place in: boundary/Usermanagementcontroller.js
   User Admin only — no category/platform manager code
============================================================ */

const API = '';

/* ============================================================
   STATE
============================================================ */
let allUsers = [];
let filtered = []; let curPage = 1; const PER = 5;
let currentProfileId = null;

/* ============================================================
   INIT
============================================================ */
window.addEventListener('DOMContentLoaded', async () => {
  applyRoleAccess();
  await loadUsers();

  // Chrome ignores autocomplete="off" — clear after short delay
  setTimeout(() => {
    const s = document.getElementById('searchInput');
    if (s) { s.value = ''; filterUsers(); }
  }, 150);

  document.getElementById('profileToggle').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('profileMenu').classList.toggle('show');
  });
  document.addEventListener('click', () => document.getElementById('profileMenu').classList.remove('show'));
});

/* ============================================================
   ROLE ACCESS
============================================================ */
function applyRoleAccess() {
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.getElementById('section-users').classList.remove('hidden');
  const firstLink = document.querySelector('.sidebar-link');
  if (firstLink) {
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    firstLink.classList.add('active');
  }
}

/* ============================================================
   SECTION SWITCHING
============================================================ */
function navClick(el, section) {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  const target = document.getElementById('section-' + section);
  if (target) target.classList.remove('hidden');
  if (section === 'users')      { renderTable(1); }
  if (section === 'activities') { renderProfiles(); }
}

/* ============================================================
   LOAD USERS FROM DATABASE
============================================================ */
async function loadUsers() {
  const searchEl = document.getElementById('searchInput');
  if (searchEl) searchEl.value = '';
  try {
    const res = await fetch(`${API}/admin/users`);
    const data = await res.json();
    allUsers = data.users || [];
    filtered = [...allUsers];
    renderTable(1);
  } catch (err) {
    console.error('Failed to load users:', err);
    toast('Failed to load users.', 'error');
  }
}

/* ============================================================
   USER TABLE
============================================================ */
function filterUsers() {
  const q  = (document.getElementById('searchInput') || { value: '' }).value.toLowerCase();
  const r  = (document.getElementById('roleFilter') || { value: '' }).value;
  const st = (document.getElementById('statusFilter') || { value: '' }).value;
  filtered = allUsers.filter(u => {
    const name = `${u.f_name} ${u.l_name}`.toLowerCase();
    const role = u.role_name || '';
    const status = u.suspended ? 'Suspended' : 'Active';
    const mq = !q || name.includes(q) || u.email.toLowerCase().includes(q) || role.toLowerCase().includes(q);
    return mq && (!r || role === r) && (!st || status === st);
  });
  renderTable(1);
}

const suspendIconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:14px;height:14px">
  <circle cx="10" cy="7" r="4"/>
  <path d="M4 21v-2a4 4 0 0 1 4-4h4"/>
  <line x1="17" y1="15" x2="21" y2="19" stroke-width="2"/>
  <line x1="21" y1="15" x2="17" y2="19" stroke-width="2"/>
</svg>`;

function renderTable(page) {
  curPage = page;
  const start = (page - 1) * PER;
  const slice = filtered.slice(start, start + PER);
  const body = document.getElementById('usersBody');
  if (!body) return;
  body.innerHTML = slice.map(u => {
    const role = u.role_name || 'N/A';
    const status = u.suspended ? 'Suspended' : 'Active';
    const joined = u.dob ? u.dob.split('T')[0] : '—';
    return `
    <tr>
      <td><div class="user-cell">
        <div class="user-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>
        ${u.f_name} ${u.l_name}
      </div></td>
      <td>${u.email}</td>
      <td><span class="badge badge-${role.toLowerCase()}">${role}</span></td>
      <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
      <td>${joined}</td>
      <td><div class="actions">
        <button class="action-btn" title="View" onclick="openView('${u.user_id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button class="action-btn" title="Edit" onclick="openEdit('${u.user_id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="action-btn ${u.suspended ? '' : 'danger'}" title="${u.suspended ? 'Activate' : 'Suspend'}" onclick="openSuspend('${u.user_id}')">
          ${suspendIconSVG}
        </button>
      </div></td>
    </tr>`;
  }).join('');
  const total = filtered.length;
  const tp = Math.max(1, Math.ceil(total / PER));
  const info = document.getElementById('paginationInfo');
  if (info) info.textContent = `Showing ${Math.min(start + 1, total)} to ${Math.min(start + PER, total)} of ${total} users`;
  renderPager('pager', page, tp, 'goPage');
}

function goPage(p) {
  const tp = Math.ceil(filtered.length / PER);
  if (p < 1 || p > tp) return;
  renderTable(p);
}

/* ============================================================
   ADD NEW USER
============================================================ */
function openAddUser() {
  document.getElementById('addFName').value = '';
  document.getElementById('addLName').value = '';
  document.getElementById('addEmail').value = '';
  document.getElementById('addPassword').value = '';
  document.getElementById('addPhone').value = '';
  document.getElementById('addDob').value = '';
  document.getElementById('addRole').value = 'Donee';
  openModal('addUserModal');
}

async function saveAddUser() {
  const f_name   = document.getElementById('addFName').value.trim();
  const l_name   = document.getElementById('addLName').value.trim();
  const email    = document.getElementById('addEmail').value.trim();
  const password = document.getElementById('addPassword').value;
  const phone    = document.getElementById('addPhone').value.trim();
  const dob      = document.getElementById('addDob').value;
  const role     = document.getElementById('addRole').value;
  const profile_id = getProfileIdByRole(role);

  if (!f_name || !l_name || !email || !password) { toast('Please fill in all required fields.', 'error'); return; }
  if (password.length < 8) { toast('Password must be at least 8 characters.', 'error'); return; }

  try {
    const res = await fetch(`${API}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ f_name, l_name, email, password, phone, dob, profile_id })
    });
    if (!res.ok) {
      const err = await res.json();
      toast(err.message || 'Failed to add user.', 'error');
      return;
    }
    toast('User added successfully.', 'success');
    closeModal('addUserModal');
    await loadUsers();
  } catch (err) {
    console.error(err);
    toast('Failed to add user.', 'error');
  }
}

/* ============================================================
   VIEW USER
============================================================ */
function openView(uid) {
  const u = allUsers.find(u => u.user_id === uid);
  if (!u) return;
  const role = u.role_name || 'N/A';
  const status = u.suspended ? 'Suspended' : 'Active';
  document.getElementById('viewBody').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <div class="user-avatar" style="width:46px;height:46px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:26px;height:26px"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
      </div>
      <div>
        <div style="font-size:16px;font-weight:700;">${u.f_name} ${u.l_name}</div>
        <div style="font-size:12px;color:#999;">${u.email}</div>
      </div>
    </div>
    <div class="detail-row"><span class="detail-label">Role</span><span class="detail-value"><span class="badge badge-${role.toLowerCase()}">${role}</span></span></div>
    <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value"><span class="status-badge status-${status.toLowerCase()}">${status}</span></span></div>
    <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${u.phone || '—'}</span></div>
    <div class="detail-row"><span class="detail-label">Date of Birth</span><span class="detail-value">${u.dob ? u.dob.split('T')[0] : '—'}</span></div>`;
  openModal('viewModal');
}

/* ============================================================
   EDIT USER
============================================================ */
function openEdit(uid) {
  const u = allUsers.find(u => u.user_id === uid);
  if (!u) return;
  document.getElementById('editUID').value = uid;
  document.getElementById('editFName').value = u.f_name || '';
  document.getElementById('editLName').value = u.l_name || '';
  document.getElementById('editEmail').value = u.email || '';
  document.getElementById('editPhone').value = u.phone || '';
  const roleSelect = document.getElementById('editRole');
  if (u.profile_id) roleSelect.value = getRoleNameById(u.profile_id);
  document.getElementById('editStatus').value = u.suspended ? 'Suspended' : 'Active';
  openModal('editModal');
}

function getRoleNameById(profile_id) {
  const map = { 1: 'Admin', 2: 'Fundraiser', 3: 'Donee' };
  return map[profile_id] || 'Donee';
}

function getProfileIdByRole(role_name) {
  const map = { 'Admin': 1, 'Fundraiser': 2, 'Donee': 3 };
  return map[role_name] || 3;
}

async function saveEdit() {
  const uid = document.getElementById('editUID').value;
  const f_name = document.getElementById('editFName').value.trim();
  const l_name = document.getElementById('editLName').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  const role = document.getElementById('editRole').value;
  const status = document.getElementById('editStatus').value;
  const profile_id = getProfileIdByRole(role);

  if (!f_name || !email) { toast('Name and email required.', 'error'); return; }

  try {
    await fetch(`${API}/admin/users/${uid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ f_name, l_name, email, phone, profile_id })
    });
    const u = allUsers.find(u => u.user_id === uid);
    const newSuspended = status === 'Suspended';
    if (u.suspended !== newSuspended) {
      await fetch(`${API}/admin/users/${uid}/suspend`, { method: 'PATCH' });
    }
    toast('User updated.', 'success');
    closeModal('editModal');
    await loadUsers();
  } catch (err) {
    console.error(err);
    toast('Failed to update user.', 'error');
  }
}

/* ============================================================
   SUSPEND USER
============================================================ */
function openSuspend(uid) {
  const u = allUsers.find(u => u.user_id === uid);
  if (!u) return;
  const isSuspended = u.suspended;
  document.getElementById('suspendUID').value = uid;
  document.getElementById('suspendTitle').textContent = isSuspended ? 'Activate User' : 'Suspend User';
  document.getElementById('suspendMsg').textContent = isSuspended
    ? `Reactivate ${u.f_name} ${u.l_name}'s account?`
    : `Suspend ${u.f_name} ${u.l_name}'s account?`;
  document.getElementById('suspendSub').textContent = isSuspended
    ? 'They will regain platform access.'
    : 'They will lose platform access immediately.';
  document.getElementById('suspendConfirmBtn').textContent = isSuspended ? 'Activate' : 'Suspend';
  openModal('suspendModal');
}

async function confirmSuspend() {
  const uid = document.getElementById('suspendUID').value;
  try {
    await fetch(`${API}/admin/users/${uid}/suspend`, { method: 'PATCH' });
    toast('User status updated.', 'success');
    closeModal('suspendModal');
    await loadUsers();
  } catch (err) {
    toast('Failed to update status.', 'error');
  }
}

/* ============================================================
   SEARCH PROFILE — role cards
============================================================ */
const PROFILES_DATA = [
  {
    id: 'p1', name: 'Donee',
    desc: 'A donee is a user who receives donations or support through the platform.',
    color: '#fce7f3', stroke: '#db2777',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:22px;height:22px"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`
  },
  {
    id: 'p2', name: 'Fund Raiser',
    desc: 'A fund raiser creates and manages fundraising campaigns on the platform.',
    color: '#dbeafe', stroke: '#2563eb',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:22px;height:22px"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`
  },
  {
    id: 'p3', name: 'Platform Management',
    desc: 'Platform management monitors platform activity, manages categories and oversees reports.',
    color: '#ede9fe', stroke: '#7c3aed',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:22px;height:22px"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`
  },
  {
    id: 'p4', name: 'User Admin',
    desc: 'A user admin manages user accounts, roles and platform access.',
    color: '#fef9c3', stroke: '#854d0e',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:22px;height:22px"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>`
  }
];

let profilesFiltered = [...PROFILES_DATA];

function filterProfiles() {
  const q = (document.getElementById('profileSearchInput') || { value: '' }).value.toLowerCase();
  profilesFiltered = PROFILES_DATA.filter(p =>
    !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
  );
  renderProfiles();
}

function renderProfiles() {
  profilesFiltered = profilesFiltered.length ? profilesFiltered : [...PROFILES_DATA];
  const list = document.getElementById('profileCardList');
  if (!list) return;
  list.innerHTML = profilesFiltered.map(p => `
    <div class="act-profile-card" onclick="openProfileDetail('${p.id}')">
      <div class="act-card-left">
        <div class="act-card-avatar" style="background:${p.color};color:${p.stroke}">${p.icon}</div>
        <div class="act-card-info">
          <div class="act-card-title">${p.name}</div>
          <div class="act-card-desc">${p.desc}</div>
        </div>
      </div>
      <div class="act-card-right">
        <svg viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="2" style="width:16px;height:16px;flex-shrink:0"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </div>
  `).join('');
}

function openProfileDetail(id) {
  currentProfileId = id;
  const p = PROFILES_DATA.find(x => x.id === id);
  if (!p) return;
  document.getElementById('profileDetailBody').innerHTML = `
    <div class="detail-row">
      <span class="detail-label">Role</span>
      <span class="detail-value" style="font-weight:600">${p.name}</span>
    </div>
    <div class="detail-row" style="align-items:flex-start">
      <span class="detail-label">Role Description</span>
      <span class="detail-value" style="color:#555;line-height:1.6">${p.desc}</span>
    </div>`;
  openModal('profileDetailModal');
}

function openProfileEdit() {
  const p = PROFILES_DATA.find(x => x.id === currentProfileId);
  if (!p) return;
  document.getElementById('profileEditID').value = p.id;
  document.getElementById('profileEditName').value = p.name;
  document.getElementById('profileEditDesc').value = p.desc;
  closeModal('profileDetailModal');
  openModal('profileEditModal');
}

function saveProfileEdit() {
  const id   = document.getElementById('profileEditID').value;
  const name = document.getElementById('profileEditName').value.trim();
  const desc = document.getElementById('profileEditDesc').value.trim();
  if (!name || !desc) { toast('Role name and description are required.', 'error'); return; }
  const p = PROFILES_DATA.find(x => x.id === id);
  if (!p) return;
  p.name = name;
  p.desc = desc;
  profilesFiltered = [...PROFILES_DATA];
  renderProfiles();
  toast('Profile updated successfully.', 'success');
  closeModal('profileEditModal');
}

function openProfileDelete() {
  closeModal('profileDetailModal');
  openModal('profileDeleteModal');
}

function confirmProfileDelete() {
  const idx = PROFILES_DATA.findIndex(x => x.id === currentProfileId);
  if (idx !== -1) PROFILES_DATA.splice(idx, 1);
  profilesFiltered = [...PROFILES_DATA];
  renderProfiles();
  toast('Profile deleted.', 'success');
  closeModal('profileDeleteModal');
}

function openCreateProfile() {
  document.getElementById('createProfileName').value = '';
  document.getElementById('createProfileDesc').value = '';
  openModal('createProfileModal');
}

function saveCreateProfile() {
  const name = document.getElementById('createProfileName').value.trim();
  const desc = document.getElementById('createProfileDesc').value.trim();
  if (!name || !desc) { toast('Role name and description are required.', 'error'); return; }
  if (PROFILES_DATA.find(p => p.name.toLowerCase() === name.toLowerCase())) {
    toast('A profile with this role name already exists.', 'error');
    return;
  }
  const colors = [
    { color: '#d1fae5', stroke: '#059669' },
    { color: '#fef3c7', stroke: '#d97706' },
    { color: '#e0e7ff', stroke: '#3730a3' },
    { color: '#fce7f3', stroke: '#db2477' },
  ];
  const c = colors[PROFILES_DATA.length % colors.length];
  const icon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:22px;height:22px"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`;
  PROFILES_DATA.push({ id: 'p' + Date.now(), name, desc, color: c.color, stroke: c.stroke, icon });
  profilesFiltered = [...PROFILES_DATA];
  renderProfiles();
  toast('Profile created successfully.', 'success');
  closeModal('createProfileModal');
}

/* ============================================================
   SHARED PAGER
============================================================ */
function renderPager(id, page, totalPages, fn) {
  const el = document.getElementById(id); if (!el) return;
  let ph = `<button class="page-btn" onclick="${fn}(${page - 1})" ${page <= 1 ? 'disabled' : ''}>&#8249;</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - page) > 1) {
      if (i === 3) ph += `<button class="page-btn" style="pointer-events:none;border:none;background:none">…</button>`;
      continue;
    }
    ph += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="${fn}(${i})">${i}</button>`;
  }
  ph += `<button class="page-btn" onclick="${fn}(${page + 1})" ${page >= totalPages ? 'disabled' : ''}>&#8250;</button>`;
  el.innerHTML = ph;
}

/* ============================================================
   MODAL HELPERS
============================================================ */
const openModal  = id => document.getElementById(id).classList.add('show');
const closeModal = id => document.getElementById(id).classList.remove('show');

/* ============================================================
   TOAST & LOGOUT
============================================================ */
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `toast ${type}`;
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.classList.remove('show'), 2800);
}

function handleLogout(e) {
  if (e) e.preventDefault();
  sessionStorage.removeItem('hh_session');
  toast('Logged out.', 'success');
  setTimeout(() => window.location.href = 'login.html', 1200);
}