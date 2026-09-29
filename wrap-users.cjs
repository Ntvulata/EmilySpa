const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.settings.tsx', 'utf8');

const regex = /(<section className="rounded-\[3px\] border border-ink\/10 bg-ivory-deep\/30 p-5 sm:p-6">\s*<h2 className="font-display text-2xl text-ink mb-4">T[^<]+h[^<]+<\/h2>[\s\S]*?<\/section>)/;
code = code.replace(regex, '{isAdmin && (\n$1\n)}');

fs.writeFileSync('src/routes/dashboard.settings.tsx', code, 'utf8');
console.log("Wrapped users section in isAdmin");
