const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const oldTimeAxis = `className="border-r border-ink/10 flex items-start justify-center pt-0.5 pointer-events-none bg-ivory-deep/30"`;
const newTimeAxis = `className="sticky left-0 z-20 border-r border-ink/10 flex items-start justify-center pt-0.5 pointer-events-none bg-ivory-deep/95 backdrop-blur shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"`;

code = code.replace(oldTimeAxis, newTimeAxis);

const oldHeaderCell = `<div className="border-r border-ink/10 px-2 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45 text-center">`;
const newHeaderCell = `<div className="sticky left-0 z-40 border-r border-ink/10 px-2 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45 text-center bg-ivory-deep/95 backdrop-blur shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">`;

// Only replace the first instance which is the Giờ header
if (code.includes(oldHeaderCell)) {
    code = code.replace(oldHeaderCell, newHeaderCell);
}

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Patched grid");
