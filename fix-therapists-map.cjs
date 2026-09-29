const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const oldBlock = `  const therapists = useMemo(() => {
    return therapistNames.map(name => ({
      name,
      sessions: rows.filter(r => r.therapistId === name || r.therapist === name).length
    }));
  }, [rows, therapistNames]);`;

const newBlock = `  const therapists = useMemo(() => {
    return therapistNames.map(name => {
      const tObj = dbTherapists.find((d: any) => d.name === name);
      const tId = tObj?.id || name;
      return {
        id: tId,
        name,
        sessions: rows.filter(r => r.therapistId === tId || r.therapistId === name || r.therapist === name).length
      };
    });
  }, [rows, therapistNames, dbTherapists]);`;

// Just to be safe with line endings and spaces, let's use a regex replace for the whole useMemo:
code = code.replace(
  /const therapists = useMemo\(\(\) => \{\s*return therapistNames\.map\(name => \(\{\s*name,\s*sessions: rows\.filter\(r => r\.therapistId === name \|\| r\.therapist === name\)\.length\s*\}\)\);\s*\}, \[rows, therapistNames\]\);/g,
  newBlock
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Fixed therapists useMemo mapping");
