const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');

const newSection = `        <section className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6 mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-2xl text-ink">Báo Cáo Thẻ Khách Hàng</h2>
              <p className="mt-1 text-sm text-ink/65">Thống kê số dư thẻ, biến động mua mới và sử dụng trong kỳ báo cáo.</p>
            </div>
            <button 
              type="button" 
              onClick={() => {
                let csv = "\\uFEFF\\\"Khách hàng\\\",\\\"Số ĐT\\\",\\\"Tên gói/thẻ\\\",\\\"Đầu kỳ\\\",\\\"Mua mới\\\",\\\"Sử dụng\\\",\\\"Còn lại\\\"\\n";
                packageReport.forEach(row => {
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
          </div>
          
          <div className="overflow-x-auto rounded-[3px] border border-ink/10 bg-ivory">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-ink/10 bg-ink/5 text-xs uppercase tracking-wider text-ink/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Khách hàng</th>
                  <th className="px-4 py-3 font-semibold">Số ĐT</th>
                  <th className="px-4 py-3 font-semibold">Tên gói/thẻ</th>
                  <th className="px-4 py-3 font-semibold text-right">Đầu kỳ</th>
                  <th className="px-4 py-3 font-semibold text-right">Mua mới</th>
                  <th className="px-4 py-3 font-semibold text-right text-emerald">Sử dụng</th>
                  <th className="px-4 py-3 font-semibold text-right font-bold text-ink">Còn lại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {packageReport.map((row, i) => {
                  const cust = initialCustomers.find(c => c.id === row.customerId);
                  let pDef = masterPackages.find(p => p.id === row.packageId);
                  let pName = pDef ? pDef.name : row.packageId;
                  if (!pDef && row.packageId.startsWith("CUSTOM_")) {
                    const h = packageHistory.find(x => x.packageId === row.packageId && x.customName);
                    if (h) pName = h.customName;
                  }
                  const pType = pDef ? pDef.type : (row.packageId.startsWith("CUSTOM_") ? "sessions" : "none");
                  
                  const fmt = (val) => {
                    if (val === 0) return "-";
                    return pType === "balance" ? formatVnd(val) : \`\${val} buổi\`;
                  };
                  
                  const closing = row.opening + row.bought - row.used;

                  return (
                    <tr key={i} className="transition hover:bg-ivory/60">
                      <td className="px-4 py-3.5 font-medium text-ink/80">{cust?.name || row.customerId}</td>
                      <td className="px-4 py-3.5 text-ink/70 text-xs">{cust?.phone || ""}</td>
                      <td className="px-4 py-3.5 text-ink/70 text-xs">{pName}</td>
                      <td className="px-4 py-3.5 text-right font-medium text-ink/70">{fmt(row.opening)}</td>
                      <td className="px-4 py-3.5 text-right font-medium text-ink/70">{fmt(row.bought)}</td>
                      <td className="px-4 py-3.5 text-right font-medium text-emerald">{fmt(row.used)}</td>
                      <td className="px-4 py-3.5 text-right font-bold text-ink">{pType === "balance" ? formatVnd(closing) : \`\${closing} buổi\`}</td>
                    </tr>
                  );
                })}
                {packageReport.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-ink/50">Không có dữ liệu trong khoảng thời gian này</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

`;

let idx = code.indexOf('<section className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6 mt-8">');
if (idx !== -1) {
    code = code.substring(0, idx) + newSection + code.substring(idx);
    fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
    console.log("Patched report UI successfully.");
} else {
    console.log("Could not find section");
}
