const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

// 1. Update startEdit
const oldStartEdit = `  const startEdit = (id: string) => {
    setConvertOpen(false);
    setSellMode("master");
    const item = packageHistory.find(x => x.id === id);
    if (!item || item.type !== "sell") return;
    setForm({
      date: item.date,
      customerId: item.customerId,
      packageId: item.packageId,
      serviceId: "",
      valueChange: item.valueChange ? Number(item.valueChange).toLocaleString("en-US") : "",
      pricePaid: item.pricePaid !== undefined ? Number(item.pricePaid).toLocaleString("en-US") : "",
      note: item.note
    });`;

const newStartEdit = `  const startEdit = (id: string) => {
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
    });`;

code = code.replace(oldStartEdit, newStartEdit);

// 2. Update submit (edit branch)
const oldSubmitEdit = `      if (editId) {
        const idx = packageHistory.findIndex(h => h.id === editId);
        if (idx !== -1) {
          recordToSave = {
            ...packageHistory[idx],
            date: form.date,
            customerId: form.customerId,
            packageId: form.packageId,
            valueChange: val,
            pricePaid: price,
            note: form.note
          };
          packageHistory[idx] = recordToSave;
        }`;

const newSubmitEdit = `      if (editId) {
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
          packageHistory[idx] = recordToSave;
        }`;

code = code.replace(oldSubmitEdit, newSubmitEdit);

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("Fixed startEdit and submit logic!");
