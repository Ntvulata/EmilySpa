/**
 * SPA EASE - Quản Lý Lịch Hẹn Spa
 * dashboard.js - Thống kê KPI tổng quan, cảnh báo lịch hẹn sắp tới & Biểu đồ phân tích
 */

const DashboardModule = {
  serviceChartInstance: null,
  staffChartInstance: null,

  init() {
    this.render();
  },

  render() {
    const container = document.getElementById('dashboard-view-content');
    if (!container) return;

    const store = window.spaStore;
    const appointments = store.getAppointments();
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today);

    // Tính toán số liệu thống kê hôm nay
    const totalToday = todayAppointments.length;
    const pendingToday = todayAppointments.filter(a => a.status === 'pending').length;
    const inProgressToday = todayAppointments.filter(a => a.status === 'in_progress').length;
    const completedToday = todayAppointments.filter(a => a.status === 'completed').length;
    
    const packageOrders = store.getPackageOrders ? store.getPackageOrders() : [];
    const todayPackageOrders = packageOrders.filter(o => o.date === today);
    const todayPackageRevenue = todayPackageOrders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);

    const todayAptRevenue = todayAppointments
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

    const totalTodayRevenue = todayAptRevenue + todayPackageRevenue;

    const todayExpectedRevenue = todayAppointments
      .filter(a => a.status !== 'cancelled')
      .reduce((sum, a) => sum + (Number(a.price) || 0), 0) + todayPackageRevenue;

    // Danh sách lịch hẹn sắp tới trong ngày (sắp xếp theo giờ)
    const upcomingToday = todayAppointments
      .filter(a => a.status !== 'completed' && a.status !== 'cancelled')
      .sort((a, b) => a.time.localeCompare(b.time));

    let html = `
      <div class="space-y-6">
        <!-- KPI Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Card 1: Tổng lịch hẹn hôm nay -->
          <div class="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div>
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lịch Hẹn Hôm Nay</p>
              <h3 class="text-2xl font-bold text-slate-800 mt-1">${totalToday}</h3>
              <p class="text-xs text-rose-500 font-medium mt-1">${completedToday} đã xong • ${inProgressToday} đang làm</p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
              <i data-lucide="calendar" class="w-6 h-6"></i>
            </div>
          </div>

          <!-- Card 2: Chờ xác nhận -->
          <div class="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div>
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chờ Xác Nhận</p>
              <h3 class="text-2xl font-bold text-amber-600 mt-1">${pendingToday}</h3>
              <p class="text-xs text-slate-400 mt-1">Cần gọi điện cho khách</p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <i data-lucide="clock" class="w-6 h-6"></i>
            </div>
          </div>

          <!-- Card 3: Doanh thu thực thu (Lịch hẹn + Gói/thẻ) -->
          <div onclick="app.switchTab('reports')" class="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between relative overflow-hidden cursor-pointer hover:border-emerald-300 transition group" title="Bấm để xem Báo Cáo Doanh Thu chi tiết">
            <div>
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Doanh Thu Đã Thu</p>
              <h3 class="text-2xl font-bold text-emerald-600 mt-1">${store.formatCurrency(totalTodayRevenue)}</h3>
              <p class="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
                ${todayPackageRevenue > 0 ? `Lịch: ${store.formatCurrency(todayAptRevenue)} + Gói: ${store.formatCurrency(todayPackageRevenue)}` : `Từ dịch vụ đã hoàn thành`}
              </p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
              <i data-lucide="badge-dollar-sign" class="w-6 h-6"></i>
            </div>
          </div>

          <!-- Card 4: Doanh thu dự kiến -->
          <div class="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div>
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doanh Thu Dự Kiến</p>
              <h3 class="text-2xl font-bold text-rose-600 mt-1">${store.formatCurrency(todayExpectedRevenue)}</h3>
              <p class="text-xs text-slate-400 mt-1">Tổng lịch hẹn + đơn gói hôm nay</p>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
              <i data-lucide="trending-up" class="w-6 h-6"></i>
            </div>
          </div>
        </div>

        <!-- Section 2 Cột: Lịch hẹn sắp tới & Biểu đồ -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Cột Trái (2 phần): Danh sách lịch hẹn sắp tới hôm nay -->
          <div class="lg:col-span-2 bg-white rounded-2xl border border-rose-100 shadow-sm p-5 space-y-4">
            <div class="flex items-center justify-between border-b border-rose-100 pb-3">
              <div class="flex items-center space-x-2">
                <span class="p-2 bg-rose-100 text-rose-600 rounded-lg">
                  <i data-lucide="bell" class="w-5 h-5"></i>
                </span>
                <div>
                  <h3 class="font-bold text-slate-800">Lịch Hẹn Sắp Tới Hôm Nay</h3>
                  <p class="text-xs text-slate-400">Các lượt khách cần chuẩn bị đón tiếp và phục vụ</p>
                </div>
              </div>
              <button 
                onclick="window.app.switchTab('appointments')"
                class="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline"
              >
                Xem tất cả ➜
              </button>
            </div>

            <div class="space-y-3">
              ${upcomingToday.length === 0 ? `
                <div class="py-12 text-center text-slate-400">
                  <i data-lucide="check-circle" class="w-12 h-12 mx-auto mb-2 text-emerald-400"></i>
                  <p class="text-sm">Tất cả lịch hẹn hôm nay đã hoàn thành hoặc chưa có lịch mới!</p>
                </div>
              ` : upcomingToday.map(apt => `
                <div class="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-rose-50/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="flex items-start space-x-3">
                    <div class="w-12 h-12 rounded-xl bg-white border border-rose-100 text-rose-600 flex flex-col items-center justify-center font-bold shadow-2xs shrink-0">
                      <span class="text-xs text-slate-400 font-normal">GIỜ</span>
                      <span class="text-xs font-bold">${apt.time}</span>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h4 class="font-bold text-slate-800 text-sm">${apt.customerName}</h4>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${AppointmentsModule.getStatusBadgeClass(apt.status)}">
                          ${store.getStatusLabel(apt.status)}
                        </span>
                      </div>
                      <p class="text-xs text-slate-500 mt-0.5">${apt.serviceName} • <span class="text-rose-600 font-semibold">${store.formatCurrency(apt.price)}</span></p>
                      <div class="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                        <span>👩‍💼 KTV: ${apt.staffName}</span>
                        <span>🛋️ ${apt.room || 'Phòng chờ'} ${apt.bed ? `(${apt.bed})` : ''}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Thao tác nhanh -->
                  <div class="flex items-center gap-2 self-end sm:self-center">
                    <button 
                      onclick="AppointmentsModule.openDetailModal('${apt.id}')"
                      class="px-3 py-1.5 bg-white border border-slate-200 hover:border-rose-300 text-slate-700 text-xs font-medium rounded-lg shadow-2xs transition"
                    >
                      Chi tiết
                    </button>
                    ${apt.status === 'pending' || apt.status === 'confirmed' ? `
                      <button 
                        onclick="AppointmentsModule.quickUpdateStatus('${apt.id}', 'in_progress')"
                        class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition"
                      >
                        Bắt đầu
                      </button>
                    ` : apt.status === 'in_progress' ? `
                      <button 
                        onclick="AppointmentsModule.quickUpdateStatus('${apt.id}', 'completed')"
                        class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition"
                      >
                        Thu tiền
                      </button>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Cột Phải (1 phần): Biểu đồ Top Dịch Vụ & Thao tác nhanh -->
          <div class="space-y-6">
            <!-- Quick Actions Card -->
            <div class="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-5 rounded-2xl shadow-md space-y-4">
              <div>
                <h3 class="font-bold text-lg">Đặt Lịch Nhanh</h3>
                <p class="text-xs text-rose-100 mt-1">Thêm khách và xếp lịch hẹn chỉ trong 30 giây</p>
              </div>

              <div class="space-y-2">
                <button 
                  onclick="AppointmentsModule.openAddModal()"
                  class="w-full py-2.5 bg-white text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
                >
                  <i data-lucide="calendar-plus" class="w-4 h-4"></i> Tạo Lịch Hẹn Mới
                </button>
                <button 
                  onclick="CustomersModule.openAddModal()"
                  class="w-full py-2.5 bg-rose-700/50 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2"
                >
                  <i data-lucide="user-plus" class="w-4 h-4"></i> Thêm Hồ Sơ Khách
                </button>
              </div>
            </div>

            <!-- Chart Card: Tỉ lệ dịch vụ -->
            <div class="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm space-y-3">
              <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                <i data-lucide="pie-chart" class="w-4 h-4 text-rose-500"></i> Cơ Cấu Dịch Vụ
              </h3>
              <div class="relative h-48">
                <canvas id="serviceDoughnutChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart Section: Hiệu suất KTV & Doanh số -->
        <div class="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                <i data-lucide="bar-chart-3" class="w-4 h-4 text-rose-500"></i> Số Lượt Phục Vụ Của Kỹ Thuật Viên
              </h3>
              <p class="text-xs text-slate-400">Đánh giá phân bổ công việc đồng đều giữa các KTV</p>
            </div>
          </div>
          <div class="relative h-60">
            <canvas id="staffBarChart"></canvas>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    // Render charts
    setTimeout(() => {
      this.initCharts();
    }, 50);
  },

  initCharts() {
    if (typeof Chart === 'undefined') return;

    const store = window.spaStore;
    const appointments = store.getAppointments().filter(a => a.status !== 'cancelled');
    const staffList = store.getStaff();

    // 1. Doughnut Chart: Dịch vụ
    const srvCount = {};
    appointments.forEach(a => {
      const name = a.serviceName ? a.serviceName.split('(')[0].trim() : 'Khác';
      srvCount[name] = (srvCount[name] || 0) + 1;
    });

    const srvLabels = Object.keys(srvCount).slice(0, 5);
    const srvData = srvLabels.map(k => srvCount[k]);

    const ctx1 = document.getElementById('serviceDoughnutChart');
    if (ctx1) {
      if (this.serviceChartInstance) this.serviceChartInstance.destroy();
      this.serviceChartInstance = new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: srvLabels,
          datasets: [{
            data: srvData,
            backgroundColor: ['#f43f5e', '#ec4899', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 10, font: { size: 10 } }
            }
          }
        }
      });
    }

    // 2. Bar Chart: KTV
    const staffCounts = staffList.map(st => {
      return appointments.filter(a => a.staffId === st.id).length;
    });

    const ctx2 = document.getElementById('staffBarChart');
    if (ctx2) {
      if (this.staffChartInstance) this.staffChartInstance.destroy();
      this.staffChartInstance = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: staffList.map(s => s.name),
          datasets: [{
            label: 'Số lượt phục vụ',
            data: staffCounts,
            backgroundColor: '#fb7185',
            borderRadius: 8,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }
  }
};

window.DashboardModule = DashboardModule;
