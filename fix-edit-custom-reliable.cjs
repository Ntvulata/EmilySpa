const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

// 1. Update startEdit
const startEditAnchor = 'const startEdit = (id: string) => {';
let idx = code.indexOf(startEditAnchor);
if (idx !== -1) {
    const endAnchor = 'setEditId(id);';
    const endIdx = code.indexOf(endAnchor, idx);
    if (endIdx !== -1) {
        const replacement = `const startEdit = (id: string) => {
    setConvertOpen(false);
    const item = packageHistory.find(x => x.id === id);
    if (!item || item.type !== "sell") return;
    
    const isCustom = item.packageId.startsWith("CUSTOM_");
    setSellMode(isCustom ? "custom" : "master");
    
    let parsedServiceId = "";
    if (isCustom) {
      const parts = item.packageId.split("_");
      if (parts.length >= 2) parsedServiceId = parts[1];
    }
    
    setForm({
      date: item.date,
      customerId: item.customerId,
      packageId: isCustom ? "" : item.packageId,
      serviceId: parsedServiceId,
      valueChange: item.valueChange ? Number(item.valueChange).toLocaleString("en-US") : "",
      pricePaid: item.pricePaid !== undefined ? Number(item.pricePaid).toLocaleString("en-US") : "",
      note: item.note
    });
    `;
        code = code.substring(0, idx) + replacement + code.substring(endIdx);
        console.log("PATCHED startEdit");
    }
}

// 2. Update submit
const submitAnchor = 'if (editId) {';
// We need to find the specific editId inside submit
const submitFuncIdx = code.indexOf('const submit = async (e: FormEvent) => {');
idx = code.indexOf(submitAnchor, submitFuncIdx);

if (idx !== -1) {
    const endAnchor = 'packageHistory[idx] = recordToSave;';
    const endIdx = code.indexOf(endAnchor, idx);
    if (endIdx !== -1) {
        const replacement = `if (editId) {
        const idx = packageHistory.findIndex(h => h.id === editId);
        if (idx !== -1) {
          let finalPkgId = form.packageId;
          let finalCustomName = packageHistory[idx].customName;
          
          if (sellMode === "custom") {
             const oldIsCustom = packageHistory[idx].packageId.startsWith("CUSTOM_");
             finalPkgId = oldIsCustom ? packageHistory[idx].packageId : "CUSTOM_" + form.serviceId + "_" + Date.now();
             const svc = serviceOptions.find(s => s.id === form.serviceId);
             finalCustomName = "Thẻ " + val + " buổi - " + (svc ? svc.name : form.serviceId);
          } else {
             finalCustomName = undefined;
          }

          recordToSave = {
            ...packageHistory[idx],
            date: form.date,
            customerId: form.customerId,
            packageId: finalPkgId,
            customName: finalCustomName,
            valueChange: val,
            pricePaid: price,
            note: form.note
          };
          `;
        code = code.substring(0, idx) + replacement + code.substring(endIdx);
        console.log("PATCHED submit");
    }
}

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
