const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const getPkgTarget = `  const getPackageName = (id?: string) => {
    if (!id) return "Khng dng th?";
    const p = masterPackages.find(x => x.id === id);
    return p ? p.name : id;
  };`;

const getPkgReplacement = `  const getPackageName = (id?: string) => {
    if (!id) return "Không dùng thẻ";
    const p = masterPackages.find(x => x.id === id);
    if (p) return p.name;
    const h = packageHistory.find(x => x.packageId === id && x.customName);
    return h ? h.customName : id;
  };`;

// Use regex or indexOf since encoding chars could mess up the match
let idx = code.indexOf('const getPackageName = (id?: string) => {');
if (idx !== -1) {
    let endIdx = code.indexOf('};', idx);
    code = code.substring(0, idx) + getPkgReplacement + code.substring(endIdx + 2);
}

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Patched getPackageName");
