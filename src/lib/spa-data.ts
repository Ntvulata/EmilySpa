export type AppointmentStatus = "cho" | "dang" | "xong" | "huy";

export type Appointment = {
  id: string;
  date: string;
  time: string;
  endTime?: string;
  customerId: string;
  phone?: string; // Optional now, since customerId is used
  serviceIds: string[];
  therapistId: string;
  packageUsed?: string; // Tên thẻ hoặc ID thẻ
  
  // Các trường thanh toán
  price: number;
  sessionsDeducted?: number;
  balanceDeducted?: number;
  
  status: AppointmentStatus;
};

export type PackageDef = {
  id: string;
  name: string;
  type: "sessions" | "balance";
  value: number; // Tổng số lượt hoặc tiền lúc bán
  price: number; // Giá bán
};

export const masterPackages: PackageDef[] = [
  { id: "PK1", name: "Thẻ chăm sóc da 10 buổi", type: "sessions", value: 10, price: 8000000 },
  { id: "PK2", name: "Thẻ tài khoản 10 triệu", type: "balance", value: 10000000, price: 8500000 },
  { id: "PK3", name: "Thẻ gội đầu 5 buổi", type: "sessions", value: 5, price: 2000000 },
  { id: "PK4", name: "Thẻ massage đá nóng 10 buổi", type: "sessions", value: 10, price: 6500000 },
];

export type CustomerPackage = {
  packageId: string;
  remaining: number;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  visits: number;
  activePackages: CustomerPackage[];
  tier: string;
};

export const initialCustomers: Customer[] = [
  { id: "CUST1", name: "Nguyễn Thu Hà", phone: "0901 234 567", visits: 18, activePackages: [{ packageId: "PK1", remaining: 3 }], tier: "Kim cương" },
  { id: "CUST2", name: "Trần Bảo Ngọc", phone: "0912 887 445", visits: 11, activePackages: [{ packageId: "PK2", remaining: 1450000 }], tier: "Vàng" },
  { id: "CUST3", name: "Lê Minh Tuấn", phone: "0933 666 888", visits: 2, activePackages: [], tier: "Mới" },
  { id: "CUST4", name: "Phạm Phương Anh", phone: "0988 111 222", visits: 45, activePackages: [{ packageId: "PK1", remaining: 0 }, { packageId: "PK4", remaining: 8 }], tier: "Kim cương" }
];

export const statusLabel: Record<AppointmentStatus, string> = {
  cho: "Chờ tiếp đón",
  dang: "Đang chăm sóc",
  xong: "Hoàn thành",
  huy: "Hủy",
};

export const statusClass: Record<AppointmentStatus, string> = {
  cho: "border-champagne/60 bg-champagne/15 text-ink/75",
  dang: "border-emerald/30 bg-emerald/10 text-emerald",
  xong: "border-ink/15 bg-ink/5 text-ink/55",
  huy: "border-red-500/30 bg-red-500/10 text-red-600 font-bold",
};

export const appointments: Appointment[] = [
  { id: "LH-2041", date: "2026-09-25", time: "08:30", customer: "Nguyễn Thu Hà", phone: "0901 234 567", services: ["Massage đá nóng 90'"], therapist: "KTV Ngọc Anh", packageUsed: "PK1", sessionsDeducted: 1, price: 0, status: "xong" },
  { id: "LH-2042", date: "2026-09-25", time: "09:15", customer: "Trần Bảo Ngọc", phone: "0912 887 445", services: ["Chăm sóc da chuyên sâu"], therapist: "KTV Mai Chi", packageUsed: "", price: 980000, status: "dang" },
  { id: "LH-2043", date: "2026-09-25", time: "10:00", customer: "Lê Minh Phụng", phone: "0938 442 110", services: ["Gội đầu dưỡng sinh 60'"], therapist: "KTV Thanh Trúc", packageUsed: "", price: 450000, status: "dang" },
  { id: "LH-2044", date: "2026-09-26", time: "11:30", customer: "Phạm Khánh Vy", phone: "0977 310 226", services: ["Triệt lông công nghệ cao", "Gội đầu dưỡng sinh 60'"], therapist: "KTV Ngọc Anh", packageUsed: "", price: 2100000, status: "cho" },
  { id: "LH-2045", date: "2026-09-24", time: "13:45", customer: "Đỗ Thanh Tâm", phone: "0908 665 231", services: ["Body detox thải độc"], therapist: "KTV Mai Chi", packageUsed: "", price: 1200000, status: "xong" },
  { id: "LH-2046", date: "2026-09-25", time: "15:00", customer: "Vũ Hoàng Yến", phone: "0961 774 908", services: ["Massage foot thư giãn"], therapist: "KTV Thanh Trúc", packageUsed: "", price: 390000, status: "cho" },
  { id: "LH-2047", date: "2026-09-26", time: "16:30", customer: "Bùi Cẩm Tú", phone: "0939 552 118", services: ["Trẻ hoá da ánh sáng sinh học"], therapist: "KTV Ngọc Anh", packageUsed: "", price: 2100000, status: "cho" },
];

export const therapists = [
  { name: "KTV Ngọc Anh", sessions: 6, revenue: 4500000 },
  { name: "KTV Mai Chi", sessions: 4, revenue: 3180000 },
  { name: "KTV Thanh Trúc", sessions: 3, revenue: 1240000 },
];

export type ServiceDef = { id: string; name: string; price: number; duration: string; };

export const serviceOptions: ServiceDef[] = [
  { id: "SRV1", name: "Chăm sóc da chuyên sâu", price: 800000, duration: "90 phút" },
  { id: "SRV2", name: "Massage Body Tinh dầu", price: 650000, duration: "60 phút" },
  { id: "SRV3", name: "Gội đầu dưỡng sinh", price: 250000, duration: "45 phút" },
  { id: "SRV4", name: "Triệt lông vĩnh viễn (Nách)", price: 350000, duration: "30 phút" },
];

export const serviceMix = [
  { name: "Chăm sóc da", share: 38 },
  { name: "Massage trị liệu", share: 31 },
  { name: "Gội đầu dưỡng sinh", share: 18 },
  { name: "Triệt lông", share: 13 },
];

export const formatVnd = (value: number) => `${(value || 0).toLocaleString("vi-VN")} đ`;

export type PackageHistoryRecord = {
  id: string;
  date: string;
  type: "sell" | "deduct";
  customer: string;
  packageId: string;
  valueChange: number;
  pricePaid?: number;
  note: string;
  appointmentId?: string;
};

export const packageHistory: PackageHistoryRecord[] = [
  { id: "PH1", date: "2026-09-20", type: "sell", customerId: "CUST1", packageId: "PK1", valueChange: 10, pricePaid: 8000000, note: "Mua thẻ mới" },
  { id: "PH2", date: "2026-09-21", type: "deduct", customerId: "CUST1", packageId: "PK1", valueChange: -1, note: "Trừ buổi 1" },
];

export const getRemainingPackageValue = (customerId: string, packageId: string) => {
  return packageHistory
    .filter(h => h.customerId === customerId && h.packageId === packageId)
    .reduce((sum, record) => sum + record.valueChange, 0);
};
