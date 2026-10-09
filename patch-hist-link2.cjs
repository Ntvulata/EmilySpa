const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

const target = `<Link to={\`/dashboard/appointments?hl=\${item.appointmentId}\`} className="inline-flex items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-emerald/40 hover:text-emerald">`;
const repl = `<Link to="/dashboard/appointments" search={{ hl: item.appointmentId } as any} className="inline-flex items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-emerald/40 hover:text-emerald">`;

code = code.replace(target, repl);
fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("Patched history link to use search prop");
