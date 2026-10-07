const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');

// 1. Remove pkg states
code = code.replace(
  `  const [pkgFromDate, setPkgFromDate] = useState(weekAgo.toISOString().split("T")[0]);
  const [pkgToDate, setPkgToDate] = useState(today.toISOString().split("T")[0]);\n`,
  ''
);

// 2. Remove date inputs from UI & use fromDate/toDate
const oldSection = `            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-ink/50">Từ</span>
                <input type="date" value={pkgFromDate} onChange={e => setPkgFromDate(e.target.value)} className="rounded-[3px] border border-ink/15 bg-ivory px-2 py-1.5 text-xs outline-none focus:border-emerald" />
                <span className="text-xs font-semibold uppercase tracking-widest text-ink/50">Đến</span>
                <input type="date" value={pkgToDate} onChange={e => setPkgToDate(e.target.value)} className="rounded-[3px] border border-ink/15 bg-ivory px-2 py-1.5 text-xs outline-none focus:border-emerald" />
              </div>
              <button 
                type="button" 
                onClick={() => {
                  const pkgMap: Record<string, any> = {};
                  packageHistory.forEach(h => {
                    if (!h.packageId) return; // safety
                    const key = h.customerId + "_" + h.packageId;
                    if (!pkgMap[key]) {
                      pkgMap[key] = { customerId: h.customerId, packageId: h.packageId, opening: 0, bought: 0, used: 0 };
                    }
                    if (h.date < pkgFromDate) {
                      pkgMap[key].opening += h.valueChange;
                    } else if (h.date >= pkgFromDate && h.date <= pkgToDate) {
                      if (h.valueChange > 0) pkgMap[key].bought += h.valueChange;
                      else pkgMap[key].used += Math.abs(h.valueChange);
                    }
                  });
                  const pRep = Object.values(pkgMap).filter(p => p.opening > 0 || p.bought > 0 || p.used > 0);

                  let csv = "\\uFEFF\\\"Khách hàng\\\",\\\"Số ĐT\\\",\\\"Tên gói/thẻ\\\",\\\"Đầu kỳ\\\",\\\"Mua mới\\\",\\\"Sử dụng\\\",\\\"Còn lại\\\"\\n";
                  pRep.forEach(row => {
                    const cust = initialCustomers.find(c => c.id === row.customerId);
                    let pDef = masterPackages.find(p => p.id === row.packageId);
                    let pName = pDef ? pDef.name : row.packageId;
                    if (!pDef && row.packageId.startsWith("CUSTOM_")) {
                      const h = packageHistory.find(x => x.packageId === row.packageId && x.customName);
                      if (h) pName = h.customName;
                    }
                    const pType = pDef ? pDef.type : (row.packageId.startsWith("CUSTOM_") ? "sessions" : "none");
                    const fmt = (val) => pType === "balance" ? formatVnd(val) : \`\${val} buổi\`;
                    const closing = row.opening + row.bought - row.used;
                    
                    csv += \`"\\"\${cust?.name || row.customerId}\\"","\\"\${cust?.phone || ""}\\"","\\"\${pName}\\"","\\"\${fmt(row.opening)}\\"","\\"\${fmt(row.bought)}\\"","\\"\${fmt(row.used)}\\"","\\"\${fmt(closing)}\\""\\n\`;
                  });
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.setAttribute("href", url);
                  link.setAttribute("download", \`Bao_Cao_The_Khach_Hang_\${pkgFromDate}_\${pkgToDate}.csv\`);
                  link.style.visibility = 'hidden';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex shrink-0 items-center gap-2 rounded-[3px] bg-emerald px-4 py-2.5 text-xs font-semibold text-ivory transition hover:bg-emerald-soft"
              >
                <Download className="size-4" />
                Xuất Excel Thẻ
              </button>
            </div>`;

const newSection = `            <div className="flex flex-wrap items-center gap-4">
              <button 
                type="button" 
                onClick={() => {
                  const pkgMap: Record<string, any> = {};
                  packageHistory.forEach(h => {
                    if (!h.packageId) return; // safety
                    const key = h.customerId + "_" + h.packageId;
                    if (!pkgMap[key]) {
                      pkgMap[key] = { customerId: h.customerId, packageId: h.packageId, opening: 0, bought: 0, used: 0 };
                    }
                    if (h.date < fromDate) {
                      pkgMap[key].opening += h.valueChange;
                    } else if (h.date >= fromDate && h.date <= toDate) {
                      if (h.valueChange > 0) pkgMap[key].bought += h.valueChange;
                      else pkgMap[key].used += Math.abs(h.valueChange);
                    }
                  });
                  const pRep = Object.values(pkgMap).filter(p => p.opening > 0 || p.bought > 0 || p.used > 0);

                  let csv = "\\uFEFF\\\"Khách hàng\\\",\\\"Số ĐT\\\",\\\"Tên gói/thẻ\\\",\\\"Đầu kỳ\\\",\\\"Mua mới\\\",\\\"Sử dụng\\\",\\\"Còn lại\\\"\\n";
                  pRep.forEach(row => {
                    const cust = initialCustomers.find(c => c.id === row.customerId);
                    let pDef = masterPackages.find(p => p.id === row.packageId);
                    let pName = pDef ? pDef.name : row.packageId;
                    if (!pDef && row.packageId.startsWith("CUSTOM_")) {
                      const h = packageHistory.find(x => x.packageId === row.packageId && x.customName);
                      if (h) pName = h.customName;
                    }
                    const pType = pDef ? pDef.type : (row.packageId.startsWith("CUSTOM_") ? "sessions" : "none");
                    const fmt = (val) => pType === "balance" ? formatVnd(val) : \`\${val} buổi\`;
                    const closing = row.opening + row.bought - row.used;
                    
                    csv += \`"\\"\${cust?.name || row.customerId}\\"","\\"\${cust?.phone || ""}\\"","\\"\${pName}\\"","\\"\${fmt(row.opening)}\\"","\\"\${fmt(row.bought)}\\"","\\"\${fmt(row.used)}\\"","\\"\${fmt(closing)}\\""\\n\`;
                  });
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.setAttribute("href", url);
                  link.setAttribute("download", \`Bao_Cao_The_Khach_Hang_\${fromDate}_\${toDate}.csv\`);
                  link.style.visibility = 'hidden';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex shrink-0 items-center gap-2 rounded-[3px] bg-emerald px-4 py-2.5 text-xs font-semibold text-ivory transition hover:bg-emerald-soft"
              >
                <Download className="size-4" />
                Xuất Excel Thẻ
              </button>
            </div>`;

code = code.replace(oldSection, newSection);


// 3. Remove KTV table and just leave export button
const ktvTableStart = `<div className="overflow-x-auto rounded-[3px] border border-ink/10 bg-ivory">`;
const ktvSectionEnd = `</section>`;

let ktvIdx = code.indexOf(ktvTableStart);
if (ktvIdx !== -1) {
    let ktvEndIdx = code.indexOf(ktvSectionEnd, ktvIdx);
    if (ktvEndIdx !== -1) {
        code = code.substring(0, ktvIdx) + code.substring(ktvEndIdx);
    }
}

fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
console.log("Patched unified dates & removed KTV table.");
