const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

code = code.replace(
  /const getFormatValue = \(pkgId: string, value: number\) => \{[\s\S]*?return p\.type === 'sessions' \? `\$\{value > 0 \? '\+' : ''\}\$\{value\} bu i` : `\$\{value > 0 \? '\+' : ''\}\$\{formatVnd\(value\)\}`;/m,
  `const getFormatValue = (pkgId: string, value: number) => {
    if (pkgId.startsWith("CUSTOM_")) return \`\${value > 0 ? '+' : ''}\${value} buổi\`;
    const p = masterPackages.find(x => x.id === pkgId);
    if (!p) return value;
    return p.type === 'sessions' ? \`\${value > 0 ? '+' : ''}\${value} buổi\` : \`\${value > 0 ? '+' : ''}\${formatVnd(value)}\`;`
);

code = code.replace(
  /\{getPackageName\(item\.packageId\)\}/g,
  `{item.customName || getPackageName(item.packageId)}`
);

// We should also fix the SearchableSelect of source packages for Convert:
// activePackagesForSelected uses masterPackages.find
code = code.replace(
  /const pDef = masterPackages\.find\(p => p\.id === pId\);\n\s*if \(pDef\) \{\n\s*result\.push\(\{ pId, name: pDef\.name, remaining, type: pDef\.type \}\);\n\s*\}/g,
  `const pDef = masterPackages.find(p => p.id === pId);
          if (pDef) {
            result.push({ pId, name: pDef.name, remaining, type: pDef.type });
          } else if (pId.startsWith("CUSTOM_")) {
            // Find custom name from history
            const h = packageHistory.find(x => x.packageId === pId && x.customName);
            result.push({ pId, name: h ? h.customName : pId, remaining, type: "sessions" });
          }`
);

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("Fixed display logic");
