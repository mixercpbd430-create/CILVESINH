// ===== APP STATE =====
let statusMap = {};
let currentFilter = 'all';
let currentStatusFilter = 'all'; // 'all', 'done', 'pending'
let currentLine = 'all';
let currentSearchQuery = '';
let uploadedPhotosBefore = [];
let uploadedPhotosAfter = [];
let currentEquipment = null;
let currentUser = null;
let globalPpeItems = ['Nón', 'Giày', 'Khẩu trang', 'Bao tay len'];
let globalToolItems = ['Sủi cán gỗ ngắn', 'Sủi dao ngắn', 'Sủi dao dài', 'Sủi dài 1 mét', 'Chổi nhựa', 'Đèn pin', 'Ky rốt cám', 'Bao trắng'];
let lightboxImages = [];
let lightboxIndex = 0;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  
  // Enter key handlers for login/register forms
  document.getElementById('loginPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('regPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleRegister();
  });
});

// ===== AUTH =====
function checkAuth() {
  const saved = localStorage.getItem('currentUser');
  if (saved) {
    currentUser = JSON.parse(saved);
    showMainApp();
  } else {
    showAuthScreen();
  }
}

function showAuthScreen() {
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('mainApp').style.display = 'none';
}

function showMainApp() {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('mainApp').style.display = 'block';
  
  // Update user info
  document.getElementById('userName').textContent = currentUser.displayName;
  
  // Show admin bar if admin
  if (currentUser.isAdmin) {
    document.getElementById('adminBar').style.display = 'block';
  }
  
  // Init the main app
  setCurrentDate();
  Promise.all([loadCustomEquipment(), loadGlobalConfig()]).then(() => {
    buildLineTabs();
    buildFilterTabs();
    loadStatusAndRender();
    setupModalEvents();
    setupSearchInput();
  });
}

function showLogin() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginError').textContent = '';
}

function showRegister() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
  document.getElementById('registerError').textContent = '';
  document.getElementById('registerSuccess').textContent = '';
}

async function handleLogin() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  
  if (!username || !password) {
    errorEl.textContent = 'Vui lòng nhập tên đăng nhập và mật khẩu';
    return;
  }
  
  const btn = document.getElementById('btnLogin');
  btn.disabled = true;
  btn.innerHTML = '<span>⏳</span> Đang đăng nhập...';
  
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      errorEl.textContent = data.error;
      btn.disabled = false;
      btn.innerHTML = '<span>🔐</span> Đăng nhập';
      return;
    }
    
    currentUser = data.user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showMainApp();
    
  } catch (err) {
    errorEl.textContent = 'Lỗi kết nối. Vui lòng thử lại.';
  }
  
  btn.disabled = false;
  btn.innerHTML = '<span>🔐</span> Đăng nhập';
}

async function handleRegister() {
  const displayName = document.getElementById('regDisplayName').value.trim();
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value;
  const errorEl = document.getElementById('registerError');
  const successEl = document.getElementById('registerSuccess');
  
  errorEl.textContent = '';
  successEl.textContent = '';
  
  if (!displayName || !username || !password) {
    errorEl.textContent = 'Vui lòng nhập đầy đủ thông tin';
    return;
  }
  
  if (password.length < 3) {
    errorEl.textContent = 'Mật khẩu phải có ít nhất 3 ký tự';
    return;
  }
  
  const btn = document.getElementById('btnRegister');
  btn.disabled = true;
  btn.innerHTML = '<span>⏳</span> Đang đăng ký...';
  
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, displayName })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      errorEl.textContent = data.error;
    } else {
      successEl.textContent = data.message;
      document.getElementById('regDisplayName').value = '';
      document.getElementById('regUsername').value = '';
      document.getElementById('regPassword').value = '';
    }
  } catch (err) {
    errorEl.textContent = 'Lỗi kết nối. Vui lòng thử lại.';
  }
  
  btn.disabled = false;
  btn.innerHTML = '<span>📝</span> Đăng ký';
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('adminBar').style.display = 'none';
  showAuthScreen();
}

// ===== ADMIN PANEL =====
function toggleAdminPanel() {
  const panel = document.getElementById('adminPanel');
  if (panel.style.display === 'none') {
    panel.style.display = 'block';
    loadAdminUsers();
  } else {
    panel.style.display = 'none';
  }
}

async function loadAdminUsers() {
  try {
    const res = await fetch('/api/admin/users');
    const users = await res.json();
    
    const container = document.getElementById('adminUserList');
    
    if (users.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">👤</div><p>Chưa có thành viên nào đăng ký</p></div>';
      return;
    }
    
    const statusLabel = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };
    
    container.innerHTML = users.map(u => `
      <div class="admin-user-item">
        <div class="admin-user-avatar">${getInitials(u.display_name)}</div>
        <div class="admin-user-info">
          <div class="admin-user-name">${u.display_name} <span class="status-badge ${u.status}">${statusLabel[u.status]}</span></div>
          <div class="admin-user-username">@${u.username}</div>
          <div class="admin-user-password">🔑 ${u.password}</div>
          <div class="admin-user-date">${formatDateTime(u.created_at)}</div>
        </div>
        <div class="admin-user-actions">
          ${u.status !== 'approved' ? `<button class="btn-approve" onclick="updateUserStatus(${u.id}, 'approved')">✓ Duyệt</button>` : ''}
          ${u.status !== 'rejected' ? `<button class="btn-reject" onclick="updateUserStatus(${u.id}, 'rejected')">✕ Từ chối</button>` : ''}
          <button class="btn-delete-user" onclick="deleteUser(${u.id})">🗑</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading users:', err);
  }
}

async function updateUserStatus(userId, status) {
  try {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadAdminUsers();
    showToast(status === 'approved' ? '✅ Đã duyệt thành viên' : '❌ Đã từ chối thành viên');
  } catch (err) {
    console.error('Error updating user:', err);
  }
}

async function deleteUser(userId) {
  if (!confirm('Xác nhận xóa thành viên này?')) return;
  try {
    await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    loadAdminUsers();
    showToast('🗑 Đã xóa thành viên');
  } catch (err) {
    console.error('Error deleting user:', err);
  }
}

function setCurrentDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('currentDate').textContent = now.toLocaleDateString('vi-VN', options);
}

// ===== LOAD CUSTOM EQUIPMENT FROM DB =====
async function loadCustomEquipment() {
  try {
    const res = await fetch('/api/equipment');
    const customEquipment = await res.json();
    customEquipment.forEach(eq => {
      if (!EQUIPMENT_LIST.find(e => e.id === eq.equipment_id)) {
        let instructions = [];
        try { instructions = JSON.parse(eq.instructions); } catch(e) {}
        EQUIPMENT_LIST.push({
          id: eq.equipment_id,
          name: eq.name,
          code: eq.code,
          category: eq.category,
          line: eq.line || 'Mixer',
          instructions: instructions,
          isCustom: true,
          dbId: eq.id
        });
      }
    });
  } catch (err) {
    console.error('Failed to load custom equipment:', err);
  }

  // Load overrides (hidden equipment + instruction edits)
  try {
    const res2 = await fetch('/api/equipment/overrides');
    const overrides = await res2.json();
    overrides.forEach(ov => {
      if (ov.is_hidden) {
        // Remove hidden equipment from list
        const idx = EQUIPMENT_LIST.findIndex(e => e.id === ov.equipment_id);
        if (idx !== -1) EQUIPMENT_LIST.splice(idx, 1);
      } else if (ov.instructions) {
        // Apply instruction overrides
        const eq = EQUIPMENT_LIST.find(e => e.id === ov.equipment_id);
        if (eq) {
          try { eq.instructions = JSON.parse(ov.instructions); } catch(e) {}
        }
      }
    });
  } catch (err) {
    console.error('Failed to load overrides:', err);
  }
}

// ===== DATA FETCHING =====
async function loadStatusAndRender() {
  try {
    const res = await fetch('/api/status');
    statusMap = await res.json();
  } catch (err) {
    console.error('Failed to load status:', err);
    statusMap = {};
  }
  renderEquipmentGrid();
  updateProgress();
}

// ===== LINE TABS =====
function buildLineTabs() {
  const container = document.getElementById('lineTabs');
  const lines = getLines();
  container.innerHTML = '';

  // "All" tab
  const allBtn = document.createElement('button');
  allBtn.className = 'line-tab active';
  allBtn.dataset.line = 'all';
  allBtn.textContent = '📋 Tất cả';
  allBtn.addEventListener('click', () => selectLine('all'));
  container.appendChild(allBtn);

  lines.forEach(line => {
    const btn = document.createElement('button');
    btn.className = 'line-tab';
    btn.dataset.line = line;
    btn.textContent = `${LINE_ICONS[line] || '📦'} ${line}`;
    btn.addEventListener('click', () => selectLine(line));
    container.appendChild(btn);
  });
}

function selectLine(line) {
  currentLine = line;
  currentFilter = 'all';
  document.querySelectorAll('.line-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.line-tab[data-line="${line}"]`).classList.add('active');
  buildFilterTabs();
  renderEquipmentGrid();
  updateProgress();
}

// ===== FILTER TABS =====
function buildFilterTabs() {
  const tabs = document.getElementById('filterTabs');
  const categories = getCategories(currentLine);
  
  // Clear existing tabs
  tabs.innerHTML = '';

  // "All" tab
  const allBtn = document.createElement('button');
  allBtn.className = 'filter-tab active';
  allBtn.dataset.filter = 'all';
  allBtn.textContent = 'Tất cả';
  allBtn.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    allBtn.classList.add('active');
    currentFilter = 'all';
    renderEquipmentGrid();
  });
  tabs.appendChild(allBtn);

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-tab';
    btn.dataset.filter = cat;
    btn.textContent = `${CATEGORY_ICONS[cat] || ''} ${cat}`;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = cat;
      renderEquipmentGrid();
    });
    tabs.appendChild(btn);
  });
}

// ===== SEARCH =====
function setupSearchInput() {
  const input = document.getElementById('searchInput');
  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentSearchQuery = input.value.trim().toLowerCase();
      renderEquipmentGrid();
    }, 200);
  });
}

// ===== EQUIPMENT GRID =====
function renderEquipmentGrid() {
  const grid = document.getElementById('equipmentGrid');
  
  // Filter by line
  let filtered = currentLine === 'all'
    ? EQUIPMENT_LIST
    : EQUIPMENT_LIST.filter(eq => eq.line === currentLine);
  
  // Filter by category
  if (currentFilter !== 'all') {
    filtered = filtered.filter(eq => eq.category === currentFilter);
  }
  
  // Apply status filter
  if (currentStatusFilter === 'done') {
    filtered = filtered.filter(eq => !!statusMap[eq.id]);
  } else if (currentStatusFilter === 'pending') {
    filtered = filtered.filter(eq => !statusMap[eq.id]);
  }
  
  // Apply search filter
  if (currentSearchQuery) {
    filtered = filtered.filter(eq => 
      eq.name.toLowerCase().includes(currentSearchQuery) ||
      eq.code.toLowerCase().includes(currentSearchQuery)
    );
  }
  
  const isAdmin = currentUser && currentUser.isAdmin;

  grid.innerHTML = filtered.map(eq => {
    const status = statusMap[eq.id];
    const isDone = !!status;
    const icon = CATEGORY_ICONS[eq.category] || '⚙️';
    
    return `
      <div class="eq-card ${isDone ? 'completed' : ''}" data-id="${eq.id}" onclick="openDetail('${eq.id}')">
        <div class="eq-card-header">
          <span class="eq-card-name">${icon} ${eq.name}</span>
          <span class="eq-card-code">#${eq.code}</span>
        </div>
        <div class="eq-card-status">
          <span class="status-dot ${isDone ? 'done' : 'pending'}"></span>
          <span class="status-text ${isDone ? 'done' : ''}">
            ${isDone ? '✓ Đã vệ sinh' : 'Chưa vệ sinh'}
          </span>
        </div>
        ${isDone ? `<div class="eq-card-info">${status.workerName} · ${formatTime(status.cleanedAt)}</div>` : ''}
        ${isAdmin ? `<button class="btn-delete-eq" onclick="event.stopPropagation();deleteEquipment('${eq.id}','${eq.name}')" title="Xóa thiết bị">🗑</button>` : ''}
      </div>
    `;
  }).join('');
}

// ===== STATUS FILTER =====
function setStatusFilter(status, btn) {
  currentStatusFilter = status;
  document.querySelectorAll('.status-filter-btn').forEach(b => {
    b.classList.remove('active', 'active-done', 'active-pending');
  });
  if (status === 'done') btn.classList.add('active-done');
  else if (status === 'pending') btn.classList.add('active-pending');
  else btn.classList.add('active');
  renderEquipmentGrid();
}

// ===== PROGRESS RING =====
function updateProgress() {
  const lineList = currentLine === 'all'
    ? EQUIPMENT_LIST
    : EQUIPMENT_LIST.filter(eq => eq.line === currentLine);
  const total = lineList.length;
  const done = lineList.filter(eq => statusMap[eq.id]).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  
  document.getElementById('progressText').textContent = `${pct}%`;
  
  const ring = document.getElementById('progressRing');
  const circumference = 2 * Math.PI * 22; // r=22
  const offset = circumference - (pct / 100) * circumference;
  ring.style.strokeDashoffset = offset;
  
  // Change color based on completion
  if (pct === 100) {
    ring.style.stroke = 'var(--success)';
  } else if (pct >= 50) {
    ring.style.stroke = 'var(--accent)';
  } else {
    ring.style.stroke = 'var(--warning)';
  }
}

// ===== MODAL =====
function setupModalEvents() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  
  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const lightbox = document.querySelector('.lightbox.active');
      if (lightbox) {
        closeLightbox();
      } else if (document.getElementById('reportOverlay').classList.contains('active')) {
        closeReportModal();
      } else if (document.getElementById('addEquipmentOverlay').classList.contains('active')) {
        closeAddEquipmentModal();
      } else {
        closeModal();
      }
    }
  });

  // Add equipment modal overlay click
  document.getElementById('addEquipmentOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeAddEquipmentModal();
  });
}

function openDetail(equipmentId) {
  currentEquipment = EQUIPMENT_LIST.find(eq => eq.id === equipmentId);
  if (!currentEquipment) return;
  
  uploadedPhotos = [];
  
  document.getElementById('modalTitle').textContent = currentEquipment.name;
  document.getElementById('modalSubtitle').textContent = `Mã thiết bị: #${currentEquipment.code} · ${currentEquipment.category}`;
  
  renderModalContent();
  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
  currentEquipment = null;
  uploadedPhotos = [];
}

async function renderModalContent() {
  const body = document.getElementById('modalBody');
  const isAdmin = currentUser && currentUser.isAdmin;
  
  // Load history
  let records = [];
  try {
    const res = await fetch(`/api/records/${currentEquipment.id}`);
    records = await res.json();
  } catch (err) {
    console.error('Failed to load records:', err);
  }

  const savedWorker = localStorage.getItem('workerName') || (currentUser ? currentUser.displayName : '');
  
  body.innerHTML = `
    <!-- Trang bị bảo hộ -->
    <div class="section">
      <div class="section-title">
        <span class="icon">🦺</span> Trang bị bảo hộ
        ${isAdmin ? `<button class="btn-edit-instr" onclick="addConfigItem('ppe')" title="Thêm">＋ Thêm</button>` : ''}
      </div>
      <div class="ppe-grid">
        ${globalPpeItems.map((item, i) => `
          <div class="ppe-item">
            <span class="ppe-icon">🔹</span>
            <span class="ppe-label">${item}</span>
            ${isAdmin ? `<button class="btn-remove-item" onclick="event.stopPropagation();removeConfigItem('ppe',${i})" title="Xóa">✕</button>` : ''}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Dụng cụ chuẩn bị -->
    <div class="section">
      <div class="section-title">
        <span class="icon">🧹</span> Dụng cụ chuẩn bị
        ${isAdmin ? `<button class="btn-edit-instr" onclick="addConfigItem('tool')" title="Thêm">＋ Thêm</button>` : ''}
      </div>
      <div class="tools-list">
        ${globalToolItems.map((item, i) => `
          <div class="tool-item">
            ${item}
            ${isAdmin ? `<button class="btn-remove-tag" onclick="event.stopPropagation();removeConfigItem('tool',${i})">✕</button>` : ''}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Cleaning Instructions -->
    <div class="section">
      <div class="section-title">
        <span class="icon">📋</span> Hướng dẫn vệ sinh
        ${isAdmin ? `<button class="btn-edit-instr" onclick="toggleEditInstructions()" title="Chỉnh sửa">✏️ Sửa</button>` : ''}
      </div>
      <div id="instructionsView">
        <ol class="instructions-list">
          ${currentEquipment.instructions.map((step, i) => `
            <li class="instruction-step">
              <span class="step-number">${i + 1}</span>
              <span class="step-text">${step}</span>
            </li>
          `).join('')}
        </ol>
      </div>
      <div id="instructionsEdit" style="display:none">
        <div class="confirm-form">
          <div class="form-group">
            <textarea id="editInstructionsText" rows="8" placeholder="Mỗi bước 1 dòng...">${currentEquipment.instructions.join('\n')}</textarea>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn-confirm" style="flex:1" onclick="saveInstructions()"><span>💾</span> Lưu</button>
            <button class="btn-confirm" style="flex:1;background:var(--border)" onclick="toggleEditInstructions()"><span>✕</span> Hủy</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo Upload: Before -->
    <div class="section">
      <div class="section-title"><span class="icon">📸</span> Hình ảnh thực hiện</div>
      <div class="photo-before-after">
        <div class="photo-ba-section">
          <div class="photo-ba-label">📷 Trước khi vệ sinh</div>
          <div class="photo-upload-buttons">
            <button class="btn-photo btn-photo-sm" onclick="openCamera('before')">
              <span>📷</span> Chụp
            </button>
            <button class="btn-photo btn-photo-sm" onclick="openGallery('before')">
              <span>🖼️</span> Thư viện
            </button>
          </div>
          <div class="photo-preview-grid" id="photoPreviewBefore"></div>
        </div>
        <div class="photo-ba-section">
          <div class="photo-ba-label">📷 Sau khi vệ sinh</div>
          <div class="photo-upload-buttons">
            <button class="btn-photo btn-photo-sm" onclick="openCamera('after')">
              <span>📷</span> Chụp
            </button>
            <button class="btn-photo btn-photo-sm" onclick="openGallery('after')">
              <span>🖼️</span> Thư viện
            </button>
          </div>
          <div class="photo-preview-grid" id="photoPreviewAfter"></div>
        </div>
      </div>
      <input type="file" id="cameraInput" accept="image/*" capture="environment" style="display:none">
      <input type="file" id="galleryInput" accept="image/*" multiple style="display:none">
    </div>

    <!-- Confirmation Form -->
    <div class="section">
      <div class="section-title"><span class="icon">✅</span> Xác nhận vệ sinh</div>
      <div class="confirm-form">
        <div class="form-group">
          <label for="workerName">Người thực hiện</label>
          <input type="text" id="workerName" placeholder="Nhập tên người vệ sinh..." value="${savedWorker}">
        </div>
        <div class="form-group">
          <label for="notes">Ghi chú (không bắt buộc)</label>
          <textarea id="notes" placeholder="Ghi chú thêm nếu cần..."></textarea>
        </div>
        <button class="btn-confirm" id="btnConfirm" onclick="submitCleaning()">
          <span>✓</span> Xác nhận đã vệ sinh
        </button>
      </div>
    </div>

    <!-- History -->
    <div class="section">
      <div class="section-title"><span class="icon">🕐</span> Lịch sử vệ sinh</div>
      ${records.length === 0 
        ? `<div class="empty-state"><div class="empty-icon">📭</div><p>Chưa có lịch sử vệ sinh</p></div>`
        : `<div class="history-list">
            ${records.map(r => {
              // Parse photos - support new {before,after}, old array, and single string
              let photosBefore = [], photosAfter = [], photosAll = [];
              if (r.photo_data) {
                try {
                  const parsed = JSON.parse(r.photo_data);
                  if (parsed && parsed.before) {
                    photosBefore = parsed.before || [];
                    photosAfter = parsed.after || [];
                    photosAll = [...photosBefore, ...photosAfter];
                  } else if (Array.isArray(parsed)) {
                    photosAll = parsed;
                  } else {
                    photosAll = [r.photo_data];
                  }
                } catch(e) {
                  photosAll = [r.photo_data];
                }
              }
              const hasBA = photosBefore.length > 0 || photosAfter.length > 0;
              return `
              <div class="history-item history-item-col">
                <div class="history-item-top">
                  <div class="history-avatar">${getInitials(r.worker_name)}</div>
                  <div class="history-info">
                    <div class="history-name">${r.worker_name}</div>
                    <div class="history-time">${formatDateTime(r.cleaned_at)}</div>
                    ${r.notes ? `<div class="history-time" style="color:var(--text-secondary);margin-top:2px;">${r.notes}</div>` : ''}
                  </div>
                  ${isAdmin ? `<button class="btn-delete-record" onclick="event.stopPropagation();deleteRecord(${r.id}, this)" title="Xóa lịch sử">🗑</button>` : ''}
                </div>
                ${hasBA ? `
                  <div class="history-ba-photos">
                    ${photosBefore.length > 0 ? `
                      <div class="history-ba-group" onclick="event.stopPropagation();showLightboxGallery(${JSON.stringify(photosBefore).replace(/"/g, '&quot;')}, 0)">
                        <div class="history-ba-tag tag-before">Trước</div>
                        <div class="history-photos-row">
                          ${photosBefore.map((p, pi) => `<div class="history-photo-thumb"><img src="${p}" alt="Trước ${pi+1}" loading="lazy"></div>`).join('')}
                        </div>
                      </div>
                    ` : ''}
                    ${photosAfter.length > 0 ? `
                      <div class="history-ba-group" onclick="event.stopPropagation();showLightboxGallery(${JSON.stringify(photosAfter).replace(/"/g, '&quot;')}, 0)">
                        <div class="history-ba-tag tag-after">Sau</div>
                        <div class="history-photos-row">
                          ${photosAfter.map((p, pi) => `<div class="history-photo-thumb"><img src="${p}" alt="Sau ${pi+1}" loading="lazy"></div>`).join('')}
                        </div>
                      </div>
                    ` : ''}
                  </div>
                ` : (photosAll.length > 0 ? `
                  <div class="history-photos-row" style="margin-top:8px" onclick="event.stopPropagation();showLightboxGallery(${JSON.stringify(photosAll).replace(/"/g, '&quot;')}, 0)">
                    ${photosAll.slice(0, 4).map((p, pi) => `<div class="history-photo-thumb"><img src="${p}" alt="Ảnh ${pi+1}" loading="lazy"></div>`).join('')}
                    ${photosAll.length > 4 ? `<div class="history-photo-more">+${photosAll.length - 4}</div>` : ''}
                  </div>
                ` : '')}
              </div>`;
            }).join('')}
          </div>`
      }
    </div>
  `;
}

// ===== ADMIN: EDIT INSTRUCTIONS =====
function toggleEditInstructions() {
  const view = document.getElementById('instructionsView');
  const edit = document.getElementById('instructionsEdit');
  if (edit.style.display === 'none') {
    edit.style.display = 'block';
    view.style.display = 'none';
  } else {
    edit.style.display = 'none';
    view.style.display = 'block';
  }
}

async function saveInstructions() {
  const text = document.getElementById('editInstructionsText').value.trim();
  const instructions = text.split('\n').map(s => s.replace(/^(bước\s*\d+\s*[:.]?\s*)/i, '').trim()).filter(s => s);
  
  if (instructions.length === 0) {
    showToast('⚠️ Hướng dẫn không được để trống');
    return;
  }
  
  try {
    const res = await fetch(`/api/equipment/${currentEquipment.id}/instructions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instructions })
    });
    
    if (!res.ok) throw new Error('Failed');
    
    // Update local data
    currentEquipment.instructions = instructions;
    const eq = EQUIPMENT_LIST.find(e => e.id === currentEquipment.id);
    if (eq) eq.instructions = instructions;
    
    renderModalContent();
    showToast('✅ Đã cập nhật hướng dẫn vệ sinh');
  } catch (err) {
    console.error('Save instructions error:', err);
    showToast('❌ Lỗi khi lưu. Vui lòng thử lại.');
  }
}

// ===== ADMIN: DELETE EQUIPMENT =====
async function deleteEquipment(equipmentId, name) {
  if (!confirm(`Xác nhận xóa thiết bị "${name}"?`)) return;
  
  try {
    const res = await fetch(`/api/equipment/by-eid/${equipmentId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed');
    
    // Remove from local list
    const idx = EQUIPMENT_LIST.findIndex(e => e.id === equipmentId);
    if (idx !== -1) EQUIPMENT_LIST.splice(idx, 1);
    
    renderEquipmentGrid();
    updateProgress();
    showToast('🗑 Đã xóa thiết bị');
  } catch (err) {
    console.error('Delete equipment error:', err);
    showToast('❌ Lỗi khi xóa. Vui lòng thử lại.');
  }
}
// ===== GLOBAL CONFIG: PPE & TOOLS =====
async function loadGlobalConfig() {
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    if (config.ppe_items && Array.isArray(config.ppe_items)) globalPpeItems = config.ppe_items;
    if (config.tool_items && Array.isArray(config.tool_items)) globalToolItems = config.tool_items;
  } catch (err) {
    console.error('Failed to load global config:', err);
  }
}

async function saveConfigItems(type) {
  const key = type === 'ppe' ? 'ppe_items' : 'tool_items';
  const value = type === 'ppe' ? globalPpeItems : globalToolItems;
  try {
    await fetch(`/api/config/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    });
  } catch (err) {
    console.error('Save config error:', err);
    showToast('❌ Lỗi khi lưu. Vui lòng thử lại.');
  }
}

function addConfigItem(type) {
  const label = type === 'ppe' ? 'trang bị bảo hộ' : 'dụng cụ';
  const name = prompt(`Nhập tên ${label} mới:`);
  if (!name || !name.trim()) return;
  
  if (type === 'ppe') {
    globalPpeItems.push(name.trim());
  } else {
    globalToolItems.push(name.trim());
  }
  
  saveConfigItems(type);
  renderModalContent();
  showToast(`✅ Đã thêm "${name.trim()}"`);
}

async function removeConfigItem(type, index) {
  const list = type === 'ppe' ? globalPpeItems : globalToolItems;
  const item = list[index];
  if (!confirm(`Xóa "${item}"?`)) return;
  
  list.splice(index, 1);
  await saveConfigItems(type);
  renderModalContent();
  showToast(`🗑 Đã xóa "${item}"`);
}

// ===== MOBILE PHOTO HELPERS =====
let currentPhotoType = 'before'; // 'before' or 'after'

function openCamera(type) {
  currentPhotoType = type || 'before';
  const input = document.getElementById('cameraInput');
  input.onchange = (e) => handlePhotoUpload(e, currentPhotoType);
  input.click();
}

function openGallery(type) {
  currentPhotoType = type || 'before';
  const input = document.getElementById('galleryInput');
  input.onchange = (e) => handlePhotoUpload(e, currentPhotoType);
  input.click();
}

// ===== PHOTO UPLOAD =====
function handlePhotoUpload(event, type) {
  const files = event.target.files;
  if (!files.length) return;
  const targetArr = type === 'after' ? uploadedPhotosAfter : uploadedPhotosBefore;
  
  Array.from(files).forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      showToast('❌ Ảnh quá lớn (tối đa 5MB)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let w = img.width, h = img.height;
        
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round(h * maxDim / w);
            w = maxDim;
          } else {
            w = Math.round(w * maxDim / h);
            h = maxDim;
          }
        }
        
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        targetArr.push(compressed);
        renderPhotoPreview(type);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
  
  event.target.value = '';
}

function renderPhotoPreview(type) {
  // Render both grids
  renderPhotoGrid('photoPreviewBefore', uploadedPhotosBefore, 'before');
  renderPhotoGrid('photoPreviewAfter', uploadedPhotosAfter, 'after');
}

function renderPhotoGrid(gridId, photos, type) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  
  grid.innerHTML = photos.map((photo, i) => `
    <div class="photo-preview">
      <img src="${photo}" alt="Preview ${i+1}" onclick="showLightbox('${photo}')">
      <button class="remove-photo" onclick="event.stopPropagation();removePhoto('${type}',${i})">✕</button>
    </div>
  `).join('');
}

function removePhoto(type, index) {
  if (type === 'after') {
    uploadedPhotosAfter.splice(index, 1);
  } else {
    uploadedPhotosBefore.splice(index, 1);
  }
  renderPhotoPreview(type);
}

// ===== SUBMIT CLEANING =====
async function submitCleaning() {
  const workerName = document.getElementById('workerName').value.trim();
  const notes = document.getElementById('notes').value.trim();
  
  if (!workerName) {
    document.getElementById('workerName').focus();
    document.getElementById('workerName').style.borderColor = 'var(--danger)';
    showToast('⚠️ Vui lòng nhập tên người thực hiện');
    return;
  }
  
  const btn = document.getElementById('btnConfirm');
  btn.disabled = true;
  btn.innerHTML = '<span>⏳</span> Đang lưu...';
  
  try {
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        equipmentId: currentEquipment.id,
        workerName: workerName,
        photoData: (uploadedPhotosBefore.length > 0 || uploadedPhotosAfter.length > 0) ? JSON.stringify({ before: uploadedPhotosBefore, after: uploadedPhotosAfter }) : null,
        notes: notes || null
      })
    });
    
    if (!res.ok) throw new Error('Failed to save');
    
    // Save worker name for next time
    localStorage.setItem('workerName', workerName);
    
    // Update local status
    statusMap[currentEquipment.id] = {
      workerName: workerName,
      cleanedAt: new Date().toISOString()
    };
    
    renderEquipmentGrid();
    updateProgress();
    
    showToast('✅ Đã xác nhận vệ sinh thành công!');
    
    // Refresh modal content to show new history
    setTimeout(() => renderModalContent(), 500);
    
  } catch (err) {
    console.error('Submit error:', err);
    showToast('❌ Lỗi khi lưu. Vui lòng thử lại.');
    btn.disabled = false;
    btn.innerHTML = '<span>✓</span> Xác nhận đã vệ sinh';
  }
}

// ===== LIGHTBOX WITH GALLERY NAVIGATION =====
function showLightboxGallery(images, startIndex) {
  lightboxImages = images;
  lightboxIndex = startIndex || 0;
  renderLightbox();
}

function showLightbox(imageSrc) {
  showLightboxGallery([imageSrc], 0);
}

function renderLightbox() {
  let lightbox = document.querySelector('.lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    document.body.appendChild(lightbox);
  }
  
  const hasMultiple = lightboxImages.length > 1;
  lightbox.innerHTML = `
    ${hasMultiple ? `<button class="lightbox-nav lightbox-prev" onclick="event.stopPropagation();lightboxPrev()">‹</button>` : ''}
    <img src="${lightboxImages[lightboxIndex]}" alt="Phóng to" onclick="event.stopPropagation()">
    ${hasMultiple ? `<button class="lightbox-nav lightbox-next" onclick="event.stopPropagation();lightboxNext()">›</button>` : ''}
    ${hasMultiple ? `<div class="lightbox-counter">${lightboxIndex + 1} / ${lightboxImages.length}</div>` : ''}
    <button class="lightbox-close" onclick="event.stopPropagation();closeLightbox()">✕</button>
  `;
  lightbox.onclick = (e) => { if (e.target === lightbox) closeLightbox(); };
  lightbox.classList.add('active');
}

function lightboxPrev() {
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  renderLightbox();
}

function lightboxNext() {
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  renderLightbox();
}

function closeLightbox() {
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) lightbox.classList.remove('active');
}

// ===== ADMIN: DELETE CLEANING RECORD =====
async function deleteRecord(recordId, btn) {
  // Two-step delete: first click shows confirmation, second click deletes
  if (btn.dataset.confirmDelete === 'true') {
    // Second click - actually delete
    btn.disabled = true;
    try {
      const res = await fetch(`/api/records/${recordId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      showToast('🗑 Đã xóa lịch sử vệ sinh');
      // Refresh modal and status
      await loadStatusAndRender();
      renderModalContent();
    } catch (err) {
      console.error('Delete record error:', err);
      showToast('❌ Lỗi khi xóa. Vui lòng thử lại.');
      btn.disabled = false;
      btn.dataset.confirmDelete = 'false';
      btn.innerHTML = '🗑';
      btn.classList.remove('btn-delete-record-confirm');
    }
  } else {
    // First click - show confirmation state
    btn.dataset.confirmDelete = 'true';
    btn.innerHTML = '✓';
    btn.classList.add('btn-delete-record-confirm');
    btn.title = 'Nhấn lần nữa để xóa';
    // Auto-reset after 3 seconds
    setTimeout(() => {
      if (btn && btn.dataset.confirmDelete === 'true') {
        btn.dataset.confirmDelete = 'false';
        btn.innerHTML = '🗑';
        btn.classList.remove('btn-delete-record-confirm');
        btn.title = 'Xóa lịch sử';
      }
    }, 3000);
  }
}

// ===== TOAST =====
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== UTILITIES =====
function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ===== ADD EQUIPMENT MODAL =====
function openAddEquipmentModal() {
  document.getElementById('addEquipmentOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  document.getElementById('eqName').focus();
}

function closeAddEquipmentModal() {
  document.getElementById('addEquipmentOverlay').classList.remove('active');
  document.body.style.overflow = '';
  // Reset form
  document.getElementById('eqName').value = '';
  document.getElementById('eqCode').value = '';
  document.getElementById('eqInstructions').value = '';
}

async function saveNewEquipment() {
  const name = document.getElementById('eqName').value.trim();
  const code = document.getElementById('eqCode').value.trim();
  const category = document.getElementById('eqCategory').value;
  const instructionsText = document.getElementById('eqInstructions').value.trim();
  
  if (!name) {
    document.getElementById('eqName').focus();
    showToast('⚠️ Vui lòng nhập tên thiết bị');
    return;
  }
  if (!code) {
    document.getElementById('eqCode').focus();
    showToast('⚠️ Vui lòng nhập mã số thiết bị');
    return;
  }
  
  const instructions = instructionsText
    ? instructionsText.split('\n').map(s => s.replace(/^(bước\s*\d+\s*[:.]?\s*)/i, '').trim()).filter(s => s)
    : ['Tắt nguồn điện và khóa an toàn', 'Vệ sinh sạch sẽ bên trong và bên ngoài', 'Kiểm tra và ghi nhận tình trạng'];
  
  const btn = document.getElementById('btnSaveEquipment');
  btn.disabled = true;
  btn.innerHTML = '<span>⏳</span> Đang lưu...';
  
  try {
    const res = await fetch('/api/equipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code, category, instructions })
    });
    
    if (res.status === 409) {
      showToast('⚠️ Thiết bị này đã tồn tại');
      btn.disabled = false;
      btn.innerHTML = '<span>＋</span> Thêm thiết bị';
      return;
    }
    
    if (!res.ok) throw new Error('Failed to save');
    
    const saved = await res.json();
    
    // Add to local list
    let parsedInstructions = [];
    try { parsedInstructions = JSON.parse(saved.instructions); } catch(e) { parsedInstructions = instructions; }
    
    EQUIPMENT_LIST.push({
      id: saved.equipment_id,
      name: saved.name,
      code: saved.code,
      category: saved.category,
      instructions: parsedInstructions,
      isCustom: true,
      dbId: saved.id
    });
    
    // Re-render
    renderEquipmentGrid();
    updateProgress();
    
    showToast('✅ Đã thêm thiết bị mới thành công!');
    closeAddEquipmentModal();
    
  } catch (err) {
    console.error('Save equipment error:', err);
    showToast('❌ Lỗi khi lưu. Vui lòng thử lại.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>＋</span> Thêm thiết bị';
  }
}

// ===== REPORT MODAL =====
function openReportModal() {
  // Set default dates: today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('reportFrom').value = today;
  document.getElementById('reportTo').value = today;
  document.getElementById('reportPreview').style.display = 'none';
  
  document.getElementById('reportOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeReportModal() {
  document.getElementById('reportOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

async function generatePDFReport() {
  const fromDate = document.getElementById('reportFrom').value;
  const toDate = document.getElementById('reportTo').value;
  
  if (!fromDate || !toDate) {
    showToast('⚠️ Vui lòng chọn ngày bắt đầu và kết thúc');
    return;
  }
  
  if (new Date(fromDate) > new Date(toDate)) {
    showToast('⚠️ Ngày bắt đầu phải trước ngày kết thúc');
    return;
  }
  
  const btn = document.getElementById('btnGenerateReport');
  btn.disabled = true;
  btn.innerHTML = '<span>⏳</span> Đang tạo báo cáo...';
  
  try {
    // Fetch report data (includes photo_data)
    const res = await fetch(`/api/reports?from=${fromDate}&to=${toDate}`);
    if (!res.ok) throw new Error('Failed to fetch report');
    const records = await res.json();
    
    // Build equipment lookup
    const eqLookup = {};
    EQUIPMENT_LIST.forEach(eq => {
      eqLookup[eq.id] = { name: eq.name, code: eq.code, category: eq.category };
    });
    
    // Generate PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.width;
    const pageH = doc.internal.pageSize.height;
    
    // Register Roboto font for Vietnamese
    if (window.robotoFontBase64) {
      doc.addFileToVFS('Roboto-Regular.ttf', window.robotoFontBase64);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.setFont('Roboto', 'normal');
    }
    
    const fromStr = formatDateVN(fromDate);
    const toStr = formatDateVN(toDate);
    const useRoboto = !!window.robotoFontBase64;
    const setFont = (style) => {
      if (useRoboto) doc.setFont('Roboto', 'normal');
      else doc.setFont('helvetica', style || 'normal');
    };
    
    // ===== PAGE 1: SUMMARY TABLE =====
    doc.setFontSize(18);
    setFont('bold');
    doc.text('BÁO CÁO VỆ SINH MÁY MÓC', pageW / 2, 18, { align: 'center' });
    
    doc.setFontSize(11);
    setFont();
    doc.text(`Từ ngày: ${fromStr}  -  Đến ngày: ${toStr}`, pageW / 2, 26, { align: 'center' });
    
    // Summary stats
    const cleanedEqIds = new Set(records.map(r => r.equipment_id));
    const totalEquipment = EQUIPMENT_LIST.length;
    const cleanedCount = cleanedEqIds.size;
    const notCleanedCount = totalEquipment - cleanedCount;
    
    doc.setFontSize(10);
    setFont();
    doc.text(`Tổng thiết bị: ${totalEquipment}  |  Đã vệ sinh: ${cleanedCount}  |  Chưa vệ sinh: ${notCleanedCount}`, 14, 34);
    
    // Table of cleaning records
    const fontName = useRoboto ? 'Roboto' : 'helvetica';
    
    if (records.length > 0) {
      const tableData = records.map((r, i) => {
        const eq = eqLookup[r.equipment_id] || { name: r.equipment_id, code: '-', category: '-' };
        const dt = new Date(r.cleaned_at);
        return [
          i + 1,
          eq.name,
          '#' + eq.code,
          eq.category,
          r.worker_name,
          dt.toLocaleDateString('vi-VN'),
          dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          r.notes || ''
        ];
      });
      
      doc.autoTable({
        startY: 38,
        head: [['STT', 'Thiết bị', 'Mã', 'Nhóm', 'Người thực hiện', 'Ngày', 'Giờ', 'Ghi chú']],
        body: tableData,
        styles: { fontSize: 8, cellPadding: 2, font: fontName },
        headStyles: { fillColor: [6, 182, 212], textColor: 255, fontStyle: 'bold', font: fontName },
        alternateRowStyles: { fillColor: [240, 245, 249] },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 45 },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 25 },
          4: { cellWidth: 35 },
          5: { cellWidth: 25, halign: 'center' },
          6: { cellWidth: 15, halign: 'center' },
          7: { cellWidth: 'auto' }
        }
      });
    } else {
      doc.setFontSize(12);
      setFont();
      doc.text('Không có dữ liệu vệ sinh trong khoảng thời gian này.', pageW / 2, 50, { align: 'center' });
    }
    
    // ===== NOT CLEANED EQUIPMENT LIST =====
    const notCleanedEquipment = EQUIPMENT_LIST.filter(eq => !cleanedEqIds.has(eq.id));
    if (notCleanedEquipment.length > 0) {
      const currentY = doc.autoTable.previous ? doc.autoTable.previous.finalY + 10 : 60;
      if (currentY > pageH - 40) doc.addPage();
      
      const startY = currentY > pageH - 40 ? 18 : currentY;
      doc.setFontSize(12);
      setFont('bold');
      doc.text('THIẾT BỊ CHƯA VỆ SINH', 14, startY);
      
      const notCleanedData = notCleanedEquipment.map((eq, i) => [
        i + 1, eq.name, '#' + eq.code, eq.category
      ]);
      
      doc.autoTable({
        startY: startY + 4,
        head: [['STT', 'Thiết bị', 'Mã', 'Nhóm']],
        body: notCleanedData,
        styles: { fontSize: 8, cellPadding: 2, font: fontName },
        headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold', font: fontName },
        alternateRowStyles: { fillColor: [255, 249, 235] },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 60 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 30 }
        }
      });
    }
    
    // ===== DETAIL PAGES WITH IMAGES =====
    const recordsWithPhotos = records.filter(r => r.photo_data);
    if (recordsWithPhotos.length > 0) {
      for (const r of recordsWithPhotos) {
        const eq = eqLookup[r.equipment_id] || { name: r.equipment_id, code: '-', category: '-' };
        const dt = new Date(r.cleaned_at);
        
        // Parse photos
        let photosBefore = [], photosAfter = [], photosAll = [];
        try {
          const parsed = JSON.parse(r.photo_data);
          if (parsed && parsed.before) {
            photosBefore = parsed.before || [];
            photosAfter = parsed.after || [];
          } else if (Array.isArray(parsed)) {
            photosAll = parsed;
          } else {
            photosAll = [r.photo_data];
          }
        } catch(e) {
          photosAll = [r.photo_data];
        }
        
        const hasPhotos = photosBefore.length > 0 || photosAfter.length > 0 || photosAll.length > 0;
        if (!hasPhotos) continue;
        
        // New page for each equipment with photos
        doc.addPage();
        let y = 14;
        
        // Equipment header
        doc.setFontSize(14);
        setFont('bold');
        doc.text(`${eq.name} - #${eq.code}`, 14, y);
        y += 7;
        
        doc.setFontSize(9);
        setFont();
        doc.text(`Nhóm: ${eq.category}  |  Người thực hiện: ${r.worker_name}  |  Thời gian: ${dt.toLocaleDateString('vi-VN')} ${dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`, 14, y);
        y += 4;
        
        // Draw separator
        doc.setDrawColor(6, 182, 212);
        doc.setLineWidth(0.5);
        doc.line(14, y, pageW - 14, y);
        y += 6;
        
        const imgMaxW = 80;
        const imgMaxH = 60;
        
        if (photosBefore.length > 0 || photosAfter.length > 0) {
          // Before photos
          if (photosBefore.length > 0) {
            doc.setFontSize(11);
            setFont('bold');
            doc.setTextColor(245, 158, 11);
            doc.text('TRƯỚC KHI VỆ SINH', 14, y);
            doc.setTextColor(0, 0, 0);
            y += 4;
            
            let x = 14;
            for (const photo of photosBefore.slice(0, 3)) {
              try {
                const imgFormat = photo.includes('image/png') ? 'PNG' : 'JPEG';
                doc.addImage(photo, imgFormat, x, y, imgMaxW, imgMaxH);
                x += imgMaxW + 5;
                if (x + imgMaxW > pageW - 14) { x = 14; y += imgMaxH + 5; }
              } catch(e) { console.warn('Could not add before image:', e); }
            }
            y += imgMaxH + 8;
          }
          
          // Check if we need a new page for after photos
          if (y + imgMaxH + 20 > pageH - 14 && photosAfter.length > 0) {
            doc.addPage();
            y = 14;
          }
          
          // After photos
          if (photosAfter.length > 0) {
            doc.setFontSize(11);
            setFont('bold');
            doc.setTextColor(16, 185, 129);
            doc.text('SAU KHI VỆ SINH', 14, y);
            doc.setTextColor(0, 0, 0);
            y += 4;
            
            let x = 14;
            for (const photo of photosAfter.slice(0, 3)) {
              try {
                const imgFormat = photo.includes('image/png') ? 'PNG' : 'JPEG';
                doc.addImage(photo, imgFormat, x, y, imgMaxW, imgMaxH);
                x += imgMaxW + 5;
                if (x + imgMaxW > pageW - 14) { x = 14; y += imgMaxH + 5; }
              } catch(e) { console.warn('Could not add after image:', e); }
            }
          }
        } else if (photosAll.length > 0) {
          // Legacy format - show all photos
          doc.setFontSize(11);
          setFont('bold');
          doc.text('HÌNH ẢNH', 14, y);
          y += 4;
          
          let x = 14;
          for (const photo of photosAll.slice(0, 6)) {
            try {
              const imgFormat = photo.includes('image/png') ? 'PNG' : 'JPEG';
              doc.addImage(photo, imgFormat, x, y, imgMaxW, imgMaxH);
              x += imgMaxW + 5;
              if (x + imgMaxW > pageW - 14) { x = 14; y += imgMaxH + 5; }
            } catch(e) { console.warn('Could not add image:', e); }
          }
        }
      }
    }
    
    // ===== FOOTER on all pages =====
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      setFont();
      doc.text(
        `Trang ${i}/${pageCount} - Xuất lúc: ${new Date().toLocaleString('vi-VN')}`,
        pageW / 2, pageH - 8,
        { align: 'center' }
      );
    }
    
    // Save
    doc.save(`BaoCao_VeSinh_${fromDate}_${toDate}.pdf`);
    showToast('✅ Đã tạo báo cáo PDF thành công!');
    
    // Show preview summary
    const previewEl = document.getElementById('reportPreview');
    previewEl.style.display = 'block';
    previewEl.innerHTML = `
      <div class="report-summary">
        <div class="report-stat">
          <div class="report-stat-value">${totalEquipment}</div>
          <div class="report-stat-label">Tổng thiết bị</div>
        </div>
        <div class="report-stat report-stat-success">
          <div class="report-stat-value">${cleanedCount}</div>
          <div class="report-stat-label">Đã vệ sinh</div>
        </div>
        <div class="report-stat report-stat-warning">
          <div class="report-stat-value">${notCleanedCount}</div>
          <div class="report-stat-label">Chưa vệ sinh</div>
        </div>
      </div>
      <p style="text-align:center;font-size:0.78rem;color:var(--text-muted);margin-top:8px;">${records.length} bản ghi vệ sinh trong khoảng thời gian</p>
    `;
    
  } catch (err) {
    console.error('Report generation error:', err);
    showToast('❌ Lỗi khi tạo báo cáo. Vui lòng thử lại.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>📄</span> Tạo báo cáo PDF';
  }
}

function formatDateVN(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
