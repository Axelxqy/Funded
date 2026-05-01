/* ============================================================
   PLATFORM MANAGER FRONTEND CONTROLLER
   Place in: boundary/platformManagerController.js
============================================================ */

let catFiltered = []; let catPage = 1; const CAT_PER = 10;

/* ============================================================
   INIT
============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  catFiltered = [...getCatData()];
  renderCategories(1);

  document.getElementById('profileToggle').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('profileMenu').classList.toggle('show');
  });
  document.addEventListener('click', () => document.getElementById('profileMenu').classList.remove('show'));
});

/* ============================================================
   SECTION SWITCHING
============================================================ */
function navClick(el, section) {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.getElementById('section-' + section).classList.remove('hidden');
  if (section === 'categories') { catFiltered = [...getCatData()]; renderCategories(1); }
}

/* ============================================================
   REPORT TABS
============================================================ */
function switchReport(el, tab) {
  document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.report-section').forEach(s => s.classList.add('hidden'));
  document.getElementById('report-' + tab).classList.remove('hidden');
}

/* ============================================================
   CATEGORY DATA (localStorage)
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

/* ============================================================
   CATEGORY FILTER & RENDER
============================================================ */
function filterCategories() {
  const q = (document.getElementById('catSearchInput').value || '').toLowerCase();
  catFiltered = getCatData().filter(c =>
    !q || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
  );
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
        <button class="action-btn" onclick="openCatEdit('${c.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="action-btn danger" onclick="openCatDelete('${c.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div></td>
    </tr>`).join('');

  const total = catFiltered.length;
  const tp = Math.max(1, Math.ceil(total / CAT_PER));
  const info = document.getElementById('catPaginationInfo');
  if (info) info.textContent = `Showing ${Math.min(start + 1, total)} to ${Math.min(start + CAT_PER, total)} of ${total} categories`;
  renderPager('catPager', page, tp, 'catGoPage');
}

function catGoPage(p) {
  const tp = Math.ceil(catFiltered.length / CAT_PER);
  if (p < 1 || p > tp) return;
  renderCategories(p);
}

/* ============================================================
   CATEGORY MODALS
============================================================ */
function openAddCategory() {
  document.getElementById('catModalTitle').textContent = 'Add New Category';
  document.getElementById('catEditID').value = '';
  document.getElementById('catEditName').value = '';
  document.getElementById('catEditDesc').value = '';
  openModal('catEditModal');
}

function openCatEdit(id) {
  const c = getCatData().find(x => x.id === id);
  if (!c) return;
  document.getElementById('catModalTitle').textContent = 'Edit Category';
  document.getElementById('catEditID').value = id;
  document.getElementById('catEditName').value = c.name;
  document.getElementById('catEditDesc').value = c.desc;
  openModal('catEditModal');
}

function saveCategoryEdit() {
  const id   = document.getElementById('catEditID').value;
  const name = document.getElementById('catEditName').value.trim();
  const desc = document.getElementById('catEditDesc').value.trim();
  if (!name) { toast('Category name is required.', 'error'); return; }
  const cats = getCatData();
  if (id) {
    const i = cats.findIndex(c => c.id === id);
    if (i >= 0) { cats[i].name = name; cats[i].desc = desc; }
    toast('Category updated.', 'success');
  } else {
    cats.push({ id: 'c' + Date.now(), name, desc, created: new Date().toISOString().slice(0, 10) });
    toast('Category added.', 'success');
  }
  saveCatData(cats);
  catFiltered = [...cats];
  renderCategories(catPage);
  closeModal('catEditModal');
}

function openCatDelete(id) {
  document.getElementById('catDeleteID').value = id;
  openModal('catDeleteModal');
}

function confirmCatDelete() {
  const id = document.getElementById('catDeleteID').value;
  const cats = getCatData().filter(c => c.id !== id);
  saveCatData(cats);
  catFiltered = [...cats];
  renderCategories(1);
  toast('Category deleted.', 'success');
  closeModal('catDeleteModal');
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