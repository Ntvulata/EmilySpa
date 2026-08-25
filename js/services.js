/**
 * SPA EASE - Quản Lý Lịch Hẹn Spa
 * services.js - Quản lý Dịch vụ, Bảng giá, Kỹ thuật viên & Phòng/Giường
 */

const ServicesModule = {
  currentSubTab: 'services', // 'services' | 'staff' | 'rooms' | 'packages'
  searchQuery: '',
  selectedCategory: 'all',
  editingServiceId: null,
  editingStaffId: null,
  editingRoomId: null,

  init() {
    this.render();
  },

  setSubTab(tab) {
    this.currentSubTab = tab;
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.render();
  },

  onSearch(val) {
    this.searchQuery = val;
    this.renderSubTabContentOnly();
  },

  onCategoryFilter(val) {
    this.selectedCategory = val;
    this.renderSubTabContentOnly();
  },

  render() {
    const container = document.getElementById('services-view-content');
    if (!container) return;

    const store = window.spaStore;
    const allServices = store.getServices();
    const categories = ['all', ...new Set(allServices.map(s => s.category).filter(Boolean))];

    let placeholderText = 'Tìm kiếm dịch vụ theo tên, giá, mô tả...';
    if (this.currentSubTab === 'packages') placeholderText = 'Tìm kiếm gói liệu trình, thẻ tài khoản...';
    else if (this.currentSubTab === 'staff') placeholderText = 'Tìm kiếm KTV theo tên, SĐT, chuyên môn...';
    else if (this.currentSubTab === 'rooms') placeholderText = 'Tìm kiếm phòng, giường...';

    let html = `
      <div class="space-y-6">
        <!-- Sub-tabs Navigation -->
        <div class="flex items-center justify-between border-b border-rose-100 pb-3 flex-wrap gap-3">
          <div class="flex flex-wrap gap-1.5 bg-rose-50/70 p-1 rounded-xl">
            <button 
              onclick="ServicesModule.setSubTab('services')"
              class="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${this.currentSubTab === 'services' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
            >
              🌿 Bảng Giá Dịch Vụ
            </button>
            <button 
              onclick="ServicesModule.setSubTab('packages')"
              class="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${this.currentSubTab === 'packages' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
            >
              🎁 Gói & Thẻ Liệu Trình
            </button>
            <button 
              onclick="ServicesModule.setSubTab('staff')"
              class="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${this.currentSubTab === 'staff' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
            >
              👩‍💼 Kỹ Thuật Viên (KTV)
            </button>
            <button 
              onclick="ServicesModule.setSubTab('rooms')"
              class="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${this.currentSubTab === 'rooms' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
            >
              🛋️ Phòng & Giường Spa
            </button>
          </div>

          <!-- Nút hành động tương ứng -->
          <div>
            ${this.currentSubTab === 'services' ? `
              <button onclick="ServicesModule.openAddServiceModal()" class="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition flex items-center gap-2">
                <i data-lucide="plus-circle" class="w-4 h-4"></i> Thêm Dịch Vụ
              </button>
            ` : this.currentSubTab === 'packages' ? `
              <button onclick="PackagesModule.openAddTemplateModal()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition flex items-center gap-2">
                <i data-lucide="plus-circle" class="w-4 h-4"></i> + Thêm Gói / Thẻ Mới
              </button>
            ` : this.currentSubTab === 'staff' ? `
              <button onclick="ServicesModule.openAddStaffModal()" class="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition flex items-center gap-2">
                <i data-lucide="user-plus" class="w-4 h-4"></i> Thêm Kỹ Thuật Viên
              </button>
            ` : `
              <button onclick="ServicesModule.openAddRoomModal()" class="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition flex items-center gap-2">
                <i data-lucide="plus-circle" class="w-4 h-4"></i> Thêm Phòng & Giường
              </button>
            `}
          </div>
        </div>

        <!-- Search and Filter Bar -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
            <!-- Tìm kiếm -->
            <div class="relative flex-1 max-w-md">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-3"></i>
              <input 
                type="text" 
                id="services-search-input"
                placeholder="${placeholderText}" 
                value="${this.searchQuery}"
                oninput="ServicesModule.onSearch(this.value)"
                class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-sm"
              />
            </div>

            <!-- Lọc phân loại cho dịch vụ -->
            ${this.currentSubTab === 'services' ? `
              <select 
                onchange="ServicesModule.onCategoryFilter(this.value)"
                class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-sm font-medium"
              >
                <option value="all" ${this.selectedCategory === 'all' ? 'selected' : ''}>Tất cả nhóm dịch vụ</option>
                ${categories.filter(c => c !== 'all').map(cat => `
                  <option value="${cat}" ${this.selectedCategory === cat ? 'selected' : ''}>${cat}</option>
                `).join('')}
              </select>
            ` : ''}
          </div>
        </div>

        <!-- Content Area -->
        <div id="services-subtab-content">
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.renderSubTabContentOnly();
  },

  renderSubTabContentOnly() {
    const contentEl = document.getElementById('services-subtab-content');
    if (!contentEl) return;

    if (this.currentSubTab === 'services') contentEl.innerHTML = this.renderServicesList();
    else if (this.currentSubTab === 'packages') contentEl.innerHTML = this.renderPackagesList();
    else if (this.currentSubTab === 'staff') contentEl.innerHTML = this.renderStaffList();
    else if (this.currentSubTab === 'rooms') contentEl.innerHTML = this.renderRoomsList();

    if (window.lucide) lucide.createIcons();
  },

  renderServicesList() {
    const store = window.spaStore;
    let services = store.getServices();

    if (this.selectedCategory !== 'all') {
      services = services.filter(s => s.category === this.selectedCategory);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      services = services.filter(s => 
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        (s.duration && String(s.duration).includes(q)) ||
        (s.price && String(s.price).includes(q))
      );
    }

    if (services.length === 0) {
      return `
        <div class="py-16 bg-white rounded-2xl border border-rose-100 text-center text-slate-400">
          <i data-lucide="search-x" class="w-12 h-12 mx-auto mb-2 opacity-40"></i>
          <p class="text-base font-medium">Không tìm thấy dịch vụ nào khớp với tìm kiếm</p>
        </div>
      `;
    }

    // Gom nhóm theo category
    const categories = {};
    services.forEach(s => {
      const cat = s.category || 'Khác';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(s);
    });

    let html = `<div class="space-y-6">`;
    for (const [cat, list] of Object.entries(categories)) {
      html += `
        <div class="space-y-3">
          <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> ${cat} (${list.length})
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${list.map(s => `
              <div class="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="font-bold text-slate-800 text-base group-hover:text-rose-600 transition leading-snug">${s.name}</h4>
                  </div>
                  <p class="text-xs text-slate-500 mt-2 leading-relaxed">${s.description || 'Chưa có mô tả chi tiết.'}</p>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span class="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <i data-lucide="clock" class="w-3.5 h-3.5"></i> ${s.duration} phút
                    </span>
                    <div class="text-base font-bold text-rose-600">${store.formatCurrency(s.price)}</div>
                  </div>

                  <div class="flex items-center gap-1">
                    <button 
                      onclick="ServicesModule.openEditServiceModal('${s.id}')"
                      class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Sửa dịch vụ"
                    >
                      <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                    ${window.AuthModule?.isAdmin() ? `
                      <button 
                        onclick="ServicesModule.deleteService('${s.id}')"
                        class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Xóa dịch vụ (Chỉ Admin)"
                      >
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    html += `</div>`;
    return html;
  },

  renderStaffList() {
    const store = window.spaStore;
    let staff = store.getStaff();
    const today = new Date().toISOString().split('T')[0];
    const todayApts = store.getAppointments().filter(a => a.date === today && a.status !== 'cancelled');

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      staff = staff.filter(st => 
        (st.name && st.name.toLowerCase().includes(q)) ||
        (st.role && st.role.toLowerCase().includes(q)) ||
        (st.phone && st.phone.includes(q)) ||
        ((st.skills || []).some(sk => sk.toLowerCase().includes(q)))
      );
    }

    if (staff.length === 0) {
      return `
        <div class="py-16 bg-white rounded-2xl border border-rose-100 text-center text-slate-400">
          <i data-lucide="user-x" class="w-12 h-12 mx-auto mb-2 opacity-40"></i>
          <p class="text-base font-medium">Không tìm thấy Kỹ thuật viên nào khớp với tìm kiếm</p>
        </div>
      `;
    }

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        ${staff.map(st => {
          const aptsForStaffToday = todayApts.filter(a => a.staffId === st.id);
          return `
            <div class="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition text-center flex flex-col justify-between group">
              <div>
                <div class="flex justify-end -mt-1 -mr-1">
                  <div class="flex items-center gap-1">
                    <button 
                      onclick="ServicesModule.openEditStaffModal('${st.id}')"
                      class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Chỉnh sửa thông tin KTV"
                    >
                      <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                    ${window.AuthModule?.isAdmin() ? `
                      <button 
                        onclick="ServicesModule.deleteStaff('${st.id}')"
                        class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Xóa KTV (Chỉ Admin)"
                      >
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    ` : ''}
                  </div>
                </div>

                <div class="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-sm mb-3" style="background-color: ${st.color}20; color: ${st.color}">
                  ${st.avatar || '👩‍💼'}
                </div>
                <h4 class="font-bold text-slate-800 text-base">${st.name}</h4>
                <span class="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600">
                  ${st.role}
                </span>
                <a href="tel:${st.phone}" class="text-xs text-slate-400 block mt-1 hover:text-rose-500">
                  <i data-lucide="phone" class="w-3 h-3 inline"></i> ${st.phone}
                </a>

                <div class="mt-3 flex flex-wrap justify-center gap-1 text-[11px]">
                  ${(st.skills || []).map(sk => `<span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">${sk}</span>`).join('')}
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span class="text-slate-500">Hôm nay: <strong class="text-rose-600">${aptsForStaffToday.length} lịch</strong></span>
                <button 
                  onclick="AppointmentsModule.onFilterChange('staffId', '${st.id}'); AppointmentsModule.setView('timeline'); window.app.switchTab('appointments');" 
                  class="text-rose-500 hover:underline font-semibold"
                >
                  Xem lịch ➜
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderRoomsList() {
    const store = window.spaStore;
    let rooms = store.getRooms();

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      rooms = rooms.filter(rm => 
        (rm.name && rm.name.toLowerCase().includes(q)) ||
        (rm.type && rm.type.toLowerCase().includes(q)) ||
        ((rm.beds || []).some(b => (b.name && b.name.toLowerCase().includes(q))))
      );
    }

    if (rooms.length === 0) {
      return `
        <div class="py-16 bg-white rounded-2xl border border-rose-100 text-center text-slate-400">
          <i data-lucide="door-closed" class="w-12 h-12 mx-auto mb-2 opacity-40"></i>
          <p class="text-base font-medium">Không tìm thấy phòng / giường nào khớp với tìm kiếm</p>
        </div>
      `;
    }

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${rooms.map(rm => `
          <div class="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="font-bold text-slate-800 text-base flex items-center gap-2">
                    <i data-lucide="door-open" class="w-4 h-4 text-rose-500"></i> ${rm.name}
                  </h4>
                  <p class="text-xs text-slate-400 mt-0.5">${rm.type || 'Phòng dịch vụ'}</p>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ${rm.beds ? rm.beds.length : 0} Giường
                </span>
              </div>

              <!-- Danh sách Giường -->
              <div class="mt-4 space-y-2">
                ${(rm.beds || []).map((b, idx) => `
                  <div class="p-2.5 bg-slate-50 rounded-xl text-xs font-medium text-slate-700 flex items-center justify-between border border-slate-100">
                    <span class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full ${b.status === 'in_use' ? 'bg-purple-500' : 'bg-emerald-500'}"></span>
                      ${b.name || `Giường ${idx + 1}`}
                    </span>
                    <span class="text-[11px] ${b.status === 'in_use' ? 'text-purple-600 font-bold' : 'text-slate-400'}">
                      ${b.status === 'in_use' ? 'Đang có khách' : 'Trống'}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-1">
              <button 
                onclick="ServicesModule.openEditRoomModal('${rm.id}')"
                class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Sửa phòng"
              >
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </button>
              ${window.AuthModule?.isAdmin() ? `
                <button 
                  onclick="ServicesModule.deleteRoom('${rm.id}')"
                  class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Xóa phòng (Chỉ Admin)"
                >
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // MODAL PHÒNG & GIƯỜNG (ROOMS & BEDS)
  openAddRoomModal() {
    this.editingRoomId = null;
    const form = document.getElementById('room-form');
    if (!form) return;

    document.getElementById('modal-room-title').textContent = 'Thêm Phòng & Giường Spa Mới';

    form.innerHTML = `
      <div class="space-y-4 text-sm">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tên Phòng Spa <span class="text-rose-500">*</span></label>
          <input type="text" id="room-input-name" required placeholder="Ví dụ: Phòng Chăm Sóc Da VIP 3, Phòng Gội Đầu 2..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm" />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Loại Phòng</label>
          <select id="room-input-type" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm">
            <option value="Phòng đơn VIP">Phòng đơn VIP (1 giường)</option>
            <option value="Phòng đôi VIP">Phòng đôi VIP (2 giường)</option>
            <option value="Phòng dịch vụ">Phòng dịch vụ tiêu chuẩn</option>
            <option value="Phòng máy công nghệ cao">Phòng máy công nghệ cao</option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Danh Sách Tên Giường / Vị Trí <span class="text-rose-500">*</span></label>
          <p class="text-[11px] text-slate-400">Nhập tên các giường cách nhau bằng dấu phẩy <code>,</code> hoặc xuống dòng.</p>
          <textarea id="room-input-beds" rows="3" required placeholder="Ví dụ: Giường 01, Giường 02, Giường 03" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm font-medium text-slate-800">Giường 01, Giường 02</textarea>
        </div>
      </div>
    `;

    document.getElementById('room-modal').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  },

  openEditRoomModal(id) {
    this.openAddRoomModal();
    this.editingRoomId = id;
    document.getElementById('modal-room-title').textContent = 'Chỉnh Sửa Phòng & Đổi Tên/Số Giường';

    const room = window.spaStore.getRooms().find(r => r.id === id);
    if (!room) return;

    document.getElementById('room-input-name').value = room.name || '';
    document.getElementById('room-input-type').value = room.type || 'Phòng dịch vụ';
    document.getElementById('room-input-beds').value = (room.beds || []).join(', ');
  },

  saveRoomForm(e) {
    e.preventDefault();
    const store = window.spaStore;

    const name = document.getElementById('room-input-name').value.trim();
    const type = document.getElementById('room-input-type').value;
    const bedsRaw = document.getElementById('room-input-beds').value;

    // Phân tách giường bằng dấu phẩy hoặc xuống dòng
    const beds = bedsRaw
      .split(/[,\n]/)
      .map(b => b.trim())
      .filter(Boolean);

    if (!name) {
      window.app.showToast('Vui lòng nhập tên phòng', 'warning');
      return;
    }

    if (beds.length === 0) {
      window.app.showToast('Vui lòng nhập ít nhất 1 tên giường', 'warning');
      return;
    }

    const data = {
      name,
      type,
      beds
    };

    if (this.editingRoomId) {
      store.updateRoom(this.editingRoomId, data);
      window.app.showToast('Đã cập nhật phòng và danh sách giường!', 'success');
    } else {
      store.addRoom(data);
      window.app.showToast('Thêm phòng và giường mới thành công!', 'success');
    }

    this.closeRoomModal();
    this.render();
  },

  closeRoomModal() {
    document.getElementById('room-modal')?.classList.add('hidden');
    this.editingRoomId = null;
  },

  deleteRoom(id) {
    if (!window.AuthModule?.isAdmin()) {
      window.app?.showToast('⚠️ Chỉ tài khoản Chủ Spa (Admin) mới có quyền xóa phòng!', 'error');
      return;
    }

    if (confirm('Bạn có chắc chắn muốn xóa phòng này không?')) {
      window.spaStore.deleteRoom(id);
      window.app.showToast('Đã xóa phòng', 'info');
      this.render();
    }
  },

  // MODAL DỊCH VỤ
  openAddServiceModal() {
    this.editingServiceId = null;
    const form = document.getElementById('service-form');
    if (!form) return;

    document.getElementById('modal-service-title').textContent = 'Thêm Dịch Vụ Mới';

    form.innerHTML = `
      <div class="space-y-4 text-sm">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase">Tên Dịch Vụ <span class="text-rose-500">*</span></label>
          <input type="text" id="srv-input-name" required placeholder="Ví dụ: Massage Body Đá Nóng" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase">Danh Mục</label>
            <input type="text" id="srv-input-category" list="category-options" placeholder="Chăm sóc da, Massage..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm" />
            <datalist id="category-options">
              <option value="Chăm sóc da">
              <option value="Massage & Trị liệu">
              <option value="Dưỡng sinh">
              <option value="Triệt lông">
              <option value="Tắm trắng">
              <option value="Nail & Mi">
            </datalist>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase">Thời Lượng (Phút) <span class="text-rose-500">*</span></label>
            <input type="number" id="srv-input-duration" required value="60" min="15" step="15" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm" />
          </div>
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase">Đơn Giá (VNĐ) <span class="text-rose-500">*</span></label>
          <input type="number" id="srv-input-price" required value="300000" step="10000" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm font-semibold text-rose-600" />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase">Mô Tả Quy Trình / Tác Dụng</label>
          <textarea id="srv-input-desc" rows="2" placeholder="Chi tiết các bước thực hiện..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"></textarea>
        </div>
      </div>
    `;

    document.getElementById('service-modal').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  },

  openEditServiceModal(id) {
    this.openAddServiceModal();
    this.editingServiceId = id;
    document.getElementById('modal-service-title').textContent = 'Chỉnh Sửa Dịch Vụ';

    const srv = window.spaStore.getServices().find(s => s.id === id);
    if (!srv) return;

    document.getElementById('srv-input-name').value = srv.name || '';
    document.getElementById('srv-input-category').value = srv.category || 'Chăm sóc da';
    document.getElementById('srv-input-duration').value = srv.duration || 60;
    document.getElementById('srv-input-price').value = srv.price || 0;
    document.getElementById('srv-input-desc').value = srv.description || '';
  },

  saveServiceForm(e) {
    e.preventDefault();
    const store = window.spaStore;

    const data = {
      name: document.getElementById('srv-input-name').value.trim(),
      category: document.getElementById('srv-input-category').value.trim() || 'Dịch vụ Spa',
      duration: parseInt(document.getElementById('srv-input-duration').value, 10) || 60,
      price: parseInt(document.getElementById('srv-input-price').value, 10) || 0,
      description: document.getElementById('srv-input-desc').value.trim()
    };

    if (!data.name) {
      window.app.showToast('Vui lòng nhập tên dịch vụ', 'warning');
      return;
    }

    if (this.editingServiceId) {
      store.updateService(this.editingServiceId, data);
      window.app.showToast('Đã cập nhật dịch vụ!', 'success');
    } else {
      store.addService(data);
      window.app.showToast('Thêm dịch vụ mới thành công!', 'success');
    }

    this.closeServiceModal();
    this.render();
  },

  closeServiceModal() {
    document.getElementById('service-modal')?.classList.add('hidden');
    this.editingServiceId = null;
  },

  deleteService(id) {
    if (!window.AuthModule?.isAdmin()) {
      window.app?.showToast('⚠️ Chỉ tài khoản Chủ Spa (Admin) mới có quyền xóa dịch vụ!', 'error');
      return;
    }

    if (confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      window.spaStore.deleteService(id);
      window.app.showToast('Đã xóa dịch vụ', 'info');
      this.render();
    }
  },

  // MODAL KỸ THUẬT VIÊN
  openAddStaffModal() {
    this.editingStaffId = null;
    const form = document.getElementById('staff-form');
    if (!form) return;

    const modalTitle = document.querySelector('#staff-modal h3');
    if (modalTitle) modalTitle.textContent = 'Thêm Kỹ Thuật Viên Mới';

    form.innerHTML = `
      <div class="space-y-4 text-sm">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase">Họ và Tên KTV <span class="text-rose-500">*</span></label>
          <input type="text" id="staff-input-name" required placeholder="Ví dụ: Nguyễn Thị Mai" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase">Số Điện Thoại</label>
            <input type="tel" id="staff-input-phone" placeholder="09xx xxx xxx" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm" />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase">Vị Trí / Chức Danh</label>
            <input type="text" id="staff-input-role" value="Kỹ thuật viên" placeholder="KTV Trưởng, KTV Da..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm" />
          </div>
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase">Kỹ Năng & Chuyên Môn (cách nhau bởi dấu phẩy)</label>
          <input type="text" id="staff-input-skills" placeholder="Chăm sóc da, Massage, Dưỡng sinh" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm" />
        </div>
      </div>
    `;

    document.getElementById('staff-modal').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  },

  openEditStaffModal(id) {
    this.openAddStaffModal();
    this.editingStaffId = id;

    const modalTitle = document.querySelector('#staff-modal h3');
    if (modalTitle) modalTitle.textContent = 'Chỉnh Sửa Thông Tin KTV';

    const staff = window.spaStore.getStaff().find(s => s.id === id);
    if (!staff) return;

    document.getElementById('staff-input-name').value = staff.name || '';
    document.getElementById('staff-input-phone').value = staff.phone || '';
    document.getElementById('staff-input-role').value = staff.role || 'Kỹ thuật viên';
    document.getElementById('staff-input-skills').value = (staff.skills || []).join(', ');
  },

  saveStaffForm(e) {
    e.preventDefault();
    const store = window.spaStore;

    const skillsRaw = document.getElementById('staff-input-skills').value;
    const skills = skillsRaw.split(',').map(s => s.trim()).filter(Boolean);

    const colors = ['#f43f5e', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const data = {
      name: document.getElementById('staff-input-name').value.trim(),
      phone: document.getElementById('staff-input-phone').value.trim(),
      role: document.getElementById('staff-input-role').value.trim() || 'Kỹ thuật viên',
      skills: skills.length > 0 ? skills : ['Chăm sóc da']
    };

    if (!data.name) {
      window.app.showToast('Vui lòng nhập tên nhân viên', 'warning');
      return;
    }

    if (this.editingStaffId) {
      store.updateStaff(this.editingStaffId, data);
      window.app.showToast('Đã cập nhật thông tin Kỹ thuật viên!', 'success');
    } else {
      data.avatar = '💆‍♀️';
      data.color = randomColor;
      store.addStaff(data);
      window.app.showToast('Thêm kỹ thuật viên thành công!', 'success');
    }

    this.closeStaffModal();
    this.render();
    if (window.AppointmentsModule) window.AppointmentsModule.render();
  },

  closeStaffModal() {
    document.getElementById('staff-modal')?.classList.add('hidden');
    this.editingStaffId = null;
  },

  deleteStaff(id) {
    if (!window.AuthModule?.isAdmin()) {
      window.app?.showToast('⚠️ Chỉ tài khoản Chủ Spa (Admin) mới có quyền xóa Kỹ thuật viên!', 'error');
      return;
    }

    if (confirm('Bạn có chắc chắn muốn xóa Kỹ thuật viên này không?')) {
      window.spaStore.deleteStaff(id);
      window.app.showToast('Đã xóa kỹ thuật viên', 'info');
      this.render();
      if (window.AppointmentsModule) window.AppointmentsModule.render();
    }
  },

  // ==================== 4. QUẢN LÝ DANH MỤC GÓI & THẺ LIỆU TRÌNH ====================
  renderPackagesList() {
    const store = window.spaStore;
    const templates = store.getPackageTemplates();

    const sessionTemplates = templates.filter(t => t.type !== 'balance');
    const balanceTemplates = templates.filter(t => t.type === 'balance');

    let html = `
      <div class="space-y-8">
        <!-- 1. Gói Theo Số Lượt (Buổi) -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
              <span class="p-1.5 bg-rose-100 text-rose-600 rounded-lg text-sm">🎟️</span>
              Gói Liệu Trình Theo Số Lượt (${sessionTemplates.length} gói)
            </h3>
            <span class="text-xs text-slate-400">Trừ dần theo từng buổi khi khách đến làm dịch vụ</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${sessionTemplates.length === 0 ? `
              <div class="col-span-full p-6 text-center text-slate-400 bg-slate-50 rounded-2xl">Chưa có gói dịch vụ theo lượt nào</div>
            ` : sessionTemplates.map(pkg => `
              <div class="bg-white rounded-2xl border border-rose-100 shadow-2xs hover:shadow-md transition p-5 flex flex-col justify-between space-y-4 relative overflow-hidden group">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold border border-rose-100">
                      🎟️ ${pkg.sessions || 10} Buổi Trị Liệu
                    </span>
                    <span class="text-xs font-semibold text-slate-400">#${pkg.id}</span>
                  </div>
                  <h4 class="font-bold text-slate-800 text-sm group-hover:text-rose-600 transition leading-snug">${pkg.name}</h4>
                  <p class="text-xs text-slate-500 line-clamp-2">${pkg.description || 'Chưa có mô tả chi tiết'}</p>
                </div>

                <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span class="text-[10px] text-slate-400 uppercase font-semibold">Giá trọn gói</span>
                    <div class="text-base font-extrabold text-rose-600">${store.formatCurrency(pkg.price)}</div>
                  </div>

                  <div class="flex items-center gap-1.5">
                    <button 
                      onclick="PackagesModule.openEditTemplateModal('${pkg.id}')"
                      class="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition"
                      title="Chỉnh sửa gói này"
                    >
                      <i data-lucide="edit-2" class="w-4 h-4"></i>
                    </button>
                    ${window.AuthModule?.isAdmin() ? `
                      <button 
                        onclick="PackagesModule.deleteTemplate('${pkg.id}')"
                        class="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition"
                        title="Xóa gói này (Chỉ Admin)"
                      >
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    ` : ''}
                    <button 
                      onclick="PackagesModule.openSellModal(); setTimeout(() => { document.getElementById('pkg-input-template').value = '${pkg.id}'; PackagesModule.onTemplateSelect('${pkg.id}'); }, 50);"
                      class="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1"
                      title="Bán gói này cho khách"
                    >
                      Bán
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 2. Thẻ Trả Trước / Trừ Tiền Dần -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
              <span class="p-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm">💳</span>
              Thẻ Thành Viên / Tài Khoản Trừ Tiền Dần (${balanceTemplates.length} thẻ)
            </h3>
            <span class="text-xs text-slate-400">Nạp tiền vào tài khoản, trừ dần linh hoạt theo từng lần làm</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${balanceTemplates.length === 0 ? `
              <div class="col-span-full p-6 text-center text-slate-400 bg-slate-50 rounded-2xl">Chưa có thẻ trừ tiền dần nào</div>
            ` : balanceTemplates.map(pkg => `
              <div class="bg-white rounded-2xl border border-purple-100 shadow-2xs hover:shadow-md transition p-5 flex flex-col justify-between space-y-4 relative overflow-hidden group">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-200">
                      💳 Tài khoản: ${store.formatCurrency(pkg.initialBalance || pkg.price)}
                    </span>
                    <span class="text-xs font-semibold text-slate-400">#${pkg.id}</span>
                  </div>
                  <h4 class="font-bold text-slate-800 text-sm group-hover:text-purple-700 transition leading-snug">${pkg.name}</h4>
                  <p class="text-xs text-slate-500 line-clamp-2">${pkg.description || 'Chưa có mô tả chi tiết'}</p>
                </div>

                <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span class="text-[10px] text-slate-400 uppercase font-semibold">Giá nạp thu tiền</span>
                    <div class="text-base font-extrabold text-purple-700">${store.formatCurrency(pkg.price)}</div>
                  </div>

                  <div class="flex items-center gap-1.5">
                    <button 
                      onclick="PackagesModule.openEditTemplateModal('${pkg.id}')"
                      class="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition"
                      title="Chỉnh sửa thẻ này"
                    >
                      <i data-lucide="edit-2" class="w-4 h-4"></i>
                    </button>
                    ${window.AuthModule?.isAdmin() ? `
                      <button 
                        onclick="PackagesModule.deleteTemplate('${pkg.id}')"
                        class="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition"
                        title="Xóa thẻ này (Chỉ Admin)"
                      >
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>
                    ` : ''}
                    <button 
                      onclick="PackagesModule.openSellModal(); setTimeout(() => { document.getElementById('pkg-input-template').value = '${pkg.id}'; PackagesModule.onTemplateSelect('${pkg.id}'); }, 50);"
                      class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1"
                      title="Bán thẻ này cho khách"
                    >
                      Bán
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    return html;
  }
};

window.ServicesModule = ServicesModule;
