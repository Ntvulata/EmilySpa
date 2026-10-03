const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// ============================================================
// STEP 1: Add packagesDeducted to form type definition
// ============================================================
code = code.replace(
  /packageUsed: string;\n\s*price: string;\n\s*sessionsDeducted: string;\n\s*balanceDeducted: string;/,
  `packageUsed: string;
    packagesDeducted: { packageId: string; type: "sessions" | "balance"; deducted: string }[];
    price: string;
    sessionsDeducted: string;
    balanceDeducted: string;`
);

// STEP 2: Add packagesDeducted to ALL initial form values (openNew resets)
// Match: packageUsed: "",\n...price:
code = code.replace(
  /packageUsed: "",\n\s*price:/g,
  `packageUsed: "",
      packagesDeducted: [],
      price:`
);

// ============================================================
// STEP 3: Update startEdit to populate packagesDeducted from item
// ============================================================
code = code.replace(
  /packageUsed: item\.packageUsed \|\| "",\n\s*price:/,
  `packageUsed: item.packageUsed || "",
      packagesDeducted: item.packagesDeducted 
        ? item.packagesDeducted.map(p => ({...p, deducted: String(p.deducted)})) 
        : (item.packageUsed 
          ? [{ 
              packageId: item.packageUsed, 
              type: (item.balanceDeducted ? "balance" : "sessions") as "sessions"|"balance", 
              deducted: item.balanceDeducted ? String(item.balanceDeducted) : String(item.sessionsDeducted || 1) 
            }] 
          : []),
      price:`
);

// ============================================================
// STEP 4: Remove the old Dùng Gói/Thẻ dropdown at the top of the form
// ============================================================
const topBlockStartMarker = '{customerPackages.length > 0 && (\n                <div className="col-span-1 space-y-1.5 p-2.5';
const topBlockStartIdx = code.indexOf(topBlockStartMarker);
if (topBlockStartIdx !== -1) {
  // Find the closing of this conditional block: </select>\n                  </div>\n                )}
  const endMarker = '</select>\n                  </div>\n                )}';
  const topBlockEndIdx = code.indexOf(endMarker, topBlockStartIdx);
  if (topBlockEndIdx !== -1) {
    code = code.substring(0, topBlockStartIdx) + code.substring(topBlockEndIdx + endMarker.length);
    console.log("Removed top package dropdown block");
  } else {
    console.log("WARNING: Could not find end of top package dropdown block");
  }
} else {
  console.log("WARNING: Could not find top package dropdown block");
}

// ============================================================
// STEP 5: Replace the bottom "Thanh toán & Trừ thẻ" block with multi-package UI
// ============================================================
const bottomBlockStart = '<div className="sm:col-span-2 rounded-lg border border-emerald/20 bg-gradient-to-r from-emerald/[0.04]';
const bottomBlockStartIdx = code.indexOf(bottomBlockStart);
if (bottomBlockStartIdx !== -1) {
  // Find the end of this div block - it ends with </div>\n              </div>
  // We need to find the matching closing </div> pair
  const searchFrom = bottomBlockStartIdx;
  const endMarker = '</div>\n            </div>';
  let endIdx = code.indexOf(endMarker, searchFrom);
  if (endIdx !== -1) {
    endIdx += endMarker.length;
    
    const newBlock = `<div className="sm:col-span-2 rounded-lg border border-emerald/20 bg-gradient-to-r from-emerald/[0.04] to-transparent mt-2 p-4">
              <p className="text-sm font-bold mb-3 text-ink flex items-center gap-2">\u{1F4B3} Thanh toán & Trừ thẻ</p>
              
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
                      <div key={pkg.packageId} className="flex flex-wrap items-end gap-3 rounded-[3px] bg-white p-3 shadow-sm ring-1 ring-ink/5">
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
            </div>`;
    
    code = code.substring(0, bottomBlockStartIdx) + newBlock + code.substring(endIdx);
    console.log("Replaced bottom payment block with multi-package UI");
  } else {
    console.log("WARNING: Could not find end of bottom payment block");
  }
} else {
  console.log("WARNING: Could not find bottom payment block");
}

// ============================================================
// STEP 6: Update the submit function's validation & deduction logic
// Replace old single-package validation with multi-package loop
// ============================================================

// 6a: Replace the old single-package validation block
const oldValidation = /const p = form\.price[\s\S]*?if \(form\.packageUsed\) \{[\s\S]*?\}\s*\}\s*let savedAppt/;
const match = code.match(oldValidation);
if (match) {
  const replacement = `const p = form.price ? Number(String(form.price).replace(/\\D/g, "")) : 0;
      
      // Multi-package validation
      if (form.status === "xong" && form.packagesDeducted.length > 0) {
        for (const pkg of form.packagesDeducted) {
          const dedVal = Number(String(pkg.deducted).replace(/\\D/g, "")) || 0;
          if (dedVal <= 0) { alert("Vui lòng nhập số lượng trừ cho gói thẻ."); return; }
          let rem = getRemainingPackageValue(form.customerId, pkg.packageId);
          if (editId) {
            const oldAppt = initialAppointments.find(x => x.id === editId);
            if (oldAppt?.status === "xong" && oldAppt.packagesDeducted) {
              const oldPkg = oldAppt.packagesDeducted.find(op => op.packageId === pkg.packageId);
              if (oldPkg) rem += oldPkg.deducted;
            } else if (oldAppt?.status === "xong" && oldAppt.packageUsed === pkg.packageId) {
              if (pkg.type === "sessions") rem += (oldAppt.sessionsDeducted || 0);
              if (pkg.type === "balance") rem += (oldAppt.balanceDeducted || 0);
            }
          }
          if (pkg.type === "sessions" && dedVal > rem) { alert(\`Gói "\${customerPackages.find(c=>c.id===pkg.packageId)?.name}" chỉ còn \${rem} buổi, không đủ để trừ \${dedVal} buổi.\`); return; }
          if (pkg.type === "balance" && dedVal > rem) { alert(\`Gói "\${customerPackages.find(c=>c.id===pkg.packageId)?.name}" chỉ còn \${formatVnd(rem)}, không đủ để trừ \${formatVnd(dedVal)}.\`); return; }
        }
      }

      let savedAppt`;
  code = code.replace(oldValidation, replacement);
  console.log("Replaced validation block");
} else {
  console.log("WARNING: Could not find old validation block");
}

// 6b: Replace old revert/deduction logic in the editId block
// Find: const isRevertingCompleted ... savedAppt = { ...oldAppt
const oldRevertBlock = /const isRevertingCompleted[\s\S]*?if \(\(isRevertingCompleted \|\| isChangingDeduction\)[\s\S]*?\}\s*\}\s*savedAppt = \{/;
const revertMatch = code.match(oldRevertBlock);
if (revertMatch) {
  const newRevertBlock = `const isRevertingCompleted = oldAppt?.status === "xong" && form.status !== "xong";
        
        // Hoàn lại tất cả các gói thẻ nếu đang revert từ Hoàn thành
        if (isRevertingCompleted && (oldAppt.packagesDeducted?.length || oldAppt.packageUsed)) {
          if (!window.confirm(\`Bạn có muốn HOÀN LẠI số dư/buổi cho khách không?\\nTrạng thái đổi từ 'Hoàn thành' sang '\${form.status}'\`)) {
            return;
          }
          const toDelete = packageHistory.filter(h => h.appointmentId === editId && h.type === "deduct");
          toDelete.forEach(r => {
            deletedHistoryIds.push(r.id);
            const idx = packageHistory.findIndex(h => h.id === r.id);
            if (idx !== -1) packageHistory.splice(idx, 1);
          });
        }

        savedAppt = {`;
  code = code.replace(oldRevertBlock, newRevertBlock);
  console.log("Replaced revert block");
} else {
  console.log("WARNING: Could not find old revert block");
}

// 6c: Replace the deletedHistoryId (single) with deletedHistoryIds (array)
code = code.replace(
  /let deletedHistoryId: string \| null = null;/g,
  'let deletedHistoryIds: string[] = [];'
);

// 6d: Replace all `deletedHistoryId` single value references
code = code.replace(
  /deletedHistoryId = toDelete\[0\]\.id;/g,
  'deletedHistoryIds.push(toDelete[0].id);'
);

// 6e: Replace the savedAppt spread to include packagesDeducted
// Find old savedAppt = { ...oldAppt, ...form, ... sessionsDeducted: s, balanceDeducted: b, note: ...
code = code.replace(
  /sessionsDeducted: s,\n\s*balanceDeducted: b,\n\s*note: form\.note/g,
  `packagesDeducted: form.packagesDeducted.map(p => ({...p, deducted: Number(String(p.deducted).replace(/\\D/g, "")) || 0})),
            sessionsDeducted: 0,
            balanceDeducted: 0,
            note: form.note`
);

// 6f: Replace the old single processPackageDeduction call with multi-package loop
// For the edit case (isNewlyCompleted)
const oldNewlyCompleted = /const isNewlyCompleted = oldAppt\.status !== "xong" && form\.status === "xong";[\s\S]*?newHistoryRecord = processPackageDeduction\([\s\S]*?\);[\s\S]*?\}/;
const newlyCompMatch = code.match(oldNewlyCompleted);
if (newlyCompMatch) {
  const newNewlyCompleted = `const isNewlyCompleted = oldAppt.status !== "xong" && form.status === "xong";
        if (isNewlyCompleted && form.packagesDeducted.length > 0) {
          newHistoryRecords = form.packagesDeducted.map(pkg => {
            const dedVal = Number(String(pkg.deducted).replace(/\\D/g, "")) || 0;
            return processPackageDeduction(
              savedAppt.id, savedAppt.customerId, pkg.packageId, pkg.type, 
              pkg.type === "sessions" ? dedVal : 0, 
              pkg.type === "balance" ? dedVal : 0
            );
          });
        }`;
  code = code.replace(oldNewlyCompleted, newNewlyCompleted);
  console.log("Replaced isNewlyCompleted block");
} else {
  console.log("WARNING: Could not find isNewlyCompleted block");
}

// 6g: Replace newHistoryRecord (single) with newHistoryRecords (array)
code = code.replace(/let newHistoryRecord: any = null;/g, 'let newHistoryRecords: any[] = [];');
code = code.replace(/let newRecord: any = null;/g, 'let newRecords: any[] = [];');

// 6h: For the "new appointment" case (else block)
const oldNewApptPkg = /if \(form\.status === "xong" && form\.packageUsed\) \{\s*newHistoryRecord = processPackageDeduction\(\s*savedAppt\.id[\s\S]*?\);\s*\}/;
const newApptMatch = code.match(oldNewApptPkg);
if (newApptMatch) {
  const newNewApptPkg = `if (form.status === "xong" && form.packagesDeducted.length > 0) {
          newHistoryRecords = form.packagesDeducted.map(pkg => {
            const dedVal = Number(String(pkg.deducted).replace(/\\D/g, "")) || 0;
            return processPackageDeduction(
              savedAppt.id, savedAppt.customerId, pkg.packageId, pkg.type,
              pkg.type === "sessions" ? dedVal : 0,
              pkg.type === "balance" ? dedVal : 0
            );
          });
        }`;
  code = code.replace(oldNewApptPkg, newNewApptPkg);
  console.log("Replaced new appointment package block");
} else {
  console.log("WARNING: Could not find new appointment package block");
}

// 6i: Replace the Firebase save calls for single record with array
code = code.replace(
  /if \(newHistoryRecord\) \{\s*packageHistory\.push\(newHistoryRecord\);\s*await fbSavePackageHistory\(newHistoryRecord\);\s*\}/g,
  `for (const rec of newHistoryRecords) {
          packageHistory.push(rec);
          await fbSavePackageHistory(rec);
        }`
);

code = code.replace(
  /if \(newRecord\) \{\s*packageHistory\.push\(newRecord\);\s*await fbSavePackageHistory\(newRecord\);\s*\}/g,
  `for (const rec of newRecords) {
          packageHistory.push(rec);
          await fbSavePackageHistory(rec);
        }`
);

// 6j: Replace single deletedHistoryId Firebase delete with array
code = code.replace(
  /if \(deletedHistoryId\) \{\s*await fbDeletePackageHistory\(deletedHistoryId\);\s*\}/g,
  `for (const dhId of deletedHistoryIds) {
          await fbDeletePackageHistory(dhId);
        }`
);

// 6k: changeStatus function - replace newRecord single with array
const oldChangeStatusPkg = /newRecord = processPackageDeduction\(\s*updatedAppt\.id[\s\S]*?\);/;
const changeMatch = code.match(oldChangeStatusPkg);
if (changeMatch) {
  code = code.replace(oldChangeStatusPkg, `if (updatedAppt.packagesDeducted && updatedAppt.packagesDeducted.length > 0) {
          newRecords = updatedAppt.packagesDeducted.map(pkg => 
            processPackageDeduction(updatedAppt.id, updatedAppt.customerId, pkg.packageId, pkg.type,
              pkg.type === "sessions" ? pkg.deducted : 0,
              pkg.type === "balance" ? pkg.deducted : 0)
          );
        } else if (updatedAppt.packageUsed) {
          const t = getPackageType(updatedAppt.packageUsed);
          newRecords = [processPackageDeduction(
            updatedAppt.id, updatedAppt.customerId, updatedAppt.packageUsed, t,
            updatedAppt.sessionsDeducted || 0, updatedAppt.balanceDeducted || 0)];
        }`);
  console.log("Replaced changeStatus package block");
} else {
  console.log("WARNING: Could not find changeStatus package block");
}

// ============================================================
// STEP 7: Fix customer change handler to clear packagesDeducted
// ============================================================
code = code.replace(
  /setForm\(\{ \.\.\.form, customerId: v, packageUsed: "", price:/g,
  'setForm({ ...form, customerId: v, packageUsed: "", packagesDeducted: [], price:'
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("\n=== All modifications complete ===");
