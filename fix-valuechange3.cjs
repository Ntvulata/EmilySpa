const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

const targetValue = 'value={form.valueChange}';
const labelStart = code.lastIndexOf('<label className="space-y-1.5 text-xs font-semibold text-ink/60">', code.indexOf(targetValue));
const labelEnd = code.indexOf('</label>', labelStart) + 8;

if (labelStart !== -1 && labelEnd !== -1) {
    const replacement = `<label className="space-y-1.5 text-xs font-semibold text-ink/60">
                {sellMode === "custom" ? "Số buổi (Lượt)" : "Giá trị cấp cho khách (Số buổi / Số tiền)"}
                <input
                  className="w-full rounded-[3px] border border-ink/15 bg-ivory px-3 py-2.5 text-sm font-normal text-ink outline-none transition focus:border-emerald"
                  value={form.valueChange}
                  onChange={(e) => { 
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
                  }}
                  inputMode="numeric"
                  placeholder="VD: 5"
                />
              </label>`;
    
    code = code.substring(0, labelStart) + replacement + code.substring(labelEnd);
    fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
    console.log("PATCHED successfully!");
} else {
    console.log("Failed to find boundaries");
}
