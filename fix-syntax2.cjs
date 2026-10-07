const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

const target = `<div className="relative w-full sm:max-w-sm">`;
const replacement = `</div>\n        <div className="relative w-full sm:max-w-sm">`;

code = code.replace(target, replacement);

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("Fixed missing closing tag.");
