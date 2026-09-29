const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// The label to extract and move
const regexLabel = /<label className="space-y-1\.5 sm:col-span-2">\s*<span className="text-\[11px\] font-bold uppercase tracking-wide text-ink\/50">Ghi ch[^<]*<\/span>\s*<textarea[\s\S]*?<\/label>/;

const match = code.match(regexLabel);
if (match) {
  const labelCode = match[0];
  
  // Remove it from its current position
  code = code.replace(labelCode, '');
  
  // Insert it before the end of the grid, which is marked by the line just before {error &&
  const gridEndRegex = /<\/div>\s*\{error && <p role="alert"/;
  code = code.replace(gridEndRegex, `${labelCode}\n            </div>\n            {error && <p role="alert"`);
  
  fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
  console.log("Moved Ghi chú layout");
} else {
  console.log("Could not find Ghi chú label.");
}
