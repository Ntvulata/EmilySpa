const fs = require('fs');

let content = fs.readFileSync('src/lib/spa-data.ts', 'utf8');

// 1. Update Types
content = content.replace(
  /export type Appointment = \{[\s\S]*?status: AppointmentStatus;\n\};/,
  `export type Appointment = {
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
};`
);

content = content.replace(
  /export type Customer = \{[\s\S]*?tier: string;\n\};/,
  `export type Customer = {
  id: string;
  name: string;
  phone: string;
  visits: number;
  activePackages: CustomerPackage[];
  tier: string;
};`
);

content = content.replace(
  /export type PackageHistoryRecord = \{[\s\S]*?note: string;\n\};/,
  `export type PackageHistoryRecord = {
  id: string;
  date: string;
  type: "sell" | "deduct";
  customerId: string;
  packageId: string;
  valueChange: number; // + (mua) hoặc - (trừ)
  pricePaid?: number; // Tiền khách thực trả khi mua
  note: string;
};`
);

content = content.replace(
  /export const getRemainingPackageValue = \(customerName: string, packageId: string\) => \{/,
  `export const getRemainingPackageValue = (customerId: string, packageId: string) => {`
);
content = content.replace(
  /h\.customer\.toLowerCase\(\) === customerName\.toLowerCase\(\)/g,
  `h.customerId === customerId`
);

// We need to inject ServiceDef and TherapistDef types
content = content.replace(
  /export const serviceOptions = \[/,
  `export type ServiceDef = { id: string; name: string; price: number; duration: string; };\n\nexport const serviceOptions: ServiceDef[] = [`
);
content = content.replace(
  /export const masterTherapists = \[/,
  `export type TherapistDef = { id: string; name: string; phone: string; role: string; sessions: number; revenue: number; };\n\nexport const masterTherapists: TherapistDef[] = [`
);

// 2. Add IDs to Initial Data
// Since this is mock data, we can just clear it out or map it to add IDs, but it's hardcoded text.
// Let's replace the hardcoded arrays directly.
content = content.replace(
  /export const initialCustomers: Customer\[\] = \[[^]*?\];/,
  `export const initialCustomers: Customer[] = [
  { id: "CUST1", name: "Nguyễn Thu Hà", phone: "0901 234 567", visits: 18, activePackages: [{ packageId: "PK1", remaining: 3 }], tier: "Kim cương" },
  { id: "CUST2", name: "Trần Bảo Ngọc", phone: "0912 887 445", visits: 11, activePackages: [{ packageId: "PK2", remaining: 1450000 }], tier: "Vàng" },
  { id: "CUST3", name: "Lê Minh Tuấn", phone: "0933 666 888", visits: 2, activePackages: [], tier: "Mới" },
  { id: "CUST4", name: "Phạm Phương Anh", phone: "0988 111 222", visits: 45, activePackages: [{ packageId: "PK1", remaining: 0 }, { packageId: "PK4", remaining: 8 }], tier: "Kim cương" }
];`
);

content = content.replace(
  /export const packageHistory: PackageHistoryRecord\[\] = \[[^]*?\];/,
  `export const packageHistory: PackageHistoryRecord[] = [
  { id: "PH1", date: "2026-09-20", type: "sell", customerId: "CUST1", packageId: "PK1", valueChange: 10, pricePaid: 8000000, note: "Mua thẻ mới" },
  { id: "PH2", date: "2026-09-21", type: "deduct", customerId: "CUST1", packageId: "PK1", valueChange: -1, note: "Trừ buổi 1" },
];`
);

content = content.replace(
  /export const serviceOptions: ServiceDef\[\] = \[[^]*?\];/,
  `export const serviceOptions: ServiceDef[] = [
  { id: "SRV1", name: "Chăm sóc da chuyên sâu", price: 800000, duration: "90 phút" },
  { id: "SRV2", name: "Massage Body Tinh dầu", price: 650000, duration: "60 phút" },
  { id: "SRV3", name: "Gội đầu dưỡng sinh", price: 250000, duration: "45 phút" },
  { id: "SRV4", name: "Triệt lông vĩnh viễn (Nách)", price: 350000, duration: "30 phút" },
];`
);

content = content.replace(
  /export const masterTherapists: TherapistDef\[\] = \[[^]*?\];/,
  `export const masterTherapists: TherapistDef[] = [
  { id: "THR1", name: "Lê Anna", phone: "0911222333", role: "Kỹ thuật viên Trưởng", sessions: 0, revenue: 0 },
  { id: "THR2", name: "Trần Bella", phone: "0944555666", role: "Kỹ thuật viên", sessions: 0, revenue: 0 },
  { id: "THR3", name: "Nguyễn Celine", phone: "0977888999", role: "Kỹ thuật viên", sessions: 0, revenue: 0 },
];`
);

content = content.replace(
  /export const initialAppointments: Appointment\[\] = \[[^]*?\];/,
  `export const initialAppointments: Appointment[] = [
  { id: "1", date: new Date().toISOString().split("T")[0], time: "09:00", endTime: "10:30", customerId: "CUST1", phone: "0901 234 567", serviceIds: ["SRV1"], therapistId: "THR1", status: "xong", price: 0, packageUsed: "PK1", sessionsDeducted: 1 },
];`
);

fs.writeFileSync('src/lib/spa-data.ts', content, 'utf8');
console.log("Updated spa-data.ts");
