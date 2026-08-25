/**
 * SPA EASE - Quản Lý Lịch Hẹn Spa
 * appointments.js - Logic quản lý lịch hẹn, chế độ xem (Timeline, Tuần, Danh sách), Đặt lịch & Xung đột
 */

const AppointmentsModule = {
  currentView: 'timeline', // 'timeline' | 'week' | 'list'
  selectedDate: new Date().toISOString().split('T')[0],
  filters: {
    status: 'all',
    staffId: 'all',
    serviceId: 'all',
    search: ''
  },
  editingAppointmentId: null,

  init() {
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    // Không cần duplicate vì đã bind qua delegate hoặc trực tiếp
  },

  render() {
    const container = document.getElementById('appointments-view-content');
    if (!container) return;

    // Cập nhật ngày đang chọn trên thanh công cụ
    const dateInput = document.getElementById('apt-date-picker');
    if (dateInput) dateInput.value = this.selectedDate;

    const dateDisplay = document.getElementById('apt-date-display');
    if (dateDisplay) {
      const d = new Date(this.selectedDate);
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[d.getDay()];
      dateDisplay.textContent = `${dayName}, ngày ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }

    if (this.currentView === 'timeline') {
      this.renderTimelineView(container);
    } else if (this.currentView === 'week') {
      this.renderWeekView(container);
    } else if (this.currentView === 'list') {
      this.renderListView(container);
    }
  },

  // 1. TIMELINE VIEW (Khung giờ theo từng Kỹ thuật viên / Phòng)
  renderTimelineView(container) {
    const hours = [];
    for (let h = 8; h <= 23; h++) {
      hours.push(`${String(h).padStart(2, '0')}:00`);
      hours.push(`${String(h).padStart(2, '0')}:30`);
    }

    let html = `
      <div class="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden space-y-0">
        <!-- Header Timeline with Search & Legend -->
        <div class="p-4 border-b border-rose-100 bg-gradient-to-r from-rose-50/50 via-white to-amber-50/30 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center space-x-3">
            <span class="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <i data-lucide="clock" class="w-5 h-5"></i>
            </span>
            <div>
              <h3 class="font-semibold text-slate-800">Sơ đồ Lịch hẹn theo Kỹ thuật viên (08:00 - 23:30)</h3>
              <p class="text-xs text-slate-500">Kéo ngang để xem toàn bộ ca làm việc trong ngày</p>
            </div>
          </div>

          <div class="flex items-center flex-wrap gap-3">
            <!-- Tìm kiếm trên Timeline -->
            <div class="relative w-64">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
              <input 
                type="text" 
                id="apt-timeline-search-input"
                placeholder="Tìm khách, KTV, dịch vụ..."
                value="${this.filters.search}"
                oninput="AppointmentsModule.onTimelineSearch(this.value)"
                class="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <!-- Chú thích màu -->
            <div class="flex items-center gap-2 text-xs">
              <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-amber-400"></span> Chờ</span>
              <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-blue-500"></span> Đã nhận</span>
              <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-purple-500"></span> Đang làm</span>
              <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-emerald-500"></span> Xong</span>
            </div>
          </div>
        </div>

        <!-- Scrollable Timeline Grid -->
        <div class="overflow-x-auto select-none timeline-container relative">
          <table class="w-full border-collapse min-w-[1400px]">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th class="p-3 w-48 text-left sticky left-0 bg-slate-100/95 backdrop-blur z-20 border-r border-slate-200">
                  Kỹ Thuật Viên
                </th>
                ${hours.map(h => `<th class="p-2 text-center w-20 border-r border-slate-100 font-medium text-slate-500">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody id="apt-timeline-tbody" class="divide-y divide-slate-100 text-sm">
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.renderTimelineBodyOnly();
    if (window.lucide) lucide.createIcons();
  },

  renderTimelineBodyOnly() {
    const tbody = document.getElementById('apt-timeline-tbody');
    if (!tbody) return;

    const store = window.spaStore;
    const staffList = store.getStaff();
    let allAppointments = store.getAppointments().filter(a => a.date === this.selectedDate && a.status !== 'cancelled');

    // Khung giờ từ 08:00 đến 23:30 (mỗi nấc 30 phút)
    const hoursCount = 32; // 16 tiếng * 2 nấc

    const q = (this.filters.search || '').toLowerCase().trim();

    let html = '';
    staffList.forEach(staff => {
      let staffApts = allAppointments.filter(a => a.staffId === staff.id);

      html += `
        <tr class="hover:bg-rose-50/20 transition-colors h-24">
          <!-- Cột tên nhân viên (Cố định sticky left) -->
          <td class="p-3 sticky left-0 bg-white/95 backdrop-blur z-10 border-r border-slate-200 shadow-sm">
            <div class="flex items-center space-x-2.5">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-sm" style="background-color: ${staff.color}20; color: ${staff.color}">
                ${staff.avatar || '💆'}
              </div>
              <div class="truncate">
                <div class="font-semibold text-slate-800 truncate">${staff.name}</div>
                <div class="text-xs text-slate-400">${staff.role} • <span class="text-rose-500 font-medium">${staffApts.length} lịch</span></div>
              </div>
            </div>
          </td>

          <!-- Các ô khung giờ & render appointment cards -->
          <td colspan="${hoursCount}" class="p-0 relative border-r border-slate-100 bg-slate-50/30">
            <div class="relative h-20 w-full flex">
              <!-- Render vạch chia giờ mờ phía sau -->
              ${Array.from({ length: hoursCount }).map(() => `<div class="flex-1 min-w-[5rem] border-r border-slate-100 h-full"></div>`).join('')}
              
              <!-- Render các thẻ lịch hẹn của KTV này -->
              ${staffApts.map(apt => {
                const totalStartMinutes = 8 * 60; // 08:00
                const totalEndMinutes = 23 * 60 + 30; // 23:30
                const totalTimelineMinutes = totalEndMinutes - totalStartMinutes; // 930 phút

                const aptStartM = store.timeToMinutes(apt.time);
                const aptDuration = parseInt(apt.duration, 10);
                
                // Tính % vị trí left và width
                const leftPercent = Math.max(0, ((aptStartM - totalStartMinutes) / totalTimelineMinutes) * 100);
                const widthPercent = Math.min(100 - leftPercent, (aptDuration / totalTimelineMinutes) * 100);

                const isMatch = !q || (
                  (apt.customerName && apt.customerName.toLowerCase().includes(q)) ||
                  (apt.customerPhone && apt.customerPhone.includes(q)) ||
                  (apt.serviceName && apt.serviceName.toLowerCase().includes(q)) ||
                  (apt.staffName && apt.staffName.toLowerCase().includes(q))
                );

                let badgeBg = 'bg-rose-50 border-rose-200 text-rose-700';
                let dotBg = 'bg-rose-500';
                if (apt.status === 'pending') { badgeBg = 'bg-amber-50 border-amber-300 text-amber-800'; dotBg = 'bg-amber-400'; }
                else if (apt.status === 'confirmed') { badgeBg = 'bg-blue-50 border-blue-300 text-blue-800'; dotBg = 'bg-blue-500'; }
                else if (apt.status === 'arrived') { badgeBg = 'bg-teal-50 border-teal-300 text-teal-800'; dotBg = 'bg-teal-500'; }
                else if (apt.status === 'in_progress') { badgeBg = 'bg-purple-50 border-purple-300 text-purple-800 ring-2 ring-purple-400/50'; dotBg = 'bg-purple-500 animate-pulse'; }
                else if (apt.status === 'completed') { badgeBg = 'bg-emerald-50 border-emerald-300 text-emerald-800'; dotBg = 'bg-emerald-500'; }

                const opacityClass = (q && !isMatch) ? 'opacity-30 scale-95' : 'opacity-100';

                return `
                  <div 
                    onclick="AppointmentsModule.openDetailModal('${apt.id}')"
                    class="absolute top-2 bottom-2 rounded-xl p-2 border shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all overflow-hidden flex flex-col justify-between ${badgeBg} ${opacityClass} z-10"
                    style="left: ${leftPercent}%; width: ${Math.max(widthPercent, 7)}%; min-width: 140px;"
                    title="${apt.customerName} - ${apt.serviceName} (${apt.time} - ${apt.endTime})"
                  >
                    <div class="flex items-center justify-between gap-1">
                      <span class="font-bold text-xs truncate flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full ${dotBg}"></span>
                        ${apt.time} - ${apt.endTime}
                      </span>
                      <span class="text-[10px] font-semibold uppercase px-1 rounded bg-white/70 shadow-xs">${store.getStatusLabel(apt.status)}</span>
                    </div>
                    <div class="truncate font-semibold text-xs text-slate-800">${apt.customerName}</div>
                    <div class="truncate text-[11px] text-slate-500">${apt.serviceName}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  onTimelineSearch(val) {
    this.filters.search = val;
    this.renderTimelineBodyOnly();
  },

  // 2. WEEK VIEW (Lịch tuần 7 ngày)
  renderWeekView(container) {
    const baseDate = new Date(this.selectedDate);
    const dayOfWeek = baseDate.getDay(); // 0 = CN, 1 = T2
    // Đưa về Thứ 2 đầu tuần
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + mondayOffset);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      weekDays.push({
        dateStr: iso,
        dayName: dayNames[d.getDay()],
        dayNum: d.getDate(),
        isToday: iso === new Date().toISOString().split('T')[0],
        isSelected: iso === this.selectedDate
      });
    }

    let html = `
      <div class="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">
        <div class="p-4 border-b border-rose-100 bg-gradient-to-r from-rose-50/50 to-white flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center space-x-3">
            <span class="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <i data-lucide="calendar" class="w-5 h-5"></i>
            </span>
            <h3 class="font-semibold text-slate-800">Lịch Tuần (${weekDays[0].dateStr} đến ${weekDays[6].dateStr})</h3>
          </div>

          <!-- Tìm kiếm trong tuần -->
          <div class="relative w-64">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
            <input 
              type="text" 
              id="apt-week-search-input"
              placeholder="Tìm khách, KTV trong tuần..."
              value="${this.filters.search}"
              oninput="AppointmentsModule.onWeekSearch(this.value)"
              class="w-full pl-9 pr-3 py-1.5 bg-white border border-rose-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
        </div>

        <div id="apt-week-grid-container" class="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-rose-100 min-h-[500px]">
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.renderWeekGridOnly(weekDays);
    if (window.lucide) lucide.createIcons();
  },

  renderWeekGridOnly(weekDays = null) {
    const grid = document.getElementById('apt-week-grid-container');
    if (!grid) return;

    const store = window.spaStore;

    if (!weekDays) {
      const baseDate = new Date(this.selectedDate);
      const dayOfWeek = baseDate.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(baseDate);
      monday.setDate(baseDate.getDate() + mondayOffset);

      weekDays = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const iso = d.toISOString().split('T')[0];
        const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        weekDays.push({
          dateStr: iso,
          dayName: dayNames[d.getDay()],
          dayNum: d.getDate(),
          isToday: iso === new Date().toISOString().split('T')[0],
          isSelected: iso === this.selectedDate
        });
      }
    }

    const q = (this.filters.search || '').toLowerCase().trim();
    const allAppointments = store.getAppointments().filter(a => a.status !== 'cancelled');

    grid.innerHTML = weekDays.map(wd => {
      let dayApts = allAppointments.filter(a => a.date === wd.dateStr).sort((a, b) => a.time.localeCompare(b.time));

      if (q) {
        dayApts = dayApts.filter(a => 
          (a.customerName && a.customerName.toLowerCase().includes(q)) ||
          (a.customerPhone && a.customerPhone.includes(q)) ||
          (a.serviceName && a.serviceName.toLowerCase().includes(q)) ||
          (a.staffName && a.staffName.toLowerCase().includes(q))
        );
      }

      return `
        <div class="flex flex-col ${wd.isSelected ? 'bg-rose-50/40' : 'bg-white'}">
          <!-- Header ngày trong tuần -->
          <div 
            onclick="AppointmentsModule.changeDate('${wd.dateStr}')"
            class="p-3 border-b border-rose-100 text-center cursor-pointer hover:bg-rose-100/50 transition-colors ${wd.isToday ? 'bg-rose-500 text-white hover:!bg-rose-600' : ''}"
          >
            <div class="text-xs font-semibold ${wd.isToday ? 'text-white' : 'text-slate-500'}">${wd.dayName}</div>
            <div class="text-lg font-bold ${wd.isToday ? 'text-white' : 'text-slate-800'}">${wd.dayNum}</div>
            <div class="text-[11px] ${wd.isToday ? 'text-rose-100' : 'text-rose-600 font-medium'}">${dayApts.length} lịch hẹn</div>
          </div>

          <!-- Danh sách lịch của ngày -->
          <div class="p-2 space-y-2 flex-1 overflow-y-auto max-h-[550px]">
            ${dayApts.length === 0 ? `
              <div class="h-28 flex flex-col items-center justify-center text-slate-300 text-xs italic">
                Trống lịch
              </div>
            ` : dayApts.map(apt => `
              <div 
                onclick="AppointmentsModule.openDetailModal('${apt.id}')"
                class="p-2.5 rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer text-xs group"
              >
                <div class="flex items-center justify-between font-bold text-slate-700">
                  <span class="text-rose-600">${apt.time}</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded-full ${this.getStatusBadgeClass(apt.status)}">${store.getStatusLabel(apt.status)}</span>
                </div>
                <div class="font-semibold text-slate-800 truncate mt-1">${apt.customerName}</div>
                <div class="text-slate-500 truncate text-[11px]">${apt.serviceName}</div>
                <div class="text-slate-400 text-[10px] flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                  <span>👩‍💼 ${apt.staffName}</span>
                  <span>${store.formatCurrency(apt.price)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  },

  onWeekSearch(val) {
    this.filters.search = val;
    this.renderWeekGridOnly();
  },

  // 3. LIST TABLE VIEW (Bảng danh sách với bộ lọc đa năng)
  renderListView(container) {
    const store = window.spaStore;
    const staffList = store.getStaff();
    const serviceList = store.getServices();

    // Nếu khung danh sách đã có, chỉ render lại các hàng trong bảng
    if (document.getElementById('apt-list-table-body') && document.getElementById('apt-list-search-input')) {
      this.renderListTableRowsOnly();
      return;
    }

    let html = `
      <div class="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">
        <!-- Bộ lọc Filter Bar -->
        <div class="p-4 border-b border-rose-100 bg-slate-50/50 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <!-- Tìm kiếm -->
            <div class="relative">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-3"></i>
              <input 
                type="text" 
                id="apt-list-search-input"
                placeholder="Tìm khách hàng, SĐT..." 
                value="${this.filters.search}"
                oninput="AppointmentsModule.onFilterChange('search', this.value)"
                class="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
              />
            </div>

            <!-- Trạng thái -->
            <div>
              <select 
                onchange="AppointmentsModule.onFilterChange('status', this.value)"
                class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
              >
                <option value="all" ${this.filters.status === 'all' ? 'selected' : ''}>Tất cả trạng thái</option>
                <option value="pending" ${this.filters.status === 'pending' ? 'selected' : ''}>Chờ xác nhận</option>
                <option value="confirmed" ${this.filters.status === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option>
                <option value="arrived" ${this.filters.status === 'arrived' ? 'selected' : ''}>Khách đã đến (Check-in)</option>
                <option value="in_progress" ${this.filters.status === 'in_progress' ? 'selected' : ''}>Đang phục vụ</option>
                <option value="completed" ${this.filters.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
                <option value="cancelled" ${this.filters.status === 'cancelled' ? 'selected' : ''}>Đã huỷ</option>
              </select>
            </div>

            <!-- Nhân viên -->
            <div>
              <select 
                onchange="AppointmentsModule.onFilterChange('staffId', this.value)"
                class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
              >
                <option value="all" ${this.filters.staffId === 'all' ? 'selected' : ''}>Tất cả Kỹ thuật viên</option>
                ${staffList.map(s => `<option value="${s.id}" ${this.filters.staffId === s.id ? 'selected' : ''}>${s.name} (${s.role})</option>`).join('')}
              </select>
            </div>

            <!-- Dịch vụ -->
            <div>
              <select 
                onchange="AppointmentsModule.onFilterChange('serviceId', this.value)"
                class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
              >
                <option value="all" ${this.filters.serviceId === 'all' ? 'selected' : ''}>Tất cả Dịch vụ</option>
                ${serviceList.map(s => `<option value="${s.id}" ${this.filters.serviceId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Bảng danh sách -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-rose-50/50 text-slate-700 uppercase text-xs font-semibold border-b border-rose-100">
              <tr>
                <th class="py-3 px-4">Thời gian</th>
                <th class="py-3 px-4">Khách hàng</th>
                <th class="py-3 px-4">Dịch vụ & Phòng</th>
                <th class="py-3 px-4">Kỹ thuật viên</th>
                <th class="py-3 px-4">Chi phí</th>
                <th class="py-3 px-4 text-center">Trạng thái</th>
                <th class="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody id="apt-list-table-body" class="divide-y divide-slate-100">
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.renderListTableRowsOnly();
    if (window.lucide) lucide.createIcons();
  },

  renderListTableRowsOnly() {
    const tbody = document.getElementById('apt-list-table-body');
    if (!tbody) return;

    const store = window.spaStore;
    let appointments = store.getAppointments();

    // Lọc theo ngày
    if (this.selectedDate) {
      appointments = appointments.filter(a => a.date === this.selectedDate);
    }

    // Lọc theo trạng thái
    if (this.filters.status !== 'all') {
      appointments = appointments.filter(a => a.status === this.filters.status);
    }

    // Lọc theo KTV
    if (this.filters.staffId !== 'all') {
      appointments = appointments.filter(a => a.staffId === this.filters.staffId);
    }

    // Lọc theo Dịch vụ
    if (this.filters.serviceId !== 'all') {
      appointments = appointments.filter(a => a.serviceId === this.filters.serviceId);
    }

    // Tìm kiếm Tên / SĐT / Mã / Dịch vụ
    if (this.filters.search) {
      const q = this.filters.search.toLowerCase().trim();
      appointments = appointments.filter(a => 
        (a.customerName && a.customerName.toLowerCase().includes(q)) ||
        (a.customerPhone && a.customerPhone.includes(q)) ||
        (a.id && a.id.toLowerCase().includes(q)) ||
        (a.serviceName && a.serviceName.toLowerCase().includes(q)) ||
        (a.staffName && a.staffName.toLowerCase().includes(q))
      );
    }

    // Sắp xếp theo giờ
    appointments.sort((a, b) => a.time.localeCompare(b.time));

    if (appointments.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-slate-400">
            <i data-lucide="calendar-x" class="w-12 h-12 mx-auto mb-2 opacity-40"></i>
            <p class="text-sm">Không có lịch hẹn nào phù hợp với bộ lọc</p>
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = appointments.map(apt => `
        <tr class="hover:bg-rose-50/20 transition-colors">
          <td class="py-3.5 px-4">
            <div class="font-bold text-slate-800">${apt.time} - ${apt.endTime || ''}</div>
            <div class="text-xs text-slate-400">${apt.date}</div>
          </td>
          <td class="py-3.5 px-4">
            <div class="font-semibold text-slate-800">${apt.customerName}</div>
            <a href="tel:${apt.customerPhone}" class="text-xs text-rose-500 hover:underline flex items-center gap-1">
              <i data-lucide="phone" class="w-3 h-3"></i> ${apt.customerPhone}
            </a>
          </td>
          <td class="py-3.5 px-4">
            <div class="font-medium text-slate-700 line-clamp-1">${apt.serviceName}</div>
            <div class="text-xs text-slate-400">${apt.room || 'Chưa xếp phòng'} ${apt.bed ? `(${apt.bed})` : ''} • ${apt.duration}p</div>
          </td>
          <td class="py-3.5 px-4">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span>
              <span class="text-slate-700 font-medium">${apt.staffName}</span>
            </div>
          </td>
          <td class="py-3.5 px-4 font-semibold text-slate-800">
            ${store.formatCurrency(apt.price)}
          </td>
          <td class="py-3.5 px-4 text-center">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${this.getStatusBadgeClass(apt.status)}">
              ${store.getStatusLabel(apt.status)}
            </span>
          </td>
          <td class="py-3.5 px-4 text-right">
            <div class="flex items-center justify-end gap-1">
              <button 
                onclick="AppointmentsModule.openDetailModal('${apt.id}')"
                title="Xem chi tiết" 
                class="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
              >
                <i data-lucide="eye" class="w-4 h-4"></i>
              </button>
              <button 
                onclick="AppointmentsModule.openEditModal('${apt.id}')"
                title="Chỉnh sửa" 
                class="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 transition"
              >
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </button>
              ${window.AuthModule?.isAdmin() ? `
                <button 
                  onclick="AppointmentsModule.deleteAppointment('${apt.id}')"
                  title="Xóa lịch (Chỉ Admin)" 
                  class="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition"
                >
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `).join('');
    }

    if (window.lucide) lucide.createIcons();
  },

  getStatusBadgeClass(status) {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'arrived': return 'bg-teal-100 text-teal-800 border border-teal-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border border-purple-200 animate-pulse';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-800 border border-rose-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  },

  setView(viewType) {
    this.currentView = viewType;
    document.querySelectorAll('.view-btn').forEach(btn => {
      if (btn.dataset.view === viewType) {
        btn.classList.add('bg-white', 'shadow-xs', 'text-rose-600', 'font-semibold');
        btn.classList.remove('text-slate-600');
      } else {
        btn.classList.remove('bg-white', 'shadow-xs', 'text-rose-600', 'font-semibold');
        btn.classList.add('text-slate-600');
      }
    });
    this.render();
  },

  changeDate(dateStr) {
    this.selectedDate = dateStr;
    this.render();
  },

  prevDate() {
    const d = new Date(this.selectedDate);
    if (this.currentView === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    this.selectedDate = d.toISOString().split('T')[0];
    this.render();
  },

  nextDate() {
    const d = new Date(this.selectedDate);
    if (this.currentView === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    this.selectedDate = d.toISOString().split('T')[0];
    this.render();
  },

  today() {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.render();
  },

  onFilterChange(key, value) {
    this.filters[key] = value;
    if (this.currentView === 'list' && document.getElementById('apt-list-table-body')) {
      this.renderListTableRowsOnly();
    } else {
      this.render();
    }
  },

  // MODAL ĐẶT LỊCH / CHỈNH SỬA
  openAddModal(prefillData = {}, editId = null) {
    this.editingAppointmentId = editId;
    const store = window.spaStore;
    const customers = store.getCustomers();
    const services = store.getServices();
    const staff = store.getStaff();
    const rooms = store.getRooms();

    const titleEl = document.getElementById('modal-apt-title');
    if (titleEl) titleEl.textContent = editId ? 'Chỉnh Sửa Lịch Hẹn' : 'Đặt Lịch Hẹn Mới';

    const defaultDate = prefillData.date || this.selectedDate;
    const defaultTime = prefillData.time || '09:00';

    const form = document.getElementById('appointment-form');
    if (!form) return;

    form.innerHTML = `
      <input type="hidden" name="id" id="apt-edit-id" value="${editId || ''}" />
      
      <!-- Khách hàng -->
      <div class="space-y-1">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Khách Hàng <span class="text-rose-500">*</span></label>
          <span class="text-[11px] text-rose-500 font-semibold">🔍 Tìm kiếm tên / SĐT bên dưới</span>
        </div>
        <div class="space-y-1.5">
          <div class="relative">
            <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5"></i>
            <input 
              type="text" 
              id="apt-modal-cust-filter"
              placeholder="Gõ tên hoặc số điện thoại để lọc nhanh khách..." 
              oninput="AppointmentsModule.filterModalCustomerList(this.value)"
              class="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs"
            />
          </div>
          <select 
            name="customerId" 
            id="apt-input-customer" 
            required 
            onchange="AppointmentsModule.onCustomerSelectChange(this.value)"
            class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 text-sm"
          >
            <option value="">-- Chọn khách hàng sẵn có (${customers.length}) --</option>
            ${customers.map(c => `<option value="${c.id}">${c.name} - ${c.phone} (${c.type})</option>`).join('')}
            <option value="NEW_CUSTOMER">+ Thêm nhanh khách hàng mới...</option>
          </select>
        </div>
      </div>

      <!-- Form thêm nhanh khách nếu chọn New -->
      <div id="new-customer-quick-fields" class="hidden p-3 bg-rose-50/60 rounded-xl border border-rose-200 space-y-2 text-xs">
        <div class="font-bold text-rose-700 flex items-center gap-1">
          <i data-lucide="user-plus" class="w-3.5 h-3.5"></i> Thông tin khách hàng mới
        </div>
        <div class="grid grid-cols-2 gap-2">
          <input type="text" id="quick-cust-name" placeholder="Họ và tên khách" class="px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs" />
          <input type="tel" id="quick-cust-phone" placeholder="Số điện thoại" class="px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs" />
        </div>
      </div>

      <!-- Dịch vụ -->
      <div class="space-y-1">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Dịch Vụ Spa <span class="text-rose-500">*</span></label>
          <span class="text-[11px] text-rose-500 font-semibold">🔍 Tìm kiếm dịch vụ</span>
        </div>
        <div class="space-y-1.5">
          <div class="relative">
            <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5"></i>
            <input 
              type="text" 
              id="apt-modal-srv-filter"
              placeholder="Gõ tên hoặc nhóm dịch vụ để tìm..." 
              oninput="AppointmentsModule.filterModalServiceList(this.value)"
              class="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs"
            />
          </div>
          <select 
            name="serviceId" 
            id="apt-input-service" 
            required 
            onchange="AppointmentsModule.onServiceSelectChange(this.value)"
            class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 text-sm"
          >
            <option value="">-- Chọn dịch vụ (${services.length}) --</option>
            ${services.map(s => `<option value="${s.id}" data-duration="${s.duration}" data-price="${s.price}">${s.name} (${s.duration}p - ${store.formatCurrency(s.price)})</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Kỹ thuật viên & Phòng/Giường -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Kỹ Thuật Viên (KTV) <span class="text-rose-500">*</span></label>
          <select 
            name="staffId" 
            id="apt-input-staff" 
            required 
            onchange="AppointmentsModule.triggerConflictCheck()"
            class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 text-sm"
          >
            <option value="">-- Chọn kỹ thuật viên --</option>
            ${staff.map(st => `<option value="${st.id}">${st.avatar || '💆'} ${st.name} (${st.role})</option>`).join('')}
          </select>
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Phòng & Giường</label>
          <select 
            name="roomBed" 
            id="apt-input-roombed" 
            onchange="AppointmentsModule.triggerConflictCheck()"
            class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 text-sm"
          >
            <option value="">-- Chọn phòng / giường --</option>
            ${rooms.map(r => (r.beds || []).map(b => `<option value="${r.name}|${b}">${r.name} - ${b}</option>`).join('')).join('')}
          </select>
        </div>
      </div>

      <!-- Ngày & Giờ & Thời lượng & Giá tiền -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Ngày <span class="text-rose-500">*</span></label>
          <input 
            type="date" 
            name="date" 
            id="apt-input-date" 
            required 
            value="${defaultDate}" 
            onchange="AppointmentsModule.triggerConflictCheck()"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm"
          />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Giờ Bắt Đầu <span class="text-rose-500">*</span></label>
          <input 
            type="time" 
            name="time" 
            id="apt-input-time" 
            required 
            value="${defaultTime}" 
            onchange="AppointmentsModule.triggerConflictCheck()"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm"
          />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Thời Lượng (Phút)</label>
          <input 
            type="number" 
            name="duration" 
            id="apt-input-duration" 
            value="60" 
            min="15" 
            step="15" 
            onchange="AppointmentsModule.triggerConflictCheck()"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm"
          />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Giá Tiền (VNĐ)</label>
          <input 
            type="number" 
            name="price" 
            id="apt-input-price" 
            value="0" 
            step="10000" 
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm font-semibold text-rose-600"
          />
        </div>
      </div>

      <!-- Cảnh báo trùng lịch (Conflict Alert Box) -->
      <div id="apt-conflict-alert" class="hidden p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 text-xs flex items-start gap-2.5">
        <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-600 shrink-0 mt-0.5"></i>
        <div id="apt-conflict-message" class="space-y-1"></div>
      </div>

      <!-- Trạng thái -->
      <div class="space-y-1">
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Trạng Thái Lịch Hẹn</label>
        <select 
          name="status" 
          id="apt-input-status" 
          class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm font-medium"
        >
          <option value="pending">⏳ Chờ xác nhận (Pending)</option>
          <option value="confirmed" selected>✅ Đã xác nhận (Confirmed)</option>
          <option value="arrived">🚶‍♀️ Khách đã đến (Check-in)</option>
          <option value="in_progress">💆‍♀️ Đang phục vụ (In-service)</option>
          <option value="completed">🎉 Hoàn thành & Đã thanh toán (Completed)</option>
          <option value="cancelled">❌ Đã huỷ (Cancelled)</option>
        </select>
      </div>

      <!-- Ghi chú -->
      <div class="space-y-1">
        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Ghi Chú Yêu Cầu Riêng Của Khách</label>
        <textarea 
          name="notes" 
          id="apt-input-notes" 
          rows="2" 
          placeholder="Ví dụ: Da mẫn cảm, thích uống trà gừng ấm, làm nhẹ tay..." 
          class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm"
        ></textarea>
      </div>
    `;

    document.getElementById('appointment-modal').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
    this.triggerConflictCheck();
  },

  openEditModal(id) {
    const store = window.spaStore;
    const apt = store.getAppointments().find(a => a.id === id);
    if (!apt) return;

    this.openAddModal({ date: apt.date, time: apt.time }, id);
    this.editingAppointmentId = id;

    const titleEl = document.getElementById('modal-apt-title');
    if (titleEl) titleEl.textContent = 'Chỉnh Sửa Lịch Hẹn';

    // Điền dữ liệu
    const custSelect = document.getElementById('apt-input-customer');
    if (custSelect) custSelect.value = apt.customerId;

    const srvSelect = document.getElementById('apt-input-service');
    if (srvSelect) srvSelect.value = apt.serviceId;

    const staffSelect = document.getElementById('apt-input-staff');
    if (staffSelect) staffSelect.value = apt.staffId;

    const roomBedSelect = document.getElementById('apt-input-roombed');
    if (roomBedSelect && apt.room && apt.bed) {
      roomBedSelect.value = `${apt.room}|${apt.bed}`;
    }

    document.getElementById('apt-input-date').value = apt.date;
    document.getElementById('apt-input-time').value = apt.time;
    document.getElementById('apt-input-duration').value = apt.duration;
    document.getElementById('apt-input-price').value = apt.price;
    document.getElementById('apt-input-status').value = apt.status;
    document.getElementById('apt-input-notes').value = apt.notes || '';

    this.triggerConflictCheck();
  },

  filterModalCustomerList(q) {
    const select = document.getElementById('apt-input-customer');
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
      <option value="">-- Chọn khách hàng sẵn có (${filtered.length}) --</option>
      ${filtered.map(c => `<option value="${c.id}">${c.name} - ${c.phone} (${c.type})</option>`).join('')}
      <option value="NEW_CUSTOMER">+ Thêm nhanh khách hàng mới...</option>
    `;
    if (filtered.length === 1) {
      select.value = filtered[0].id;
      this.onCustomerSelectChange(filtered[0].id);
    }
  },

  filterModalServiceList(q) {
    const select = document.getElementById('apt-input-service');
    if (!select) return;
    const store = window.spaStore;
    const services = store.getServices();
    const query = (q || '').toLowerCase().trim();

    let filtered = services;
    if (query) {
      filtered = services.filter(s => 
        (s.name && s.name.toLowerCase().includes(query)) ||
        (s.category && s.category.toLowerCase().includes(query)) ||
        (s.description && s.description.toLowerCase().includes(query))
      );
    }

    select.innerHTML = `
      <option value="">-- Chọn dịch vụ (${filtered.length}) --</option>
      ${filtered.map(s => `<option value="${s.id}" data-duration="${s.duration}" data-price="${s.price}">${s.name} (${s.duration}p - ${store.formatCurrency(s.price)})</option>`).join('')}
    `;
    if (filtered.length === 1) {
      select.value = filtered[0].id;
      this.onServiceSelectChange(filtered[0].id);
    }
  },

  onCustomerSelectChange(val) {
    const quickFields = document.getElementById('new-customer-quick-fields');
    if (val === 'NEW_CUSTOMER') {
      quickFields.classList.remove('hidden');
    } else {
      quickFields.classList.add('hidden');
    }
  },

  onServiceSelectChange(srvId) {
    const store = window.spaStore;
    const srv = store.getServices().find(s => s.id === srvId);
    if (srv) {
      document.getElementById('apt-input-duration').value = srv.duration;
      document.getElementById('apt-input-price').value = srv.price;
      this.triggerConflictCheck();
    }
  },

  triggerConflictCheck() {
    const store = window.spaStore;
    const staffId = document.getElementById('apt-input-staff')?.value;
    const roomBedVal = document.getElementById('apt-input-roombed')?.value;
    const date = document.getElementById('apt-input-date')?.value;
    const time = document.getElementById('apt-input-time')?.value;
    const duration = document.getElementById('apt-input-duration')?.value;

    let room = '';
    let bed = '';
    if (roomBedVal) {
      const parts = roomBedVal.split('|');
      room = parts[0];
      bed = parts[1] || '';
    }

    const alertBox = document.getElementById('apt-conflict-alert');
    const msgBox = document.getElementById('apt-conflict-message');

    if (!staffId || !date || !time || !duration) {
      alertBox?.classList.add('hidden');
      return;
    }

    const conflicts = store.checkAppointmentConflict(staffId, room, bed, date, time, duration, this.editingAppointmentId);
    if (conflicts.length > 0) {
      alertBox.classList.remove('hidden');
      msgBox.innerHTML = `
        <div class="font-bold text-amber-900">⚠️ Cảnh báo xung đột lịch!</div>
        ${conflicts.map(c => `<div>• ${c.message}</div>`).join('')}
      `;
    } else {
      alertBox.classList.add('hidden');
    }
  },

  saveAppointmentForm(e) {
    e.preventDefault();
    const store = window.spaStore;

    const custSelectVal = document.getElementById('apt-input-customer').value;
    let customerId = custSelectVal;
    let customerName = '';
    let customerPhone = '';

    if (custSelectVal === 'NEW_CUSTOMER') {
      const quickName = document.getElementById('quick-cust-name').value.trim();
      const quickPhone = document.getElementById('quick-cust-phone').value.trim();
      if (!quickName || !quickPhone) {
        window.app.showToast('Vui lòng nhập tên và SĐT của khách hàng mới', 'warning');
        return;
      }
      const newCust = store.addCustomer({
        name: quickName,
        phone: quickPhone,
        gender: 'Nữ',
        type: 'Khách mới',
        notes: 'Tạo nhanh từ lịch hẹn'
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

    const serviceId = document.getElementById('apt-input-service').value;
    const service = store.getServices().find(s => s.id === serviceId);
    const serviceName = service ? service.name : '';

    const staffId = document.getElementById('apt-input-staff').value;
    const staffMember = store.getStaff().find(st => st.id === staffId);
    const staffName = staffMember ? staffMember.name : '';

    const roomBedVal = document.getElementById('apt-input-roombed').value;
    let room = '';
    let bed = '';
    if (roomBedVal) {
      const parts = roomBedVal.split('|');
      room = parts[0];
      bed = parts[1] || '';
    }

    const date = document.getElementById('apt-input-date').value;
    const time = document.getElementById('apt-input-time').value;
    const duration = parseInt(document.getElementById('apt-input-duration').value, 10) || 60;
    const price = parseInt(document.getElementById('apt-input-price').value, 10) || 0;
    const status = document.getElementById('apt-input-status').value;
    const notes = document.getElementById('apt-input-notes').value.trim();
    const endTime = store.calculateEndTime(time, duration);

    const aptData = {
      customerId,
      customerName,
      customerPhone,
      serviceId,
      serviceName,
      staffId,
      staffName,
      room,
      bed,
      date,
      time,
      endTime,
      duration,
      price,
      status,
      notes
    };

    const editId = this.editingAppointmentId || document.getElementById('apt-edit-id')?.value;

    if (editId) {
      store.updateAppointment(editId, aptData);
      window.app.showToast('Cập nhật lịch hẹn thành công!', 'success');
    } else {
      store.addAppointment(aptData);
      window.app.showToast('Thêm lịch hẹn mới thành công!', 'success');
    }

    this.closeModal();
    this.render();
    if (window.DashboardModule) window.DashboardModule.render();
    if (window.ReportsModule) window.ReportsModule.render();
  },

  closeModal() {
    document.getElementById('appointment-modal')?.classList.add('hidden');
    this.editingAppointmentId = null;
  },

  // MODAL CHI TIẾT LỊCH HẸN & THAO TÁC NHANH
  openDetailModal(id) {
    const store = window.spaStore;
    const apt = store.getAppointments().find(a => a.id === id);
    if (!apt) return;

    const modal = document.getElementById('appointment-detail-modal');
    const content = document.getElementById('appointment-detail-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="space-y-5">
        <!-- Header Info -->
        <div class="flex items-start justify-between pb-4 border-b border-rose-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${this.getStatusBadgeClass(apt.status)}">
                ${store.getStatusLabel(apt.status)}
              </span>
              <span class="text-xs text-slate-400">Mã: #${apt.id}</span>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mt-2">${apt.customerName}</h3>
            <a href="tel:${apt.customerPhone}" class="text-sm text-rose-500 hover:underline flex items-center gap-1.5 mt-0.5">
              <i data-lucide="phone-call" class="w-4 h-4"></i> ${apt.customerPhone}
            </a>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-rose-600">${store.formatCurrency(apt.price)}</div>
            <div class="text-xs text-slate-500">Thời lượng: ${apt.duration} phút</div>
          </div>
        </div>

        <!-- Chi tiết lịch hẹn -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <span class="text-xs text-slate-400 font-medium block">Dịch vụ điều trị:</span>
            <span class="font-semibold text-slate-800">${apt.serviceName}</span>
          </div>
          <div>
            <span class="text-xs text-slate-400 font-medium block">Thời gian:</span>
            <span class="font-semibold text-slate-800">${apt.time} - ${apt.endTime || ''} (Ngày ${apt.date})</span>
          </div>
          <div>
            <span class="text-xs text-slate-400 font-medium block">Kỹ thuật viên phụ trách:</span>
            <span class="font-semibold text-slate-800">👩‍💼 ${apt.staffName}</span>
          </div>
          <div>
            <span class="text-xs text-slate-400 font-medium block">Phòng & Giường:</span>
            <span class="font-semibold text-slate-800">🛋️ ${apt.room || 'Chưa xếp'} ${apt.bed ? `(${apt.bed})` : ''}</span>
          </div>
        </div>

        <!-- Ghi chú -->
        ${apt.notes ? `
          <div class="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
            <span class="font-bold block mb-1">📝 Ghi chú yêu cầu của khách:</span>
            ${apt.notes}
          </div>
        ` : ''}

        <!-- Nút chuyển đổi trạng thái nhanh (Quick Status Switcher) -->
        <div class="pt-2 border-t border-rose-100">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Đổi Trạng Thái 1 Chạm:</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button 
              onclick="AppointmentsModule.quickUpdateStatus('${apt.id}', 'arrived')" 
              class="px-3 py-2 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 font-semibold hover:bg-teal-100 transition text-center"
            >
              🚶‍♀️ Check-in khách
            </button>
            <button 
              onclick="AppointmentsModule.quickUpdateStatus('${apt.id}', 'in_progress')" 
              class="px-3 py-2 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 font-semibold hover:bg-purple-100 transition text-center"
            >
              💆‍♀️ Đang phục vụ
            </button>
            <button 
              onclick="AppointmentsModule.quickUpdateStatus('${apt.id}', 'completed')" 
              class="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition text-center"
            >
              🎉 Đã xong & Thu tiền
            </button>
            <button 
              onclick="AppointmentsModule.quickUpdateStatus('${apt.id}', 'cancelled')" 
              class="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100 transition text-center"
            >
              ❌ Huỷ lịch hẹn
            </button>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            ${window.AuthModule?.isAdmin() ? `
              <button 
                onclick="AppointmentsModule.deleteAppointment('${apt.id}')"
                class="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-xs font-semibold transition flex items-center gap-1"
              >
                <i data-lucide="trash-2" class="w-4 h-4"></i> Xóa lịch này
              </button>
            ` : `
              <span class="text-[11px] text-slate-400 italic">🔒 Chỉ Chủ Spa mới có quyền xóa lịch</span>
            `}
          </div>
          <div class="flex gap-2">
            <button 
              onclick="AppointmentsModule.closeDetailModal(); AppointmentsModule.openEditModal('${apt.id}');"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Chỉnh sửa
            </button>
            <button 
              onclick="AppointmentsModule.closeDetailModal()"
              class="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  },

  closeDetailModal() {
    document.getElementById('appointment-detail-modal')?.classList.add('hidden');
  },

  quickUpdateStatus(id, newStatus) {
    window.spaStore.updateAppointment(id, { status: newStatus });
    window.app.showToast(`Đã chuyển trạng thái: ${window.spaStore.getStatusLabel(newStatus)}`, 'success');
    this.closeDetailModal();
    this.render();
    if (window.DashboardModule) window.DashboardModule.render();
  },

  deleteAppointment(id) {
    if (!window.AuthModule?.isAdmin()) {
      window.app?.showToast('⚠️ Chỉ tài khoản Chủ Spa (Admin) mới có quyền xóa lịch hẹn!', 'error');
      return;
    }

    if (confirm('Bạn có chắc chắn muốn xóa lịch hẹn này không?')) {
      window.spaStore.deleteAppointment(id);
      window.app.showToast('Đã xóa lịch hẹn!', 'info');
      this.closeDetailModal();
      this.render();
      if (window.DashboardModule) window.DashboardModule.render();
      if (window.ReportsModule) window.ReportsModule.render();
    }
  }
};

window.AppointmentsModule = AppointmentsModule;
