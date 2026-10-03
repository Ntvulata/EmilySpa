const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

const oldStartNew = `  const startNew = () => {
    setConvertOpen(false);
    setForm({ 
      date: new Date().toISOString().split("T")[0], 
      customerId: "", 
      packageId: "", 
      valueChange: "", 
      pricePaid: "",
      note: "" 
    });`;

const newStartNew = `  const startNew = () => {
    setConvertOpen(false);
    setSellMode("master");
    setForm({ 
      date: new Date().toISOString().split("T")[0], 
      customerId: "", 
      packageId: "", 
      serviceId: "",
      valueChange: "", 
      pricePaid: "",
      note: "" 
    });`;

code = code.replace(oldStartNew, newStartNew);

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("Fixed startNew!");
