const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// Add fbGetTherapists to imports
code = code.replace(
  'import { fbSaveAppointment, fbSaveAppointmentAndHistory, fbDeleteAppointment } from "@/lib/firebase";',
  'import { fbSaveAppointment, fbSaveAppointmentAndHistory, fbDeleteAppointment, fbGetTherapists } from "@/lib/firebase";'
);

// Add dbTherapists state
const stateToInject = `  const [dbTherapists, setDbTherapists] = useState<any[]>([]);
  useEffect(() => {
    fbGetTherapists().then(data => {
      if (data && data.length > 0) {
        setDbTherapists(data);
      } else {
        setDbTherapists(masterTherapists);
      }
    }).catch(console.error);
  }, []);
`;

code = code.replace(
  '  const [statusFilter, setStatusFilter] = useState("all");',
  '  const [statusFilter, setStatusFilter] = useState("all");\n' + stateToInject
);

// Replace masterTherapists with dbTherapists everywhere except in the import and fallback
code = code.replace(/masterTherapists/g, 'dbTherapists');
code = code.replace(/dbTherapists\.map\(/g, 'dbTherapists.map('); // Just checking syntax

// Wait, the import is `therapists as masterTherapists`. So replacing masterTherapists with dbTherapists will break the import!
// Let's fix the import back:
code = code.replace(
  'therapists as dbTherapists } from "@/lib/spa-data";',
  'therapists as masterTherapists } from "@/lib/spa-data";'
);
// And in the fallback:
code = code.replace(
  'setDbTherapists(dbTherapists);',
  'setDbTherapists(masterTherapists);'
);

// We must also fix therapistNames to use dbTherapists:
code = code.replace(
  'const therapistNames = dbTherapists',
  'const therapistNames = dbTherapists'
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Injected dbTherapists into appointments");
