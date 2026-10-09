const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const buggyBlock = `  const d = new Date();
  d.setDate(d.getDate() - 6);
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const hl = searchParams.get("hl");
  const hlAppt = hl ? initialAppointments.find(a => a.id === hl) : null;
  const [fromDate, setFromDate] = useState(hlAppt ? hlAppt.date : d.toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(hlAppt ? hlAppt.date : new Date().toISOString().split("T")[0]);`;

const safeBlock = `  const d = new Date();
  d.setDate(d.getDate() - 6);
  const [fromDate, setFromDate] = useState(d.toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [hl, setHl] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const h = params.get("hl");
      if (h) {
        setHl(h);
        const appt = initialAppointments.find(a => a.id === h);
        if (appt) {
          setFromDate(appt.date);
          setToDate(appt.date);
        }
      }
    }
  }, []);`;

code = code.replace(buggyBlock, safeBlock);

const buggyViewMode = `const [viewMode, setViewMode] = useState<"list" | "grid">(hl ? "list" : "grid");`;
const safeViewMode = `const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes("hl=")) {
      setViewMode("list");
    }
  }, []);`;

code = code.replace(buggyViewMode, safeViewMode);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Patched to be SSR safe");
