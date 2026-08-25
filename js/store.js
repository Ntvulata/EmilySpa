/**
 * SPA EASE - Quản Lý Lịch Hẹn Spa
 * store.js - Quản lý State, LocalStorage, Dữ liệu mẫu (Seed Data) & Backup/Restore
 */

const STORAGE_KEYS = {
  APPOINTMENTS: 'spa_appointments_v1',
  CUSTOMERS: 'spa_customers_v1',
  SERVICES: 'spa_services_v1',
  STAFF: 'spa_staff_v1',
  ROOMS: 'spa_rooms_v1',
  PACKAGE_ORDERS: 'spa_package_orders_v1',
  PACKAGES: 'spa_packages_v1',
  SETTINGS: 'spa_settings_v1',
  INITIALIZED: 'spa_initialized_v1'
};

// Dữ liệu mẫu ban đầu (Seed Data phong phú, thực tế)
const SEED_DATA = {
  packageTemplates: [
    { id: 'pkg_1', name: 'Gói 10 Buổi Trị Mụn Chuẩn Y Khoa & Chiếu Ánh Sáng', type: 'sessions', sessions: 10, price: 4800000, description: 'Gói theo số lượt: 10 buổi lấy nhân mụn chuẩn y khoa 90p/buổi' },
    { id: 'pkg_2', name: 'Combo 5 Buổi Massage Body Tinh Dầu & Đá Nóng', type: 'sessions', sessions: 5, price: 2000000, description: 'Gói theo số lượt: 5 buổi massage thư giãn toàn thân 90p/buổi' },
    { id: 'pkg_3', name: 'Gói 10 Buổi Gội Đầu Dưỡng Sinh Thảo Dược', type: 'sessions', sessions: 10, price: 2000000, description: 'Gói theo số lượt: 10 buổi gội bồ kết bấm huyệt cổ vai gáy 60p' },
    { id: 'pkg_4', name: 'Thẻ Liệu Trình Trẻ Hóa & Nâng Cơ Hifu 3 Buổi', type: 'sessions', sessions: 3, price: 2400000, description: 'Gói theo số lượt: 3 buổi Hifu & RF nâng cơ viền hàm' },
    { id: 'pkg_5', name: 'Thẻ Thành Viên VIP Gold (Tài Khoản 10 Triệu Trừ Tiền Dần)', type: 'balance', initialBalance: 10000000, price: 10000000, description: 'Thẻ trừ tiền dần: Nạp 10 triệu, thanh toán linh hoạt cho tất cả dịch vụ' },
    { id: 'pkg_6', name: 'Thẻ Thành Viên VIP Diamond (Tài Khoản 20 Triệu + Tặng 2 Triệu)', type: 'balance', initialBalance: 22000000, price: 20000000, description: 'Thẻ trừ tiền dần: Nạp 20 triệu nhận tài khoản 22 triệu' }
  ],

  services: [
    { id: 'srv_1', name: 'Gội đầu dưỡng sinh thảo dược & Massage cổ vai gáy', category: 'Dưỡng sinh', duration: 60, price: 250000, description: 'Ngâm chân thảo dược, gội bồ kết cô đặc, massage ấn huyệt đầu - cổ - vai - gáy giảm đau nhức mỏi.' },
    { id: 'srv_2', name: 'Chăm sóc da mặt chuyên sâu Glow Skin (Cấp ẩm & Điện di Vitamin C)', category: 'Chăm sóc da', duration: 75, price: 450000, description: 'Tẩy tế bào chết enzyme, xông hơi hút mụn, điện di lạnh tinh chất Vitamin C và đắp mặt nạ vàng 24K.' },
    { id: 'srv_3', name: 'Massage Body tinh dầu Lavender & Đá nóng Thụy Điển', category: 'Massage & Trị liệu', duration: 90, price: 500000, description: 'Thư giãn cơ bắp toàn thân với tinh dầu Lavender tự nhiên kết hợp đá bazan núi lửa ấm nóng.' },
    { id: 'srv_4', name: 'Liệu trình Trị Mụn Chuẩn Y Khoa & Chiếu Ánh Sáng Sinh Học', category: 'Chăm sóc da', duration: 90, price: 600000, description: 'Lấy nhân mụn vô khuẩn, sát khuẩn tia điện tím, thoa serum đặc trị và chiếu ánh sáng sinh học Blue-light.' },
    { id: 'srv_5', name: 'Triệt lông nách / mép công nghệ Diode Laser Multi-Light', category: 'Triệt lông', duration: 30, price: 180000, description: 'Triệt lạnh không đau rát, se khít lỗ chân lông, hỗ trợ làm sáng mịn vùng da.' },
    { id: 'srv_6', name: 'Tắm trắng phi thuyền Hoàng Gia Collagen', category: 'Tắm trắng', duration: 90, price: 850000, description: 'Ủ dưỡng chất hoa hồng, ủ noãn thực vật và hấp phi thuyền hồng ngoại giúp da trắng hồng bật tone.' },
    { id: 'srv_7', name: 'Trẻ hóa xóa nhăn & Nâng cơ Hifu / RF Mini', category: 'Chăm sóc da', duration: 60, price: 950000, description: 'Sóng RF kích thích tăng sinh collagen tầng sâu, săn chắc thon gọn viền hàm.' }
  ],

  staff: [
    { id: 'stf_1', name: 'Nguyễn Thị Mai Hương', phone: '0912 345 678', role: 'KTV Trưởng', skills: ['Chăm sóc da', 'Massage & Trị liệu', 'Dưỡng sinh'], avatar: '👩‍💼', color: '#f43f5e' },
    { id: 'stf_2', name: 'Trần Thảo Linh', phone: '0988 765 432', role: 'KTV Da liễu', skills: ['Chăm sóc da', 'Trị mụn', 'Hifu'], avatar: '👩‍🔬', color: '#8b5cf6' },
    { id: 'stf_3', name: 'Lê Ngọc Ánh', phone: '0903 112 233', role: 'KTV Massage', skills: ['Massage & Trị liệu', 'Dưỡng sinh', 'Tắm trắng'], avatar: '💆‍♀️', color: '#0ea5e9' },
    { id: 'stf_4', name: 'Phạm Quỳnh Như', phone: '0977 445 566', role: 'KTV Thẩm mỹ', skills: ['Dưỡng sinh', 'Triệt lông', 'Chăm sóc da'], avatar: '💅', color: '#10b981' }
  ],

  rooms: [
    { id: 'rm_1', name: 'Phòng VIP 1 (Hoa Sen)', type: 'Phòng đơn VIP', beds: ['Giường VIP 01'] },
    { id: 'rm_2', name: 'Phòng VIP 2 (Hoa Hồng)', type: 'Phòng đôi VIP', beds: ['Giường VIP 02-A', 'Giường VIP 02-B'] },
    { id: 'rm_3', name: 'Phòng Dưỡng Sinh Gội Đầu', type: 'Phòng dịch vụ', beds: ['Giường Gội 01', 'Giường Gội 02', 'Giường Gội 03'] },
    { id: 'rm_4', name: 'Phòng Body & Trị Liệu', type: 'Phòng dịch vụ', beds: ['Giường Body 01', 'Giường Body 02'] },
    { id: 'rm_5', name: 'Phòng Công Nghệ Cao (Laser/Phi thuyền)', type: 'Phòng máy', beds: ['Máy Phi Thuyền', 'Máy Laser 01'] }
  ],

  customers: [
    {
      id: 'cust_1',
      name: 'Chị Hoàng Thu Trang',
      phone: '0934 888 999',
      gender: 'Nữ',
      birthdate: '1992-05-18',
      type: 'VIP Diamond',
      skinType: 'Da hỗn hợp thiên dầu, nhạy cảm',
      notes: 'Thích massage lực vừa, dùng tinh dầu oải hương, không dùng sản phẩm có cồn.',
      totalSpent: 4850000,
      totalVisits: 8,
      createdAt: '2026-01-10'
    },
    {
      id: 'cust_2',
      name: 'Chị Đỗ Mỹ Linh',
      phone: '0908 123 456',
      gender: 'Nữ',
      birthdate: '1995-11-20',
      type: 'VIP Gold',
      skinType: 'Da khô thiếu nước, có nám nhẹ',
      notes: 'Thường thích chăm sóc da Glow Skin và gội đầu dưỡng sinh.',
      totalSpent: 2650000,
      totalVisits: 5,
      createdAt: '2026-02-01'
    },
    {
      id: 'cust_3',
      name: 'Anh Vũ Hoàng Nam',
      phone: '0919 654 321',
      gender: 'Nam',
      birthdate: '1988-08-14',
      type: 'Thân thiết',
      skinType: 'Bình thường',
      notes: 'Thường bị đau mỏi vai gáy do làm việc văn phòng, thích kỹ thuật viên lực mạnh.',
      totalSpent: 1750000,
      totalVisits: 3,
      createdAt: '2026-03-05'
    },
    {
      id: 'cust_4',
      name: 'Chị Nguyễn Phương Thảo',
      phone: '0972 333 444',
      gender: 'Nữ',
      birthdate: '2001-03-25',
      type: 'Khách mới',
      skinType: 'Da dầu mụn tuổi dậy thì',
      notes: 'Đang theo liệu trình trị mụn y khoa buổi 1.',
      totalSpent: 600000,
      totalVisits: 1,
      createdAt: '2026-08-15'
    },
    {
      id: 'cust_5',
      name: 'Chị Bùi Bích Phương',
      phone: '0981 999 111',
      gender: 'Nữ',
      birthdate: '1990-12-02',
      type: 'VIP Diamond',
      skinType: 'Da lão hóa, nhiều nếp nhăn đuôi mắt',
      notes: 'Khách ưu tiên phòng VIP 1 yên tĩnh, phục vụ trà hoa cúc nóng.',
      totalSpent: 7200000,
      totalVisits: 12,
      createdAt: '2025-11-12'
    }
  ],

  // Tạo sẵn các lịch hẹn cho hôm nay và các ngày lân cận
  generateInitialAppointments: function() {
    const today = new Date();
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const dateToday = formatDate(today);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const dateYesterday = formatDate(yesterday);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const dateTomorrow = formatDate(tomorrow);

    return [
      {
        id: 'apt_1',
        customerId: 'cust_1',
        customerName: 'Chị Hoàng Thu Trang',
        customerPhone: '0934 888 999',
        serviceId: 'srv_2',
        serviceName: 'Chăm sóc da mặt chuyên sâu Glow Skin (Cấp ẩm & Điện di Vitamin C)',
        duration: 75,
        price: 450000,
        staffId: 'stf_2',
        staffName: 'Trần Thảo Linh',
        room: 'Phòng VIP 1 (Hoa Sen)',
        bed: 'Giường VIP 01',
        date: dateToday,
        time: '09:00',
        endTime: '10:15',
        status: 'completed', // pending | confirmed | arrived | in_progress | completed | cancelled
        notes: 'Khách đến đúng giờ, đã thanh toán chuyển khoản.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'apt_2',
        customerId: 'cust_3',
        customerName: 'Anh Vũ Hoàng Nam',
        customerPhone: '0919 654 321',
        serviceId: 'srv_3',
        serviceName: 'Massage Body tinh dầu Lavender & Đá nóng Thụy Điển',
        duration: 90,
        price: 500000,
        staffId: 'stf_3',
        staffName: 'Lê Ngọc Ánh',
        room: 'Phòng Body & Trị Liệu',
        bed: 'Giường Body 01',
        date: dateToday,
        time: '10:30',
        endTime: '12:00',
        status: 'in_progress',
        notes: 'Tập trung vùng lưng và cổ vai gáy cho khách.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'apt_3',
        customerId: 'cust_2',
        customerName: 'Chị Đỗ Mỹ Linh',
        customerPhone: '0908 123 456',
        serviceId: 'srv_1',
        serviceName: 'Gội đầu dưỡng sinh thảo dược & Massage cổ vai gáy',
        duration: 60,
        price: 250000,
        staffId: 'stf_1',
        staffName: 'Nguyễn Thị Mai Hương',
        room: 'Phòng Dưỡng Sinh Gội Đầu',
        bed: 'Giường Gội 01',
        date: dateToday,
        time: '14:00',
        endTime: '15:00',
        status: 'confirmed',
        notes: 'Đã gọi điện nhắc khách lúc sáng.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'apt_4',
        customerId: 'cust_4',
        customerName: 'Chị Nguyễn Phương Thảo',
        customerPhone: '0972 333 444',
        serviceId: 'srv_4',
        serviceName: 'Liệu trình Trị Mụn Chuẩn Y Khoa & Chiếu Ánh Sáng Sinh Học',
        duration: 90,
        price: 600000,
        staffId: 'stf_2',
        staffName: 'Trần Thảo Linh',
        room: 'Phòng VIP 2 (Hoa Hồng)',
        bed: 'Giường VIP 02-A',
        date: dateToday,
        time: '15:30',
        endTime: '17:00',
        status: 'pending',
        notes: 'Khách đặt qua Fanpage, cần gọi xác nhận trước 2 tiếng.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'apt_5',
        customerId: 'cust_5',
        customerName: 'Chị Bùi Bích Phương',
        customerPhone: '0981 999 111',
        serviceId: 'srv_7',
        serviceName: 'Trẻ hóa xóa nhăn & Nâng cơ Hifu / RF Mini',
        duration: 60,
        price: 950000,
        staffId: 'stf_1',
        staffName: 'Nguyễn Thị Mai Hương',
        room: 'Phòng VIP 1 (Hoa Sen)',
        bed: 'Giường VIP 01',
        date: dateToday,
        time: '17:30',
        endTime: '18:30',
        status: 'confirmed',
        notes: 'Khách yêu cầu chuẩn bị trước phòng VIP 1 và tinh dầu cam quế.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'apt_6',
        customerId: 'cust_2',
        customerName: 'Chị Đỗ Mỹ Linh',
        customerPhone: '0908 123 456',
        serviceId: 'srv_6',
        serviceName: 'Tắm trắng phi thuyền Hoàng Gia Collagen',
        duration: 90,
        price: 850000,
        staffId: 'stf_3',
        staffName: 'Lê Ngọc Ánh',
        room: 'Phòng Công Nghệ Cao (Laser/Phi thuyền)',
        bed: 'Máy Phi Thuyền',
        date: dateTomorrow,
        time: '10:00',
        endTime: '11:30',
        status: 'confirmed',
        notes: 'Buổi 2 trong gói tắm trắng 5 buổi.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'apt_7',
        customerId: 'cust_1',
        customerName: 'Chị Hoàng Thu Trang',
        customerPhone: '0934 888 999',
        serviceId: 'srv_3',
        serviceName: 'Massage Body tinh dầu Lavender & Đá nóng Thụy Điển',
        duration: 90,
        price: 500000,
        staffId: 'stf_1',
        staffName: 'Nguyễn Thị Mai Hương',
        room: 'Phòng VIP 1 (Hoa Sen)',
        bed: 'Giường VIP 01',
        date: dateYesterday,
        time: '14:00',
        endTime: '15:30',
        status: 'completed',
        notes: 'Khách rất hài lòng và tip cho KTV.',
        createdAt: new Date().toISOString()
      }
    ];
  }
};

class Store {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      this.resetToDefault();
    } else {
      // Đảm bảo mảng lịch rỗng nếu người dùng đã yêu cầu xóa hết demo
      if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || localStorage.getItem(STORAGE_KEYS.APPOINTMENTS).includes('apt_1')) {
        this.clearAllAppointments();
      }
    }
  }

  resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(SEED_DATA.services));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(SEED_DATA.staff));
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(SEED_DATA.rooms));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(SEED_DATA.customers));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
      spaName: 'Glow & Relax Luxury Spa',
      spaPhone: '028 3888 9999',
      spaAddress: '128 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. HCM',
      openTime: '08:30',
      closeTime: '21:00',
      currency: 'VND'
    }));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }

  clearAllAppointments() {
    this.saveAppointments([]);
    try {
      const customers = this.getCustomers();
      customers.forEach(c => {
        c.totalSpent = 0;
        c.totalVisits = 0;
        c.type = 'Khách mới';
      });
      this.saveCustomers(customers);
    } catch (e) {}
    return true;
  }

  // --- APPOINTMENTS CRUD ---
  getAppointments() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      if (raw !== null) {
        return JSON.parse(raw) || [];
      }
      return [];
    } catch (e) {
      console.error('Lỗi đọc appointments:', e);
      return [];
    }
  }

  saveAppointments(list) {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
    window.FirebaseSync?.syncCollection('appointments', list);
  }

  addAppointment(apt) {
    const list = this.getAppointments();
    const newApt = {
      ...apt,
      id: 'apt_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    list.unshift(newApt);
    this.saveAppointments(list);
    
    // Cập nhật tổng chi tiêu và số lần đến của khách hàng nếu trạng thái là hoàn thành
    this.syncCustomerStats(newApt.customerId);
    return newApt;
  }

  updateAppointment(id, updatedData) {
    const list = this.getAppointments();
    const index = list.findIndex(a => a.id === id);
    if (index !== -1) {
      const oldStatus = list[index].status;
      list[index] = { ...list[index], ...updatedData, updatedAt: new Date().toISOString() };
      this.saveAppointments(list);
      
      if (oldStatus !== list[index].status || updatedData.price) {
        this.syncCustomerStats(list[index].customerId);
      }
      return list[index];
    }
    return null;
  }

  deleteAppointment(id) {
    const list = this.getAppointments();
    const aptToDelete = list.find(a => a.id === id);
    const filtered = list.filter(a => a.id !== id);
    this.saveAppointments(filtered);
    if (aptToDelete) {
      this.syncCustomerStats(aptToDelete.customerId);
    }
    return true;
  }

  // Kiểm tra trùng lịch (Conflict Detector)
  checkAppointmentConflict(staffId, room, bed, date, startTime, duration, excludeAptId = null) {
    const appointments = this.getAppointments();
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = startMinutes + parseInt(duration, 10);

    const conflicts = [];

    appointments.forEach(apt => {
      // Bỏ qua lịch đã huỷ hoặc chính lịch đang chỉnh sửa
      if (apt.status === 'cancelled' || (excludeAptId && apt.id === excludeAptId)) {
        return;
      }
      if (apt.date !== date) return;

      const aptStart = this.timeToMinutes(apt.time);
      const aptEnd = apt.endTime ? this.timeToMinutes(apt.endTime) : (aptStart + parseInt(apt.duration, 10));

      // Kiểm tra giao thoa khoảng thời gian [startMinutes, endMinutes] và [aptStart, aptEnd]
      const isOverlap = (startMinutes < aptEnd && endMinutes > aptStart);

      if (isOverlap) {
        if (apt.staffId === staffId) {
          conflicts.push({
            type: 'staff',
            message: `Kỹ thuật viên ${apt.staffName} đã có lịch hẹn "${apt.serviceName}" (${apt.time} - ${apt.endTime || ''}) với khách ${apt.customerName}`,
            conflictingApt: apt
          });
        }
        if (apt.room === room && apt.bed === bed && bed) {
          conflicts.push({
            type: 'room_bed',
            message: `${room} - ${bed} đang được xếp cho khách ${apt.customerName} (${apt.time} - ${apt.endTime || ''})`,
            conflictingApt: apt
          });
        }
      }
    });

    return conflicts;
  }

  // --- CUSTOMERS CRUD ---
  getCustomers() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS));
      if (Array.isArray(data) && data.length > 0) return data;
      this.saveCustomers(SEED_DATA.customers);
      return SEED_DATA.customers;
    } catch (e) {
      return SEED_DATA.customers;
    }
  }

  saveCustomers(list) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
    window.FirebaseSync?.syncCollection('customers', list);
  }

  addCustomer(customer) {
    const list = this.getCustomers();
    const newCust = {
      ...customer,
      id: 'cust_' + Date.now(),
      totalSpent: 0,
      totalVisits: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    list.unshift(newCust);
    this.saveCustomers(list);
    return newCust;
  }

  updateCustomer(id, updatedData) {
    const list = this.getCustomers();
    const index = list.findIndex(c => c.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedData };
      this.saveCustomers(list);
      return list[index];
    }
    return null;
  }

  deleteCustomer(id) {
    const list = this.getCustomers();
    const filtered = list.filter(c => c.id !== id);
    this.saveCustomers(filtered);
    return true;
  }

  syncCustomerStats(customerId) {
    if (!customerId) return;
    const appointments = this.getAppointments().filter(a => a.customerId === customerId);
    const completedApts = appointments.filter(a => a.status === 'completed');
    const aptSpent = completedApts.reduce((sum, a) => sum + (Number(a.price) || 0), 0);

    const packageOrders = this.getPackageOrders().filter(o => o.customerId === customerId);
    const pkgSpent = packageOrders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);

    const totalSpent = aptSpent + pkgSpent;
    const totalVisits = completedApts.length;

    // Tự động phân loại cấp bậc thành viên
    let type = 'Khách mới';
    if (totalSpent >= 5000000 || totalVisits >= 10) {
      type = 'VIP Diamond';
    } else if (totalSpent >= 2500000 || totalVisits >= 5) {
      type = 'VIP Gold';
    } else if (totalVisits >= 2 || pkgSpent > 0) {
      type = 'Thân thiết';
    }

    const customers = this.getCustomers();
    const custIndex = customers.findIndex(c => c.id === customerId);
    if (custIndex !== -1) {
      customers[custIndex].totalSpent = totalSpent;
      customers[custIndex].totalVisits = totalVisits;
      customers[custIndex].type = type;
      this.saveCustomers(customers);
    }
  }

  // --- PACKAGE TEMPLATES & PACKAGE ORDERS (Gói & Thẻ Dài Hạn) ---
  getPackageTemplates() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.PACKAGES));
      if (Array.isArray(data) && data.length > 0) return data;
      this.savePackageTemplates(SEED_DATA.packageTemplates);
      return SEED_DATA.packageTemplates;
    } catch (e) {
      return SEED_DATA.packageTemplates;
    }
  }

  savePackageTemplates(list) {
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(list));
    window.FirebaseSync?.syncCollection('packages', list);
  }

  getPackageOrders() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PACKAGE_ORDERS)) || [];
    } catch (e) {
      return [];
    }
  }

  savePackageOrders(list) {
    localStorage.setItem(STORAGE_KEYS.PACKAGE_ORDERS, JSON.stringify(list));
    window.FirebaseSync?.syncCollection('package_orders', list);
  }

  addPackageOrder(order) {
    const list = this.getPackageOrders();
    const newOrder = {
      ...order,
      id: 'pkg_ord_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    list.unshift(newOrder);
    this.savePackageOrders(list);
    
    // Đồng bộ lại tổng chi tiêu & nâng hạng VIP của khách
    this.syncCustomerStats(newOrder.customerId);
    return newOrder;
  }

  updatePackageOrder(id, updatedData) {
    const list = this.getPackageOrders();
    const index = list.findIndex(o => o.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedData, updatedAt: new Date().toISOString() };
      this.savePackageOrders(list);
      this.syncCustomerStats(list[index].customerId);
      return list[index];
    }
    return null;
  }

  deletePackageOrder(id) {
    const list = this.getPackageOrders();
    const orderToDelete = list.find(o => o.id === id);
    const filtered = list.filter(o => o.id !== id);
    this.savePackageOrders(filtered);
    if (orderToDelete) {
      this.syncCustomerStats(orderToDelete.customerId);
    }
    return true;
  }

  addPackageTemplate(pkg) {
    const list = this.getPackageTemplates();
    const newPkg = {
      ...pkg,
      id: 'pkg_' + Date.now()
    };
    list.push(newPkg);
    this.savePackageTemplates(list);
    return newPkg;
  }

  updatePackageTemplate(id, updatedData) {
    const list = this.getPackageTemplates();
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedData };
      this.savePackageTemplates(list);
      return list[index];
    }
    return null;
  }

  deletePackageTemplate(id) {
    const list = this.getPackageTemplates();
    const filtered = list.filter(p => p.id !== id);
    this.savePackageTemplates(filtered);
    return true;
  }

  // Trừ 1 buổi liệu trình khi khách đến sử dụng gói theo số lượt
  usePackageSession(orderId, note = '') {
    const list = this.getPackageOrders();
    const index = list.findIndex(o => o.id === orderId);
    if (index !== -1 && list[index].remainingSessions > 0) {
      list[index].remainingSessions -= 1;
      list[index].usedSessions = (list[index].usedSessions || 0) + 1;
      if (!list[index].usageHistory) list[index].usageHistory = [];
      list[index].usageHistory.unshift({
        date: new Date().toLocaleString('vi-VN'),
        type: 'session',
        sessionsDeducted: 1,
        remainingSessions: list[index].remainingSessions,
        notes: note || 'Trừ 1 buổi liệu trình'
      });
      this.savePackageOrders(list);
      return { success: true, remaining: list[index].remainingSessions };
    }
    return { success: false, message: 'Đã hết số buổi trong gói này!' };
  }

  // Trừ tiền khi khách sử dụng thẻ trả trước / tài khoản trừ tiền dần
  deductPackageBalance(orderId, amount, note = '') {
    const list = this.getPackageOrders();
    const index = list.findIndex(o => o.id === orderId);
    if (index !== -1) {
      const currentBalance = list[index].remainingBalance !== undefined ? list[index].remainingBalance : list[index].price;
      if (currentBalance < amount) {
        return { success: false, message: `Số dư thẻ không đủ! Hiện chỉ còn: ${this.formatCurrency(currentBalance)}` };
      }
      list[index].remainingBalance = currentBalance - amount;
      list[index].usedBalance = (list[index].usedBalance || 0) + amount;
      if (!list[index].usageHistory) list[index].usageHistory = [];
      list[index].usageHistory.unshift({
        date: new Date().toLocaleString('vi-VN'),
        type: 'balance',
        amountDeducted: amount,
        remainingBalance: list[index].remainingBalance,
        notes: note || 'Thanh toán dịch vụ bằng thẻ trả trước'
      });
      this.savePackageOrders(list);
      return { success: true, remainingBalance: list[index].remainingBalance };
    }
    return { success: false, message: 'Không tìm thấy thẻ tài khoản này!' };
  }

  // --- SERVICES CRUD ---
  getServices() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES));
      if (Array.isArray(data) && data.length > 0) return data;
      this.saveServices(SEED_DATA.services);
      return SEED_DATA.services;
    } catch (e) {
      return SEED_DATA.services;
    }
  }

  saveServices(list) {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(list));
    window.FirebaseSync?.syncCollection('services', list);
  }

  addService(service) {
    const list = this.getServices();
    const newService = {
      ...service,
      id: 'srv_' + Date.now()
    };
    list.push(newService);
    this.saveServices(list);
    return newService;
  }

  updateService(id, updatedData) {
    const list = this.getServices();
    const index = list.findIndex(s => s.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedData };
      this.saveServices(list);
      return list[index];
    }
    return null;
  }

  deleteService(id) {
    const list = this.getServices();
    const filtered = list.filter(s => s.id !== id);
    this.saveServices(filtered);
    return true;
  }

  // --- STAFF & ROOMS ---
  getStaff() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAFF));
      if (Array.isArray(data) && data.length > 0) return data;
      this.saveStaff(SEED_DATA.staff);
      return SEED_DATA.staff;
    } catch (e) {
      return SEED_DATA.staff;
    }
  }

  saveStaff(list) {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(list));
    window.FirebaseSync?.syncCollection('staff', list);
  }

  addStaff(staffMember) {
    const list = this.getStaff();
    const newStaff = {
      ...staffMember,
      id: 'stf_' + Date.now()
    };
    list.push(newStaff);
    this.saveStaff(list);
    return newStaff;
  }

  updateStaff(id, updatedData) {
    const list = this.getStaff();
    const index = list.findIndex(s => s.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedData };
      this.saveStaff(list);
      return list[index];
    }
    return null;
  }

  deleteStaff(id) {
    const list = this.getStaff();
    const filtered = list.filter(s => s.id !== id);
    this.saveStaff(filtered);
    return true;
  }

  getRooms() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS));
      if (Array.isArray(data) && data.length > 0) return data;
      this.saveRooms(SEED_DATA.rooms);
      return SEED_DATA.rooms;
    } catch (e) {
      return SEED_DATA.rooms;
    }
  }

  saveRooms(list) {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(list));
    window.FirebaseSync?.syncCollection('rooms', list);
  }

  addRoom(room) {
    const list = this.getRooms();
    const newRoom = {
      ...room,
      id: 'rm_' + Date.now()
    };
    list.push(newRoom);
    this.saveRooms(list);
    return newRoom;
  }

  updateRoom(id, updatedData) {
    const list = this.getRooms();
    const index = list.findIndex(r => r.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedData };
      this.saveRooms(list);
      return list[index];
    }
    return null;
  }

  deleteRoom(id) {
    const list = this.getRooms();
    const filtered = list.filter(r => r.id !== id);
    this.saveRooms(filtered);
    return true;
  }

  // --- SETTINGS ---
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {};
    } catch (e) {
      return {};
    }
  }

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    window.FirebaseSync?.syncCollection('settings', settings);
  }

  // --- UTILS ---
  timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  minutesToTime(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  calculateEndTime(startTime, durationMinutes) {
    const startM = this.timeToMinutes(startTime);
    const endM = startM + parseInt(durationMinutes, 10);
    return this.minutesToTime(endM);
  }

  formatCurrency(num) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  }

  // Export / Import Data
  exportAllDataJSON() {
    const data = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      appointments: this.getAppointments(),
      customers: this.getCustomers(),
      services: this.getServices(),
      staff: this.getStaff(),
      rooms: this.getRooms(),
      packageOrders: this.getPackageOrders(),
      packages: this.getPackageTemplates(),
      settings: this.getSettings()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Spa_Backup_Data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importAllDataJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.appointments) localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(data.appointments));
      if (data.customers) localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(data.customers));
      if (data.services) localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(data.services));
      if (data.staff) localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(data.staff));
      if (data.rooms) localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(data.rooms));
      if (data.packageOrders) localStorage.setItem(STORAGE_KEYS.PACKAGE_ORDERS, JSON.stringify(data.packageOrders));
      if (data.packages) localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(data.packages));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  exportAppointmentsCSV() {
    const appointments = this.getAppointments();
    const headers = ['Mã Lịch Hẹn', 'Ngày', 'Giờ Bắt Đầu', 'Giờ Kết Thúc', 'Khách Hàng', 'Số Điện Thoại', 'Dịch Vụ', 'Thời Lượng (phút)', 'Giá Tiền (VNĐ)', 'Kỹ Thuật Viên', 'Phòng & Giường', 'Trạng Thái', 'Ghi Chú'];
    
    const rows = appointments.map(a => [
      `"${a.id}"`,
      `"${a.date}"`,
      `"${a.time}"`,
      `"${a.endTime || ''}"`,
      `"${(a.customerName || '').replace(/"/g, '""')}"`,
      `"${a.customerPhone || ''}"`,
      `"${(a.serviceName || '').replace(/"/g, '""')}"`,
      `"${a.duration || ''}"`,
      `"${a.price || 0}"`,
      `"${(a.staffName || '').replace(/"/g, '""')}"`,
      `"${((a.room || '') + ' - ' + (a.bed || '')).replace(/"/g, '""')}"`,
      `"${this.getStatusLabel(a.status)}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_Sach_Lich_Hen_Spa_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  getStatusLabel(status) {
    const statusMap = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'arrived': 'Khách đã đến (Check-in)',
      'in_progress': 'Đang phục vụ',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã huỷ'
    };
    return statusMap[status] || status;
  }
}

// Global Store Instance
window.spaStore = new Store();
