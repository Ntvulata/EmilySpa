const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');

const targetStr = `  const exportToCsv = () => {
    // Collect all transactions in date range
    const appts = appointments
      .filter(a => a.status === "xong" && a.date >= fromDate && a.date <= toDate && Number(a.price || 0) > 0)
      .map(a => ({
        date: a.date,
        description: \`\${a.customer} - Dịch vụ: \${a.services.join(", ")}\`,
        amount: Number(a.price || 0)
      }));

    const pkgs = packageHistory
      .filter(h => h.type === "sell" && h.date >= fromDate && h.date <= toDate && Number(h.pricePaid || 0) > 0)
      .map(h => ({
        date: h.date,
        description: \`\${h.customer} - Mua thẻ: \${masterPackages.find(p => p.id === h.packageId)?.name || h.packageId}\`,
        amount: Number(h.pricePaid || 0)
      }));`;

// We'll use index logic because of unicode chars
const compStart = 'const exportToCsv = () => {';
let idx = code.indexOf(compStart);
if (idx !== -1) {
  const endAnchor = 'const allTx = [...appts, ...pkgs]';
  const endIdx = code.indexOf(endAnchor, idx);
  if (endIdx !== -1) {
    const replacement = `const exportToCsv = () => {
    const appts = appointments
      .filter(a => a.status === "xong" && a.date >= fromDate && a.date <= toDate && Number(a.price || 0) > 0)
      .map(a => {
        const c = initialCustomers.find(x => x.id === a.customerId);
        const svcs = (a.serviceIds || []).map(id => {
          const s = serviceOptions.find(x => x.id === id);
          return s ? s.name : id;
        });
        return {
          date: a.date,
          description: \`\${c ? c.name : "Khách lẻ"} - Dịch vụ: \${svcs.join(", ")}\`,
          amount: Number(a.price || 0)
        };
      });

    const pkgs = packageHistory
      .filter(h => h.type === "sell" && h.date >= fromDate && h.date <= toDate && Number(h.pricePaid || 0) > 0)
      .map(h => {
        const c = initialCustomers.find(x => x.id === h.customerId);
        let pName = h.packageId;
        const pDef = masterPackages.find(p => p.id === h.packageId);
        if (pDef) {
          pName = pDef.name;
        } else if (h.customName) {
          pName = h.customName;
        } else if (h.packageId.startsWith("CUSTOM_")) {
          const origin = packageHistory.find(x => x.packageId === h.packageId && x.customName);
          if (origin) pName = origin.customName;
        }
        
        return {
          date: h.date,
          description: \`\${c ? c.name : "Khách lẻ"} - Mua gói/thẻ: \${pName}\`,
          amount: Number(h.pricePaid || 0)
        };
      });

    `;
    code = code.substring(0, idx) + replacement + code.substring(endIdx);
    fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
    console.log("PATCHED exportToCsv");
  }
}
