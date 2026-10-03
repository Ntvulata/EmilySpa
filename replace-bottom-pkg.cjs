const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const regex = /<div className="sm:col-span-2 rounded-lg border border-emerald\/20 bg-gradient-to-r from-emerald\/\[0\.04\]\s*to-transparent mt-2 p-4">[\s\S]*?S\? ti\?n th\?c thu[\s\S]*?<\/label>\s*<\/div>\s*<\/div>/;

const newBlock = `<div className="sm:col-span-2 rounded-lg border border-emerald/20 bg-gradient-to-r from-emerald/[0.04] to-transparent mt-2 p-4">
              <p className="text-sm font-bold mb-3 text-ink flex items-center gap-2">💳 Thanh toán & Trừ thẻ</p>
              
              {customerPackages.length > 0 && (
                <div className="mb-4 space-y-2 border-b border-emerald/10 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-ink/50">Các gói thẻ đang áp dụng</span>
                    <select
                      className="rounded-[3px] border border-ink/15 bg-ivory px-2 py-1 text-xs outline-none focus:border-emerald"
                      value=""
                      onChange={e => {
                        const newPkg = e.target.value;
                        if (!newPkg) return;
                        if (form.packagesDeducted.some(p => p.packageId === newPkg)) return;
                        
                        const pkgType = customerPackages.find(p => p.id === newPkg)?.type || "sessions";
                        setForm({...form, packagesDeducted: [...form.packagesDeducted, { packageId: newPkg, type: pkgType as any, deducted: "1" }]});
                      }}
                    >
                      <option value="">+ Chọn gói thẻ để trừ...</option>
                      {customerPackages.filter(p => !form.packagesDeducted.some(pd => pd.packageId === p.id)).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} - Còn {p.type === "balance" ? formatVnd(p.remaining) : \`\${p.remaining} buổi\`}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {form.packagesDeducted.map((pkg, i) => {
                    const pDef = customerPackages.find(p => p.id === pkg.packageId);
                    if (!pDef) return null;
                    return (
                      <div key={pkg.packageId} className="flex flex-wrap items-end gap-3 rounded bg-white p-3 shadow-sm ring-1 ring-ink/5">
                        <div className="flex-1 min-w-[120px]">
                          <p className="text-xs font-semibold">{pDef.name}</p>
                          <p className="text-[10px] text-ink/50 mt-0.5">Còn {pDef.type === "balance" ? formatVnd(pDef.remaining) : \`\${pDef.remaining} buổi\`}</p>
                        </div>
                        <div className="w-32">
                          <label className="text-[10px] uppercase text-ink/50 font-bold mb-1 block">
                            {pDef.type === "balance" ? "Số tiền trừ (VND)" : "Số buổi trừ"}
                          </label>
                          <input 
                            className={inputClass + " py-1.5"} 
                            value={pkg.deducted}
                            onChange={e => {
                              const raw = e.target.value.replace(/\\D/g, "");
                              const val = pDef.type === "balance" ? (raw ? Number(raw).toLocaleString("en-US") : "") : raw;
                              const newArr = [...form.packagesDeducted];
                              newArr[i].deducted = val;
                              setForm({...form, packagesDeducted: newArr});
                            }}
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            setForm({...form, packagesDeducted: form.packagesDeducted.filter((_, idx) => idx !== i)});
                          }}
                          className="text-ink/40 hover:text-red-500 p-2 transition"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/50">
                   Số tiền thực thu (Thanh toán thêm/dịch vụ ngoài)
                   <input className={inputClass} value={form.price} onChange={e => {
                     const raw = e.target.value.replace(/\\D/g, "");
                     setForm({...form, price: raw ? Number(raw).toLocaleString("en-US") : ""});
                   }} inputMode="numeric" placeholder="VND..." />
                </label>
              </div>
            </div>`;

code = code.replace(regex, newBlock);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Replaced bottom block");
