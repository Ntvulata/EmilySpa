const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

const target = `  const filteredRows = packageHistory.filter(h => {
    if (filter !== "all" && h.type !== filter) return false;
    if (!searchQuery.trim()) return true;
    
    const q = searchQuery.toLowerCase().trim();
    const customer = initialCustomers.find(c => c.id === h.customerId);
    const cName = customer?.name?.toLowerCase() || "";
    const cPhone = customer?.phone?.toLowerCase() || "";
    const pName = getPackageName(h.packageId).toLowerCase();
    
    return h.id.toLowerCase().includes(q) || 
           cName.includes(q) || 
           cPhone.includes(q) || 
           pName.includes(q) || 
           (h.note && h.note.toLowerCase().includes(q));
  }).sort((a, b) => b.id.localeCompare(a.id));`;

const replacement = `  const filteredRows = packageHistory.filter(h => {
    if (filter !== "all" && h.type !== filter) return false;
    if (!searchQuery.trim()) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];
      return h.date >= sevenDaysAgoStr;
    }
    
    const q = searchQuery.toLowerCase().trim();
    const customer = initialCustomers.find(c => c.id === h.customerId);
    const cName = customer?.name?.toLowerCase() || "";
    const cPhone = customer?.phone?.toLowerCase() || "";
    const pName = getPackageName(h.packageId).toLowerCase();
    
    return h.id.toLowerCase().includes(q) || 
           cName.includes(q) || 
           cPhone.includes(q) || 
           pName.includes(q) || 
           (h.note && h.note.toLowerCase().includes(q));
  }).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));`;

code = code.replace(target, replacement);

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("Patched package history sorting and filtering.");
