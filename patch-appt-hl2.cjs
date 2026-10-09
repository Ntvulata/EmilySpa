const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const regex1 = /const \[fromDate, setFromDate\] = useState\(d\.toISOString\(\)\.split\("T"\)\[0\]\);/g;
const repl1 = `const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const hl = searchParams.get("hl");
  const hlAppt = hl ? initialAppointments.find(a => a.id === hl) : null;
  const [fromDate, setFromDate] = useState(hlAppt ? hlAppt.date : d.toISOString().split("T")[0]);`;

code = code.replace(regex1, repl1);

const regex2 = /const \[toDate, setToDate\] = useState\(new Date\(\)\.toISOString\(\)\.split\("T"\)\[0\]\);/g;
const repl2 = `const [toDate, setToDate] = useState(hlAppt ? hlAppt.date : new Date().toISOString().split("T")[0]);`;

code = code.replace(regex2, repl2);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Patched target1");
