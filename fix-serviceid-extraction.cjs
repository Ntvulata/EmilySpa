const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

const targetStr = `    let parsedServiceId = "";
    if (isCustom) {
      const parts = item.packageId.split("_");
      if (parts.length >= 2) parsedServiceId = parts[1];
    }`;

const replacementStr = `    let parsedServiceId = "";
    if (isCustom) {
      const withoutPrefix = item.packageId.replace("CUSTOM_", "");
      const lastUnderscoreIdx = withoutPrefix.lastIndexOf("_");
      if (lastUnderscoreIdx !== -1) {
        parsedServiceId = withoutPrefix.substring(0, lastUnderscoreIdx);
      }
    }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("PATCHED startEdit serviceId extraction");
