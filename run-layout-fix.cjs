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
const regexLayout = /<div className="space-y-1\.5 sm:col-span-2">\s*<label className="text-\[11px\] font-bold uppercase tracking-wide text-ink\/50">Kh(?:Ã¡|áº¡)ch H(?:Ã |Ã )ng<\/label>[\s\S]*?<\/select>\s*<\/div>\s*\)\}/;

// Wait, the accents might be encoded in utf8. I'll just use a more generic regex.
const regexLayoutSafe = /<div className="space-y-1\.5 sm:col-span-2">\s*<label className="text-\[11px\][^>]*>Kh[^<]*H[^<]*<\/label>[\s\S]*?<\/select>\s*<\/div>\s*\)\}/;

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
                  <label className="text-[11px] font-bold uppercase tracking-wide text-ink/50 flex items-center gap-2">
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

code = code.replace(regexLayoutSafe, newLayout);

// 3. Update Service Dropdown Options to show price
code = code.replace(
  /options=\{serviceOptions\.map\(s => \(\{ value: s\.id, label: s\.name \}\)\)\}/g,
  'options={serviceOptions.map(s => ({ value: s.id, label: `${s.name} - ${s.price ? Number(s.price).toLocaleString("en-US") + " VNĐ" : "0 VNĐ"}` }))}'
);

// 4. Update service selection to auto-calc price
const oldServiceOnChange = /onChange=\{v => \{\s*const newS = \[\.\.\.form\.serviceIds\];\s*newS\[i\] = v;\s*setForm\(\{\.\.\.form, serviceIds: newS, endTime: calculateEndTime\(form\.time, newS, serviceOptions\)\}\);\s*\}\}/g;
const newServiceOnChange = `onChange={v => {
                              const newS = [...form.serviceIds];
                              newS[i] = v;
                              const endTime = calculateEndTime(form.time, newS, serviceOptions);
                              let newPrice = form.price;
                              if (!form.packageUsed) {
                                const total = calculateTotalPrice(newS, serviceOptions);
                                newPrice = total > 0 ? total.toLocaleString("en-US") : "";
                              }
                              setForm({...form, serviceIds: newS, endTime, price: newPrice});
                            }}`;
code = code.replace(oldServiceOnChange, newServiceOnChange);

// 5. Update remove service button to auto-calc price
const oldRemoveService = /const newS = form\.serviceIds\.filter\(\(_, idx\) => idx !== i\);\s*setForm\(\{\.\.\.form, serviceIds: newS, endTime: calculateEndTime\(form\.time, newS, serviceOptions\)\}\);/g;
const newRemoveService = `const newS = form.serviceIds.filter((_, idx) => idx !== i);
                              const endTime = calculateEndTime(form.time, newS, serviceOptions);
                              let newPrice = form.price;
                              if (!form.packageUsed) {
                                const total = calculateTotalPrice(newS, serviceOptions);
                                newPrice = total > 0 ? total.toLocaleString("en-US") : "";
                              }
                              setForm({...form, serviceIds: newS, endTime, price: newPrice});`;
code = code.replace(oldRemoveService, newRemoveService);

// 6. Update startNew so that it auto-fills the price based on default service
const oldStartNew = /endTime: calculateEndTime.*?,\s*customerId: "",\s*serviceIds: (.*?),/s;
const newStartNewMatch = code.match(/serviceIds: (.*?),/);
if (newStartNewMatch) {
  // Just rewrite startNew partially, or let's just do a regex replace on the state initialization
  code = code.replace(
    /endTime: calculateEndTime\(getNext15MinTime\(\), serviceOptions\.length > 0 \? \[serviceOptions\[0\]\.id\] : \[""\], serviceOptions\),/g,
    `endTime: calculateEndTime(getNext15MinTime(), serviceOptions.length > 0 ? [serviceOptions[0].id] : [""], serviceOptions),`
  );
  // Actually, price in startNew is initialized as "". We can change it.
  code = code.replace(
    /packageUsed: "",\s*price: "",\s*sessionsDeducted: "1",/g,
    `packageUsed: "",
        price: serviceOptions.length > 0 && serviceOptions[0].price ? Number(serviceOptions[0].price).toLocaleString("en-US") : "",
        sessionsDeducted: "1",`
  );
}


fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Refactoring complete");
