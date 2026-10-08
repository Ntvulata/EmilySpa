const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const target1 = `className="sticky left-0 z-20 border-r border-ink/10 flex items-start justify-center pt-0.5 pointer-events-none bg-ivory-deep/95 backdrop-blur shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"`;
const replace1 = `className="sticky left-0 z-20 border-r border-ink/10 flex items-start justify-center pt-0.5 bg-ivory-deep/95 backdrop-blur shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"`;

code = code.replace(target1, replace1);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Patched pointer events");
