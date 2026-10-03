const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

const targetStr = `<label className="space-y-1.5 text-xs font-semibold text-ink/60">
                GiA tr< cp cho khAch (S\` bu i / S\` ti?n)
                <input className="w-full rounded-[3px] border border-ink/15 bg-ivory px-3 py-2.5 text-sm font-normal text-ink outline-none" value={form.valueChange} onChange={(e) => { const raw = e.target.value.replace(/\\D/g, ""); setForm({ ...form, valueChange: raw ? Number(raw).toLocaleString("en-US") : "" }); }} inputMode="numeric" placeholder="VD: 10 bu i ho_c 5,000,000" />
              </label>`;

// It might be corrupted because of encoding. Let's use indexOf instead to locate the exact label.
const startAnchor = '<label className="space-y-1.5 text-xs font-semibold text-ink/60">\n                GiA tr< cp cho khAch';
let startIdx = code.indexOf(startAnchor);

if (startIdx === -1) {
  // Let's try alternative regex
  const regex = /<label className="space-y-1\.5 text-xs font-semibold text-ink\/60">\s*Gi.*?tr.*?c.*?p cho kh.*?ch \((S.*? bu.*? i \/ S.*? ti.*?n)\)\s*<input className="w-full rounded-\[3px\] border border-ink\/15 bg-ivory px-3 py-2\.5 text-sm font-normal text-ink outline-none" value=\{form\.valueChange\} onChange=\{\(e\) => \{ const raw = e\.target\.value\.replace\(\/\\D\/g, ""\); setForm\(\{ \.\.\.form, valueChange: raw \? Number\(raw\)\.toLocaleString\("en-US"\) : "" \}\); \}\} inputMode="numeric" placeholder="VD: 10 bu.*? i ho.*?c 5,000,000" \/>\s*<\/label>/;
  
  if (regex.test(code)) {
    const replacement = `<label className="space-y-1.5 text-xs font-semibold text-ink/60">
                {sellMode === "custom" ? "Số buổi (Lượt)" : "Giá trị cấp cho khách (Số buổi / Số tiền)"}
                <input className="w-full rounded-[3px] border border-ink/15 bg-ivory px-3 py-2.5 text-sm font-normal text-ink outline-none" value={form.valueChange} onChange={(e) => { 
                  const raw = e.target.value.replace(/\\D/g, ""); 
                  let newPrice = form.pricePaid;
                  if (sellMode === "custom" && raw) {
                    const svc = serviceOptions.find(s => s.id === form.serviceId);
                    if (svc) {
                      newPrice = Number(svc.price * Number(raw)).toLocaleString("en-US");
                    }
                  } else if (sellMode === "custom" && !raw) {
                    newPrice = "";
                  }
                  setForm({ ...form, valueChange: raw ? Number(raw).toLocaleString("en-US") : "", pricePaid: sellMode === "custom" ? newPrice : form.pricePaid }); 
                }} inputMode="numeric" placeholder={sellMode === "custom" ? "VD: 10" : "VD: 10 buổi hoặc 5,000,000"} />
              </label>`;
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
    console.log("PATCHED via regex!");
  } else {
    console.log("Regex didn't match.");
  }
} else {
    console.log("String indexOf logic not implemented, rely on regex.");
}
