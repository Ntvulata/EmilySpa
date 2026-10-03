const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const startBlock = '<div className="sm:col-span-2 rounded-lg border border-emerald/20 bg-gradient-to-r from-emerald/[0.04]';
const startIdx = code.indexOf(startBlock);

const endBlock = '<label className="space-y-1.5 sm:col-span-2">';
const endIdx = code.indexOf(endBlock, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  // Find the closing </div> that comes right before endIdx
  const blockEndStr = code.substring(startIdx, endIdx);
  const lastDivIndex = blockEndStr.lastIndexOf('</div>');
  
  if (lastDivIndex !== -1) {
    const newBlock = `<div className="sm:col-span-2 rounded-[6px] border border-emerald/20 bg-emerald/[0.02] mt-2 p-4">
              <p className="text-sm font-bold mb-3 text-ink flex items-center gap-2">💳 Thanh toán & Trừ thẻ</p>
              
              {customerPackages.length > 0 && (
                <div className="mb-4 space-y-2 border-b border-emerald/10 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-ink/50">Trừ vào gói thẻ</span>
                    <select
                      className="rounded-[3px] border border-ink/15 bg-ivory px-2 py-1.5 text-xs outline-none focus:border-emerald"
                      value=""
                      onChange={e => {
                        const newPkg = e.target.value;
                        if (!newPkg) return;
                        if (form.packagesDeducted.some(p => p.packageId === newPkg)) return;
                        const pkgDef = customerPackages.find(p => p.id === newPkg);
                        if (!pkgDef) return;
                        setForm({...form, packagesDeducted: [...form.packagesDeducted, { packageId: newPkg, type: pkgDef.type, deducted: pkgDef.type === "sessions" ? "1" : "" }]});
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
                      <div key={pkg.packageId} className="flex flex-wrap items-end gap-3 rounded-[3px] bg-white p-3 shadow-sm ring-1 ring-ink/5 mt-2">
                        <div className="flex-1 min-w-[120px]">
                          <p className="text-xs font-semibold text-ink">{pDef.name}</p>
                          <p className="text-[10px] text-ink/50 mt-0.5">Còn {pDef.type === "balance" ? formatVnd(pDef.remaining) : \`\${pDef.remaining} buổi\`}</p>
                        </div>
                        <div className="w-32">
                          <label className="text-[10px] uppercase text-ink/50 font-bold mb-1 block">
                            {pDef.type === "balance" ? "Số tiền trừ" : "Số buổi trừ"}
                          </label>
                          <input 
                            className={inputClass + " !py-1.5"} 
                            value={pkg.deducted}
                            onChange={e => {
                              const raw = e.target.value.replace(/\\D/g, "");
                              const val = pDef.type === "balance" ? (raw ? Number(raw).toLocaleString("en-US") : "") : raw;
                              const newArr = [...form.packagesDeducted];
                              newArr[i] = {...newArr[i], deducted: val};
                              setForm({...form, packagesDeducted: newArr});
                            }}
                            inputMode="numeric"
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            setForm({...form, packagesDeducted: form.packagesDeducted.filter((_, idx) => idx !== i)});
                          }}
                          className="text-ink/40 hover:text-red-500 p-1.5 transition"
                          title="Bỏ gói thẻ này"
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
            </div>
`;
    
    code = code.substring(0, startIdx) + newBlock + code.substring(startIdx + lastDivIndex + 6);
    fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
    console.log("Successfully replaced bottom block!");
  }
} else {
  console.log("Block not found");
}

