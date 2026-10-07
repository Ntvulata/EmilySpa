const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const exportFnStr = `  const exportList = () => {
    let csv = "\\uFEFF\\\"Ngày\\\",\\\"Giờ\\\",\\\"Khách hàng\\\",\\\"SĐT\\\",\\\"Dịch vụ\\\",\\\"Ghi chú\\\",\\\"KTV\\\",\\\"Sử dụng thẻ\\\",\\\"Trạng thái\\\"\\n";
    rows.forEach(item => {
      const cust = initialCustomers.find(c => c.id === item.customerId);
      const cName = cust ? cust.name : item.customerId;
      const cPhone = cust ? cust.phone : "";
      const svcs = (item.serviceIds || item.services || []).map(sid => serviceOptions.find(opt => opt.id === sid)?.name || sid).join(", ");
      
      let pkgText = "";
      if (item.packagesDeducted && item.packagesDeducted.length > 0) {
        pkgText = item.packagesDeducted.map(p => {
          const pDef = masterPackages.find(x => x.id === p.packageId);
          let name = pDef ? pDef.name : p.packageId;
          if (!pDef && p.packageId.startsWith("CUSTOM_")) {
            const h = packageHistory.find(x => x.packageId === p.packageId && x.customName);
            if (h) name = h.customName;
          }
          return \`\${name} (-\${p.type === 'balance' ? formatVnd(p.deducted || 0) : (p.deducted || 0) + ' buổi'})\`;
        }).join(" | ");
      }
      
      let st = item.status === "xong" ? "Hoàn thành" : (item.status === "huy" ? "Khách hủy" : "Chờ phục vụ");
      csv += \`"\\"\${item.date}\\"","\\"\${item.time}\\"","\\"\${cName}\\"","\\"\${cPhone}\\"","\\"\${svcs}\\"","\\"\${item.note || ""}\\"","\\"\${item.therapistId || ""}\\"","\\"\${pkgText}\\"","\\"\${st}\\""\\n\`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", \`Danh_Sach_Lich_Hen_\${fromDate}_\${toDate}.csv\`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };`;

// Insert exportList before handleCapture
let codeIdx = code.indexOf('const handleCapture = async () => {');
if (codeIdx !== -1) {
    code = code.substring(0, codeIdx) + exportFnStr + '\n\n  ' + code.substring(codeIdx);
}

// Add the button
const btnTarget = `<label className="flex items-center gap-2 text-xs font-semibold text-ink/70">
                Đến ngày:
                <input type="date" className="rounded-[3px] border border-ink/15 bg-ivory px-3 py-1.5 outline-none transition focus:border-emerald" value={toDate} onChange={e => setToDate(e.target.value)} />
              </label>
            </>`;
const btnTargetSafe = `<input type="date" className="rounded-[3px] border border-ink/15 bg-ivory px-3 py-1.5 outline-none transition focus:border-emerald" value={toDate} onChange={e => setToDate(e.target.value)} />
              </label>
            </>`;
const btnRepSafe = `<input type="date" className="rounded-[3px] border border-ink/15 bg-ivory px-3 py-1.5 outline-none transition focus:border-emerald" value={toDate} onChange={e => setToDate(e.target.value)} />
              </label>
              <button type="button" onClick={exportList} className="ml-2 inline-flex items-center gap-1.5 rounded-[3px] bg-emerald px-3 py-1.5 text-[11px] font-semibold text-ivory hover:bg-emerald/80 transition">
                <Download className="size-3.5" /> Tải Danh Sách
              </button>
            </>`;

let replacedBtn = false;
if (code.includes(btnTargetSafe)) {
    code = code.replace(btnTargetSafe, btnRepSafe);
    replacedBtn = true;
} else {
    // try fallback regex
    const btnRegex = /(<label[^>]*>\s*D\?n ngy:.*?<\/label>\s*)<\/>/;
    if (code.match(btnRegex)) {
        code = code.replace(btnRegex, `$1<button type="button" onClick={exportList} className="ml-2 inline-flex items-center gap-1.5 rounded-[3px] bg-emerald px-3 py-1.5 text-[11px] font-semibold text-ivory hover:bg-emerald/80 transition"><Download className="size-3.5" /> Tải Danh Sách</button></>`);
        replacedBtn = true;
    }
}

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Added exportList function. Replaced button:", replacedBtn);
