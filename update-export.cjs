const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');

// 1. Add initialCustomers to imports
code = code.replace(
  /import \{ formatVnd, appointments, packageHistory, masterPackages, therapists as masterTherapists, serviceOptions \} from "@\/lib\/spa-data";/,
  'import { formatVnd, appointments, packageHistory, masterPackages, therapists as masterTherapists, serviceOptions, initialCustomers } from "@/lib/spa-data";'
);

// 2. Add the exportCommissionToCsv function inside ReportsPage component (after exportToCsv)
const exportFunc = `
  const exportCommissionToCsv = () => {
    let csvContent = "\\uFEFF"; // BOM for UTF-8 Excel support
    csvContent += "Mã Lịch Hẹn,Ngày,Giờ,Khách Hàng,Dịch Vụ,KTV Thực Hiện,Hoa Hồng (VNĐ)\\n";

    const appts = appointments.filter(a => a.status === 'xong' && a.date >= fromDate && a.date <= toDate);
    
    appts.forEach((a) => {
      const customerName = initialCustomers.find(c => c.id === a.customerId)?.name || a.customerId;
      const therapistName = masterTherapists.find(t => t.id === a.therapistId)?.name || a.therapistId;
      
      const serviceNames = [];
      let totalCommission = 0;
      (a.serviceIds || (a as any).services || []).forEach(sid => {
        const s = serviceOptions.find(opt => opt.id === sid);
        if (s) {
          serviceNames.push(s.name);
          if (s.commission) totalCommission += s.commission;
        } else {
          serviceNames.push(sid);
        }
      });
      
      const row = [
        \`"\${a.id}"\`,
        \`"\${a.date}"\`,
        \`"\${a.time}"\`,
        \`"\${customerName}"\`,
        \`"\${serviceNames.join(", ")}"\`,
        \`"\${therapistName}"\`,
        \`"\${totalCommission}"\`
      ];
      csvContent += row.join(",") + "\\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", \`BaoCao_HoaHongKTV_\${fromDate}_den_\${toDate}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
`;

code = code.replace(
  /const exportToCsv = \(\) => \{[\s\S]*?document\.body\.removeChild\(link\);\n\s*\};/,
  `$&` + '\n' + exportFunc
);

// 3. Update the UI layout to include the Export button
code = code.replace(
  /<h2 className="font-display text-2xl text-ink">Báo Cáo Hoa Hồng KTV<\/h2>\s*<p className="mt-1 text-sm text-ink\/65 mb-4">Thống kê số dịch vụ và tiền hoa hồng trong kỳ báo cáo \(Không phân biệt thanh toán tiền mặt hay trừ thẻ\)\.<\/p>/,
  `<div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-2xl text-ink">Báo Cáo Hoa Hồng KTV</h2>
            <p className="mt-1 text-sm text-ink/65">Thống kê số dịch vụ và tiền hoa hồng trong kỳ báo cáo (Không phân biệt thanh toán tiền mặt hay trừ thẻ).</p>
          </div>
          <button 
            type="button" 
            onClick={exportCommissionToCsv}
            className="flex shrink-0 items-center gap-2 rounded-[3px] bg-emerald px-4 py-2.5 text-xs font-semibold text-ivory transition hover:bg-emerald-soft"
          >
            <Download className="size-4" />
            Xuất Excel KTV
          </button>
        </div>`
);

fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
