const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const target1 = `  const d = new Date();
  d.setDate(d.getDate() - 1);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000); // 1 min update
    return () => clearInterval(timer);
  }, []);
  const [fromDate, setFromDate] = useState(d.toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);`;

const repl1 = `  const d = new Date();
  d.setDate(d.getDate() - 1);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000); // 1 min update
    return () => clearInterval(timer);
  }, []);
  
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const hl = searchParams.get("hl");
  const hlAppt = hl ? initialAppointments.find(a => a.id === hl) : null;
  
  const [fromDate, setFromDate] = useState(hlAppt ? hlAppt.date : d.toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(hlAppt ? hlAppt.date : new Date().toISOString().split("T")[0]);`;

code = code.replace(target1, repl1);

const target2 = `const [viewMode, setViewMode] = useState<"list" | "grid">("grid");`;
const repl2 = `const [viewMode, setViewMode] = useState<"list" | "grid">(hl ? "list" : "grid");

  useEffect(() => {
    if (hl && viewMode === "list") {
      setTimeout(() => {
        const el = document.getElementById(\`appt-\${hl}\`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight effect
          el.classList.add('bg-emerald/20');
          setTimeout(() => el.classList.remove('bg-emerald/20'), 2000);
        }
      }, 500);
    }
  }, [hl, viewMode, appts]);`;

code = code.replace(target2, repl2);

const target3 = `<tr key={item.id} className="transition hover:bg-ivory/60">`;
const repl3 = `<tr key={item.id} id={\`appt-\${item.id}\`} className={\`transition \${hl === item.id ? 'bg-emerald/10' : 'hover:bg-ivory/60'}\`}>`;

code = code.replace(target3, repl3);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Patched appointments.tsx");
