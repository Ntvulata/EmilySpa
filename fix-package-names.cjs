const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

const getPackageNameTarget = `const getPackageName = (id: string) => masterPackages.find(p => p.id === id)?.name || id;`;
const getPackageNameReplacement = `const getPackageName = (id: string) => {
    const m = masterPackages.find(p => p.id === id);
    if (m) return m.name;
    const h = packageHistory.find(x => x.packageId === id && x.customName);
    return h ? h.customName : id;
  };`;
code = code.replace(getPackageNameTarget, getPackageNameReplacement);

const pNameTarget = `const pName = masterPackages.find(p => p.id === h.packageId)?.name?.toLowerCase() || h.packageId.toLowerCase();`;
const pNameReplacement = `const pName = getPackageName(h.packageId).toLowerCase();`;
code = code.replace(pNameTarget, pNameReplacement);

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("Fixed getPackageName display logic");
