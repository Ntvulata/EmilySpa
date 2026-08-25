/**
 * SPA EASE - Quản Lý Lịch Hẹn Spa
 * auth.js - Quản lý Đăng Nhập, Danh Sách Tài Khoản & Đổi Tên Đăng Nhập / Mật Khẩu
 */

const AUTH_STORAGE_KEYS = {
  CURRENT_USER: 'spa_current_user_v1',
  USERS_LIST: 'spa_users_list_v1'
};

// Danh sách tài khoản mẫu ban đầu
const DEFAULT_USERS = [
  {
    id: 'usr_admin',
    username: 'admin',
    password: '123',
    name: 'Chị Mai Hương (Chủ Spa)',
    role: 'admin', // 'admin' (Chủ Spa) | 'receptionist' (Lễ tân) | 'staff' (Kỹ thuật viên)
    roleName: '👑 Quản Lý / Chủ Spa',
    avatar: '👑'
  },
  {
    id: 'usr_letan',
    username: 'letan',
    password: '123',
    name: 'Thu Hà (Lễ Tân)',
    role: 'receptionist',
    roleName: '🌸 Lễ Tân Spa',
    avatar: '👩‍💼'
  },
  {
    id: 'usr_ktv',
    username: 'ktv',
    password: '123',
    name: 'Trần Thảo Linh (KTV)',
    role: 'staff',
    roleName: '💆‍♀️ Kỹ Thuật Viên',
    avatar: '💆‍♀️'
  }
];

const AuthModule = {
  editingUserId: null,

  init() {
    const list = this.getUsers();
    if (!localStorage.getItem(AUTH_STORAGE_KEYS.USERS_LIST)) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USERS_LIST, JSON.stringify(list));
    }
    this.checkAuthState();
  },

  getUsers() {
    try {
      const data = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.USERS_LIST));
      if (Array.isArray(data) && data.length > 0) {
        // Đảm bảo luôn có tài khoản admin
        if (!data.some(u => u.username && u.username.toLowerCase() === 'admin')) {
          data.unshift(DEFAULT_USERS[0]);
        }
        return data;
      }
      return DEFAULT_USERS;
    } catch (e) {
      return DEFAULT_USERS;
    }
  },

  saveUsers(list) {
    localStorage.setItem(AUTH_STORAGE_KEYS.USERS_LIST, JSON.stringify(list));
    window.FirebaseSync?.syncCollection('users', list);
  },

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER));
    } catch (e) {
      return null;
    }
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  },

  login(username, password) {
    username = String(username || '').trim().toLowerCase();
    password = String(password || '').trim();

    if (!username || !password) {
      window.app?.showToast('Vui lòng nhập tên đăng nhập và mật khẩu!', 'warning');
      return { success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu!' };
    }

    let users = this.getUsers();
    let user = users.find(u => u.username && u.username.toLowerCase() === username && String(u.password).trim() === password);

    // Fallback: Nếu không tìm thấy, kiểm tra trong DEFAULT_USERS
    if (!user) {
      const defaultMatch = DEFAULT_USERS.find(u => u.username.toLowerCase() === username && String(u.password).trim() === password);
      if (defaultMatch) {
        user = defaultMatch;
        if (!users.some(u => u.username.toLowerCase() === username)) {
          users.push(defaultMatch);
          this.saveUsers(users);
        }
      }
    }

    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      this.checkAuthState();
      if (window.app) {
        window.app.switchTab(window.app.currentTab || 'dashboard');
        window.app.updateLogoUI();
      }
      window.app?.showToast(`Chào mừng ${user.name} đăng nhập thành công!`, 'success');
      return { success: true };
    } else {
      window.app?.showToast('Sai tên đăng nhập hoặc mật khẩu! (Mặc định: admin / 123)', 'error');
      return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' };
    }
  },

  logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
      this.checkAuthState();
      window.app?.showToast('Đã đăng xuất khỏi hệ thống', 'info');
    }
  },

  checkAuthState() {
    const currentUser = this.getCurrentUser();
    const loginScreen = document.getElementById('login-screen');
    const appSidebar = document.getElementById('app-sidebar');
    const mainHeader = document.querySelector('header');
    const mainContent = document.querySelector('main');

    if (!currentUser) {
      // Chưa đăng nhập -> Hiện màn hình Login, ẩn app
      if (loginScreen) loginScreen.classList.remove('hidden');
      if (appSidebar) {
        appSidebar.classList.add('hidden');
        appSidebar.classList.remove('lg:static');
      }
      if (mainHeader) mainHeader.classList.add('hidden');
      if (mainContent) mainContent.classList.add('hidden');
    } else {
      // Đã đăng nhập -> Ẩn màn hình Login, hiện app
      if (loginScreen) loginScreen.classList.add('hidden');
      if (appSidebar) {
        appSidebar.classList.remove('hidden', 'lg:hidden');
        appSidebar.classList.add('lg:static');
      }
      if (mainHeader) mainHeader.classList.remove('hidden');
      if (mainContent) mainContent.classList.remove('hidden');

      this.updateUserUI(currentUser);
      if (window.app) {
        window.app.updateLogoUI();
      }
    }
  },

  updateUserUI(user) {
    // Cập nhật thông tin user trên Header & Sidebar
    const userNameEls = document.querySelectorAll('.auth-user-name');
    const userRoleEls = document.querySelectorAll('.auth-user-role');
    const userAvatarEls = document.querySelectorAll('.auth-user-avatar');

    userNameEls.forEach(el => el.textContent = user.name);
    userRoleEls.forEach(el => el.textContent = user.roleName || user.role);
    userAvatarEls.forEach(el => el.textContent = user.avatar || '👤');

    // Phân quyền hiển thị (Ẩn/Hiện nút nhạy cảm theo Role)
    const adminOnlyElements = document.querySelectorAll('.role-admin-only');
    adminOnlyElements.forEach(el => {
      if (user.role === 'admin') {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });
  },

  // Đổi mật khẩu nhanh cho tài khoản đang đăng nhập
  changePassword(oldPass, newPass) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, message: 'Chưa đăng nhập' };

    if (currentUser.password !== oldPass) {
      return { success: false, message: 'Mật khẩu cũ không chính xác!' };
    }

    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
      users[idx].password = newPass;
      currentUser.password = newPass;
      this.saveUsers(users);
      localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      return { success: true };
    }

    return { success: false, message: 'Lỗi cập nhật mật khẩu' };
  },

  // MODAL QUẢN LÝ / CHỈNH SỬA TÀI KHOẢN
  openAddUserModal() {
    if (!this.isAdmin()) {
      window.app?.showToast('⚠️ Chỉ Chủ Spa (Admin) mới có quyền tạo thêm tài khoản!', 'error');
      return;
    }

    this.editingUserId = null;
    const form = document.getElementById('user-modal-form');
    if (!form) return;

    document.getElementById('modal-user-title').textContent = 'Thêm Tài Khoản Đăng Nhập Mới';

    form.innerHTML = `
      <div class="space-y-4 text-sm">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Họ và Tên Người Dùng <span class="text-rose-500">*</span></label>
          <input type="text" id="usr-input-name" required placeholder="Ví dụ: Nguyễn Văn A (Quản lý)" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tên Đăng Nhập <span class="text-rose-500">*</span></label>
            <input type="text" id="usr-input-username" required placeholder="admin, letan1, ktv_mai..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm font-semibold text-rose-600" />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Mật Khẩu <span class="text-rose-500">*</span></label>
            <input type="text" id="usr-input-password" required placeholder="Nhập mật khẩu..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm font-semibold" />
          </div>
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Vai Trò & Quyền Hạn</label>
          <select id="usr-input-role" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm font-medium">
            <option value="admin">👑 Quản Lý / Chủ Spa (Toàn quyền)</option>
            <option value="receptionist">🌸 Lễ Tân Spa (Đặt lịch, quản lý khách - Không được xóa)</option>
            <option value="staff">💆‍♀️ Kỹ Thuật Viên (Xem lịch làm việc - Không được xóa)</option>
          </select>
        </div>
      </div>
    `;

    document.getElementById('user-modal').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  },

  openEditUserModal(userId) {
    const currentUser = this.getCurrentUser();
    if (!this.isAdmin() && currentUser?.id !== userId) {
      window.app?.showToast('⚠️ Bạn không có quyền chỉnh sửa tài khoản của người khác!', 'error');
      return;
    }

    this.editingUserId = userId;
    const form = document.getElementById('user-modal-form');
    if (!form) return;

    const user = this.getUsers().find(u => u.id === userId);
    if (!user) return;

    document.getElementById('modal-user-title').textContent = 'Thay Đổi Tên Đăng Nhập & Mật Khẩu';

    const isAdmin = this.isAdmin();

    form.innerHTML = `
      <div class="space-y-4 text-sm">
        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Họ và Tên Người Dùng <span class="text-rose-500">*</span></label>
          <input type="text" id="usr-input-name" required value="${user.name || ''}" placeholder="Ví dụ: Nguyễn Văn A" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tên Đăng Nhập <span class="text-rose-500">*</span></label>
            <input type="text" id="usr-input-username" required value="${user.username || ''}" placeholder="admin, letan1..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm font-semibold text-rose-600" />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Mật Khẩu <span class="text-rose-500">*</span></label>
            <input type="text" id="usr-input-password" required value="${user.password || ''}" placeholder="Nhập mật khẩu..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 text-sm font-semibold" />
          </div>
        </div>

        <div class="space-y-1 ${!isAdmin ? 'hidden' : ''}">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Vai Trò & Quyền Hạn</label>
          <select id="usr-input-role" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-sm font-medium">
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>👑 Quản Lý / Chủ Spa (Toàn quyền)</option>
            <option value="receptionist" ${user.role === 'receptionist' ? 'selected' : ''}>🌸 Lễ Tân Spa (Đặt lịch, quản lý khách - Không được xóa)</option>
            <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>💆‍♀️ Kỹ Thuật Viên (Xem lịch làm việc - Không được xóa)</option>
          </select>
        </div>
        ${!isAdmin ? `<input type="hidden" id="usr-input-role" value="${user.role}" />` : ''}
      </div>
    `;

    document.getElementById('user-modal').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  },

  saveUserModalForm(e) {
    e.preventDefault();
    const name = document.getElementById('usr-input-name').value.trim();
    const username = document.getElementById('usr-input-username').value.trim();
    const password = document.getElementById('usr-input-password').value.trim();
    const role = document.getElementById('usr-input-role').value;

    if (!name || !username || !password) {
      window.app.showToast('Vui lòng điền đầy đủ thông tin!', 'warning');
      return;
    }

    const roleNames = {
      admin: '👑 Quản Lý / Chủ Spa',
      receptionist: '🌸 Lễ Tân Spa',
      staff: '💆‍♀️ Kỹ Thuật Viên'
    };

    const avatars = {
      admin: '👑',
      receptionist: '👩‍💼',
      staff: '💆‍♀️'
    };

    const users = this.getUsers();

    // Kiểm tra trùng username (trừ chính user đang sửa)
    const duplicate = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.id !== this.editingUserId);
    if (duplicate) {
      window.app.showToast('Tên đăng nhập này đã tồn tại, vui lòng chọn tên khác!', 'error');
      return;
    }

    if (this.editingUserId) {
      const idx = users.findIndex(u => u.id === this.editingUserId);
      if (idx !== -1) {
        users[idx] = {
          ...users[idx],
          name,
          username,
          password,
          role,
          roleName: roleNames[role] || 'Nhân viên',
          avatar: avatars[role] || '👤'
        };
        this.saveUsers(users);

        // Cập nhật session nếu đang là user hiện tại
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === this.editingUserId) {
          localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(users[idx]));
          this.updateUserUI(users[idx]);
        }

        window.app.showToast(`Đã cập nhật tài khoản "${username}" thành công!`, 'success');
      }
    } else {
      const newUser = {
        id: 'usr_' + Date.now(),
        name,
        username,
        password,
        role,
        roleName: roleNames[role] || 'Nhân viên',
        avatar: avatars[role] || '👤'
      };
      users.push(newUser);
      this.saveUsers(users);
      window.app.showToast(`Thêm tài khoản "${username}" thành công!`, 'success');
    }

    this.closeUserModal();
    if (window.app) window.app.renderSettings();
  },

  closeUserModal() {
    document.getElementById('user-modal')?.classList.add('hidden');
    this.editingUserId = null;
  },

  deleteUser(userId) {
    if (!this.isAdmin()) {
      window.app?.showToast('⚠️ Chỉ tài khoản Chủ Spa (Admin) mới có quyền xóa tài khoản!', 'error');
      return;
    }

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      window.app.showToast('Không thể xóa tài khoản bạn đang đăng nhập!', 'warning');
      return;
    }

    const users = this.getUsers();
    if (users.length <= 1) {
      window.app.showToast('Hệ thống phải có ít nhất 1 tài khoản quản trị!', 'warning');
      return;
    }

    const userToDelete = users.find(u => u.id === userId);
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${userToDelete?.username}" (${userToDelete?.name}) không?`)) {
      const filtered = users.filter(u => u.id !== userId);
      this.saveUsers(filtered);
      window.app.showToast('Đã xóa tài khoản!', 'info');
      if (window.app) window.app.renderSettings();
    }
  }
};

window.AuthModule = AuthModule;
