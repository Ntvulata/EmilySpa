const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.customers.tsx', 'utf8');

// 1. Add `appointments` to import from `@/lib/spa-data`
code = code.replace(
  /import \{ formatVnd, initialCustomers, masterPackages, type Customer, type CustomerPackage, getRemainingPackageValue, packageHistory \} from "@\/lib\/spa-data";/,
  'import { formatVnd, initialCustomers, masterPackages, type Customer, type CustomerPackage, getRemainingPackageValue, packageHistory, appointments } from "@/lib/spa-data";'
);

// 2. Add validation in deleteCustomer
const oldDelete = '  const deleteCustomer = async (idx: number) => {\n    if (window.confirm("';
const newDelete = `  const deleteCustomer = async (idx: number) => {
    const custToDelete = customers[idx];
    const hasAppointments = appointments.some(a => a.customerId === custToDelete.id);
    if (hasAppointments) {
      alert("Không thể xóa Khách hàng này vì đã có phát sinh lịch hẹn trên hệ thống (dù là Admin)!");
      return;
    }

    if (window.confirm("`;

// Regex replace since the string match might be tricky with mangled characters
const regex = /const deleteCustomer = async \(idx: number\) => \{\s*if \(window\.confirm\([^)]+\)\) \{/;

code = code.replace(regex, `const deleteCustomer = async (idx: number) => {
    const custToDelete = customers[idx];
    const hasAppointments = appointments.some(a => a.customerId === custToDelete.id || a.phone === custToDelete.phone);
    if (hasAppointments) {
      alert("Không thể xóa Khách hàng này vì đã có phát sinh lịch hẹn trên hệ thống (kể cả Admin)!");
      return;
    }
    if (window.confirm("Xóa khách hàng này?")) {`);

fs.writeFileSync('src/routes/dashboard.customers.tsx', code, 'utf8');
console.log("Injected referential integrity check");
