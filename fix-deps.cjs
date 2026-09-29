const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

code = code.replace(
  '  const therapists = useMemo(() => {\n      return therapistNames.map(name => ({\n        name,\n        sessions: rows.filter(r => r.therapistId === name || r.therapist === name).length\n      }));\n    }, [rows]);',
  '  const therapists = useMemo(() => {\n      return therapistNames.map(name => ({\n        name,\n        sessions: rows.filter(r => r.therapistId === name || r.therapist === name).length\n      }));\n    }, [rows, therapistNames]);'
);

// wait, let's just use string replace without newlines to be safe, or just use a generic regex:
code = code.replace(
  /sessions: rows\.filter\(r => r\.therapistId === name \|\| r\.therapist === name\)\.length\n\s*\}\)\);\n\s*\}, \[rows\]\);/g,
  'sessions: rows.filter(r => r.therapistId === name || r.therapist === name).length\n      }));\n    }, [rows, therapistNames]);'
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Fixed useMemo dependencies");
