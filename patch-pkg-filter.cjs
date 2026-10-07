const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

// 1. Add state
const stateTarget = `  const [filter, setFilter] = useState<"all" | "sell" | "deduct">("all");
  const [searchQuery, setSearchQuery] = useState("");`;
const stateReplacement = `  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const [fromDate, setFromDate] = useState(sevenDaysAgo.toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(today.toISOString().split("T")[0]);
  const [filter, setFilter] = useState<"all" | "sell" | "deduct">("all");
  const [searchQuery, setSearchQuery] = useState("");`;
code = code.replace(stateTarget, stateReplacement);

// 2. Modify filteredRows
const filterTarget = `  const filteredRows = packageHistory.filter(h => {
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

const filterReplacement = `  const filteredRows = packageHistory.filter(h => {
    if (filter !== "all" && h.type !== filter) return false;
    if (h.date < fromDate || h.date > toDate) return false;
    
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
  }).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));`;
code = code.replace(filterTarget, filterReplacement);

// 3. Add to UI
const uiTarget = `        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
          <button onClick={() => { setFilter("all"); setPage(1); }}`;
const uiReplacement = `        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink/50">Từ</span>
              <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }} className="rounded-[3px] border border-ink/15 bg-ivory px-2 py-1 text-xs outline-none focus:border-emerald" />
              <span className="text-xs font-semibold uppercase tracking-widest text-ink/50">Đến</span>
              <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }} className="rounded-[3px] border border-ink/15 bg-ivory px-2 py-1 text-xs outline-none focus:border-emerald" />
            </div>
            <div className="flex gap-2">
            <button onClick={() => { setFilter("all"); setPage(1); }}`;
code = code.replace(uiTarget, uiReplacement);

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("Added date filters.");
