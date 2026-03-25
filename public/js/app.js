// ===== APP STATE =====
let statusMap = {};
let currentFilter = 'all';
let uploadedPhotos = [];
let currentEquipment = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
  setCurrentDate();
  await loadCustomEquipment();
  buildFilterTabs();
  loadStatusAndRender();
  setupModalEvents();
});

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
      // Avoid duplicates
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
  
  // Load history
  let records = [];
  try {
    const res = await fetch(`/api/records/${currentEquipment.id}`);
    records = await res.json();
  } catch (err) {
    console.error('Failed to load records:', err);
  }

  const savedWorker = localStorage.getItem('workerName') || '';
  
  body.innerHTML = `
    <!-- Cleaning Instructions -->
    <div class="section">
      <div class="section-title"><span class="icon">📋</span> Hướng dẫn vệ sinh</div>
      <ol class="instructions-list">
        ${currentEquipment.instructions.map((step, i) => `
          <li class="instruction-step">
            <span class="step-number">${i + 1}</span>
            <span class="step-text">${step}</span>
          </li>
        `).join('')}
      </ol>
    </div>

    <!-- Photo Upload -->
    <div class="section">
      <div class="section-title"><span class="icon">📸</span> Hình ảnh thực hiện</div>
      <div class="photo-upload-area" id="photoUploadArea" onclick="document.getElementById('photoInput').click()">
        <div class="upload-icon">📷</div>
        <p>Chạm để chụp ảnh hoặc chọn từ thư viện</p>
        <p class="upload-hint">Hỗ trợ JPG, PNG · Tối đa 5MB</p>
      </div>
      <input type="file" id="photoInput" accept="image/*" capture="environment" multiple style="display:none" onchange="handlePhotoUpload(event)">
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
