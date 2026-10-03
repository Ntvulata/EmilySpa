const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const regexOldPkgTop = /\{customerPackages\.length > 0 && \([\s\S]*?Dùng Gói\/Thẻ[\s\S]*?<\/div>\s*\)\}/;
// Wait, my regex might fail because of mangled characters.
// Let's use `\{customerPackages\.length > 0 && \(\s*<div className="col-span-1 space-y-1\.5 p-2\.5[\s\S]*?<\/div>\s*\)\}`

const topBlockStart = code.indexOf('{customerPackages.length > 0 && (\n                <div className="col-span-1 space-y-1.5 p-2.5');
if (topBlockStart !== -1) {
    const endStr = '</select>\n                  </div>\n                )}';
    const topBlockEnd = code.indexOf(endStr, topBlockStart) + endStr.length;
    code = code.substring(0, topBlockStart) + code.substring(topBlockEnd);
}

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Removed top package block");
