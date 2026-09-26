const fs = require('fs');

// 1. dashboard.customers.tsx
let custCode = fs.readFileSync('src/routes/dashboard.customers.tsx', 'utf8');
custCode = custCode.replace(/item\.name/g, 'item.id');
// Wait, getActivePackages uses ID now.
custCode = custCode.replace(/getActivePackages\(form\.name/g, 'getActivePackages(form.id || ""');
custCode = custCode.replace(/getActivePackages\(item\.name/g, 'getActivePackages(item.id');
custCode = custCode.replace(/const getActivePackages = \(customerName: string/g, 'const getActivePackages = (customerId: string');
custCode = custCode.replace(/h\.customer\.toLowerCase\(\) === customerName\.toLowerCase\(\)/g, 'h.customerId === customerId');
custCode = custCode.replace(/setForm\(\{ name: "", phone: "", tier: "Mới" \}\);/g, 'setForm({ id: "CUST_" + Date.now(), name: "", phone: "", tier: "Mới" });');
custCode = custCode.replace(/const \[form, setForm\] = useState\(\{[\s\S]*?\}\);/, 'const [form, setForm] = useState({ id: "", name: "", phone: "", tier: "Mới" });');
custCode = custCode.replace(/fbSaveCustomer\(\{ \.\.\.form, visits: 0, activePackages: \[\] \}\)/g, 'fbSaveCustomer({ ...form, visits: 0, activePackages: [] })');
custCode = custCode.replace(/fbDeleteCustomer\(c\.phone\)/g, 'fbDeleteCustomer(c.id)');
custCode = custCode.replace(/const deleteCustomer = async \(phone: string\)/g, 'const deleteCustomer = async (id: string)');
custCode = custCode.replace(/const deleteCustomer = async \(id: string\) \{[\s\S]*?fbDeleteCustomer\(id\);/g, `const deleteCustomer = async (id: string) => {\n    if (!confirm("Xác nhận xóa khách hàng?")) return;\n    try {\n      await fbDeleteCustomer(id);`);
custCode = custCode.replace(/setCustomers\(customers\.filter\(c => c\.phone !== phone\)\);/g, 'setCustomers(customers.filter(c => c.id !== id));');
fs.writeFileSync('src/routes/dashboard.customers.tsx', custCode, 'utf8');

// 2. dashboard.appointments.tsx
let apptCode = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');
apptCode = apptCode.replace(/customer: string;/g, 'customerId: string;');
apptCode = apptCode.replace(/services: string\[\];/g, 'serviceIds: string[];');
apptCode = apptCode.replace(/therapist: string;/g, 'therapistId: string;');
apptCode = apptCode.replace(/customer: "",/g, 'customerId: "",');
apptCode = apptCode.replace(/services: serviceOptions\.length > 0 \? \[serviceOptions\[0\]\.name\] : \[""\],/g, 'serviceIds: serviceOptions.length > 0 ? [serviceOptions[0].id] : [""],');
apptCode = apptCode.replace(/therapist: masterTherapists\[0\]\.name,/g, 'therapistId: masterTherapists[0].id,');

apptCode = apptCode.replace(/form\.customer/g, 'form.customerId');
apptCode = apptCode.replace(/form\.services/g, 'form.serviceIds');
apptCode = apptCode.replace(/form\.therapist/g, 'form.therapistId');

apptCode = apptCode.replace(/appt\.customer/g, 'appt.customerId');
apptCode = apptCode.replace(/appt\.services/g, 'appt.serviceIds');
apptCode = apptCode.replace(/appt\.therapist/g, 'appt.therapistId');

// Rendering mapping
apptCode = apptCode.replace(/\{item\.customer\}/g, '{customers.find(c => c.id === item.customerId)?.name || "Unknown"}');
apptCode = apptCode.replace(/\{item\.therapist\}/g, '{masterTherapists.find(t => t.id === item.therapistId)?.name || "Unknown"}');
apptCode = apptCode.replace(/item\.services\.map\(\(s, idx\)/g, 'item.serviceIds.map((sid, idx) => { const s = serviceOptions.find(opt => opt.id === sid)?.name || sid; return');
apptCode = apptCode.replace(/appointment\.customer\}/g, 'customers.find(c => c.id === appointment.customerId)?.name || "Unknown"}');
apptCode = apptCode.replace(/appointment\.services\.map\(\(s: string, idx: number\)/g, 'appointment.serviceIds.map((sid: string, idx: number) => { const s = serviceOptions.find(opt => opt.id === sid)?.name || sid; return');
apptCode = apptCode.replace(/rows\.filter\(r => r\.therapistId === therapist\.name\)/g, 'rows.filter(r => r.therapistId === therapist.id)');
apptCode = apptCode.replace(/value=\{item\.customerId\}/g, 'value={item.customerId}');

fs.writeFileSync('src/routes/dashboard.appointments.tsx', apptCode, 'utf8');

// 3. dashboard.packages-history.tsx
let pkgCode = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');
pkgCode = pkgCode.replace(/customer: string;/g, 'customerId: string;');
pkgCode = pkgCode.replace(/item\.customer\}/g, 'customers.find(c => c.id === item.customerId)?.name || "Unknown"}');
pkgCode = pkgCode.replace(/form\.customer/g, 'form.customerId');
fs.writeFileSync('src/routes/dashboard.packages-history.tsx', pkgCode, 'utf8');

// 4. dashboard.services.tsx
let srvCode = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');
srvCode = srvCode.replace(/const submit = async \(e: FormEvent\) => \{[\s\S]*?if \(!form\.name\) /g, `const submit = async (e: FormEvent) => {\n    e.preventDefault();\n    if (!form.name) `);
// We will manually fix services.tsx as it's complex
fs.writeFileSync('src/routes/dashboard.services.tsx', srvCode, 'utf8');

console.log("Partial refactor done");
