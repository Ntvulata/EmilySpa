const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.customers.tsx', 'utf8');

const targetStr = `const def = masterPackages.find(m => m.id === pkg.packageId);
                          if (!def) return null;`;

const replacement = `let def = masterPackages.find(m => m.id === pkg.packageId);
                          if (!def && pkg.packageId.startsWith("CUSTOM_")) {
                            const h = packageHistory.find(x => x.packageId === pkg.packageId && x.customName);
                            def = { name: h ? (h.customName || pkg.packageId) : pkg.packageId, type: "sessions" } as any;
                          }
                          if (!def) return null;`;

// Using split/join to replace all occurrences globally without relying on RegEx that might fail on spacing
const pieces = code.split('const def = masterPackages.find(m => m.id === pkg.packageId);\n                          if (!def) return null;');
if (pieces.length > 1) {
    code = pieces.join(replacement);
} else {
    // try slightly different spacing
    const regex = /const def = masterPackages\.find\(m => m\.id === pkg\.packageId\);\s*if \(\!def\) return null;/g;
    code = code.replace(regex, replacement);
}

fs.writeFileSync('src/routes/dashboard.customers.tsx', code, 'utf8');
console.log("Updated active packages display logic!");
