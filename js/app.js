/**
 * SPA EASE - Quản Lý Lịch Hẹn Spa
 * app.js - Main Controller, Navigation router, Toast, Modals & Settings
 */

const app = {
  currentTab: 'dashboard',
  userSearchQuery: '',

  init() {
    if (window.AuthModule) window.AuthModule.init();
    this.bindGlobalEvents();
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);

    // Cập nhật Logo thương hiệu
    this.updateLogoUI();

    // Mặc định mở tab Dashboard
    this.switchTab('dashboard');
    this.renderSettings();
    if (window.FirebaseSync) window.FirebaseSync.updateStatusUI();
  },

  updateLogoUI() {
    const store = window.spaStore;
    if (!store) return;
    const settings = store.getSettings() || {};
    const logo = settings.spaLogo || 'sparkles';
    const spaName = settings.spaName || 'Glow & Relax';

    // Sidebar logo
    const sidebarLogo = document.getElementById('sidebar-spa-logo-wrapper');
    if (sidebarLogo) {
      if (logo.startsWith('data:image') || logo.startsWith('http')) {
        sidebarLogo.innerHTML = `<img src="${logo}" alt="Spa Logo" class="w-full h-full object-cover rounded-2xl" />`;
      } else if (['✨', '🌸', '🌺', '💆‍♀️', '👑', '🌿', '💎', '🍃', '🧴'].includes(logo)) {
        sidebarLogo.innerHTML = `<span class="text-2xl">${logo}</span>`;
      } else {
        sidebarLogo.innerHTML = `<i data-lucide="${logo || 'sparkles'}" class="w-6 h-6"></i>`;
      }
    }

    // Login screen logo
    const loginLogo = document.getElementById('login-spa-logo-wrapper');
    if (loginLogo) {
      if (logo.startsWith('data:image') || logo.startsWith('http')) {
        loginLogo.innerHTML = `<img src="${logo}" alt="Spa Logo" class="w-full h-full object-cover rounded-3xl" />`;
      } else if (['✨', '🌸', '🌺', '💆‍♀️', '👑', '🌿', '💎', '🍃', '🧴'].includes(logo)) {
        loginLogo.innerHTML = `<span class="text-3xl">${logo}</span>`;
      } else {
        loginLogo.innerHTML = `<i data-lucide="${logo || 'sparkles'}" class="w-8 h-8"></i>`;
      }
    }

    // Settings preview
    const settingsLogo = document.getElementById('settings-logo-preview');
    if (settingsLogo) {
      if (logo.startsWith('data:image') || logo.startsWith('http')) {
        settingsLogo.innerHTML = `<img src="${logo}" alt="Spa Logo" class="w-full h-full object-cover rounded-2xl" />`;
      } else if (['✨', '🌸', '🌺', '💆‍♀️', '👑', '🌿', '💎', '🍃', '🧴'].includes(logo)) {
        settingsLogo.innerHTML = `<span class="text-3xl">${logo}</span>`;
      } else {
        settingsLogo.innerHTML = `<i data-lucide="${logo || 'sparkles'}" class="w-8 h-8"></i>`;
      }
    }

    const sidebarNameEl = document.getElementById('sidebar-spa-name');
    if (sidebarNameEl) sidebarNameEl.textContent = spaName;
    const loginNameEl = document.getElementById('login-spa-name');
    if (loginNameEl) loginNameEl.textContent = spaName + ' Spa';

    if (window.lucide) lucide.createIcons();
  },

  openLogoUploadModal() {
    const modal = document.getElementById('logo-upload-modal');
    if (modal) {
      modal.classList.remove('hidden');
      const store = window.spaStore;
      const settings = store?.getSettings() || {};
      const preview = document.getElementById('modal-logo-preview');
      const logo = settings.spaLogo || 'sparkles';
      if (preview) {
        if (logo.startsWith('data:image') || logo.startsWith('http')) {
          preview.innerHTML = `<img src="${logo}" alt="Logo Preview" class="w-full h-full object-cover rounded-2xl" />`;
        } else if (['✨', '🌸', '🌺', '💆‍♀️', '👑', '🌿', '💎', '🍃', '🧴'].includes(logo)) {
          preview.innerHTML = `<span class="text-3xl">${logo}</span>`;
        } else {
          preview.innerHTML = `<i data-lucide="${logo || 'sparkles'}" class="w-8 h-8"></i>`;
        }
        if (window.lucide) lucide.createIcons();
      }
    }
  },

  closeLogoUploadModal() {
    document.getElementById('logo-upload-modal')?.classList.add('hidden');
  },

  handleLogoFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showToast('Vui lòng chọn file ảnh (PNG, JPG, SVG, WebP)!', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/png', 0.9);
        const store = window.spaStore;
        const settings = store.getSettings();
        settings.spaLogo = dataUrl;
        store.saveSettings(settings);

        this.updateLogoUI();
        this.openLogoUploadModal();
        if (this.currentTab === 'settings') this.renderSettings();
        this.showToast('Đã tải lên và cập nhật Logo Spa thành công!', 'success');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  setPresetLogo(preset) {
    const store = window.spaStore;
    const settings = store.getSettings();
    settings.spaLogo = preset;
    store.saveSettings(settings);

    this.updateLogoUI();
    this.openLogoUploadModal();
    if (this.currentTab === 'settings') this.renderSettings();
    this.showToast(`Đã đổi biểu tượng logo thành ${preset}!`, 'success');
  },

  setLogoFromUrl() {
    const url = document.getElementById('logo-url-input')?.value.trim();
    if (!url) {
      this.showToast('Vui lòng nhập đường dẫn URL hình ảnh!', 'warning');
      return;
    }
    const store = window.spaStore;
    const settings = store.getSettings();
    settings.spaLogo = url;
    store.saveSettings(settings);

    this.updateLogoUI();
    this.openLogoUploadModal();
    if (this.currentTab === 'settings') this.renderSettings();
    this.showToast('Đã lưu Logo từ đường dẫn URL!', 'success');
  },

  resetLogo() {
    const store = window.spaStore;
    const settings = store.getSettings();
    settings.spaLogo = 'sparkles';
    store.saveSettings(settings);

    this.updateLogoUI();
    this.openLogoUploadModal();
    if (this.currentTab === 'settings') this.renderSettings();
    this.showToast('Đã đặt lại Logo mặc định!', 'info');
  },

  bindGlobalEvents() {
    // Lắng nghe thay đổi trạng thái Cloud Firestore
    window.addEventListener('spa:syncStatusChanged', () => {
      if (window.FirebaseSync) window.FirebaseSync.updateStatusUI();
      if (this.currentTab === 'settings') this.renderSettings();
    });

    // Phím tắt Esc để đóng modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // Mobile sidebar toggle
    const toggleBtn = document.getElementById('mobile-sidebar-toggle');
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (toggleBtn && sidebar && overlay) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
      });

      overlay.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
      });
    }
  },

  updateClock() {
    const clockEl = document.getElementById('header-live-clock');
    if (clockEl) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      clockEl.textContent = timeStr;
    }
  },

  switchTab(tabName) {
    this.currentTab = tabName;

    // Ẩn tất cả view sections
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));

    // Hiện view được chọn
    const activeView = document.getElementById(`view-${tabName}`);
    if (activeView) activeView.classList.remove('hidden');

    // Cập nhật trạng thái active của menu items
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.tab === tabName) {
        link.classList.add('bg-rose-500', 'text-white', 'shadow-md');
        link.classList.remove('text-slate-600', 'hover:bg-rose-50');
      } else {
        link.classList.remove('bg-rose-500', 'text-white', 'shadow-md');
        link.classList.add('text-slate-600', 'hover:bg-rose-50');
      }
    });

    // Cập nhật tiêu đề trang
    const titles = {
      dashboard: { title: 'Tổng Quan & Thống Kê', desc: 'Theo dõi hiệu suất và lịch hẹn spa trong ngày' },
      appointments: { title: 'Quản Lý Lịch Hẹn', desc: 'Xem timeline KTV, lịch tuần và phân bổ khách hàng' },
      customers: { title: 'Khách Hàng (CRM)', desc: 'Danh bạ, phân loại thành viên VIP & lịch sử điều trị' },
      services: { title: 'Bảng Giá & Nhân Viên', desc: 'Quản lý menu dịch vụ, kỹ thuật viên và phòng/giường spa' },
      reports: { title: 'Báo Cáo Doanh Thu & Dịch Vụ', desc: 'Báo cáo chi tiết các dịch vụ đã hoàn thành, lọc theo ngày/KTV, in báo cáo & xuất Excel' },
      settings: { title: 'Cài Đặt & Sao Lưu Dữ Liệu', desc: 'Thông tin spa, xuất nhập file JSON và quản lý tài khoản' }
    };

    const headerTitle = document.getElementById('page-header-title');
    const headerDesc = document.getElementById('page-header-desc');
    if (headerTitle && titles[tabName]) headerTitle.textContent = titles[tabName].title;
    if (headerDesc && titles[tabName]) headerDesc.textContent = titles[tabName].desc;

    // Tự động render view tương ứng
    if (tabName === 'dashboard' && window.DashboardModule) window.DashboardModule.render();
    if (tabName === 'appointments' && window.AppointmentsModule) window.AppointmentsModule.render();
    if (tabName === 'customers' && window.CustomersModule) window.CustomersModule.render();
    if (tabName === 'services' && window.ServicesModule) window.ServicesModule.render();
    if (tabName === 'reports' && window.ReportsModule) window.ReportsModule.render();
    if (tabName === 'settings') this.renderSettings();

    // Ẩn sidebar trên mobile sau khi click menu
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (window.innerWidth < 1024 && sidebar && !sidebar.classList.contains('-translate-x-full')) {
      sidebar.classList.add('-translate-x-full');
      overlay?.classList.add('hidden');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => modal.classList.add('hidden'));
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `p-4 rounded-xl shadow-lg border text-sm font-medium flex items-center space-x-3 transition-all duration-300 transform translate-y-2 opacity-0 toast-${type}`;

    let icon = 'info';
    let bgClass = 'bg-slate-900 text-white border-slate-700';

    if (type === 'success') {
      icon = 'check-circle';
      bgClass = 'bg-emerald-600 text-white border-emerald-500';
    } else if (type === 'warning') {
      icon = 'alert-triangle';
      bgClass = 'bg-amber-500 text-white border-amber-400';
    } else if (type === 'error') {
      icon = 'x-circle';
      bgClass = 'bg-rose-600 text-white border-rose-500';
    }

    toast.className += ` ${bgClass}`;
    toast.innerHTML = `
      <i data-lucide="${icon}" class="w-5 h-5 shrink-0"></i>
      <span class="flex-1">${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    // Fade in
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    // Auto remove after 3s
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  // CÀI ĐẶT & BACKUP
  renderSettings() {
    const container = document.getElementById('settings-view-content');
    if (!container) return;

    const store = window.spaStore;
    const settings = store.getSettings();
    const logo = settings.spaLogo || 'sparkles';

    container.innerHTML = `
      <div class="max-w-4xl space-y-6">
        <!-- 1. Logo & Nhận Diện Thương Hiệu Spa -->
        <div class="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-rose-100 pb-3 flex-wrap gap-2">
            <div class="flex items-center space-x-3">
              <span class="p-2 bg-rose-100 text-rose-600 rounded-xl">
                <i data-lucide="image" class="w-5 h-5"></i>
              </span>
              <div>
                <h3 class="font-bold text-slate-800">Logo & Nhận Diện Thương Hiệu Spa</h3>
                <p class="text-xs text-slate-400">Hiển thị ở góc trên bên trái, màn hình đăng nhập, báo cáo & hóa đơn</p>
              </div>
            </div>
            <button 
              onclick="app.openLogoUploadModal()" 
              class="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
            >
              <i data-lucide="edit-3" class="w-4 h-4"></i> Đổi Logo Spa
            </button>
          </div>

          <div class="flex items-center gap-5 p-4 bg-rose-50/40 rounded-2xl border border-rose-100">
            <div id="settings-logo-preview" class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-400 text-white flex items-center justify-center text-3xl shadow-md shadow-rose-500/20 overflow-hidden flex-shrink-0">
              <i data-lucide="sparkles" class="w-8 h-8"></i>
            </div>
            <div class="space-y-1">
              <div class="font-bold text-slate-800 text-sm">${settings.spaName || 'Glow & Relax Spa'}</div>
              <p class="text-xs text-slate-500">Bấm nút <strong>"Đổi Logo Spa"</strong> hoặc click trực tiếp vào logo góc trái để tải ảnh từ máy tính hoặc chọn biểu tượng phong cách.</p>
            </div>
          </div>
        </div>

        <!-- 2. Thông tin Spa -->
        <div class="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
          <div class="flex items-center space-x-3 border-b border-rose-100 pb-3">
            <span class="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <i data-lucide="store" class="w-5 h-5"></i>
            </span>
            <div>
              <h3 class="font-bold text-slate-800">Thông Tin Spa & Cơ Sở</h3>
              <p class="text-xs text-slate-400">Hiển thị trên hóa đơn và thông tin liên hệ</p>
            </div>
          </div>

          <form onsubmit="app.saveSpaSettings(event)" class="space-y-4 text-sm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700 uppercase">Tên Cơ Sở Spa</label>
                <input type="text" id="setting-spa-name" value="${settings.spaName || ''}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm" />
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700 uppercase">Hotline / Số Điện Thoại</label>
                <input type="tel" id="setting-spa-phone" value="${settings.spaPhone || ''}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm" />
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-bold text-slate-700 uppercase">Địa Chỉ Spa</label>
              <input type="text" id="setting-spa-address" value="${settings.spaAddress || ''}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700 uppercase">Giờ Mở Cửa</label>
                <input type="time" id="setting-open-time" value="${settings.openTime || '08:30'}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm" />
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700 uppercase">Giờ Đóng Cửa</label>
                <input type="time" id="setting-close-time" value="${settings.closeTime || '21:00'}" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm" />
              </div>
            </div>

            <div class="pt-2">
              <button type="submit" class="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-xs shadow-xs transition">
                Lưu Thay Đổi Thông Tin
              </button>
            </div>
          </form>
        </div>

        <!-- Sao lưu & Phục hồi dữ liệu -->
        <div class="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
          <div class="flex items-center space-x-3 border-b border-rose-100 pb-3">
            <span class="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <i data-lucide="database" class="w-5 h-5"></i>
            </span>
            <div>
              <h3 class="font-bold text-slate-800">Sao Lưu & Khôi Phục Dữ Liệu</h3>
              <p class="text-xs text-slate-400">Xuất file để chuyển sang máy tính khác hoặc lưu dự phòng</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <!-- Backup JSON -->
            <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div class="font-bold text-slate-700 text-sm">📦 Xuất file sao lưu (JSON)</div>
              <p class="text-slate-500">Tải về toàn bộ danh sách lịch hẹn, khách hàng, dịch vụ và nhân viên.</p>
              <button 
                onclick="window.spaStore.exportAllDataJSON(); window.app.showToast('Đã tải xuống file sao lưu!', 'success');"
                class="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <i data-lucide="download" class="w-4 h-4"></i> Tải Về File Sao Lưu (.JSON)
              </button>
            </div>

            <!-- Restore JSON -->
            <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div class="font-bold text-slate-700 text-sm">📥 Khôi phục từ file (JSON)</div>
              <p class="text-slate-500">Nhập dữ liệu đã sao lưu trước đó từ máy tính của bạn.</p>
              <input type="file" id="import-file-input" accept=".json" class="hidden" onchange="app.handleImportFile(event)" />
              <button 
                onclick="document.getElementById('import-file-input').click()"
                class="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <i data-lucide="upload" class="w-4 h-4"></i> Chọn File Khôi Phục...
              </button>
            </div>

            <!-- Export CSV -->
            <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div class="font-bold text-slate-700 text-sm">📊 Xuất báo cáo Excel / CSV</div>
              <p class="text-slate-500">Xuất danh sách lịch hẹn để mở trên Microsoft Excel hoặc Google Sheets.</p>
              <button 
                onclick="window.spaStore.exportAppointmentsCSV(); window.app.showToast('Đã xuất file Excel / CSV!', 'success');"
                class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Xuất Danh Sách Ra Excel (.CSV)
              </button>
            </div>
          </div>
        </div>

        <!-- Đồng Bộ Dữ Liệu Đám Mây (Google Firebase Cloud Sync - Nhiều máy & điện thoại dùng chung) -->
        <div class="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-rose-100 pb-3 flex-wrap gap-2">
            <div class="flex items-center space-x-3">
              <span class="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <i data-lucide="cloud" class="w-5 h-5"></i>
              </span>
              <div>
                <h3 class="font-bold text-slate-800 flex items-center gap-2">
                  Đồng Bộ Dữ Liệu Đám Mây (Google Cloud / Firebase)
                  ${window.FirebaseSync?.isInitialized ? `
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Đang Online (Nhiều máy dùng chung)
                    </span>
                  ` : `
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      ⚪ Chế độ cục bộ (1 máy / Offline)
                    </span>
                  `}
                </h3>
                <p class="text-xs text-slate-400">Giúp Điện thoại Chủ Spa, Máy tính Lễ tân, Tablet KTV xem và cập nhật chung 1 cơ sở dữ liệu thời gian thực (Realtime)</p>
              </div>
            </div>
          </div>

          <div class="space-y-3 text-xs">
            ${window.FirebaseSync?.isInitialized ? `
              <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                <div class="text-emerald-900 font-semibold flex items-center gap-1.5">
                  <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
                  Hệ thống đã kết nối thành công với Google Cloud Database!
                </div>
                <p class="text-slate-600">Mọi lịch hẹn, đơn bán gói và khách hàng bạn tạo trên máy này sẽ tự động hiển thị ngay trên điện thoại hoặc máy tính khác.</p>
                <div class="flex flex-wrap gap-2 pt-1">
                  <button 
                    onclick="app.handlePushToCloud()" 
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                  >
                    <i data-lucide="upload-cloud" class="w-4 h-4"></i> Đẩy toàn bộ dữ liệu máy này lên Cloud
                  </button>
                  <button 
                    onclick="app.handlePullFromCloud()" 
                    class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                  >
                    <i data-lucide="download-cloud" class="w-4 h-4"></i> Tải lại dữ liệu từ Cloud về máy này
                  </button>
                  <button 
                    onclick="app.handleDisconnectFirebase()" 
                    class="px-3 py-2 bg-white border border-slate-200 text-red-500 hover:bg-red-50 rounded-xl font-semibold transition"
                  >
                    Ngắt kết nối Cloud
                  </button>
                </div>
              </div>
            ` : `
              <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <p class="text-slate-600">
                  Dán đoạn mã <code>firebaseConfig</code> từ tài khoản Google Firebase của bạn vào đây để kích hoạt tính năng đồng bộ đa thiết bị miễn phí:
                </p>
                <textarea 
                  id="firebase-config-input" 
                  rows="4" 
                  placeholder='{"apiKey": "AIzaSy...", "authDomain": "...", "projectId": "...", "storageBucket": "...", "messagingSenderId": "...", "appId": "..."}'
                  class="w-full p-3 font-mono text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 text-slate-800"
                ></textarea>
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <button 
                    onclick="app.handleSaveFirebaseConfig()" 
                    class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                  >
                    <i data-lucide="link-2" class="w-4 h-4"></i> Kết Nối & Đồng Bộ Cloud Ngay
                  </button>
                  <span class="text-slate-400 text-[11px]">✨ Hoàn toàn miễn phí bởi Google Cloud</span>
                </div>
              </div>
            `}
          </div>
        </div>

        ${window.AuthModule?.isAdmin() ? `
          <!-- Quản lý tài khoản đăng nhập & Mật khẩu (Chỉ Admin) -->
          <div class="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-rose-100 pb-3 flex-wrap gap-2">
              <div class="flex items-center space-x-3">
                <span class="p-2 bg-rose-100 text-rose-600 rounded-lg">
                  <i data-lucide="users" class="w-5 h-5"></i>
                </span>
                <div>
                  <h3 class="font-bold text-slate-800">Quản Lý Tài Khoản & Mật Khẩu Đăng Nhập</h3>
                  <p class="text-xs text-slate-400">Thay đổi tên đăng nhập, mật khẩu và thêm tài khoản cho nhân viên</p>
                </div>
              </div>

              <button 
                onclick="AuthModule.openAddUserModal()"
                class="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <i data-lucide="user-plus" class="w-4 h-4"></i> Thêm Tài Khoản Mới
              </button>
            </div>

            <!-- Tìm kiếm tài khoản -->
            <div class="relative max-w-sm">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
              <input 
                type="text" 
                id="usr-search-input"
                placeholder="Tìm kiếm tài khoản theo tên, tên đăng nhập, vai trò..." 
                value="${this.userSearchQuery}"
                oninput="app.filterUserAccounts(this.value)"
                class="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs"
              />
            </div>

            <!-- Danh sách các tài khoản trong hệ thống -->
            <div id="setting-user-list-grid" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            </div>
          </div>
        ` : ''}
        
        <!-- Đổi mật khẩu nhanh cho tài khoản đang online -->
        <div class="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
          <div class="flex items-center space-x-3 border-b border-rose-100 pb-3">
            <span class="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <i data-lucide="key-round" class="w-5 h-5"></i>
            </span>
            <div>
              <h3 class="font-bold text-slate-800">Đổi Mật Khẩu Nhanh (Tài Khoản Hiện Tại)</h3>
              <p class="text-xs text-slate-400">Đang đăng nhập: <strong class="text-rose-600">${window.AuthModule?.getCurrentUser()?.name || 'Admin'}</strong> (${window.AuthModule?.getCurrentUser()?.username})</p>
            </div>
          </div>

          <form onsubmit="app.handleChangePassword(event)" class="space-y-4 text-sm max-w-md">
            <div class="space-y-1">
              <label class="block text-xs font-bold text-slate-700 uppercase">Mật Khẩu Cũ</label>
              <input type="password" id="pwd-old" required placeholder="Nhập mật khẩu hiện tại" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm" />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-bold text-slate-700 uppercase">Mật Khẩu Mới</label>
              <input type="password" id="pwd-new" required placeholder="Nhập mật khẩu mới muốn đổi" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm" />
            </div>

            <button type="submit" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs transition">
              Cập Nhật Mật Khẩu
            </button>
          </form>
        </div>
      </div>
    `;

    this.renderUserListOnly();
    this.updateLogoUI();
    if (window.lucide) lucide.createIcons();
  },

  filterUserAccounts(q) {
    this.userSearchQuery = q;
    this.renderUserListOnly();
  },

  renderUserListOnly() {
    const grid = document.getElementById('setting-user-list-grid');
    if (!grid) return;

    let users = window.AuthModule ? window.AuthModule.getUsers() : [];
    if (this.userSearchQuery) {
      const q = this.userSearchQuery.toLowerCase().trim();
      users = users.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.roleName && u.roleName.toLowerCase().includes(q))
      );
    }

    if (users.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-8 text-center text-slate-400 text-xs">Không tìm thấy tài khoản nào khớp</div>`;
      return;
    }

    grid.innerHTML = users.map(u => `
      <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-rose-50/20 transition flex flex-col justify-between space-y-3">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-2xl">${u.avatar || '👤'}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-600 border border-slate-200">${u.roleName || u.role}</span>
          </div>
          <div class="mt-2 font-bold text-slate-800 text-sm truncate">${u.name}</div>
          
          <div class="mt-2 space-y-1 text-xs bg-white p-2.5 rounded-xl border border-slate-100">
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Tên đăng nhập:</span>
              <strong class="text-rose-600 font-mono">${u.username}</strong>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Mật khẩu:</span>
              <span class="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">${u.password}</span>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
          <button 
            onclick="AuthModule.openEditUserModal('${u.id}')"
            class="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-600 rounded-lg font-semibold transition flex items-center gap-1"
          >
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Đổi Đăng Nhập / Pass
          </button>
          ${(window.AuthModule && window.AuthModule.getCurrentUser()?.id !== u.id && window.AuthModule.getUsers().length > 1) ? `
            <button 
              onclick="AuthModule.deleteUser('${u.id}')"
              title="Xóa tài khoản này (Chỉ Admin)"
              class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  },

  handleChangePassword(e) {
    e.preventDefault();
    const oldPass = document.getElementById('pwd-old').value;
    const newPass = document.getElementById('pwd-new').value;

    const res = window.AuthModule.changePassword(oldPass, newPass);
    if (res.success) {
      this.showToast('Đổi mật khẩu thành công!', 'success');
      document.getElementById('pwd-old').value = '';
      document.getElementById('pwd-new').value = '';
      this.renderSettings();
    } else {
      this.showToast(res.message, 'error');
    }
  },

  saveSpaSettings(e) {
    e.preventDefault();
    const current = window.spaStore.getSettings() || {};
    const data = {
      ...current,
      spaName: document.getElementById('setting-spa-name').value.trim(),
      spaPhone: document.getElementById('setting-spa-phone').value.trim(),
      spaAddress: document.getElementById('setting-spa-address').value.trim(),
      openTime: document.getElementById('setting-open-time').value,
      closeTime: document.getElementById('setting-close-time').value,
      currency: 'VND'
    };

    window.spaStore.saveSettings(data);
    this.updateLogoUI();
    this.showToast('Đã lưu thông tin Spa thành công!', 'success');
  },

  handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const res = window.spaStore.importAllDataJSON(e.target.result);
      if (res.success) {
        this.showToast('Khôi phục dữ liệu thành công!', 'success');
        this.switchTab('dashboard');
      } else {
        this.showToast('Lỗi nạp file: ' + res.error, 'error');
      }
    };
    reader.readAsText(file);
  },

  handleSaveFirebaseConfig() {
    const raw = document.getElementById('firebase-config-input')?.value.trim();
    if (!raw) {
      this.showToast('Vui lòng dán đoạn mã firebaseConfig!', 'warning');
      return;
    }

    try {
      let config;
      if (raw.startsWith('{')) {
        config = JSON.parse(raw);
      } else {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const cleaned = jsonMatch[0]
            .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":')
            .replace(/'/g, '"');
          config = JSON.parse(cleaned);
        } else {
          throw new Error('Định dạng không hợp lệ');
        }
      }

      if (!config.apiKey || !config.projectId) {
        throw new Error('Thiếu apiKey hoặc projectId trong cấu hình');
      }

      const ok = window.FirebaseSync.connect(config);
      if (ok) {
        this.showToast('Kết nối Google Cloud Firebase thành công! Đang đồng bộ...', 'success');
        window.FirebaseSync.pushAllToCloud();
        this.renderSettings();
      } else {
        this.showToast('Lỗi kết nối Firebase, vui lòng kiểm tra lại cấu hình!', 'error');
      }
    } catch (e) {
      this.showToast('Mã cấu hình không hợp lệ: ' + e.message, 'error');
    }
  },

  async handlePushToCloud() {
    this.showToast('Đang đẩy dữ liệu lên Cloud...', 'info');
    const res = await window.FirebaseSync.pushAllToCloud();
    if (res.success) {
      this.showToast('Đã đẩy toàn bộ dữ liệu lên Google Cloud thành công!', 'success');
    } else {
      this.showToast('Lỗi đẩy dữ liệu: ' + res.message, 'error');
    }
  },

  async handlePullFromCloud() {
    if (confirm('Tải dữ liệu từ Cloud sẽ cập nhật toàn bộ dữ liệu trên máy này. Bạn có muốn tiếp tục?')) {
      this.showToast('Đang tải dữ liệu từ Cloud về...', 'info');
      const res = await window.FirebaseSync.pullAllFromCloud();
      if (res.success) {
        this.showToast('Đã đồng bộ toàn bộ dữ liệu từ Cloud về máy này thành công!', 'success');
        this.switchTab('dashboard');
      } else {
        this.showToast('Lỗi tải dữ liệu: ' + res.message, 'error');
      }
    }
  },

  handleDisconnectFirebase() {
    if (confirm('Bạn có chắc muốn ngắt kết nối Cloud không? Ứng dụng sẽ quay về chế độ lưu dữ liệu cục bộ trên máy này.')) {
      window.FirebaseSync.removeConfig();
      this.showToast('Đã ngắt kết nối Cloud!', 'info');
      this.renderSettings();
    }
  },

  resetDataToDefault() {
    if (confirm('Bạn có chắc muốn nạp lại bộ dữ liệu mẫu mặc định không? Dữ liệu hiện tại sẽ được thay thế.')) {
      window.spaStore.resetToDefault();
      this.showToast('Đã nạp lại dữ liệu mẫu!', 'success');
      this.switchTab('dashboard');
    }
  }
};

window.app = app;

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
