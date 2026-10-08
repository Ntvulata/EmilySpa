const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.tsx', 'utf8');

const navOld = `className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible lg:px-3"`;
const navNew = `className="flex gap-1 overflow-x-auto scrollbar-hide px-3 pb-4 lg:flex-col lg:overflow-visible lg:px-3"`;

const footerOld = `className="mt-auto border-t border-ink/5 bg-ivory/50 px-5 py-4 text-center sm:px-8"`;
const footerNew = `className="mt-auto border-t border-ink/5 bg-ivory/50 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,20px))] text-center sm:px-8"`;

code = code.replace(navOld, navNew).replace(footerOld, footerNew);
fs.writeFileSync('src/routes/dashboard.tsx', code, 'utf8');
console.log("Patched dashboard.tsx");
