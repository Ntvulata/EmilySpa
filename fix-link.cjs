const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

code = code.replace(
  /import \{ createFileRoute \} from "@tanstack\/react-router";/,
  'import { createFileRoute, Link } from "@tanstack/react-router";'
);

code = code.replace(
  /<span className="text-\[10px\] text-ink\/40 uppercase">[^<]*<\/span>/,
  '{item.type === "deduct" ? <Link to="/dashboard/appointments" className="inline-flex items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-emerald/40 hover:text-emerald">Đến Lịch hẹn</Link> : <span className="text-[10px] text-ink/40 uppercase">Không thể sửa</span>}'
);

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
