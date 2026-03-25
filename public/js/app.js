// ===== APP STATE =====
let statusMap = {};
let currentFilter = 'all';
let uploadedPhotos = [];
let currentEquipment = null;
let currentUser = null;
let globalPpeItems = ['Nón', 'Giày', 'Khẩu trang', 'Bao tay len'];
let globalToolItems = ['Sủi cán gỗ ngắn', 'Sủi dao ngắn', 'Sủi dao dài', 'Sủi dài 1 mét', 'Chổi nhựa', 'Đèn pin', 'Ky rốt cám', 'Bao trắng'];

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
    buildFilterTabs();
    loadStatusAndRender();
    setupModalEvents();
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

// ===== FILTER TABS =====
function buildFilterTabs() {
  const tabs = document.getElementById('filterTabs');
  const categories = getCategories();
  
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

  // "All" tab click handler
  tabs.querySelector('[data-filter="all"]').addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tabs.querySelector('[data-filter="all"]').classList.add('active');
    currentFilter = 'all';
    renderEquipmentGrid();
  });
}

// ===== EQUIPMENT GRID =====
function renderEquipmentGrid() {
  const grid = document.getElementById('equipmentGrid');
  const filtered = currentFilter === 'all' 
    ? EQUIPMENT_LIST 
    : EQUIPMENT_LIST.filter(eq => eq.category === currentFilter);
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

// ===== PROGRESS RING =====
function updateProgress() {
  const total = EQUIPMENT_LIST.length;
  const done = EQUIPMENT_LIST.filter(eq => statusMap[eq.id]).length;
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
        lightbox.classList.remove('active');
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

    <!-- Photo Upload -->
    <div class="section">
      <div class="section-title"><span class="icon">📸</span> Hình ảnh thực hiện</div>
      <div class="photo-upload-buttons">
        <button class="btn-photo" onclick="openCamera()">
          <span>📷</span> Chụp ảnh
        </button>
        <button class="btn-photo" onclick="openGallery()">
          <span>🖼️</span> Thư viện
        </button>
      </div>
      <input type="file" id="cameraInput" accept="image/*" capture="environment" style="display:none" onchange="handlePhotoUpload(event)">
      <input type="file" id="galleryInput" accept="image/*" multiple style="display:none" onchange="handlePhotoUpload(event)">
      <div class="photo-preview-grid" id="photoPreviewGrid"></div>
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
            ${records.map(r => `
              <div class="history-item">
                <div class="history-avatar">${getInitials(r.worker_name)}</div>
                <div class="history-info">
                  <div class="history-name">${r.worker_name}</div>
                  <div class="history-time">${formatDateTime(r.cleaned_at)}</div>
                  ${r.notes ? `<div class="history-time" style="color:var(--text-secondary);margin-top:2px;">${r.notes}</div>` : ''}
                </div>
                ${r.photo_data ? `
                  <div class="history-photo" onclick="event.stopPropagation();showLightbox('${r.photo_data}')">
                    <img src="${r.photo_data}" alt="Ảnh vệ sinh" loading="lazy">
                  </div>
                ` : ''}
              </div>
            `).join('')}
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
function openCamera() {
  document.getElementById('cameraInput').click();
}

function openGallery() {
  document.getElementById('galleryInput').click();
}

// ===== PHOTO UPLOAD =====
function handlePhotoUpload(event) {
  const files = event.target.files;
  if (!files.length) return;
  
  Array.from(files).forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      showToast('❌ Ảnh quá lớn (tối đa 5MB)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      // Resize image to reduce storage
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
        uploadedPhotos.push(compressed);
        renderPhotoPreview();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
  
  // Reset input so same file can be selected again
  event.target.value = '';
}

function renderPhotoPreview() {
  const grid = document.getElementById('photoPreviewGrid');
  if (!grid) return;
  
  grid.innerHTML = uploadedPhotos.map((photo, i) => `
    <div class="photo-preview">
      <img src="${photo}" alt="Preview ${i+1}" onclick="showLightbox('${photo}')">
      <button class="remove-photo" onclick="event.stopPropagation();removePhoto(${i})">✕</button>
    </div>
  `).join('');
}

function removePhoto(index) {
  uploadedPhotos.splice(index, 1);
  renderPhotoPreview();
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
        photoData: uploadedPhotos.length > 0 ? uploadedPhotos[0] : null,
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

// ===== LIGHTBOX =====
function showLightbox(imageSrc) {
  let lightbox = document.querySelector('.lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.onclick = () => lightbox.classList.remove('active');
    lightbox.innerHTML = '<img src="" alt="Phóng to">';
    document.body.appendChild(lightbox);
  }
  lightbox.querySelector('img').src = imageSrc;
  lightbox.classList.add('active');
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
