const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const lines = code.split('\n');
let replaced = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const therapists = useMemo(() => {')) {
    // search for the closing bracket
    for (let j = i + 1; j < i + 10; j++) {
      if (lines[j] && lines[j].includes('}, [rows]);')) {
        lines[j] = lines[j].replace('}, [rows]);', '}, [rows, therapistNames]);');
        replaced = true;
        break;
      }
    }
    if (replaced) break;
  }
}

if (replaced) {
  fs.writeFileSync('src/routes/dashboard.appointments.tsx', lines.join('\n'), 'utf8');
  console.log("Successfully fixed dependency");
} else {
  console.log("Could not find line");
}
