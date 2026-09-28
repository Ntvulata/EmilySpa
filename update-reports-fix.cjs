const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');

// Insert staffStatsLogic before the final return of useMemo
const staffStatsLogic = `
    const staffStats = masterTherapists.map(t => {
      let totalCommission = 0;
      let servicesCount = 0;
      let apptsCount = 0;
      
      const appts = appointments.filter(a => a.status === 'xong' && a.therapistId === t.id && a.date >= fromDate && a.date <= toDate);
      apptsCount = appts.length;
      
      appts.forEach(a => {
        (a.serviceIds || (a as any).services || []).forEach(sid => {
          const s = serviceOptions.find(opt => opt.id === sid);
          if (s && s.commission) {
            totalCommission += s.commission;
          }
          servicesCount++;
        });
      });
      
      return { id: t.id, name: t.name, totalCommission, servicesCount, apptsCount };
    });
`;

code = code.replace(
  /return \{\s*dataByDay: byDay,/g,
  staffStatsLogic + '\n    return {\n      staffStats,\n      dataByDay: byDay,'
);

// Insert UI Section before the final closing div of the page
const uiSection = `
      <section className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6 mt-8">
        <h2 className="font-display text-2xl text-ink">Báo Cáo Hoa Hồng KTV</h2>
        <p className="mt-1 text-sm text-ink/65 mb-4">Thống kê số dịch vụ và tiền hoa hồng trong kỳ báo cáo (Không phân biệt thanh toán tiền mặt hay trừ thẻ).</p>
        
        <div className="overflow-x-auto rounded-[3px] border border-ink/10 bg-ivory">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/5 text-xs uppercase tracking-wider text-ink/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Nhân viên</th>
                <th className="px-4 py-3 font-semibold text-right">Số lịch hẹn</th>
                <th className="px-4 py-3 font-semibold text-right">Số dịch vụ thực hiện</th>
                <th className="px-4 py-3 font-semibold text-right">Tổng hoa hồng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {staffStats.map(staff => (
                <tr key={staff.id} className="transition hover:bg-ivory/60">
                  <td className="px-4 py-3.5 font-medium text-ink/80">{staff.name}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-ink/70">{staff.apptsCount}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-ink/70">{staff.servicesCount}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-emerald">{formatVnd(staff.totalCommission)}</td>
                </tr>
              ))}
              {staffStats.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-ink/50">Không có dữ liệu trong khoảng thời gian này</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
`;

code = code.replace(
  /<\/div>\s*<\/div>\s*\);\s*\}/g,
  uiSection + '\n    </div>\n  );\n}'
);

fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
