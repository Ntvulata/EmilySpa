const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

// Update emptyService
code = code.replace(
  /const emptyService = \{ id: "", name: "", duration: "60", price: "" \};/g,
  'const emptyService = { id: "", name: "", duration: "60", price: "", commission: "" };'
);

// Update setForm in editService
code = code.replace(
  /setForm\(\{ id: s\.id, name: s\.name, duration: s\.duration\.replace\(\/\\D\/g, ""\), price: s\.price \? Number\(s\.price\)\.toLocaleString\("en-US"\) : "" \}\);/g,
  'setForm({ id: s.id, name: s.name, duration: s.duration.replace(/\\D/g, ""), price: s.price ? Number(s.price).toLocaleString("en-US") : "", commission: s.commission ? Number(s.commission).toLocaleString("en-US") : "0" });'
);

// Update submit (add commission variable)
code = code.replace(
  /const price = Number\(form\.price\.replace\(\/\\D\/g, ""\)\);/,
  'const price = Number(form.price.replace(/\\D/g, ""));\n    const commission = Number(form.commission.replace(/\\D/g, ""));'
);

code = code.replace(
  /const item = \{ id: form\.id \|\| \("SRV_" \+ Date\.now\(\)\), name, duration: \`\$\{minutes\} phút\`, price \};/,
  'const item = { id: form.id || ("SRV_" + Date.now()), name, duration: `${minutes} phút`, price, commission };'
);

// Update table header
code = code.replace(
  /<th className="px-4 py-3 text-right">Giá \(VNĐ\)<\/th>/,
  '<th className="px-4 py-3 text-right">Giá (VNĐ)</th>\n                  <th className="px-4 py-3 text-right">Hoa hồng KTV</th>'
);

// Update table row
code = code.replace(
  /<td className="px-4 py-3\.5 text-right font-medium text-ink">\{formatVnd\(item\.price\)\}<\/td>/,
  '<td className="px-4 py-3.5 text-right font-medium text-ink">{formatVnd(item.price)}</td>\n                  <td className="px-4 py-3.5 text-right font-medium text-emerald">{formatVnd(item.commission || 0)}</td>'
);

// Update Form fields
code = code.replace(
  /<label className="block space-y-1\.5 text-xs font-semibold text-ink\/60">\s*Thời lượng \(phút\)/,
  `<label className="block space-y-1.5 text-xs font-semibold text-ink/60">
                Hoa hồng KTV (VNĐ)
                <input className={inputClass} value={form.commission} onChange={update("commission")} inputMode="numeric" placeholder="VD: 50,000" />
              </label>\n              <label className="block space-y-1.5 text-xs font-semibold text-ink/60">\n                Thời lượng (phút)`
);

// Fix quick-add service logic
code = code.replace(
  /const form = \{ id: "SRV_" \+ Date\.now\(\) \+ Math\.random\(\)\.toString\(36\)\.substr\(2, 5\), name: row\[0\]\.trim\(\), duration: row\[1\]\.trim\(\), price \};/g,
  `const form = { id: "SRV_" + Date.now() + Math.random().toString(36).substr(2, 5), name: row[0].trim(), duration: row[1].trim(), price, commission: 0 };`
);

fs.writeFileSync('src/routes/dashboard.services.tsx', code, 'utf8');
