/**
 * SPA EASE - Quản Lý Lịch Hẹn Spa
 * reports.js - Báo Cáo Doanh Thu (Dịch Vụ Đã Hoàn Thành & Gói/Thẻ Dài Hạn), Bộ Lọc & Xuất In Excel
 */

const ReportsModule = {
  filterRange: 'this_month', // 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month' | 'custom'
  activeSubTab: 'all', // 'all' | 'services' | 'packages'
  startDate: '',
  endDate: '',
  filterStaffId: 'all',
  filterServiceId: 'all',
  searchQuery: '',

  init() {
    this.setDefaultDateRange();
    this.render();
  },

  setDefaultDateRange() {
    const today = new Date();
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (this.filterRange === 'today') {
      this.startDate = formatDate(today);
      this.endDate = formatDate(today);
    } else if (this.filterRange === 'yesterday') {
      const y = new Date(today); y.setDate(today.getDate() - 1);
      this.startDate = formatDate(y);
      this.endDate = formatDate(y);
    } else if (this.filterRange === 'this_week') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Thứ 2
      const monday = new Date(today.setDate(diff));
      const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
      this.startDate = formatDate(monday);
      this.endDate = formatDate(sunday);
    } else if (this.filterRange === 'this_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      this.startDate = formatDate(firstDay);
      this.endDate = formatDate(lastDay);
    } else if (this.filterRange === 'last_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      this.startDate = formatDate(firstDay);
      this.endDate = formatDate(lastDay);
    }
  },

  onRangeChange(rangeType) {
    this.filterRange = rangeType;
    if (rangeType !== 'custom') {
      this.setDefaultDateRange();
    }
    this.render();
  },

  getCompletedAppointments() {
    const store = window.spaStore;
    let list = store.getAppointments().filter(a => a.status === 'completed');

    if (this.startDate) list = list.filter(a => a.date >= this.startDate);
    if (this.endDate) list = list.filter(a => a.date <= this.endDate);
    if (this.filterStaffId !== 'all') list = list.filter(a => a.staffId === this.filterStaffId);
    if (this.filterServiceId !== 'all') list = list.filter(a => a.serviceId === this.filterServiceId);

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(a => 
        (a.customerName && a.customerName.toLowerCase().includes(q)) ||
        (a.customerPhone && a.customerPhone.includes(q)) ||
        (a.serviceName && a.serviceName.toLowerCase().includes(q)) ||
        (a.staffName && a.staffName.toLowerCase().includes(q)) ||
        (a.id && a.id.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => (b.date !== a.date ? b.date.localeCompare(a.date) : b.time.localeCompare(a.time)));
    return list;
  },

  getPackageOrders() {
    const store = window.spaStore;
    let list = store.getPackageOrders ? store.getPackageOrders() : [];

    if (this.startDate) list = list.filter(o => o.date >= this.startDate);
    if (this.endDate) list = list.filter(o => o.date <= this.endDate);
    if (this.filterStaffId !== 'all') list = list.filter(o => o.staffId === this.filterStaffId);

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(o => 
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.packageName && o.packageName.toLowerCase().includes(q)) ||
        (o.staffName && o.staffName.toLowerCase().includes(q)) ||
        (o.id && o.id.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => (b.date !== a.date ? b.date.localeCompare(a.date) : (b.createdAt || '').localeCompare(a.createdAt || '')));
    return list;
  },

  onSearch(val) {
    this.searchQuery = val;
    this.renderReportContentOnly();
  },

  render() {
    const container = document.getElementById('reports-view-content');
    if (!container) return;

    if (document.getElementById('reports-dynamic-content') && document.getElementById('reports-search-input')) {
      this.renderReportContentOnly();
      return;
    }

    const store = window.spaStore;
    const staffList = store.getStaff();
    const serviceList = store.getServices();

    let html = `
      <div class="space-y-6">
        <!-- Filter & Actions Bar -->
        <div class="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm space-y-4 no-print">
          <!-- Quick Range Selectors & Action Buttons -->
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100/80 pb-4">
            <!-- Preset Date Ranges -->
            <div class="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button 
                onclick="ReportsModule.onRangeChange('today')"
                class="px-3 py-1.5 rounded-lg transition ${this.filterRange === 'today' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
              >
                Hôm Nay
              </button>
              <button 
                onclick="ReportsModule.onRangeChange('yesterday')"
                class="px-3 py-1.5 rounded-lg transition ${this.filterRange === 'yesterday' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
              >
                Hôm Qua
              </button>
              <button 
                onclick="ReportsModule.onRangeChange('this_week')"
                class="px-3 py-1.5 rounded-lg transition ${this.filterRange === 'this_week' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
              >
                Tuần Này
              </button>
              <button 
                onclick="ReportsModule.onRangeChange('this_month')"
                class="px-3 py-1.5 rounded-lg transition ${this.filterRange === 'this_month' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
              >
                Tháng Này
              </button>
              <button 
                onclick="ReportsModule.onRangeChange('last_month')"
                class="px-3 py-1.5 rounded-lg transition ${this.filterRange === 'last_month' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
              >
                Tháng Trước
              </button>
              <button 
                onclick="ReportsModule.onRangeChange('custom')"
                class="px-3 py-1.5 rounded-lg transition ${this.filterRange === 'custom' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
              >
                Tùy Chọn
              </button>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2">
              <button 
                onclick="PackagesModule.openSellModal()"
                class="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <i data-lucide="plus-circle" class="w-4 h-4"></i> + Bán Gói / Thẻ Mới
              </button>
              <button 
                onclick="ReportsModule.exportCSV()"
                class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Xuất Excel (.CSV)
              </button>
              <button 
                onclick="window.print()"
                class="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <i data-lucide="printer" class="w-4 h-4"></i> In Báo Cáo
              </button>
            </div>
          </div>

          <!-- Advanced Filters Row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div>
              <label class="block font-bold text-slate-600 uppercase mb-1">Từ Ngày:</label>
              <input 
                type="date" 
                value="${this.startDate}"
                onchange="ReportsModule.startDate = this.value; ReportsModule.filterRange = 'custom'; ReportsModule.renderReportContentOnly();"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 font-medium"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-600 uppercase mb-1">Đến Ngày:</label>
              <input 
                type="date" 
                value="${this.endDate}"
                onchange="ReportsModule.endDate = this.value; ReportsModule.filterRange = 'custom'; ReportsModule.renderReportContentOnly();"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 font-medium"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-600 uppercase mb-1">Kỹ Thuật Viên:</label>
              <select 
                onchange="ReportsModule.filterStaffId = this.value; ReportsModule.renderReportContentOnly();"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 font-medium"
              >
                <option value="all" ${this.filterStaffId === 'all' ? 'selected' : ''}>Tất cả KTV</option>
                ${staffList.map(s => `<option value="${s.id}" ${this.filterStaffId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-600 uppercase mb-1">Dịch Vụ:</label>
              <select 
                onchange="ReportsModule.filterServiceId = this.value; ReportsModule.renderReportContentOnly();"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 font-medium"
              >
                <option value="all" ${this.filterServiceId === 'all' ? 'selected' : ''}>Tất cả Dịch vụ</option>
                ${serviceList.map(srv => `<option value="${srv.id}" ${this.filterServiceId === srv.id ? 'selected' : ''}>${srv.name}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-600 uppercase mb-1">Tìm Kiếm Khách / Gói / SĐT:</label>
              <input 
                type="text" 
                id="reports-search-input"
                placeholder="Tên khách, SĐT, gói..."
                value="${this.searchQuery}"
                oninput="ReportsModule.onSearch(this.value)"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 font-medium"
              />
            </div>
          </div>
        </div>

        <!-- Dynamic Content Area -->
        <div id="reports-dynamic-content" class="space-y-6">
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.renderReportContentOnly();
  },

  renderReportContentOnly() {
    const dynamicContainer = document.getElementById('reports-dynamic-content');
    if (!dynamicContainer) return;

    const store = window.spaStore;
    const completedApts = this.getCompletedAppointments();
    const packageOrders = this.getPackageOrders();

    const aptRevenue = completedApts.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    const pkgRevenue = packageOrders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);
    const totalRevenue = aptRevenue + pkgRevenue;
    const totalTransactions = completedApts.length + packageOrders.length;

    // Top KTV xuất sắc
    const staffRevenueMap = {};
    completedApts.forEach(a => { staffRevenueMap[a.staffName] = (staffRevenueMap[a.staffName] || 0) + (Number(a.price) || 0); });
    packageOrders.forEach(o => { if (o.staffName) staffRevenueMap[o.staffName] = (staffRevenueMap[o.staffName] || 0) + (Number(o.price) || 0); });
    
    let topStaffName = 'Chưa có';
    let topStaffRev = 0;
    for (const [sName, sRev] of Object.entries(staffRevenueMap)) {
      if (sRev > topStaffRev) {
        topStaffRev = sRev;
        topStaffName = sName;
      }
    }

    dynamicContainer.innerHTML = `
      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <!-- Card 1: Tổng lượt giao dịch -->
        <div class="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Lượt Giao Dịch</p>
            <h3 class="text-2xl font-bold text-slate-800 mt-1">${totalTransactions} <span class="text-sm font-normal text-slate-500">lượt</span></h3>
            <p class="text-xs text-emerald-600 font-medium mt-1">${completedApts.length} buổi dịch vụ • ${packageOrders.length} đơn gói</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <i data-lucide="check-check" class="w-6 h-6"></i>
          </div>
        </div>

        <!-- Card 2: Tổng Doanh Thu Thực Thu -->
        <div class="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Doanh Thu</p>
            <h3 class="text-2xl font-bold text-rose-600 mt-1">${store.formatCurrency(totalRevenue)}</h3>
            <p class="text-xs text-slate-400 mt-1">Lịch: ${store.formatCurrency(aptRevenue)} • Gói: ${store.formatCurrency(pkgRevenue)}</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
            <i data-lucide="badge-dollar-sign" class="w-6 h-6"></i>
          </div>
        </div>

        <!-- Card 3: Doanh thu Bán Gói / Thẻ -->
        <div class="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doanh Thu Gói & Thẻ</p>
            <h3 class="text-2xl font-bold text-purple-700 mt-1">${store.formatCurrency(pkgRevenue)}</h3>
            <p class="text-xs text-purple-600 font-semibold mt-1">${packageOrders.length} gói liệu trình dài hạn</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
            <i data-lucide="sparkles" class="w-6 h-6"></i>
          </div>
        </div>

        <!-- Card 4: Top KTV xuất sắc -->
        <div class="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">KTV Doanh Thu Cao Nhất</p>
            <h3 class="text-lg font-bold text-amber-700 mt-1 truncate max-w-[150px]" title="${topStaffName}">${topStaffName}</h3>
            <p class="text-xs text-amber-600 font-semibold mt-1">${topStaffRev > 0 ? store.formatCurrency(topStaffRev) : '0 ₫'}</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
            <i data-lucide="award" class="w-6 h-6"></i>
          </div>
        </div>
      </div>

      <!-- Subtabs Switcher (Tất cả / Dịch vụ / Gói liệu trình) -->
      <div class="flex items-center space-x-2 border-b border-rose-100 pb-2 no-print">
        <button 
          onclick="ReportsModule.activeSubTab = 'all'; ReportsModule.renderReportContentOnly();"
          class="px-4 py-2 rounded-xl text-xs font-bold transition ${this.activeSubTab === 'all' ? 'bg-rose-500 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-rose-50'}"
        >
          Tất Cả Nguồn Thu (${totalTransactions})
        </button>
        <button 
          onclick="ReportsModule.activeSubTab = 'services'; ReportsModule.renderReportContentOnly();"
          class="px-4 py-2 rounded-xl text-xs font-bold transition ${this.activeSubTab === 'services' ? 'bg-rose-500 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-rose-50'}"
        >
          🗓️ Dịch Vụ Theo Lịch (${completedApts.length} lượt - ${store.formatCurrency(aptRevenue)})
        </button>
        <button 
          onclick="ReportsModule.activeSubTab = 'packages'; ReportsModule.renderReportContentOnly();"
          class="px-4 py-2 rounded-xl text-xs font-bold transition ${this.activeSubTab === 'packages' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-purple-700 hover:bg-purple-50'}"
        >
          🎁 Gói & Thẻ Dài Hạn (${packageOrders.length} đơn - ${store.formatCurrency(pkgRevenue)})
        </button>
      </div>

      <!-- Printable Report View -->
      <div class="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden p-6 space-y-6">
        <div class="border-b border-slate-200 pb-5 flex items-start justify-between">
          <div>
            <div class="flex items-center space-x-2.5">
              <span class="text-2xl">🌸</span>
              <div>
                <h2 class="text-xl font-extrabold text-slate-800 uppercase tracking-tight">${store.getSettings().spaName || 'GLOW & RELAX LUXURY SPA'}</h2>
                <p class="text-xs text-slate-500 font-medium">${store.getSettings().spaAddress || '128 Nguyễn Trãi, Quận 1, TP. HCM'} • Hotline: ${store.getSettings().spaPhone || '028 3888 9999'}</p>
              </div>
            </div>
            <div class="mt-4">
              <h3 class="text-lg font-bold text-rose-600 uppercase">BÁO CÁO DOANH THU & DỊCH VỤ SPA</h3>
              <p class="text-xs text-slate-500 font-medium mt-0.5">
                Thời gian: từ ngày <strong class="text-slate-700">${this.startDate || 'Tất cả'}</strong> đến ngày <strong class="text-slate-700">${this.endDate || 'Tất cả'}</strong>
              </p>
            </div>
          </div>

          <div class="text-right text-xs text-slate-400">
            <div>Ngày xuất báo cáo: <strong>${new Date().toLocaleDateString('vi-VN')}</strong></div>
            <div>Người xuất: <strong>${window.AuthModule?.getCurrentUser()?.name || 'Quản lý'}</strong></div>
          </div>
        </div>

        <!-- 1. BẢNG DỊCH VỤ HOÀN THÀNH THEO LỊCH HẸN -->
        ${(this.activeSubTab === 'all' || this.activeSubTab === 'services') ? `
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> 1. Doanh Thu Dịch Vụ Theo Lịch Hẹn (${completedApts.length} lượt)
              </h4>
              <span class="font-extrabold text-rose-600 text-sm">${store.formatCurrency(aptRevenue)}</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-rose-50/70 text-slate-800 uppercase font-bold border-y border-rose-200">
                    <th class="py-2.5 px-3 text-center w-12">STT</th>
                    <th class="py-2.5 px-3 w-28">Ngày & Giờ</th>
                    <th class="py-2.5 px-3">Khách Hàng</th>
                    <th class="py-2.5 px-3">Số Điện Thoại</th>
                    <th class="py-2.5 px-4">Dịch Vụ Đã Làm</th>
                    <th class="py-2.5 px-3">Kỹ Thuật Viên</th>
                    <th class="py-2.5 px-4 text-right">Số Tiền Thu</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  ${completedApts.length === 0 ? `
                    <tr><td colspan="7" class="py-6 text-center text-slate-400">Không có dịch vụ hoàn thành khớp với tìm kiếm</td></tr>
                  ` : completedApts.map((apt, idx) => `
                    <tr class="hover:bg-rose-50/20 transition-colors">
                      <td class="py-2.5 px-3 text-center font-bold text-slate-400">${idx + 1}</td>
                      <td class="py-2.5 px-3 font-semibold text-slate-800">${apt.date} <span class="text-rose-500 text-[11px]">(${apt.time})</span></td>
                      <td class="py-2.5 px-3 font-bold text-slate-800">${apt.customerName}</td>
                      <td class="py-2.5 px-3 font-mono text-slate-600">${apt.customerPhone || '---'}</td>
                      <td class="py-2.5 px-4 font-medium text-slate-800">${apt.serviceName} (${apt.duration}p)</td>
                      <td class="py-2.5 px-3 text-purple-700 font-medium">👩‍💼 ${apt.staffName}</td>
                      <td class="py-2.5 px-4 text-right font-extrabold text-rose-600">${store.formatCurrency(apt.price)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- 2. BẢNG ĐƠN BÁN GÓI LIỆU TRÌNH & THẺ DÀI HẠN -->
        ${(this.activeSubTab === 'all' || this.activeSubTab === 'packages') ? `
          <div class="space-y-3 pt-4 border-t border-slate-100">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-purple-600"></span> 2. Doanh Thu Gói Liệu Trình & Thẻ Dài Hạn (${packageOrders.length} đơn)
              </h4>
              <span class="font-extrabold text-purple-700 text-sm">${store.formatCurrency(pkgRevenue)}</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-purple-50/70 text-slate-800 uppercase font-bold border-y border-purple-200">
                    <th class="py-2.5 px-3 text-center w-12">STT</th>
                    <th class="py-2.5 px-3 w-28">Ngày Thu</th>
                    <th class="py-2.5 px-3">Khách Hàng</th>
                    <th class="py-2.5 px-3">Số Điện Thoại</th>
                    <th class="py-2.5 px-4">Tên Gói / Thẻ Dài Hạn</th>
                    <th class="py-2.5 px-3 text-center">Số Buổi / Số Dư</th>
                    <th class="py-2.5 px-3">KTV Tư Vấn</th>
                    <th class="py-2.5 px-4 text-right">Số Tiền Thu</th>
                    ${window.AuthModule?.isAdmin() ? `<th class="py-2.5 px-3 text-center no-print w-16">Thao Tác</th>` : ''}
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                  ${packageOrders.length === 0 ? `
                    <tr><td colspan="${window.AuthModule?.isAdmin() ? 9 : 8}" class="py-6 text-center text-slate-400">Không có đơn mua gói khớp với tìm kiếm</td></tr>
                  ` : packageOrders.map((ord, idx) => `
                    <tr class="hover:bg-purple-50/20 transition-colors">
                      <td class="py-2.5 px-3 text-center font-bold text-slate-400">${idx + 1}</td>
                      <td class="py-2.5 px-3 font-semibold text-slate-800">${ord.date}</td>
                      <td class="py-2.5 px-3 font-bold text-slate-800">${ord.customerName}</td>
                      <td class="py-2.5 px-3 font-mono text-slate-600">${ord.customerPhone || '---'}</td>
                      <td class="py-2.5 px-4 font-bold text-purple-700">
                        ${ord.packageType === 'balance' ? '💳' : '🎟️'} ${ord.packageName}
                        <div class="text-[11px] font-normal text-slate-400">${ord.packageType === 'balance' ? 'Thẻ trừ tiền dần' : 'Gói theo số lượt'} • ${ord.paymentMethod || 'Chuyển khoản'} ${ord.notes ? '• ' + ord.notes : ''}</div>
                      </td>
                      <td class="py-2.5 px-3 text-center font-semibold text-slate-700">
                        ${ord.packageType === 'balance' ? `
                          <span class="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md font-bold text-[11px]">
                            ${store.formatCurrency(ord.remainingBalance)} / ${store.formatCurrency(ord.initialBalance)}
                          </span>
                        ` : `
                          <span class="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md font-bold text-[11px]">
                            ${ord.remainingSessions} / ${ord.totalSessions} buổi
                          </span>
                        `}
                      </td>
                      <td class="py-2.5 px-3 text-slate-700 font-medium">👩‍💼 ${ord.staffName || 'Spa'}</td>
                      <td class="py-2.5 px-4 text-right font-extrabold text-purple-700">${store.formatCurrency(ord.price)}</td>
                      ${window.AuthModule?.isAdmin() ? `
                        <td class="py-2.5 px-3 text-center no-print">
                          <button 
                            onclick="CustomersModule.deleteCustomerPackage('${ord.id}', '${ord.customerId}', '${ord.packageName.replace(/'/g, "\\'")}', ${ord.price})"
                            class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Xóa/Hủy đơn gói này"
                          >
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                          </button>
                        </td>
                      ` : ''}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

        <!-- Subtabs Switcher (Tất cả / Dịch vụ / Gói liệu trình) -->
        <div class="flex items-center space-x-2 border-b border-rose-100 pb-2 no-print">
          <button 
            onclick="ReportsModule.activeSubTab = 'all'; ReportsModule.render();"
            class="px-4 py-2 rounded-xl text-xs font-bold transition ${this.activeSubTab === 'all' ? 'bg-rose-500 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-rose-50'}"
          >
            Tất Cả Nguồn Thu (${totalTransactions})
          </button>
          <button 
            onclick="ReportsModule.activeSubTab = 'services'; ReportsModule.render();"
            class="px-4 py-2 rounded-xl text-xs font-bold transition ${this.activeSubTab === 'services' ? 'bg-rose-500 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-rose-50'}"
          >
            🗓️ Dịch Vụ Theo Lịch (${completedApts.length} lượt - ${store.formatCurrency(aptRevenue)})
          </button>
          <button 
            onclick="ReportsModule.activeSubTab = 'packages'; ReportsModule.render();"
            class="px-4 py-2 rounded-xl text-xs font-bold transition ${this.activeSubTab === 'packages' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-purple-700 hover:bg-purple-50'}"
          >
            🎁 Gói & Thẻ Dài Hạn (${packageOrders.length} đơn - ${store.formatCurrency(pkgRevenue)})
          </button>
        </div>

        <!-- Printable Report View -->
        <div class="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden p-6 space-y-6">
          <div class="border-b border-slate-200 pb-5 flex items-start justify-between">
            <div>
              <div class="flex items-center space-x-2.5">
                <span class="text-2xl">🌸</span>
                <div>
                  <h2 class="text-xl font-extrabold text-slate-800 uppercase tracking-tight">${store.getSettings().spaName || 'GLOW & RELAX LUXURY SPA'}</h2>
                  <p class="text-xs text-slate-500 font-medium">${store.getSettings().spaAddress || '128 Nguyễn Trãi, Quận 1, TP. HCM'} • Hotline: ${store.getSettings().spaPhone || '028 3888 9999'}</p>
                </div>
              </div>
              <div class="mt-4">
                <h3 class="text-lg font-bold text-rose-600 uppercase">BÁO CÁO DOANH THU & DỊCH VỤ SPA</h3>
                <p class="text-xs text-slate-500 font-medium mt-0.5">
                  Thời gian: từ ngày <strong class="text-slate-700">${this.startDate || 'Tất cả'}</strong> đến ngày <strong class="text-slate-700">${this.endDate || 'Tất cả'}</strong>
                </p>
              </div>
            </div>

            <div class="text-right text-xs text-slate-400">
              <div>Ngày xuất báo cáo: <strong>${new Date().toLocaleDateString('vi-VN')}</strong></div>
              <div>Người xuất: <strong>${window.AuthModule?.getCurrentUser()?.name || 'Quản lý'}</strong></div>
            </div>
          </div>

          <!-- 1. BẢNG DỊCH VỤ HOÀN THÀNH THEO LỊCH HẸN -->
          ${(this.activeSubTab === 'all' || this.activeSubTab === 'services') ? `
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> 1. Doanh Thu Dịch Vụ Theo Lịch Hẹn (${completedApts.length} lượt)
                </h4>
                <span class="font-extrabold text-rose-600 text-sm">${store.formatCurrency(aptRevenue)}</span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="bg-rose-50/70 text-slate-800 uppercase font-bold border-y border-rose-200">
                      <th class="py-2.5 px-3 text-center w-12">STT</th>
                      <th class="py-2.5 px-3 w-28">Ngày & Giờ</th>
                      <th class="py-2.5 px-3">Khách Hàng</th>
                      <th class="py-2.5 px-3">Số Điện Thoại</th>
                      <th class="py-2.5 px-4">Dịch Vụ Đã Làm</th>
                      <th class="py-2.5 px-3">Kỹ Thuật Viên</th>
                      <th class="py-2.5 px-4 text-right">Số Tiền Thu</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 text-slate-700">
                    ${completedApts.length === 0 ? `
                      <tr><td colspan="7" class="py-6 text-center text-slate-400">Không có dịch vụ hoàn thành trong kỳ</td></tr>
                    ` : completedApts.map((apt, idx) => `
                      <tr class="hover:bg-rose-50/20 transition-colors">
                        <td class="py-2.5 px-3 text-center font-bold text-slate-400">${idx + 1}</td>
                        <td class="py-2.5 px-3 font-semibold text-slate-800">${apt.date} <span class="text-rose-500 text-[11px]">(${apt.time})</span></td>
                        <td class="py-2.5 px-3 font-bold text-slate-800">${apt.customerName}</td>
                        <td class="py-2.5 px-3 font-mono text-slate-600">${apt.customerPhone || '---'}</td>
                        <td class="py-2.5 px-4 font-medium text-slate-800">${apt.serviceName} (${apt.duration}p)</td>
                        <td class="py-2.5 px-3 text-purple-700 font-medium">👩‍💼 ${apt.staffName}</td>
                        <td class="py-2.5 px-4 text-right font-extrabold text-rose-600">${store.formatCurrency(apt.price)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

          <!-- 2. BẢNG ĐƠN BÁN GÓI LIỆU TRÌNH & THẺ DÀI HẠN -->
          ${(this.activeSubTab === 'all' || this.activeSubTab === 'packages') ? `
            <div class="space-y-3 pt-4 border-t border-slate-100">
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-purple-600"></span> 2. Doanh Thu Gói Liệu Trình & Thẻ Dài Hạn (${packageOrders.length} đơn)
                </h4>
                <span class="font-extrabold text-purple-700 text-sm">${store.formatCurrency(pkgRevenue)}</span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="bg-purple-50/70 text-slate-800 uppercase font-bold border-y border-purple-200">
                      <th class="py-2.5 px-3 text-center w-12">STT</th>
                      <th class="py-2.5 px-3 w-28">Ngày Thu</th>
                      <th class="py-2.5 px-3">Khách Hàng</th>
                      <th class="py-2.5 px-3">Số Điện Thoại</th>
                      <th class="py-2.5 px-4">Tên Gói / Thẻ Dài Hạn</th>
                      <th class="py-2.5 px-3 text-center">Số Buổi / Số Dư</th>
                      <th class="py-2.5 px-3">KTV Tư Vấn</th>
                      <th class="py-2.5 px-4 text-right">Số Tiền Thu</th>
                      ${window.AuthModule?.isAdmin() ? `<th class="py-2.5 px-3 text-center no-print w-16">Thao Tác</th>` : ''}
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 text-slate-700">
                    ${packageOrders.length === 0 ? `
                      <tr><td colspan="${window.AuthModule?.isAdmin() ? 9 : 8}" class="py-6 text-center text-slate-400">Chưa có đơn mua gói nào trong kỳ này</td></tr>
                    ` : packageOrders.map((ord, idx) => `
                      <tr class="hover:bg-purple-50/20 transition-colors">
                        <td class="py-2.5 px-3 text-center font-bold text-slate-400">${idx + 1}</td>
                        <td class="py-2.5 px-3 font-semibold text-slate-800">${ord.date}</td>
                        <td class="py-2.5 px-3 font-bold text-slate-800">${ord.customerName}</td>
                        <td class="py-2.5 px-3 font-mono text-slate-600">${ord.customerPhone || '---'}</td>
                        <td class="py-2.5 px-4 font-bold text-purple-700">
                          ${ord.packageType === 'balance' ? '💳' : '🎟️'} ${ord.packageName}
                          <div class="text-[11px] font-normal text-slate-400">${ord.packageType === 'balance' ? 'Thẻ trừ tiền dần' : 'Gói theo số lượt'} • ${ord.paymentMethod || 'Chuyển khoản'} ${ord.notes ? '• ' + ord.notes : ''}</div>
                        </td>
                        <td class="py-2.5 px-3 text-center font-semibold text-slate-700">
                          ${ord.packageType === 'balance' ? `
                            <span class="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md font-bold text-[11px]">
                              Số dư: ${store.formatCurrency(ord.remainingBalance !== undefined ? ord.remainingBalance : (ord.initialBalance || ord.price))}
                            </span>
                          ` : `
                            <span class="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md font-bold text-[11px]">
                              ${ord.remainingSessions !== undefined ? ord.remainingSessions : ord.totalSessions}/${ord.totalSessions} buổi
                            </span>
                          `}
                        </td>
                        <td class="py-2.5 px-3 text-slate-600">${ord.staffName ? '👩‍💼 ' + ord.staffName : '---'}</td>
                        <td class="py-2.5 px-4 text-right font-extrabold text-purple-700">${store.formatCurrency(ord.price)}</td>
                        ${window.AuthModule?.isAdmin() ? `
                          <td class="py-2.5 px-3 text-center no-print">
                            <button 
                              onclick="ReportsModule.deletePackageSale('${ord.id}', '${ord.packageName.replace(/'/g, "\\'")}', ${ord.price})"
                              class="p-1.5 hover:bg-rose-100 text-rose-500 hover:text-rose-700 rounded-lg transition"
                              title="Xóa/Hủy đơn bán gói này và trừ khỏi doanh thu (Chỉ Admin)"
                            >
                              <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                          </td>
                        ` : ''}
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

          <!-- Hàng Tổng Doanh Thu Chung -->
          <div class="bg-gradient-to-r from-rose-50 via-purple-50 to-rose-100/60 p-4 rounded-xl border border-rose-200 flex flex-wrap items-center justify-between gap-3 text-slate-800 font-bold">
            <div>
              <span class="text-xs uppercase tracking-wider text-rose-800">TỔNG CỘNG DOANH THU TOÀN CƠ SỞ:</span>
              <p class="text-xs font-medium text-slate-500">${totalTransactions} giao dịch (${completedApts.length} dịch vụ + ${packageOrders.length} đơn gói)</p>
            </div>
            <div class="text-2xl font-extrabold text-rose-700">
              ${store.formatCurrency(totalRevenue)}
            </div>
          </div>

          <!-- Chữ ký người lập báo cáo & Chủ cơ sở (Khi In) -->
          <div class="mt-12 pt-6 border-t border-slate-200 hidden print:grid grid-cols-2 text-center text-xs">
            <div>
              <p class="font-bold text-slate-700">Người Lập Báo Cáo</p>
              <p class="text-slate-400 italic mt-1">(Ký và ghi rõ họ tên)</p>
              <div class="h-20"></div>
              <p class="font-bold text-slate-800">${window.AuthModule?.getCurrentUser()?.name || 'Lễ Tân / Quản Lý'}</p>
            </div>
            <div>
              <p class="font-bold text-slate-700">Chủ Cơ Sở Spa</p>
              <p class="text-slate-400 italic mt-1">(Ký duyệt và đóng dấu)</p>
              <div class="h-20"></div>
              <p class="font-bold text-slate-800">Ban Giám Đốc</p>
            </div>
          </div>
        </div>

      </div>
    `;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  },

  exportCSV() {
    const store = window.spaStore;
    const completedList = this.getCompletedAppointments();
    const packageOrders = this.getPackageOrders();

    if (completedList.length === 0 && packageOrders.length === 0) {
      window.app?.showToast('Không có dữ liệu trong kỳ này để xuất Excel', 'warning');
      return;
    }

    const headers = ['Loại Giao Dịch', 'Ngày', 'Khách Hàng', 'Số Điện Thoại', 'Tên Dịch Vụ / Gói Liệu Trình', 'Chi Tiết / Số Buổi', 'Kỹ Thuật Viên / Tư Vấn', 'Số Tiền Thu (VNĐ)', 'Ghi Chú'];
    
    const rows = [];
    completedList.forEach(a => {
      rows.push([
        `"Dịch vụ theo lịch"`,
        `"${a.date} ${a.time}"`,
        `"${(a.customerName || '').replace(/"/g, '""')}"`,
        `"${a.customerPhone || ''}"`,
        `"${(a.serviceName || '').replace(/"/g, '""')}"`,
        `"${a.duration || ''} phút (${a.room || ''} - ${a.bed || ''})"`,
        `"${(a.staffName || '').replace(/"/g, '""')}"`,
        `"${a.price || 0}"`,
        `"${(a.notes || '').replace(/"/g, '""')}"`
      ]);
    });

    packageOrders.forEach(o => {
      rows.push([
        `"Bán gói / thẻ dài hạn"`,
        `"${o.date}"`,
        `"${(o.customerName || '').replace(/"/g, '""')}"`,
        `"${o.customerPhone || ''}"`,
        `"${(o.packageName || '').replace(/"/g, '""')}"`,
        `"${o.totalSessions} buổi (còn ${o.remainingSessions})"`,
        `"${(o.staffName || '').replace(/"/g, '""')}"`,
        `"${o.price || 0}"`,
        `"${(o.notes || '').replace(/"/g, '""')}"`
      ]);
    });

    const totalRevenue = completedList.reduce((sum, a) => sum + (Number(a.price) || 0), 0) + packageOrders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);
    rows.push([
      `""`, `""`, `""`, `""`, `""`, `""`,
      `"TỔNG CỘNG DOANH THU"`,
      `"${totalRevenue}"`,
      `""`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_Cao_Doanh_Thu_Spa_${this.startDate || 'all'}_den_${this.endDate || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    window.app?.showToast('Đã xuất file báo cáo Excel (.CSV)!', 'success');
  },

  deletePackageSale(orderId, packageName, price) {
    if (!window.AuthModule?.isAdmin()) {
      window.app?.showToast('⚠️ Chỉ tài khoản Chủ Spa (Admin) mới có quyền xóa đơn bán gói và trừ doanh thu!', 'error');
      return;
    }

    const store = window.spaStore;
    const formattedPrice = store.formatCurrency(price);
    if (confirm(`Bạn có chắc chắn muốn HỦY / XÓA đơn bán "${packageName}" không?\n\nSố tiền ${formattedPrice} sẽ được trừ khỏi doanh thu và tài khoản của khách hàng.`)) {
      store.deletePackageOrder(orderId);
      window.app?.showToast(`Đã xóa đơn bán gói và trừ ${formattedPrice} khỏi doanh thu!`, 'success');
      this.render();
      if (window.DashboardModule) window.DashboardModule.render();
      if (window.CustomersModule) window.CustomersModule.render();
    }
  }
};

window.ReportsModule = ReportsModule;
