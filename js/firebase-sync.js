/**
 * SPA EASE - Firebase Cloud Sync Module
 * Tự động đồng bộ dữ liệu đa thiết bị (Máy tính, Điện thoại, Tablet) qua Google Cloud Firestore
 * Project: emilyspa-259e4
 */

const FIREBASE_STORAGE_KEY = 'spa_firebase_config_v1';

// Cấu hình Firebase Firestore của Emily Spa
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyArDrV-J307U3nUJGbZZzMivkDyqfrHx3w",
  authDomain: "emilyspa-259e4.firebaseapp.com",
  projectId: "emilyspa-259e4",
  storageBucket: "emilyspa-259e4.firebasestorage.app",
  messagingSenderId: "1093330219306",
  appId: "1:1093330219306:web:d46bf43cc5d7f26c67ee53",
  measurementId: "G-6NM5F412KH"
};

const FirebaseSync = {
  db: null,
  isInitialized: false,
  unsubscribers: [],
  syncStatus: 'offline', // 'connected' | 'connecting' | 'error' | 'offline'

  init() {
    const config = this.getConfig() || DEFAULT_FIREBASE_CONFIG;
    if (config && config.apiKey && config.projectId) {
      this.connect(config);
    }
  },

  getConfig() {
    try {
      return JSON.parse(localStorage.getItem(FIREBASE_STORAGE_KEY)) || DEFAULT_FIREBASE_CONFIG;
    } catch (e) {
      return DEFAULT_FIREBASE_CONFIG;
    }
  },

  saveConfig(config) {
    localStorage.setItem(FIREBASE_STORAGE_KEY, JSON.stringify(config));
  },

  removeConfig() {
    localStorage.removeItem(FIREBASE_STORAGE_KEY);
    this.db = null;
    this.isInitialized = false;
    this.setStatus('offline');
    this.unsubscribeAll();
  },

  setStatus(status) {
    this.syncStatus = status;
    this.updateStatusUI();
    try {
      window.dispatchEvent(new CustomEvent('spa:syncStatusChanged', { detail: { status } }));
    } catch (e) {}
  },

  updateStatusUI() {
    const headerStatusBadge = document.getElementById('header-cloud-status');
    if (headerStatusBadge) {
      if (this.syncStatus === 'connected') {
        headerStatusBadge.className = 'hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs font-semibold text-emerald-700 shadow-2xs';
        headerStatusBadge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-[11px] font-bold">Firestore Online</span>
        `;
      } else if (this.syncStatus === 'connecting') {
        headerStatusBadge.className = 'hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/80 rounded-xl text-xs font-semibold text-amber-700';
        headerStatusBadge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span class="text-[11px] font-bold">Đang kết nối Cloud...</span>
        `;
      } else if (this.syncStatus === 'error') {
        headerStatusBadge.className = 'hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200/80 rounded-xl text-xs font-semibold text-rose-700';
        headerStatusBadge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-rose-500"></span>
          <span class="text-[11px] font-bold">Lỗi kết nối Cloud</span>
        `;
      } else {
        headerStatusBadge.className = 'hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500';
        headerStatusBadge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-slate-400"></span>
          <span class="text-[11px] font-bold">Lưu Offline</span>
        `;
      }
    }
  },

  connect(config) {
    try {
      if (!window.firebase) {
        console.warn('Firebase SDK chưa được tải.');
        this.setStatus('offline');
        return false;
      }

      this.setStatus('connecting');

      // Khởi tạo app firebase nếu chưa có
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
      this.db = firebase.firestore();
      
      // Kích hoạt offline persistence nếu trình duyệt hỗ trợ
      try {
        this.db.enablePersistence({ synchronizeTabs: true }).catch(err => {
          console.log('Persistence note:', err.code);
        });
      } catch (e) {}

      this.isInitialized = true;
      this.setStatus('connected');
      this.saveConfig(config);

      // Bắt đầu lắng nghe dữ liệu Realtime từ Cloud
      this.startRealtimeListeners();
      
      // Kiểm tra lần đầu nếu Cloud rỗng thì đẩy dữ liệu local lên, nếu Cloud có dữ liệu thì nạp về
      this.initialCheckAndSync();

      return true;
    } catch (error) {
      console.error('Lỗi kết nối Firebase:', error);
      this.setStatus('error');
      return false;
    }
  },

  unsubscribeAll() {
    this.unsubscribers.forEach(unsub => typeof unsub === 'function' && unsub());
    this.unsubscribers = [];
  },

  startRealtimeListeners() {
    if (!this.db) return;
    this.unsubscribeAll();

    const collections = [
      {
        name: 'appointments',
        key: 'spa_appointments_v1',
        reRender: () => {
          window.AppointmentsModule?.render();
          window.DashboardModule?.render();
          window.ReportsModule?.render();
        }
      },
      {
        name: 'customers',
        key: 'spa_customers_v1',
        reRender: () => {
          window.CustomersModule?.render();
          window.ReportsModule?.render();
          window.DashboardModule?.render();
        }
      },
      {
        name: 'services',
        key: 'spa_services_v1',
        reRender: () => {
          window.ServicesModule?.render();
        }
      },
      {
        name: 'staff',
        key: 'spa_staff_v1',
        reRender: () => {
          window.ServicesModule?.render();
          window.AppointmentsModule?.render();
        }
      },
      {
        name: 'rooms',
        key: 'spa_rooms_v1',
        reRender: () => {
          window.ServicesModule?.render();
          window.AppointmentsModule?.render();
        }
      },
      {
        name: 'package_orders',
        key: 'spa_package_orders_v1',
        reRender: () => {
          window.ReportsModule?.render();
          window.CustomersModule?.render();
          window.DashboardModule?.render();
        }
      },
      {
        name: 'packages',
        key: 'spa_packages_v1',
        reRender: () => {
          window.ServicesModule?.render();
        }
      },
      {
        name: 'users',
        key: 'spa_users_list_v1',
        reRender: () => {
          if (window.AuthModule) {
            const currentUser = window.AuthModule.getCurrentUser();
            if (currentUser) {
              const users = window.AuthModule.getUsers();
              const updated = users.find(u => u.id === currentUser.id);
              if (updated) {
                localStorage.setItem('spa_current_user_v1', JSON.stringify(updated));
                window.AuthModule.updateUserUI(updated);
              }
            }
          }
          window.app?.renderSettings();
        }
      },
      {
        name: 'settings',
        key: 'spa_settings_v1',
        reRender: () => {
          const settings = window.spaStore?.getSettings() || {};
          const spaNameEl = document.getElementById('sidebar-spa-name');
          if (spaNameEl && settings.spaName) spaNameEl.textContent = settings.spaName;
          window.app?.renderSettings();
        }
      }
    ];

    collections.forEach(col => {
      try {
        const unsub = this.db.collection('spa_data').doc(col.name).onSnapshot(doc => {
          if (doc.exists) {
            const data = doc.data();
            if (data && data.items !== undefined) {
              if (col.name === 'users' && (!Array.isArray(data.items) || data.items.length === 0)) {
                return;
              }
              const currentLocal = localStorage.getItem(col.key);
              const incoming = JSON.stringify(data.items);
              if (currentLocal !== incoming) {
                localStorage.setItem(col.key, incoming);
                col.reRender();
              }
            }
          }
        }, err => {
          console.warn(`Lỗi lắng nghe Firestore [${col.name}]:`, err);
        });
        this.unsubscribers.push(unsub);
      } catch (e) {
        console.warn(`Lỗi kết nối collection [${col.name}]:`, e);
      }
    });
  },

  async initialCheckAndSync() {
    if (!this.db) return;
    try {
      const doc = await this.db.collection('spa_data').doc('appointments').get();
      if (!doc.exists) {
        // Cloud chưa có dữ liệu -> Đẩy dữ liệu hiện tại lên Cloud
        await this.pushAllToCloud();
      }
    } catch (e) {
      console.warn('Initial sync check:', e);
    }
  },

  // Đẩy toàn bộ dữ liệu từ máy này lên Cloud
  async pushAllToCloud() {
    if (!this.db) return { success: false, message: 'Chưa kết nối Firebase' };

    const store = window.spaStore;
    try {
      const batch = this.db.batch();

      const collections = [
        { name: 'appointments', items: store.getAppointments() },
        { name: 'customers', items: store.getCustomers() },
        { name: 'services', items: store.getServices() },
        { name: 'staff', items: store.getStaff() },
        { name: 'rooms', items: store.getRooms() },
        { name: 'package_orders', items: store.getPackageOrders() },
        { name: 'packages', items: store.getPackageTemplates() },
        { name: 'users', items: window.AuthModule ? window.AuthModule.getUsers() : [] },
        { name: 'settings', items: store.getSettings() }
      ];

      collections.forEach(c => {
        const ref = this.db.collection('spa_data').doc(c.name);
        batch.set(ref, { items: c.items, updatedAt: new Date().toISOString() });
      });

      await batch.commit();
      return { success: true };
    } catch (e) {
      console.error('Lỗi đẩy dữ liệu lên Firebase:', e);
      return { success: false, message: e.message };
    }
  },

  // Kéo toàn bộ dữ liệu từ Cloud về máy này
  async pullAllFromCloud() {
    if (!this.db) return { success: false, message: 'Chưa kết nối Firebase' };

    try {
      const snapshot = await this.db.collection('spa_data').get();
      if (snapshot.empty) {
        return { success: false, message: 'Chưa có dữ liệu nào trên Cloud!' };
      }

      snapshot.forEach(doc => {
        const name = doc.id;
        const data = doc.data();
        if (data && data.items !== undefined) {
          if (name === 'appointments') localStorage.setItem('spa_appointments_v1', JSON.stringify(data.items));
          if (name === 'customers') localStorage.setItem('spa_customers_v1', JSON.stringify(data.items));
          if (name === 'services') localStorage.setItem('spa_services_v1', JSON.stringify(data.items));
          if (name === 'staff') localStorage.setItem('spa_staff_v1', JSON.stringify(data.items));
          if (name === 'rooms') localStorage.setItem('spa_rooms_v1', JSON.stringify(data.items));
          if (name === 'package_orders') localStorage.setItem('spa_package_orders_v1', JSON.stringify(data.items));
          if (name === 'packages') localStorage.setItem('spa_packages_v1', JSON.stringify(data.items));
          if (name === 'users') localStorage.setItem('spa_users_list_v1', JSON.stringify(data.items));
          if (name === 'settings') localStorage.setItem('spa_settings_v1', JSON.stringify(data.items));
        }
      });

      if (window.app) window.app.switchTab(window.app.currentTab || 'dashboard');
      return { success: true };
    } catch (e) {
      console.error('Lỗi kéo dữ liệu:', e);
      return { success: false, message: e.message };
    }
  },

  // Đồng bộ nhanh 1 collection lên Cloud khi có thay đổi
  syncCollection(collectionName, items) {
    if (!this.db || !this.isInitialized) return;
    try {
      this.db.collection('spa_data').doc(collectionName).set({
        items: items,
        updatedAt: new Date().toISOString()
      }).catch(err => console.warn(`Lỗi sync [${collectionName}]:`, err));
    } catch (e) {
      console.warn('Lỗi ghi Cloud:', e);
    }
  }
};

window.FirebaseSync = FirebaseSync;
