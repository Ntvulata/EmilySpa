const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// 1. Add calculateTotalPrice
if (!code.includes('function calculateTotalPrice')) {
  code = code.replace(
    'function calculateEndTime',
    `function calculateTotalPrice(services: string[], serviceOptions: any[]) {
  let total = 0;
  services.forEach(id => {
    const s = serviceOptions.find(opt => opt.id === id);
    if (s && s.price) total += Number(s.price);
  });
  return total;
}

function calculateEndTime`
  );
}

// 2. Layout replacement
const oldLayout = `<div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wide text-ink/50">Khách Hàng</label>
              <SearchableSelect
                options={customerOptions}
                value={form.customerId}
                onChange={(v) => { setForm({ ...form, customerId: v, packageUsed: "" }); setError(""); }}
                placeholder="-- Chọn khách hàng --"
              />
            </div>
            
            {customerPackages.length > 0 && (
              <div className="sm:col-span-2 space-y-1.5 p-3 rounded-[3px] border border-champagne/40 bg-champagne/10">
                <label className="text-xs font-semibold text-ink/80 flex items-center gap-2">
                  <span>Dùng Gói/Thẻ (Khách có {customerPackages.length} thẻ)</span>
                </label>
                <select 
                  className={inputClass}
                  value={form.packageUsed}
                  onChange={e => setForm({...form, packageUsed: e.target.value})}
                >
                  <option value="">-- Không dùng thẻ (Thanh toán trực tiếp) --</option>
                  {customerPackages.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - Còn {p.type === "balance" ? formatVnd(p.remaining) : \`\${p.remaining} buổi\`}
                    </option>
                  ))}
                </select>
              </div>
            )}`;

const newLayout = `<div className={\`sm:col-span-2 grid gap-4 \${customerPackages.length > 0 ? "grid-cols-3" : "grid-cols-1"}\`}>
              <div className={\`space-y-1.5 \${customerPackages.length > 0 ? "col-span-2" : "col-span-1"}\`}>
                <label className="text-[11px] font-bold uppercase tracking-wide text-ink/50">Khách Hàng</label>
                <SearchableSelect
                  options={customerOptions}
                  value={form.customerId}
                  onChange={(v) => { 
                    const total = calculateTotalPrice(form.serviceIds, serviceOptions);
                    setForm({ ...form, customerId: v, packageUsed: "", price: total > 0 ? total.toLocaleString("en-US") : "" }); 
                    setError(""); 
                  }}
                  placeholder="-- Chọn khách hàng --"
                />
              </div>
              
              {customerPackages.length > 0 && (
                <div className="col-span-1 space-y-1.5 p-2.5 rounded-[3px] border border-champagne/40 bg-champagne/10">
                  <label className="text-xs font-semibold text-ink/80 flex items-center gap-2">
                    <span>Dùng Gói/Thẻ</span>
                  </label>
                  <select 
                    className={inputClass}
                    value={form.packageUsed}
                    onChange={e => {
                      const newPkg = e.target.value;
                      let newPrice = form.price;
                      if (!newPkg) {
                        const total = calculateTotalPrice(form.serviceIds, serviceOptions);
                        newPrice = total > 0 ? total.toLocaleString("en-US") : "";
                      }
                      setForm({...form, packageUsed: newPkg, price: newPrice});
                    }}
                  >
                    <option value="">-- Không dùng --</option>
                    {customerPackages.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - Còn {p.type === "balance" ? formatVnd(p.remaining) : \`\${p.remaining} buổi\`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>`;

// Use simple replacement logic, we know the file content.
// Since powershell might have different line endings, we replace spaces/newlines with regex for the target section.
