const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

// Ensure emptyService has commission
code = code.replace(
  /const emptyService = \{ id: "", name: "", duration: "60", price: "" \};/g,
  'const emptyService = { id: "", name: "", duration: "60", price: "", commission: "" };'
);

// Ensure setForm in editService has commission
code = code.replace(
  /setForm\(\{ id: s\.id, name: s\.name, duration: s\.duration\.replace\(\/\\D\/g, ""\), price: s\.price \? Number\(s\.price\)\.toLocaleString\("en-US"\) : "" \}\);/g,
  'setForm({ id: s.id, name: s.name, duration: s.duration.replace(/\\D/g, ""), price: s.price ? Number(s.price).toLocaleString("en-US") : "", commission: s.commission ? Number(s.commission).toLocaleString("en-US") : "" });'
);

// Ensure submit parses commission
code = code.replace(
  /const price = Number\(form\.price\.replace\(\/\\D\/g, ""\)\);/,
  'const price = Number(form.price.replace(/\\D/g, ""));\n    const commission = form.commission ? Number(form.commission.replace(/\\D/g, "")) : 0;'
);
code = code.replace(
  /const item = \{ id: form\.id \|\| \("SRV_" \+ Date\.now\(\)\), name, duration: \`\$\{minutes\} phút\`, price \};/,
  'const item = { id: form.id || ("SRV_" + Date.now()), name, duration: `${minutes} phút`, price, commission };'
);

// Update UI Grid layout
code = code.replace(
  /className="grid gap-3 sm:grid-cols-\[2fr_1fr_1fr\]"/g,
  'className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr]"'
);

// Inject commission input next to duration
const commissionHtml = `
                  <label className="space-y-1.5 text-xs font-semibold text-ink/60">
                    Hoa hồng KTV (VNĐ)
                    <input className={inputClass} value={form.commission} onChange={update("commission")} inputMode="numeric" placeholder="VD: 50,000" />
                  </label>
`;
code = code.replace(
  /(<label className="space-y-1\.5 text-xs font-semibold text-ink\/60">\s*Gi[^<]*\s*<input className=\{inputClass\} value=\{form\.price\}[^>]*>\s*<\/label>)/,
  '$1\n' + commissionHtml
);


fs.writeFileSync('src/routes/dashboard.services.tsx', code, 'utf8');
