/* ============================================================
   USER MANAGEMENT FRONTEND CONTROLLER
   Connects to real PostgreSQL database via API
============================================================ */

const API = '';  // same origin, no prefix needed

/* ============================================================
   STATE
============================================================ */
let allUsers = [];
let filtered = []; let curPage = 1; const PER = 5;
let actFiltered = []; let actPage = 1; const ACT_PER = 5;
let catFiltered = []; let catPage = 1; const CAT_PER = 10;

/* ============================================================
   INIT
============================================================ */
window.addEventListener('DOMContentLoaded', async () => {
  applyRoleAccess();
  await loadUsers();

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
  document.querySelectorAll('.ua-only, .pm-only').forEach(el => {
    el.style.display = '';
  });
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.getElementById('section-users').classList.remove('hidden');
  const firstLink = document.querySelector('.sidebar-link.ua-only');
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
  if (section === 'activities') { actFiltered = [...ACTIVITIES_DATA]; renderActivities(1); }
  if (section === 'categories') { catFiltered = [...getCatData()]; renderCategories(1); }
}

/* ============================================================
   LOAD USERS FROM DATABASE
============================================================ */
async function loadUsers() {
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

function renderTable(page) {
  curPage = page;
  const start = (page - 1) * PER;
  const slice = filtered.slice(start, start + PER);
  const body = document.getElementById('usersBody');
  if (!body) return;

  body.innerHTML = slice.map(u => {
    const role = u.role_name || 'N/A';
    const status = u.suspended ? 'Suspended' : 'Active';
    const roleClass = role.toLowerCase();
    const statusClass = status.toLowerCase();
    const joined = u.dob ? u.dob.split('T')[0] : '—';

    return `
    <tr>
      <td><div class="user-cell">
        <div class="user-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>
        ${u.f_name} ${u.l_name}
      </div></td>
      <td>${u.email}</td>
      <td><span class="badge badge-${roleClass}">${role}</span></td>
      <td><span class="status-badge status-${statusClass}">${status}</span></td>
      <td>${joined}</td>
      <td><div class="actions">
        <button class="action-btn" onclick="openView('${u.user_id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button class="action-btn" onclick="openEdit('${u.user_id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="action-btn" onclick="openSuspend('${u.user_id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7"/><line x1="18" y1="14" x2="18" y2="22"/><line x1="14" y1="18" x2="22" y2="18"/></svg>
        </button>
        <button class="action-btn danger" onclick="openDelete('${u.user_id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
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
   MODALS: VIEW USER
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
   MODALS: EDIT USER
============================================================ */
function openEdit(uid) {
  const u = allUsers.find(u => u.user_id === uid);
  if (!u) return;
  document.getElementById('editUID').value = uid;
  document.getElementById('editFName').value = u.f_name || '';
  document.getElementById('editLName').value = u.l_name || '';
  document.getElementById('editEmail').value = u.email || '';
  document.getElementById('editPhone').value = u.phone || '';

  // Set role dropdown based on profile_id
  const roleSelect = document.getElementById('editRole');
  if (u.profile_id) roleSelect.value = getRoleNameById(u.profile_id);

  // Set status dropdown
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
    // Update user info
    await fetch(`${API}/admin/users/${uid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ f_name, l_name, email, phone, profile_id })
    });

    // If status changed, toggle suspend
    const u = allUsers.find(u => u.user_id === uid);
    const currentSuspended = u.suspended;
    const newSuspended = status === 'Suspended';
    if (currentSuspended !== newSuspended) {
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
   MODALS: SUSPEND USER
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
   MODALS: DELETE USER
============================================================ */
function openDelete(uid) {
  document.getElementById('deleteUID').value = uid;
  openModal('deleteModal');
}

async function confirmDelete() {
  const uid = document.getElementById('deleteUID').value;
  try {
    await fetch(`${API}/admin/users/${uid}`, { method: 'DELETE' });
    toast('User deleted.', 'success');
    closeModal('deleteModal');
    await loadUsers();
  } catch (err) {
    toast('Failed to delete user.', 'error');
  }
}

/* ============================================================
   ACTIVITIES TABLE (kept as static data for now)
============================================================ */
const ACTIVITIES_DATA = [
  {id:'a1', title:'Save Cancer Patients',    desc:'Support cancer patients for treatment.',          fundraiser:'John Doe',    email:'john.doe@example.com',  initials:'JD',color:'#6366f1',category:'Health',     goal:10000,status:'Active',   created:'2024-05-12'},
  {id:'a2', title:'Help Flood Victims',       desc:'Urgent aid for flood victims.',                  fundraiser:'Sarah Johnson',email:'sarah.j@example.com',   initials:'SJ',color:'#f59e0b',category:'Disaster',    goal:5000, status:'Active',   created:'2024-05-08'},
  {id:'a3', title:'Animal Shelter Fund',      desc:'Support homeless animals and shelter.',           fundraiser:'Mike Brown',   email:'mike.b@example.com',    initials:'MB',color:'#10b981',category:'Animals',     goal:3000, status:'Active',   created:'2024-05-05'},
  {id:'a4', title:'Education for All',        desc:'Help underprivileged children.',                  fundraiser:'Emma Thompson',email:'emma.t@example.com',    initials:'ET',color:'#3b82f6',category:'Education',   goal:8000, status:'Active',   created:'2024-05-11'},
  {id:'a5', title:'Green Our Planet',         desc:'Plant trees and protect the environment.',        fundraiser:'David Lee',    email:'david.lee@example.com', initials:'DL',color:'#22c55e',category:'Environment', goal:2500, status:'Active',   created:'2024-05-01'},
  {id:'a6', title:'Community Kitchen',        desc:'Daily meals for the homeless.',                   fundraiser:'Amy Tan',      email:'amy.tan@example.com',   initials:'AT',color:'#f43f5e',category:'Community',   goal:4000, status:'Pending',  created:'2024-05-14'},
  {id:'a7', title:'Medical Supply Drive',     desc:'Collect medical supplies for rural clinics.',     fundraiser:'Brian Wong',   email:'brian.w@example.com',   initials:'BW',color:'#8b5cf6',category:'Health',     goal:6000, status:'Pending',  created:'2024-05-13'},
  {id:'a8', title:'School Library Fund',      desc:'Build a library for school children.',            fundraiser:'Clara Ng',     email:'clara.ng@example.com',  initials:'CN',color:'#0ea5e9',category:'Education',   goal:7500, status:'Completed',created:'2024-04-20'},
  {id:'a9', title:'Wildlife Protection',      desc:'Protect endangered wildlife.',                    fundraiser:'Derek Lim',    email:'derek.lim@example.com', initials:'DL',color:'#d97706',category:'Animals',     goal:9000, status:'Active',   created:'2024-05-09'},
  {id:'a10',title:'Flood Relief Package',     desc:'Emergency packages for flood victims.',           fundraiser:'Emily Chan',   email:'emily.c@example.com',   initials:'EC',color:'#ef4444',category:'Disaster',    goal:3500, status:'Completed',created:'2024-04-15'},
  {id:'a11',title:'Solar Energy for Schools', desc:'Install solar panels in rural schools.',          fundraiser:'Felix Yap',    email:'felix.y@example.com',   initials:'FY',color:'#14b8a6',category:'Education',   goal:12000,status:'Active',   created:'2024-05-10'},
  {id:'a12',title:'Dog Rescue Mission',       desc:'Rescue stray dogs and find them homes.',          fundraiser:'Grace Ong',    email:'grace.o@example.com',   initials:'GO',color:'#a855f7',category:'Animals',     goal:2000, status:'Pending',  created:'2024-05-15'},
  {id:'a13',title:'Mangrove Restoration',     desc:'Restore mangrove forests.',                       fundraiser:'Henry Koh',    email:'henry.k@example.com',   initials:'HK',color:'#16a34a',category:'Environment', goal:5500, status:'Active',   created:'2024-05-07'},
  {id:'a14',title:'Youth Sports Program',     desc:'Sports equipment for youth.',                     fundraiser:'Irene Goh',    email:'irene.g@example.com',   initials:'IG',color:'#f97316',category:'Community',   goal:3200, status:'Active',   created:'2024-05-06'},
  {id:'a15',title:'Clean Water Initiative',   desc:'Clean water for rural villages.',                 fundraiser:'James Teo',    email:'james.t@example.com',   initials:'JT',color:'#0284c7',category:'Community',   goal:8500, status:'Completed',created:'2024-04-10'},
  {id:'a16',title:'Cancer Research Fund',     desc:'Support cancer research studies.',                fundraiser:'Karen Sim',    email:'karen.s@example.com',   initials:'KS',color:'#db2777',category:'Health',     goal:15000,status:'Active',   created:'2024-05-03'},
  {id:'a17',title:'Typhoon Aid',              desc:'Emergency relief for typhoon victims.',           fundraiser:'Leo Chua',     email:'leo.c@example.com',     initials:'LC',color:'#dc2626',category:'Disaster',    goal:6500, status:'Pending',  created:'2024-05-16'},
  {id:'a18',title:'University Scholarship',   desc:'Scholarships for underprivileged students.',      fundraiser:'Mia Tan',      email:'mia.t@example.com',     initials:'MT',color:'#7c3aed',category:'Education',   goal:20000,status:'Active',   created:'2024-05-02'},
  {id:'a19',title:'Urban Garden Project',     desc:'Community gardens in urban areas.',               fundraiser:'Noah Lim',     email:'noah.l@example.com',    initials:'NL',color:'#65a30d',category:'Environment', goal:1800, status:'Completed',created:'2024-04-25'},
  {id:'a20',title:'Senior Care Support',      desc:'Support elderly living alone.',                   fundraiser:'Olivia Lee',   email:'olivia.l@example.com',  initials:'OL',color:'#0891b2',category:'Community',   goal:4500, status:'Active',   created:'2024-05-04'},
];

function filterActivities() {
  const q   = (document.getElementById('actSearchInput').value || '').toLowerCase();
  const st  = document.getElementById('actStatusFilter').value;
  const cat = document.getElementById('actCategoryFilter').value;
  actFiltered = ACTIVITIES_DATA.filter(a => {
    const mq = !q || a.title.toLowerCase().includes(q) || a.fundraiser.toLowerCase().includes(q);
    return mq && (!st || a.status === st) && (!cat || a.category === cat);
  });
  renderActivities(1);
}

function renderActivities(page) {
  actPage = page;
  if (!actFiltered.length) actFiltered = [...ACTIVITIES_DATA];
  const start = (page - 1) * ACT_PER;
  const slice = actFiltered.slice(start, start + ACT_PER);
  const catClass = c => 'cat-' + c.toLowerCase().replace(/[^a-z]/g, '');
  const body = document.getElementById('activitiesBody');
  if (!body) return;
  body.innerHTML = slice.map(a => `
    <tr>
      <td><div class="campaign-cell"><div class="campaign-info"><div class="camp-title">${a.title}</div><div class="camp-desc">${a.desc}</div></div></div></td>
      <td><div class="fundraiser-cell"><div class="fundraiser-avatar" style="background:${a.color}">${a.initials}</div><div class="fundraiser-info"><div class="f-name">${a.fundraiser}</div><div class="f-email">${a.email}</div></div></div></td>
      <td><span class="cat-badge ${catClass(a.category)}">${a.category}</span></td>
      <td>RM ${a.goal.toLocaleString()}.00</td>
      <td><span class="status-badge status-${a.status.toLowerCase()}">${a.status}</span></td>
      <td>${a.created}</td>
      <td><div class="actions">
        <button class="action-btn" onclick="openActView('${a.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
        <button class="action-btn" onclick="openActEdit('${a.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="action-btn danger" onclick="openActDelete('${a.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
      </div></td>
    </tr>`).join('');
  const total = actFiltered.length, tp = Math.max(1, Math.ceil(total / ACT_PER));
  const info = document.getElementById('actPaginationInfo');
  if (info) info.textContent = `Showing ${Math.min(start + 1, total)} to ${Math.min(start + ACT_PER, total)} of ${total} campaigns`;
  renderPager('actPager', page, tp, 'actGoPage');
}
function actGoPage(p) { const tp = Math.ceil(actFiltered.length / ACT_PER); if (p < 1 || p > tp) return; renderActivities(p); }

/* ============================================================
   ACTIVITY MODALS
============================================================ */
function openActView(id) {
  const a = ACTIVITIES_DATA.find(x => x.id === id); if (!a) return;
  document.getElementById('actViewBody').innerHTML = `
    <div style="margin-bottom:14px"><div style="font-size:16px;font-weight:700;color:#1a6b3f;margin-bottom:4px">${a.title}</div><div style="font-size:13px;color:#666">${a.desc}</div></div>
    <div class="detail-row"><span class="detail-label">Fundraiser</span><span class="detail-value">${a.fundraiser}</span></div>
    <div class="detail-row"><span class="detail-label">Category</span><span class="detail-value">${a.category}</span></div>
    <div class="detail-row"><span class="detail-label">Goal Amount</span><span class="detail-value">RM ${a.goal.toLocaleString()}.00</span></div>
    <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value"><span class="status-badge status-${a.status.toLowerCase()}">${a.status}</span></span></div>
    <div class="detail-row"><span class="detail-label">Created On</span><span class="detail-value">${a.created}</span></div>`;
  openModal('actViewModal');
}

function openActEdit(id) {
  const a = ACTIVITIES_DATA.find(x => x.id === id); if (!a) return;
  document.getElementById('actEditID').value = id;
  document.getElementById('actEditTitle').value = a.title;
  document.getElementById('actEditCategory').value = a.category;
  document.getElementById('actEditFundraiser').value = a.fundraiser;
  document.getElementById('actEditGoal').value = a.goal;
  document.getElementById('actEditDesc').value = a.desc || '';
  document.getElementById('actDescCount').textContent = (a.desc || '').length;
  document.getElementById('actEditStatus').value = a.status;
  document.getElementById('actEditImgPreview').style.display = 'none';
  openModal('actEditModal');
}

function updateActDescCount() {
  const v = document.getElementById('actEditDesc').value;
  document.getElementById('actDescCount').textContent = v.length;
}

function saveActEdit() {
  const id = document.getElementById('actEditID').value;
  const a = ACTIVITIES_DATA.find(x => x.id === id); if (!a) return;
  a.title = document.getElementById('actEditTitle').value.trim();
  a.category = document.getElementById('actEditCategory').value;
  a.fundraiser = document.getElementById('actEditFundraiser').value.trim();
  a.goal = parseFloat(document.getElementById('actEditGoal').value) || a.goal;
  a.desc = document.getElementById('actEditDesc').value.trim();
  a.status = document.getElementById('actEditStatus').value;
  toast('Campaign updated.', 'success');
  closeModal('actEditModal');
  actFiltered = [...ACTIVITIES_DATA]; renderActivities(actPage);
}

function openActDelete(id) { document.getElementById('actDeleteID').value = id; openModal('actDeleteModal'); }
function confirmActDelete() { toast('Campaign deleted.', 'success'); closeModal('actDeleteModal'); }

/* ============================================================
   CATEGORY (static for now)
============================================================ */
const CAT_META = {
  'Medical':    { color:'#fee2e2', stroke:'#dc2626', path:'M22 12h-4l-3 9L9 3l-3 9H2' },
  'Education':  { color:'#dbeafe', stroke:'#2563eb', path:'M22 10v6M2 10l10-5 10 5-10 5-10-5zM6 12v5c3 3 9 3 12 0v-5' },
  'Emergency':  { color:'#fef3c7', stroke:'#d97706', path:'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01' },
  'Animals':    { color:'#fef9c3', stroke:'#b45309', path:'M7 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM4.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm15 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM12 13c-3 0-6 2-6 5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2c0-3-3-5-6-5z' },
  'Community':  { color:'#ede9fe', stroke:'#7c3aed', path:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0a3 3 0 0 1 0 6M23 21v-2a4 4 0 0 0-3-3.87' },
  'Environment':{ color:'#d1fae5', stroke:'#059669', path:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  'Others / Miscellaneous':{ color:'#f3f4f6', stroke:'#6b7280', path:'M12 12h.01M8 12h.01M16 12h.01' },
};

function getCatData() {
  return JSON.parse(localStorage.getItem('hh_cats') || 'null') || [
    {id:'c1',name:'Medical',    desc:'Support medical treatments, healthcare services and health-related initiatives.',created:'2024-02-15'},
    {id:'c2',name:'Education',  desc:'Support education, scholarships and learning opportunities for all.',            created:'2024-02-16'},
    {id:'c3',name:'Emergency',  desc:'Provide immediate relief and support during emergencies and crises.',            created:'2024-02-16'},
    {id:'c4',name:'Animals',    desc:'Raise funds to help animals in need, shelters and wildlife protection.',         created:'2024-02-16'},
    {id:'c5',name:'Community',  desc:'Support community development and social welfare initiatives.',                  created:'2024-03-01'},
    {id:'c6',name:'Environment',desc:'Protect the environment, promote sustainability and conservation efforts.',      created:'2024-02-17'},
    {id:'c7',name:'Others / Miscellaneous',desc:'For fundraising causes that do not fit existing predefined categories.',created:'2024-02-18'},
  ];
}
function saveCatData(d) { localStorage.setItem('hh_cats', JSON.stringify(d)); }

function catSvgIcon(name) {
  const m = CAT_META[name] || CAT_META['Others / Miscellaneous'];
  return `<div class="cat-icon-wrap" style="background:${m.color}">
    <svg viewBox="0 0 24 24" fill="none" stroke="${m.stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${m.path}"/></svg>
  </div>`;
}

function filterCategories() {
  const q = (document.getElementById('catSearchInput').value || '').toLowerCase();
  catFiltered = getCatData().filter(c => !q || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
  renderCategories(1);
}

function renderCategories(page) {
  catPage = page;
  if (!catFiltered.length) catFiltered = [...getCatData()];
  const start = (page - 1) * CAT_PER;
  const slice = catFiltered.slice(start, start + CAT_PER);
  const body = document.getElementById('categoriesBody');
  if (!body) return;
  body.innerHTML = slice.map((c, idx) => `
    <tr>
      <td style="color:#888;font-size:13px;width:40px">${start + idx + 1}</td>
      <td style="width:50px">${catSvgIcon(c.name)}</td>
      <td style="font-weight:600;font-size:14px">${c.name}</td>
      <td style="color:#666;font-size:13px">${c.desc}</td>
      <td style="color:#888;font-size:13px;white-space:nowrap">${c.created}</td>
      <td><div class="actions">
        <button class="action-btn" onclick="openCatEdit('${c.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="action-btn danger" onclick="openCatDelete('${c.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
      </div></td>
    </tr>`).join('');
  const total = catFiltered.length, tp = Math.max(1, Math.ceil(total / CAT_PER));
  const info = document.getElementById('catPaginationInfo');
  if (info) info.textContent = `Showing ${Math.min(start + 1, total)} to ${Math.min(start + CAT_PER, total)} of ${total} categories`;
  renderPager('catPager', page, tp, 'catGoPage');
}
function catGoPage(p) { const tp = Math.ceil(catFiltered.length / CAT_PER); if (p < 1 || p > tp) return; renderCategories(p); }

function openAddCategory() {
  document.getElementById('catModalTitle').textContent = 'Add New Category';
  document.getElementById('catEditID').value = '';
  document.getElementById('catEditName').value = '';
  document.getElementById('catEditDesc').value = '';
  openModal('catEditModal');
}
function openCatEdit(id) {
  const c = getCatData().find(x => x.id === id); if (!c) return;
  document.getElementById('catModalTitle').textContent = 'Edit Category';
  document.getElementById('catEditID').value = id;
  document.getElementById('catEditName').value = c.name;
  document.getElementById('catEditDesc').value = c.desc;
  openModal('catEditModal');
}
function saveCategoryEdit() {
  const id = document.getElementById('catEditID').value;
  const name = document.getElementById('catEditName').value.trim();
  const desc = document.getElementById('catEditDesc').value.trim();
  if (!name) { toast('Category name is required.', 'error'); return; }
  const cats = getCatData();
  if (id) { const i = cats.findIndex(c => c.id === id); if (i >= 0) { cats[i].name = name; cats[i].desc = desc; } toast('Category updated.', 'success'); }
  else { cats.push({ id: 'c' + Date.now(), name, desc, created: new Date().toISOString().slice(0, 10) }); toast('Category added.', 'success'); }
  saveCatData(cats); catFiltered = [...cats]; renderCategories(catPage);
  closeModal('catEditModal');
}
function openCatDelete(id) { document.getElementById('catDeleteID').value = id; openModal('catDeleteModal'); }
function confirmCatDelete() {
  const id = document.getElementById('catDeleteID').value;
  const cats = getCatData().filter(c => c.id !== id);
  saveCatData(cats); catFiltered = [...cats]; renderCategories(1);
  toast('Category deleted.', 'success'); closeModal('catDeleteModal');
}

/* ============================================================
   SHARED PAGER
============================================================ */
function renderPager(id, page, totalPages, fn) {
  const el = document.getElementById(id); if (!el) return;
  let ph = `<button class="page-btn" onclick="${fn}(${page - 1})" ${page <= 1 ? 'disabled' : ''}>&#8249;</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - page) > 1) { if (i === 3) ph += `<button class="page-btn" style="pointer-events:none;border:none;background:none">…</button>`; continue; }
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