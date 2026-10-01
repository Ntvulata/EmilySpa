const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

// 1. Add searchQuery state
code = code.replace(
  'const [filter, setFilter] = useState<"all" | "sell" | "deduct">("all");',
  'const [filter, setFilter] = useState<"all" | "sell" | "deduct">("all");\n  const [searchQuery, setSearchQuery] = useState("");'
);

// 2. Modify filteredRows to use searchQuery
code = code.replace(
  /const filteredRows = packageHistory\.filter\(h => filter === "all" \|\| h\.type === filter\)\.sort\(\(a, b\) => b\.id\.localeCompare\(a\.id\)\);/,
  `const filteredRows = packageHistory.filter(h => {
    if (filter !== "all" && h.type !== filter) return false;
    if (!searchQuery.trim()) return true;
    
    const q = searchQuery.toLowerCase().trim();
    const customer = initialCustomers.find(c => c.id === h.customerId);
    const cName = customer?.name?.toLowerCase() || "";
    const cPhone = customer?.phone?.toLowerCase() || "";
    const pName = masterPackages.find(p => p.id === h.packageId)?.name?.toLowerCase() || h.packageId.toLowerCase();
    
    return h.id.toLowerCase().includes(q) || 
           cName.includes(q) || 
           cPhone.includes(q) || 
           pName.includes(q) || 
           (h.note && h.note.toLowerCase().includes(q));
  }).sort((a, b) => b.id.localeCompare(a.id));`
);

// 3. Add Search Input UI
const searchUI = `<div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">`;
code = code.replace(/<div className="flex gap-2">/, searchUI);

const closeSearchUI = `</button>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <input 
            type="text" 
            placeholder="Tìm theo mã, tên khách, SĐT, ghi chú..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full rounded-[3px] border border-ink/15 bg-ivory px-3 py-2 text-sm text-ink outline-none transition focus:border-emerald"
          />
        </div>
      </div>`;

code = code.replace(/<\/button>\s*<\/div>\s*<div className="overflow-x-auto/, closeSearchUI + '\n\n        <div className="overflow-x-auto');

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("Added search to packages history");
