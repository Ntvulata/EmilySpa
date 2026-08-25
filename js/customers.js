/**
 * SPA EASE - Quản Lý Lịch Hẹn Spa
 * customers.js - Logic Quản lý Khách hàng CRM, Lịch sử trị liệu, Phân loại VIP
 */

const CustomersModule = {
  searchQuery: '',
  selectedType: 'all',
  editingCustomerId: null,

  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('customers-view-content');
    if (!container) return;

    // Nếu đã có cấu trúc khung và ô tìm kiếm, chỉ cần render lại danh sách thẻ
    const gridEl = document.getElementById('customers-list-grid');
    if (gridEl && document.getElementById('customers-search-input')) {
      this.renderCardsOnly();
      return;
    }

    let html = `
      <div class="space-y-6">
        <!-- Action & Filter Bar -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <!-- Tìm kiếm -->
            <div class="relative flex-1 sm:w-72">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-3"></i>
              <input 
                type="text" 
                id="customers-search-input"
                placeholder="Tìm tên, SĐT, ghi chú..." 
                value="${this.searchQuery}"
                oninput="CustomersModule.onSearch(this.value)"
                class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-sm"
              />
            </div>

            <!-- Lọc phân hạng -->
            <select 
              id="customers-type-select"
              onchange="CustomersModule.onTypeFilter(this.value)"
              class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-sm font-medium"
            >
              <option value="all" ${this.selectedType === 'all' ? 'selected' : ''}>Tất cả phân hạng</option>
              <option value="VIP Diamond" ${this.selectedType === 'VIP Diamond' ? 'selected' : ''}>💎 VIP Diamond</option>
              <option value="VIP Gold" ${this.selectedType === 'VIP Gold' ? 'selected' : ''}>👑 VIP Gold</option>
              <option value="Thân thiết" ${this.selectedType === 'Thân thiết' ? 'selected' : ''}>🌸 Thân thiết</option>
              <option value="Khách mới" ${this.selectedType === 'Khách mới' ? 'selected' : ''}>✨ Khách mới</option>
            </select>
          </div>

          <!-- Nút thêm khách hàng -->
          <button 
            onclick="CustomersModule.openAddModal()"
            class="w-full sm:w-auto px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-sm shadow-xs transition flex items-center justify-center gap-2"
          >
            <i data-lucide="user-plus" class="w-4 h-4"></i> Thêm Khách Hàng
          </button>
        </div>

        <!-- Danh sách thẻ khách hàng dạng Grid -->
        <div id="customers-list-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.renderCardsOnly();
  },

  renderCardsOnly() {
    const grid = document.getElementById('customers-list-grid');
    if (!grid) return;

    const store = window.spaStore;
    let customers = store.getCustomers();

    // Lọc theo loại
    if (this.selectedType !== 'all') {
      customers = customers.filter(c => c.type === this.selectedType);
    }

    // Tìm kiếm Tên / SĐT / Ghi chú / Loại da
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      customers = customers.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q)) ||
        (c.skinType && c.skinType.toLowerCase().includes(q))
      );
    }

    if (customers.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 bg-white rounded-2xl border border-rose-100 text-center text-slate-400">
          <i data-lucide="users" class="w-12 h-12 mx-auto mb-2 opacity-40"></i>
          <p class="text-base font-medium">Không tìm thấy khách hàng nào khớp với tìm kiếm</p>
        </div>
      `;
    } else {
      grid.innerHTML = customers.map(cust => {
        const badge = this.getCustomerTypeBadge(cust.type);
        return `
          <div class="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm hover:shadow-md transition group relative flex flex-col justify-between">
            <div>
              <!-- Top info -->
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-100 to-amber-100 text-rose-600 flex items-center justify-center font-bold text-lg shadow-xs">
                    ${cust.gender === 'Nam' ? '👨' : '👩'}
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-800 text-base group-hover:text-rose-600 transition">${cust.name}</h4>
                    <a href="tel:${cust.phone}" class="text-xs text-slate-500 hover:text-rose-500 flex items-center gap-1">
                      <i data-lucide="phone" class="w-3 h-3"></i> ${cust.phone}
                    </a>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${badge.class}">
                  ${badge.icon} ${cust.type || 'Khách mới'}
                </span>
              </div>

              <!-- Chi tiết chăm sóc & da -->
              <div class="mt-4 space-y-2 text-xs">
                ${cust.skinType ? `
                  <div class="text-slate-600">
                    <span class="text-slate-400 font-medium">Loại da:</span> ${cust.skinType}
                  </div>
                ` : ''}
                ${cust.notes ? `
                  <div class="text-slate-500 bg-rose-50/40 p-2 rounded-lg line-clamp-2">
                    <span class="font-semibold text-rose-700">Lưu ý:</span> ${cust.notes}
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Thống kê chi tiêu & Thao tác -->
            <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <div class="text-slate-400">Tổng chi tiêu (${cust.totalVisits || 0} buổi)</div>
                <div class="font-bold text-rose-600 text-sm">${store.formatCurrency(cust.totalSpent || 0)}</div>
              </div>

              <div class="flex items-center gap-1.5">
                <button 
                  onclick="CustomersModule.openHistoryModal('${cust.id}')"
                  title="Xem lịch sử & Hồ sơ" 
                  class="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg font-medium transition flex items-center gap-1"
                >
                  <i data-lucide="history" class="w-3.5 h-3.5"></i> Hồ sơ
                </button>
                <button 
                  onclick="CustomersModule.openEditModal('${cust.id}')"
                  title="Sửa thông tin" 
                  class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
                <button 
                  onclick="CustomersModule.deleteCustomer('${cust.id}')"
                  title="${(store.getAppointments().filter(a => a.customerId === cust.id).length === 0) ? 'Xóa khách hàng chưa phát sinh lịch hẹn' : 'Đã có lịch hẹn phát sinh'}" 
                  class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    if (window.lucide) lucide.createIcons();
  },

  getCustomerTypeBadge(type) {
    switch (type) {
      case 'VIP Diamond':
        return { class: 'bg-cyan-50 text-cyan-700 border border-cyan-200', icon: '💎' };
      case 'VIP Gold':
        return { class: 'bg-amber-50 text-amber-700 border border-amber-200', icon: '👑' };
      case 'Thân thiết':
        return { class: 'bg-rose-50 text-rose-700 border border-rose-200', icon: '🌸' };
      default:
        return { class: 'bg-slate-100 text-slate-600 border border-slate-200', icon: '✨' };
    }
  },

  onSearch(val) {
    this.searchQuery = val;
    this.renderCardsOnly();
  },

  onTypeFilter(val) {
    this.selectedType = val;
    this.renderCardsOnly();
  },

  openAddModal() {
    this.editingCustomerId = null;
    const title = document.getElementById('modal-customer-title');
    if (title) title.textContent = 'Thêm Khách Hàng Mới';

    const form = document.getElementById('customer-form');
    if (!form) return;

    form.innerHTML = `
      <div class="space-y-4">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Họ và Tên <span class="text-rose-500">*</span></label>
          <input type="text" id="cust-input-name" required placeholder="Ví dụ: Chị Nguyễn Lan Anh" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Số Điện Thoại <span class="text-rose-500">*</span></label>
            <input type="tel" id="cust-input-phone" required placeholder="09xx xxx xxx" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm" />
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Giới Tính</label>
            <select id="cust-input-gender" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm">
              <option value="Nữ">Nữ</option>
              <option value="Nam">Nam</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Ngày Sinh</label>
            <input type="date" id="cust-input-birthdate" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm" />
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Hạng Thành Viên</label>
            <select id="cust-input-type" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm font-medium">
              <option value="Khách mới">✨ Khách mới</option>
              <option value="Thân thiết">🌸 Khách thân thiết</option>
              <option value="VIP Gold">👑 VIP Gold</option>
              <option value="VIP Diamond">💎 VIP Diamond</option>
            </select>
          </div>
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tình Trạng Da / Thể Trạng</label>
          <input type="text" id="cust-input-skintype" placeholder="Ví dụ: Da mụn viêm, da khô nhạy cảm, hay đau mỏi cơ..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm" />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Ghi Chú Đặc Biệt & Sở Thích</label>
          <textarea id="cust-input-notes" rows="2" placeholder="Ví dụ: Thích tinh dầu oải hương, dị ứng paraben, lực massage mạnh..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm"></textarea>
        </div>
      </div>
    `;

    document.getElementById('customer-modal').classList.remove('hidden');
  },

  openEditModal(id) {
    this.openAddModal();
    this.editingCustomerId = id;

    const title = document.getElementById('modal-customer-title');
    if (title) title.textContent = 'Chỉnh Sửa Thông Tin Khách Hàng';

    const store = window.spaStore;
    const cust = store.getCustomers().find(c => c.id === id);
    if (!cust) return;

    document.getElementById('cust-input-name').value = cust.name || '';
    document.getElementById('cust-input-phone').value = cust.phone || '';
    document.getElementById('cust-input-gender').value = cust.gender || 'Nữ';
    document.getElementById('cust-input-birthdate').value = cust.birthdate || '';
    document.getElementById('cust-input-type').value = cust.type || 'Khách mới';
    document.getElementById('cust-input-skintype').value = cust.skinType || '';
    document.getElementById('cust-input-notes').value = cust.notes || '';

    // Kiểm tra xem khách đã có lịch hẹn phát sinh chưa
    const appointments = store.getAppointments().filter(a => a.customerId === id);
    const form = document.getElementById('customer-form');
    if (form) {
      const existingAlert = document.getElementById('cust-delete-hint');
      if (existingAlert) existingAlert.remove();

      const alertDiv = document.createElement('div');
      alertDiv.id = 'cust-delete-hint';
      alertDiv.className = 'pt-3 border-t border-slate-100 flex items-center justify-between text-xs';

      if (appointments.length === 0) {
        if (window.AuthModule?.isAdmin()) {
          alertDiv.innerHTML = `
            <span class="text-slate-400">Khách chưa phát sinh lịch hẹn nào</span>
            <button 
              type="button" 
              onclick="CustomersModule.deleteCustomer('${cust.id}'); CustomersModule.closeModal();" 
              class="text-red-500 hover:text-red-700 hover:underline font-semibold flex items-center gap-1"
            >
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Xóa khách hàng này (Chỉ Admin)
            </button>
          `;
        } else {
          alertDiv.innerHTML = `
            <span class="text-slate-400">Khách chưa phát sinh lịch hẹn nào (Chỉ Chủ Spa mới có quyền xóa)</span>
          `;
        }
      } else {
        alertDiv.innerHTML = `
          <span class="text-amber-600 font-medium">🔒 Đã có ${appointments.length} lịch hẹn phát sinh (Không thể xóa)</span>
        `;
      }
      form.appendChild(alertDiv);
      if (window.lucide) lucide.createIcons();
    }
  },

  saveCustomerForm(e) {
    e.preventDefault();
    const store = window.spaStore;

    const data = {
      name: document.getElementById('cust-input-name').value.trim(),
      phone: document.getElementById('cust-input-phone').value.trim(),
      gender: document.getElementById('cust-input-gender').value,
      birthdate: document.getElementById('cust-input-birthdate').value,
      type: document.getElementById('cust-input-type').value,
      skinType: document.getElementById('cust-input-skintype').value.trim(),
      notes: document.getElementById('cust-input-notes').value.trim()
    };

    if (!data.name || !data.phone) {
      window.app.showToast('Vui lòng nhập họ tên và số điện thoại', 'warning');
      return;
    }

    if (this.editingCustomerId) {
      store.updateCustomer(this.editingCustomerId, data);
      window.app.showToast('Đã cập nhật thông tin khách hàng!', 'success');
    } else {
      store.addCustomer(data);
      window.app.showToast('Thêm khách hàng thành công!', 'success');
    }

    this.closeModal();
    this.render();
  },

  closeModal() {
    document.getElementById('customer-modal')?.classList.add('hidden');
    this.editingCustomerId = null;
  },

  // HỒ SƠ & LỊCH SỬ TRỊ LIỆU CỦA KHÁCH HÀNG
  openHistoryModal(customerId) {
    const store = window.spaStore;
    const cust = store.getCustomers().find(c => c.id === customerId);
    if (!cust) return;

    const appointments = store.getAppointments().filter(a => a.customerId === customerId).sort((a, b) => b.date.localeCompare(a.date));

    const modal = document.getElementById('customer-history-modal');
    const content = document.getElementById('customer-history-content');
    if (!modal || !content) return;

    const badge = this.getCustomerTypeBadge(cust.type);

    content.innerHTML = `
      <div class="space-y-6">
        <!-- Thông tin tổng quan khách hàng -->
        <div class="bg-gradient-to-r from-rose-500 to-rose-600 text-white p-5 rounded-2xl shadow-md">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center space-x-3">
              <div class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
                ${cust.gender === 'Nam' ? '👨' : '👩'}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-xl font-bold">${cust.name}</h3>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                    ${badge.icon} ${cust.type}
                  </span>
                </div>
                <div class="text-rose-100 text-xs mt-1 flex items-center gap-3">
                  <span><i data-lucide="phone" class="w-3 h-3 inline"></i> ${cust.phone}</span>
                  ${cust.birthdate ? `<span><i data-lucide="cake" class="w-3 h-3 inline"></i> ${cust.birthdate}</span>` : ''}
                </div>
              </div>
            </div>

            <!-- Nút đặt lịch nhanh cho khách này -->
            <button 
              onclick="CustomersModule.bookForCustomer('${cust.id}')"
              class="px-4 py-2 bg-white text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <i data-lucide="calendar-plus" class="w-4 h-4"></i> Đặt Lịch Cho Khách Này
            </button>
          </div>

          <!-- Thống kê chỉ số -->
          <div class="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/20 text-center">
            <div>
              <div class="text-xs text-rose-100">Số buổi trị liệu</div>
              <div class="text-lg font-bold">${cust.totalVisits || appointments.length} buổi</div>
            </div>
            <div>
              <div class="text-xs text-rose-100">Tổng chi tiêu</div>
              <div class="text-lg font-bold">${store.formatCurrency(cust.totalSpent || 0)}</div>
            </div>
            <div>
              <div class="text-xs text-rose-100">Ngày tham gia</div>
              <div class="text-lg font-bold">${cust.createdAt || 'Mới đây'}</div>
            </div>
          </div>
        </div>

        <!-- Ghi chú đặc biệt -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="font-bold text-slate-700 block mb-1">🌿 Loại da & Thể trạng:</span>
            <p class="text-slate-600">${cust.skinType || 'Chưa có ghi chú'}</p>
          </div>
          <div class="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
            <span class="font-bold text-amber-800 block mb-1">📝 Sở thích & Yêu cầu riêng:</span>
            <p class="text-amber-700">${cust.notes || 'Chưa có ghi chú'}</p>
          </div>
        </div>

        <!-- Gói dịch vụ & Thẻ dài hạn đã mua -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i data-lucide="sparkles" class="w-4 h-4 text-purple-600"></i> Gói & Thẻ Liệu Trình Đang Có (${store.getPackageOrders ? store.getPackageOrders().filter(o => o.customerId === cust.id).length : 0})
            </h4>
            <button 
              onclick="CustomersModule.closeHistoryModal(); PackagesModule.openSellModal('${cust.id}');"
              class="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold transition flex items-center gap-1"
            >
              <i data-lucide="plus" class="w-3.5 h-3.5"></i> + Bán Gói Cho Khách
            </button>
          </div>

          ${(() => {
            const customerPackages = store.getPackageOrders ? store.getPackageOrders().filter(o => o.customerId === cust.id) : [];
            if (customerPackages.length === 0) {
              return `
                <div class="p-3.5 bg-purple-50/40 rounded-xl border border-purple-100 text-center text-xs text-purple-700 flex items-center justify-between">
                  <span>Khách chưa mua gói hoặc thẻ dài hạn nào</span>
                  <button 
                    onclick="CustomersModule.closeHistoryModal(); PackagesModule.openSellModal('${cust.id}');"
                    class="underline font-bold hover:text-purple-900"
                  >
                    + Bán gói / thẻ ngay
                  </button>
                </div>
              `;
            }
            return `
              <div class="space-y-3">
                ${customerPackages.map(pkg => {
                  const isBalance = pkg.packageType === 'balance';
                  const remainingBal = pkg.remainingBalance !== undefined ? pkg.remainingBalance : (pkg.initialBalance || pkg.price);
                  const remainingSess = pkg.remainingSessions !== undefined ? pkg.remainingSessions : pkg.totalSessions;
                  const isActive = isBalance ? remainingBal > 0 : remainingSess > 0;
                  const history = pkg.usageHistory || [];

                  return `
                    <div class="p-3.5 ${isBalance ? 'bg-purple-50/70 border-purple-200' : 'bg-rose-50/70 border-rose-200'} rounded-2xl border flex flex-col gap-3 text-xs">
                      <div class="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div class="flex items-center gap-2">
                            <span class="font-bold ${isBalance ? 'text-purple-900' : 'text-rose-900'} text-sm">${pkg.packageName}</span>
                            <span class="px-2 py-0.5 rounded-md font-bold text-[10px] ${isBalance ? 'bg-purple-200 text-purple-800' : 'bg-rose-200 text-rose-800'}">
                              ${isBalance ? '💳 Thẻ Trừ Tiền Dần' : '🎟️ Gói Số Lượt'}
                            </span>
                          </div>
                          <div class="text-[11px] text-slate-500 mt-1">
                            Ngày mua: <strong>${pkg.date}</strong> • Giá thu: <strong class="text-rose-600">${store.formatCurrency(pkg.price)}</strong>
                            ${pkg.staffName ? ` • Tư vấn: <strong>${pkg.staffName}</strong>` : ''}
                          </div>
                        </div>

                        <!-- Trạng thái & Nút thao tác -->
                        <div class="flex items-center gap-2 shrink-0">
                          ${isBalance ? `
                            <div class="text-right">
                              <span class="text-[10px] text-slate-400 block font-semibold">Số dư tài khoản</span>
                              <span class="text-sm font-extrabold text-purple-700">${store.formatCurrency(remainingBal)}</span>
                            </div>
                            ${isActive ? `
                              <button 
                                onclick="PackagesModule.openDeductBalanceModal('${pkg.id}', '${cust.id}')"
                                class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-2xs transition flex items-center gap-1"
                                title="Trừ tiền thẻ khi khách làm dịch vụ"
                              >
                                <i data-lucide="minus-circle" class="w-3.5 h-3.5"></i> Trừ Tiền
                              </button>
                            ` : `<span class="text-[10px] text-slate-400 font-semibold px-2 py-1 bg-slate-100 rounded-lg">Đã hết số dư</span>`}
                          ` : `
                            <div class="text-right">
                              <span class="text-[10px] text-slate-400 block font-semibold">Số lượt còn lại</span>
                              <span class="text-sm font-extrabold text-rose-600">${remainingSess}/${pkg.totalSessions} buổi</span>
                            </div>
                            ${isActive ? `
                              <button 
                                onclick="CustomersModule.usePackageSession('${pkg.id}', '${cust.id}')"
                                class="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-2xs transition flex items-center gap-1"
                                title="Trừ 1 buổi khi khách làm dịch vụ"
                              >
                                <i data-lucide="minus-circle" class="w-3.5 h-3.5"></i> Trừ 1 Buổi
                              </button>
                            ` : `<span class="text-[10px] text-slate-400 font-semibold px-2 py-1 bg-slate-100 rounded-lg">Đã làm hết buổi</span>`}
                          `}
                          
                          <!-- Nút Xóa / Hủy Gói (Chỉ Admin) -->
                          ${window.AuthModule?.isAdmin() ? `
                            <button 
                              onclick="CustomersModule.deleteCustomerPackage('${pkg.id}', '${cust.id}', '${pkg.packageName.replace(/'/g, "\\'")}', ${pkg.price})"
                              class="p-1.5 hover:bg-rose-100 text-rose-400 hover:text-rose-600 rounded-lg transition"
                              title="Xóa/Hủy gói này và hoàn/trừ doanh thu (Chỉ Admin)"
                            >
                              <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                          ` : ''}
                        </div>
                      </div>

                      <!-- Lịch sử các lần trừ tiền / trừ lượt của thẻ này -->
                      ${history.length > 0 ? `
                        <div class="pt-2 border-t border-slate-200/60 space-y-1">
                          <div class="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                            <i data-lucide="history" class="w-3 h-3 text-slate-400"></i> Lịch sử sử dụng (${history.length} lần):
                          </div>
                          <div class="max-h-24 overflow-y-auto space-y-1 pr-1">
                            ${history.map(h => `
                              <div class="bg-white/80 px-2.5 py-1.5 rounded-lg border border-slate-200/50 flex items-center justify-between text-[11px]">
                                <div>
                                  <span class="font-semibold text-slate-700">${h.date}:</span>
                                  <span class="text-slate-600">${h.notes || 'Sử dụng dịch vụ'}</span>
                                </div>
                                <div class="font-bold ${isBalance ? 'text-purple-700' : 'text-rose-600'}">
                                  ${isBalance ? `-${store.formatCurrency(h.amountDeducted)} (Còn ${store.formatCurrency(h.remainingBalance)})` : `-1 buổi (Còn ${h.remainingSessions})`}
                                </div>
                              </div>
                            `).join('')}
                          </div>
                        </div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          })()}
        </div>

        <!-- Lịch sử các buổi hẹn & trị liệu -->
        <div>
          <h4 class="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
            <i data-lucide="clock" class="w-4 h-4 text-rose-500"></i> Lịch Sử Các Buổi Hẹn Theo Lịch (${appointments.length})
          </h4>

          <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
            ${appointments.length === 0 ? `
              <div class="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                Khách hàng chưa có lịch hẹn nào
              </div>
            ` : appointments.map(apt => `
              <div class="p-3.5 rounded-xl border border-slate-200 hover:border-rose-300 bg-white shadow-2xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-800 text-sm">${apt.serviceName}</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${AppointmentsModule.getStatusBadgeClass(apt.status)}">
                      ${store.getStatusLabel(apt.status)}
                    </span>
                  </div>
                  <div class="text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                    <span>📅 ${apt.date} (${apt.time} - ${apt.endTime || ''})</span>
                    <span>👩‍💼 KTV: ${apt.staffName}</span>
                    <span>🛋️ ${apt.room || ''}</span>
                  </div>
                  ${apt.notes ? `<div class="text-slate-400 mt-1 italic">"${apt.notes}"</div>` : ''}
                </div>
                <div class="text-right shrink-0">
                  <div class="font-bold text-rose-600 text-sm">${store.formatCurrency(apt.price)}</div>
                  <div class="text-[11px] text-slate-400">${apt.duration} phút</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  },

  deleteCustomerPackage(orderId, customerId, packageName, price) {
    if (!window.AuthModule?.isAdmin()) {
      window.app?.showToast('⚠️ Chỉ tài khoản Chủ Spa (Admin) mới có quyền xóa gói liệu trình này!', 'error');
      return;
    }

    const store = window.spaStore;
    const formattedPrice = store.formatCurrency(price);
    if (confirm(`Bạn có chắc chắn muốn XÓA / HỦY gói "${packageName}" của khách hàng này không?\n\nDoanh thu ${formattedPrice} đã thu sẽ được trừ khỏi hệ thống và tổng chi tiêu của khách.`)) {
      store.deletePackageOrder(orderId);
      window.app?.showToast(`Đã xóa gói và trừ ${formattedPrice} khỏi doanh thu!`, 'success');
      this.openHistoryModal(customerId);
      this.render();
      if (window.ReportsModule) window.ReportsModule.render();
      if (window.DashboardModule) window.DashboardModule.render();
    }
  },

  usePackageSession(pkgId, custId) {
    if (confirm('Xác nhận khách hàng đã sử dụng 1 buổi trong gói liệu trình này?')) {
      const res = window.spaStore.usePackageSession(pkgId);
      if (res.success) {
        window.app.showToast(`Đã trừ 1 buổi thành công! Còn lại ${res.remaining} buổi.`, 'success');
        this.openHistoryModal(custId);
        if (window.ReportsModule) window.ReportsModule.render();
      } else {
        window.app.showToast(res.message, 'warning');
      }
    }
  },

  closeHistoryModal() {
    document.getElementById('customer-history-modal')?.classList.add('hidden');
  },

  bookForCustomer(customerId) {
    this.closeHistoryModal();
    window.app.switchTab('appointments');
    setTimeout(() => {
      window.AppointmentsModule.openAddModal({ customerId });
      const select = document.getElementById('apt-input-customer');
      if (select) select.value = customerId;
    }, 100);
  },

  deleteCustomer(id) {
    if (!window.AuthModule?.isAdmin()) {
      window.app?.showToast('⚠️ Chỉ tài khoản Chủ Spa (Admin) mới có quyền xóa khách hàng!', 'error');
      return;
    }

    const store = window.spaStore;
    const cust = store.getCustomers().find(c => c.id === id);
    if (!cust) return;

    const appointments = store.getAppointments().filter(a => a.customerId === id);
    if (appointments.length > 0) {
      alert(`⚠️ Không thể xóa khách hàng "${cust.name}"!\n\nKhách này đã phát sinh ${appointments.length} lịch hẹn / trị liệu trong hệ thống. Việc giữ lại dữ liệu giúp bảo toàn lịch sử trị liệu và báo cáo doanh thu của Spa.`);
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa khách hàng "${cust.name}" (${cust.phone}) chưa phát sinh lịch hẹn này không?`)) {
      store.deleteCustomer(id);
      window.app.showToast(`Đã xóa khách hàng "${cust.name}" thành công!`, 'info');
      this.render();
    }
  }
};

window.CustomersModule = CustomersModule;
