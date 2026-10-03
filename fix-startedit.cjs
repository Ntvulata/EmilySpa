const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

const oldStartEdit = `  const startEdit = (id: string) => {
    setConvertOpen(false);
    const item = packageHistory.find(x => x.id === id);
    if (!item || item.type !== "sell") return;
    setForm({
      date: item.date,
      customerId: item.customerId,
      packageId: item.packageId,
      valueChange: item.valueChange ? Number(item.valueChange).toLocaleString("en-US") : "",
      pricePaid: item.pricePaid !== undefined ? Number(item.pricePaid).toLocaleString("en-US") : "",
      note: item.note
    });`;

const newStartEdit = `  const startEdit = (id: string) => {
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

code = code.replace(oldStartEdit, newStartEdit);

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("Fixed startEdit!");
