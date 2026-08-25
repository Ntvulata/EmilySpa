/**
 * SPA EASE - Quản Lý Lịch Hẹn Spa
 * packages.js - Quản lý Bán Gói (Số Lượt & Trừ Tiền Dần) & Danh Mục Gói Liệu Trình Mẫu
 */

const PackagesModule = {
  currentPkgType: 'sessions', // 'sessions' | 'balance'
  editingTemplateId: null,
  activeDeductOrderId: null,
  activeDeductCustomerId: null,

  // ==================== 1. MODAL BÁN GÓI / THẺ CHO KHÁCH HÀNG ====================
  openSellModal(prefillCustomerId = null) {
    const store = window.spaStore;
    const customers = store.getCustomers();
    const staff = store.getStaff();
    const templates = store.getPackageTemplates();

    const form = document.getElementById('package-form');
    if (!form) return;

    const todayStr = new Date().toISOString().split('T')[0];
    this.currentPkgType = 'sessions';

    form.innerHTML = `
      <div class="space-y-4 text-sm">
        <!-- Khách hàng -->
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Khách Hàng Mua Gói <span class="text-rose-500">*</span></label>
            <span class="text-[11px] text-purple-600 font-semibold">🔍 Tìm nhanh khách hàng</span>
          </div>
          <div class="space-y-1.5">
            <div class="relative">
              <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5"></i>
              <input 
                type="text" 
                id="pkg-modal-cust-filter"
                placeholder="Gõ tên hoặc SĐT khách..." 
                oninput="PackagesModule.filterModalCustomerList(this.value)"
                class="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-xs"
              />
            </div>
            <select 
              name="customerId" 
              id="pkg-input-customer" 
              required 
              onchange="PackagesModule.onCustomerSelectChange(this.value)"
              class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 text-sm font-medium"
            >
              <option value="">-- Chọn khách hàng sẵn có (${customers.length}) --</option>
              ${customers.map(c => `<option value="${c.id}" ${prefillCustomerId === c.id ? 'selected' : ''}>${c.name} - ${c.phone} (${c.type})</option>`).join('')}
              <option value="NEW_CUSTOMER">+ Thêm nhanh khách hàng mới...</option>
            </select>
          </div>
        </div>

        <!-- Thêm nhanh khách nếu chọn New -->
        <div id="pkg-new-cust-fields" class="hidden p-3 bg-rose-50/60 rounded-xl border border-rose-200 space-y-2 text-xs">
          <div class="font-bold text-rose-700 flex items-center gap-1">
            <i data-lucide="user-plus" class="w-3.5 h-3.5"></i> Nhập thông tin khách mới
          </div>
          <div class="grid grid-cols-2 gap-2">
            <input type="text" id="pkg-quick-name" placeholder="Họ và tên khách" class="px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs" />
            <input type="tel" id="pkg-quick-phone" placeholder="Số điện thoại" class="px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs" />
          </div>
        </div>

        <!-- Chọn Gói Mẫu Có Sẵn -->
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Chọn Gói Dịch Vụ Mẫu Có Sẵn</label>
            <span class="text-[11px] text-purple-600 font-semibold">🔍 Lọc gói mẫu</span>
          </div>
          <div class="space-y-1.5">
            <div class="relative">
              <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5"></i>
              <input 
                type="text" 
                id="pkg-modal-tpl-filter"
                placeholder="Gõ tên gói hoặc loại thẻ..." 
                oninput="PackagesModule.filterModalTemplateList(this.value)"
                class="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-xs"
              />
            </div>
            <select 
              id="pkg-input-template"
              onchange="PackagesModule.onTemplateSelect(this.value)"
              class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:bg-white text-xs font-medium text-purple-700"
            >
              <option value="">-- Chọn gói mẫu từ danh mục (${templates.length}) hoặc tự nhập bên dưới --</option>
              ${templates.map(t => `<option value="${t.id}">${t.type === 'balance' ? '💳 [Thẻ tiền]' : '🎟️ [Số lượt]'} ${t.name} - ${store.formatCurrency(t.price)}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Chọn Loại Gói: Số Lượt hoặc Trừ Tiền Dần -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Hình Thức Quản Lý Gói <span class="text-rose-500">*</span></label>
          <div class="grid grid-cols-2 gap-3">
            <label class="p-3 rounded-xl border-2 cursor-pointer transition flex items-center gap-2 text-xs font-bold ${this.currentPkgType === 'sessions' ? 'border-rose-500 bg-rose-50/50 text-rose-700' : 'border-slate-200 text-slate-600'}">
              <input type="radio" name="pkgTypeRadio" value="sessions" checked onchange="PackagesModule.onTypeRadioChange('sessions')" class="accent-rose-500" />
              <span>🎟️ Theo Số Lượt (Buổi)</span>
            </label>
            <label class="p-3 rounded-xl border-2 cursor-pointer transition flex items-center gap-2 text-xs font-bold ${this.currentPkgType === 'balance' ? 'border-purple-500 bg-purple-50/50 text-purple-700' : 'border-slate-200 text-slate-600'}">
              <input type="radio" name="pkgTypeRadio" value="balance" onchange="PackagesModule.onTypeRadioChange('balance')" class="accent-purple-500" />
              <span>💳 Trừ Số Tiền Dần</span>
            </label>
          </div>
        </div>

        <!-- Tên Gói -->
        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tên Gói / Thẻ Dài Hạn <span class="text-rose-500">*</span></label>
          <input 
            type="text" 
            id="pkg-input-name" 
            required 
            placeholder="Ví dụ: Gói 10 buổi Trị Mụn, Thẻ VIP Diamond 10 Triệu..." 
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm font-semibold text-rose-600"
          />
        </div>

        <!-- Dynamic Field: Số buổi HOẶC Số tiền trong thẻ -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div id="pkg-sessions-field-wrapper" class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tổng Số Lượt / Buổi <span class="text-rose-500">*</span></label>
            <input 
              type="number" 
              id="pkg-input-sessions" 
              min="1" 
              value="10" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm font-bold text-center"
            />
          </div>

          <div id="pkg-balance-field-wrapper" class="hidden space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Mệnh Giá Tài Khoản (VNĐ) <span class="text-purple-600">*</span></label>
            <input 
              type="number" 
              id="pkg-input-balance" 
              step="50000" 
              value="10000000" 
              placeholder="10000000" 
              class="w-full px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl focus:bg-white text-sm font-bold text-purple-700"
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Giá Tiền Thu Khách (VNĐ) <span class="text-rose-500">*</span></label>
            <input 
              type="number" 
              id="pkg-input-price" 
              required 
              step="50000" 
              placeholder="0" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm font-extrabold text-emerald-600"
            />
          </div>
        </div>

        <!-- Ngày Thu Tiền & Hình thức thanh toán -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Ngày Thu Tiền</label>
            <input 
              type="date" 
              id="pkg-input-date" 
              value="${todayStr}" 
              required 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Hình Thức Thanh Toán</label>
            <select id="pkg-input-payment" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-medium">
              <option value="Chuyển khoản">💳 Chuyển khoản ngân hàng</option>
              <option value="Tiền mặt">💵 Tiền mặt</option>
              <option value="Quẹt thẻ POS">💳 Quẹt thẻ POS</option>
            </select>
          </div>
        </div>

        <!-- Nhân viên tư vấn & Ghi chú -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Nhân Viên / KTV Tư Vấn</label>
            <select id="pkg-input-staff" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-medium">
              <option value="">-- Chọn nhân viên (tính doanh số) --</option>
              ${staff.map(s => `<option value="${s.id}">${s.name} (${s.role})</option>`).join('')}
            </select>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Ghi Chú / Quà Tặng Kèm</label>
            <input 
              type="text" 
              id="pkg-input-notes" 
              placeholder="Ví dụ: Tặng kèm 1 hũ kem chống nắng..." 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
            />
          </div>
        </div>

        <!-- Chú thích thông minh -->
        <div class="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <i data-lucide="info" class="w-4 h-4 text-amber-600 shrink-0 mt-0.5"></i>
          <div>
            <strong>Ghi nhận doanh thu ngay lập tức:</strong> Đơn mua gói này sẽ được tính thẳng vào <strong>Doanh thu hôm nay</strong> và nâng hạng thành viên VIP cho khách nhưng <strong>không chiếm chỗ lịch hẹn trên sơ đồ</strong>.
          </div>
        </div>
      </div>
    `;

    document.getElementById('package-sell-modal').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  },

  onTypeRadioChange(type) {
    this.currentPkgType = type;
    const sessWrapper = document.getElementById('pkg-sessions-field-wrapper');
    const balWrapper = document.getElementById('pkg-balance-field-wrapper');

    if (type === 'sessions') {
      sessWrapper?.classList.remove('hidden');
      balWrapper?.classList.add('hidden');
    } else {
      sessWrapper?.classList.add('hidden');
      balWrapper?.classList.remove('hidden');
    }
  },

  filterModalCustomerList(q) {
    const select = document.getElementById('pkg-input-customer');
    if (!select) return;
    const store = window.spaStore;
    const customers = store.getCustomers();
    const query = (q || '').toLowerCase().trim();

    let filtered = customers;
    if (query) {
      filtered = customers.filter(c => 
        (c.name && c.name.toLowerCase().includes(query)) ||
        (c.phone && c.phone.includes(query)) ||
        (c.type && c.type.toLowerCase().includes(query))
      );
    }

    select.innerHTML = `
      <option value="">-- Chọn khách hàng (${filtered.length} kết quả) --</option>
      ${filtered.map(c => `<option value="${c.id}">${c.name} - ${c.phone} (${c.type})</option>`).join('')}
      <option value="NEW_CUSTOMER">+ Thêm nhanh khách hàng mới...</option>
    `;
    if (filtered.length === 1) {
      select.value = filtered[0].id;
      this.onCustomerSelectChange(filtered[0].id);
    }
  },

  filterModalTemplateList(q) {
    const select = document.getElementById('pkg-input-template');
    if (!select) return;
    const store = window.spaStore;
    const templates = store.getPackageTemplates();
    const query = (q || '').toLowerCase().trim();

    let filtered = templates;
    if (query) {
      filtered = templates.filter(t => 
        (t.name && t.name.toLowerCase().includes(query)) ||
        (t.description && t.description.toLowerCase().includes(query))
      );
    }

    select.innerHTML = `
      <option value="">-- Chọn gói mẫu (${filtered.length} kết quả) hoặc tự nhập bên dưới --</option>
      ${filtered.map(t => `<option value="${t.id}">${t.type === 'balance' ? '💳 [Thẻ tiền]' : '🎟️ [Số lượt]'} ${t.name} - ${store.formatCurrency(t.price)}</option>`).join('')}
    `;
    if (filtered.length === 1) {
      select.value = filtered[0].id;
      this.onTemplateSelect(filtered[0].id);
    }
  },

  onCustomerSelectChange(val) {
    const fields = document.getElementById('pkg-new-cust-fields');
    if (val === 'NEW_CUSTOMER') {
      fields?.classList.remove('hidden');
    } else {
      fields?.classList.add('hidden');
    }
  },

  onTemplateSelect(templateId) {
    if (!templateId) return;
    const store = window.spaStore;
    const t = store.getPackageTemplates().find(item => item.id === templateId);
    if (t) {
      document.getElementById('pkg-input-name').value = t.name;
      document.getElementById('pkg-input-price').value = t.price;
      
      const type = t.type || 'sessions';
      this.currentPkgType = type;
      const radios = document.getElementsByName('pkgTypeRadio');
      radios.forEach(r => { r.checked = (r.value === type); });
      this.onTypeRadioChange(type);

      if (type === 'sessions') {
        document.getElementById('pkg-input-sessions').value = t.sessions || 10;
      } else {
        document.getElementById('pkg-input-balance').value = t.initialBalance || t.price;
      }
    }
  },

  closeModal() {
    document.getElementById('package-sell-modal')?.classList.add('hidden');
  },

  savePackageOrderForm(e) {
    e.preventDefault();
    const store = window.spaStore;

    const custVal = document.getElementById('pkg-input-customer').value;
    let customerId = custVal;
    let customerName = '';
    let customerPhone = '';

    if (custVal === 'NEW_CUSTOMER') {
      const quickName = document.getElementById('pkg-quick-name').value.trim();
      const quickPhone = document.getElementById('pkg-quick-phone').value.trim();
      if (!quickName || !quickPhone) {
        window.app.showToast('Vui lòng nhập tên và SĐT của khách hàng mới', 'warning');
        return;
      }
      const newCust = store.addCustomer({
        name: quickName,
        phone: quickPhone,
        gender: 'Nữ',
        type: 'Khách mới',
        notes: 'Tạo nhanh từ đơn mua gói liệu trình'
      });
      customerId = newCust.id;
      customerName = newCust.name;
      customerPhone = newCust.phone;
    } else {
      const cust = store.getCustomers().find(c => c.id === customerId);
      if (cust) {
        customerName = cust.name;
        customerPhone = cust.phone;
      }
    }

    if (!customerId) {
      window.app.showToast('Vui lòng chọn khách hàng mua gói', 'warning');
      return;
    }

    const packageName = document.getElementById('pkg-input-name').value.trim();
    const price = parseInt(document.getElementById('pkg-input-price').value, 10) || 0;
    const date = document.getElementById('pkg-input-date').value;
    const staffId = document.getElementById('pkg-input-staff').value;
    const staffMember = store.getStaff().find(s => s.id === staffId);
    const staffName = staffMember ? staffMember.name : '';
    const paymentMethod = document.getElementById('pkg-input-payment').value;
    const notes = document.getElementById('pkg-input-notes').value.trim();

    if (!packageName || price <= 0) {
      window.app.showToast('Vui lòng nhập tên gói và giá tiền hợp lệ', 'warning');
      return;
    }

    let orderData = {
      customerId,
      customerName,
      customerPhone,
      packageName,
      packageType: this.currentPkgType,
      price,
      date,
      staffId,
      staffName,
      paymentMethod,
      notes,
      usageHistory: []
    };

    if (this.currentPkgType === 'sessions') {
      const totalSessions = parseInt(document.getElementById('pkg-input-sessions').value, 10) || 1;
      orderData.totalSessions = totalSessions;
      orderData.remainingSessions = totalSessions;
      orderData.usedSessions = 0;
    } else {
      const initialBalance = parseInt(document.getElementById('pkg-input-balance').value, 10) || price;
      orderData.initialBalance = initialBalance;
      orderData.remainingBalance = initialBalance;
      orderData.usedBalance = 0;
    }

    store.addPackageOrder(orderData);

    this.closeModal();
    window.app.showToast(`Bán gói thành công! Đã cộng ${store.formatCurrency(price)} vào doanh thu.`, 'success');

    if (window.DashboardModule) window.DashboardModule.render();
    if (window.ReportsModule) window.ReportsModule.render();
    if (window.CustomersModule) window.CustomersModule.render();
  },

  // ==================== 2. MODAL TRỪ TIỀN THẺ TRẢ TRƯỚC ====================
  openDeductBalanceModal(orderId, customerId) {
    this.activeDeductOrderId = orderId;
    this.activeDeductCustomerId = customerId;

    const store = window.spaStore;
    const order = store.getPackageOrders().find(o => o.id === orderId);
    if (!order) return;

    const currentBalance = order.remainingBalance !== undefined ? order.remainingBalance : order.price;

    const form = document.getElementById('deduct-balance-form');
    if (!form) return;

    form.innerHTML = `
      <div class="space-y-4 text-sm">
        <div class="p-3.5 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
          <div>
            <div class="font-bold text-purple-900 text-sm">${order.packageName}</div>
            <div class="text-xs text-purple-600 mt-0.5">Khách hàng: <strong>${order.customerName}</strong></div>
          </div>
          <div class="text-right">
            <div class="text-[11px] text-slate-500 font-medium">Số dư hiện tại</div>
            <div class="text-lg font-extrabold text-purple-700">${store.formatCurrency(currentBalance)}</div>
          </div>
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Số Tiền Cần Trừ (VNĐ) <span class="text-rose-500">*</span></label>
          <input 
            type="number" 
            id="deduct-input-amount" 
            required 
            min="1000" 
            max="${currentBalance}" 
            placeholder="Ví dụ: 450000" 
            class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-base font-extrabold text-rose-600 focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tên Dịch Vụ Khách Đã Sử Dụng / Lý Do Trừ</label>
          <input 
            type="text" 
            id="deduct-input-service" 
            placeholder="Ví dụ: Chăm sóc da Glow Skin + Đắp mặt nạ..." 
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
          />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Ghi Chú Thêm</label>
          <input 
            type="text" 
            id="deduct-input-note" 
            placeholder="Ghi chú nhân viên thực hiện..." 
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"
          />
        </div>
      </div>
    `;

    document.getElementById('deduct-balance-modal').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  },

  closeDeductBalanceModal() {
    document.getElementById('deduct-balance-modal')?.classList.add('hidden');
    this.activeDeductOrderId = null;
    this.activeDeductCustomerId = null;
  },

  saveDeductBalance(e) {
    e.preventDefault();
    if (!this.activeDeductOrderId) return;

    const store = window.spaStore;
    const amount = parseInt(document.getElementById('deduct-input-amount').value, 10) || 0;
    const service = document.getElementById('deduct-input-service').value.trim();
    const note = document.getElementById('deduct-input-note').value.trim();

    if (amount <= 0) {
      window.app.showToast('Vui lòng nhập số tiền trừ hợp lệ', 'warning');
      return;
    }

    const fullNote = service ? `${service}${note ? ' - ' + note : ''}` : note;
    const res = store.deductPackageBalance(this.activeDeductOrderId, amount, fullNote);

    if (res.success) {
      window.app.showToast(`Đã trừ ${store.formatCurrency(amount)} thành công! Số dư còn: ${store.formatCurrency(res.remainingBalance)}`, 'success');
      this.closeDeductBalanceModal();
      if (this.activeDeductCustomerId && window.CustomersModule) {
        window.CustomersModule.openHistoryModal(this.activeDeductCustomerId);
      }
      if (window.ReportsModule) window.ReportsModule.render();
    } else {
      window.app.showToast(res.message, 'error');
    }
  },

  // ==================== 3. MODAL THÊM / SỬA GÓI MẪU (TEMPLATE CRUD) ====================
  openAddTemplateModal() {
    this.editingTemplateId = null;
    const form = document.getElementById('package-template-form');
    if (!form) return;

    document.getElementById('modal-pkg-template-title').textContent = 'Thêm Gói / Thẻ Dịch Vụ Mới';

    form.innerHTML = `
      <div class="space-y-4 text-sm">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tên Gói / Thẻ Liệu Trình <span class="text-rose-500">*</span></label>
          <input type="text" id="tpl-input-name" required placeholder="Ví dụ: Gói 10 Buổi Triệt Lông, Thẻ VIP 10 Triệu..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm font-semibold" />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Hình Thức Quản Lý <span class="text-rose-500">*</span></label>
          <select id="tpl-input-type" onchange="PackagesModule.onTemplateTypeChange(this.value)" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm font-semibold">
            <option value="sessions">🎟️ Gói Theo Số Lượt (Buổi trị liệu)</option>
            <option value="balance">💳 Thẻ Tài Khoản (Trừ số tiền dần)</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div id="tpl-sessions-wrapper" class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Số Lượt / Buổi</label>
            <input type="number" id="tpl-input-sessions" min="1" value="10" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm font-bold text-center" />
          </div>

          <div id="tpl-balance-wrapper" class="hidden space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Mệnh Giá Tài Khoản (VNĐ)</label>
            <input type="number" id="tpl-input-balance" step="50000" value="10000000" class="w-full px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl focus:bg-white text-sm font-bold text-purple-700" />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Giá Bán Thu Tiền (VNĐ) <span class="text-rose-500">*</span></label>
            <input type="number" id="tpl-input-price" required step="50000" placeholder="0" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm font-extrabold text-rose-600" />
          </div>
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Mô Tả Gói / Ưu Đãi Kèm Theo</label>
          <textarea id="tpl-input-desc" rows="3" placeholder="Mô tả chi tiết quyền lợi gói dịch vụ..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm"></textarea>
        </div>
      </div>
    `;

    document.getElementById('package-template-modal').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  },

  onTemplateTypeChange(val) {
    const sessWrap = document.getElementById('tpl-sessions-wrapper');
    const balWrap = document.getElementById('tpl-balance-wrapper');
    if (val === 'sessions') {
      sessWrap?.classList.remove('hidden');
      balWrap?.classList.add('hidden');
    } else {
      sessWrap?.classList.add('hidden');
      balWrap?.classList.remove('hidden');
    }
  },

  openEditTemplateModal(id) {
    this.openAddTemplateModal();
    this.editingTemplateId = id;

    const store = window.spaStore;
    const t = store.getPackageTemplates().find(item => item.id === id);
    if (!t) return;

    document.getElementById('modal-pkg-template-title').textContent = 'Chỉnh Sửa Gói / Thẻ Dịch Vụ';
    document.getElementById('tpl-input-name').value = t.name || '';
    document.getElementById('tpl-input-type').value = t.type || 'sessions';
    this.onTemplateTypeChange(t.type || 'sessions');

    if (t.type === 'balance') {
      document.getElementById('tpl-input-balance').value = t.initialBalance || t.price;
    } else {
      document.getElementById('tpl-input-sessions').value = t.sessions || 10;
    }

    document.getElementById('tpl-input-price').value = t.price || 0;
    document.getElementById('tpl-input-desc').value = t.description || '';
  },

  closeTemplateModal() {
    document.getElementById('package-template-modal')?.classList.add('hidden');
    this.editingTemplateId = null;
  },

  saveTemplateForm(e) {
    e.preventDefault();
    const store = window.spaStore;

    const name = document.getElementById('tpl-input-name').value.trim();
    const type = document.getElementById('tpl-input-type').value;
    const price = parseInt(document.getElementById('tpl-input-price').value, 10) || 0;
    const description = document.getElementById('tpl-input-desc').value.trim();

    if (!name || price <= 0) {
      window.app.showToast('Vui lòng nhập tên gói và giá tiền hợp lệ', 'warning');
      return;
    }

    const data = {
      name,
      type,
      price,
      description
    };

    if (type === 'sessions') {
      data.sessions = parseInt(document.getElementById('tpl-input-sessions').value, 10) || 1;
    } else {
      data.initialBalance = parseInt(document.getElementById('tpl-input-balance').value, 10) || price;
    }

    if (this.editingTemplateId) {
      store.updatePackageTemplate(this.editingTemplateId, data);
      window.app.showToast('Đã cập nhật gói dịch vụ thành công!', 'success');
    } else {
      store.addPackageTemplate(data);
      window.app.showToast('Đã thêm gói dịch vụ mới!', 'success');
    }

    this.closeTemplateModal();
    if (window.ServicesModule) window.ServicesModule.render();
  },

  deleteTemplate(id) {
    if (!window.AuthModule?.isAdmin()) {
      window.app?.showToast('⚠️ Chỉ tài khoản Chủ Spa (Admin) mới có quyền xóa gói dịch vụ mẫu!', 'error');
      return;
    }

    if (confirm('Bạn có chắc chắn muốn xóa gói dịch vụ mẫu này không?')) {
      window.spaStore.deletePackageTemplate(id);
      window.app.showToast('Đã xóa gói dịch vụ mẫu', 'info');
      if (window.ServicesModule) window.ServicesModule.render();
    }
  }
};

window.PackagesModule = PackagesModule;
