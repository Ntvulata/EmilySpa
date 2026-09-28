const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');

// Update imports
code = code.replace(
  /import \{ formatVnd, appointments, packageHistory, masterPackages \} from "@\/lib\/spa-data";/,
  'import { formatVnd, appointments, packageHistory, masterPackages, therapists as masterTherapists, serviceOptions } from "@/lib/spa-data";'
);

// Fix services -> serviceIds
code = code.replace(/a\.services\.forEach\(s => \{/g, '(a.serviceIds || (a as any).services || []).forEach(s => {');

// Add commission calculation
code = code.replace(
  /const \{ dataByDay, totalApptRev, totalPkgRev, totalRevenue, serviceMix \} = useMemo\(\(\) => \{/,
  `const { dataByDay, totalApptRev, totalPkgRev, totalRevenue, serviceMix, staffStats } = useMemo(() => {`
);

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
  /return \{\n\s*dataByDay,/,
  staffStatsLogic + '\n    return {\n      staffStats,\n      dataByDay,'
);

// Add UI section
const uiSection = `
        {/* Therapist Commission Section */}
        <section className="rounded-xl border border-ink/10 bg-white p-5 sm:p-7 mt-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl text-ink">Báo Cáo Hoa Hồng KTV</h2>
              <p className="mt-1 text-sm text-ink/65">Thống kê số dịch vụ và tiền hoa hồng trong kỳ báo cáo (Không phân biệt thanh toán tiền mặt hay trừ thẻ).</p>
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-[3px] border border-ink/10 bg-ivory-deep/30">
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
  /<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}\s*$/,
  uiSection + '\n      </div>\n    </div>\n  );\n}\n'
);

// We need to be careful with the end replacement, let's just append it before the final </div></div></div>
code = code.replace(
  /<\/section>\s*<\/div>\s*<\/div>\s*\);\s*\}/,
  '</section>\n' + uiSection + '\n      </div>\n    </div>\n  );\n}'
);

fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
