const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.tsx', 'utf8');

// Replace the old footer content
const oldFooterRegex = /&copy; 2026 Emily Spa.*?0943\.867\.865/s;

const newFooter = '&copy; 2026 Emily Spa &bull; Crafted by <span className="font-bold text-ink/60">Nguyễn Tuấn Vũ &times; AI</span> &bull; <Phone className="inline-block size-3.5 -mt-0.5 mr-0.5" /> 0943.867.865';

code = code.replace(oldFooterRegex, newFooter);

fs.writeFileSync('src/routes/dashboard.tsx', code, 'utf8');
