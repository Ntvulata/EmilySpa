import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { formatVnd, appointments, packageHistory, masterPackages, therapists as masterTherapists, serviceOptions, initialCustomers } from "@/lib/spa-data";
import { Download } from "lucide-react";

export const Route = createFileRoute("/dashboard/reports")({
  head: () => ({
    meta: [
      { title: "Báo cáo doanh thu | Emily Spa" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);

  const [fromDate, setFromDate] = useState(weekAgo.toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(today.toISOString().split("T")[0]);

  // Aggregate Data
  const { dataByDay, totalApptRev, totalPkgRev, totalRevenue, serviceMix, staffStats } = useMemo(() => {
    const days = [];
    let d = new Date(fromDate);
    const end = new Date(toDate);
    while (d <= end) {
      days.push(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }

    let tAppt = 0;
    let tPkg = 0;
    const sCounts: Record<string, number> = {};
    let totalServices = 0;

    const byDay = days.map(dayStr => {
      // 1. Số tiền khách trả tại lịch hẹn (không tính lượt/tiền trừ từ thẻ)
      const dayAppts = appointments.filter(a => a.date === dayStr && a.status === "xong");
      const apptRev = dayAppts.reduce((sum, a) => sum + Number(a.price || 0), 0);
      
      // Tính toán tỷ trọng dịch vụ (dựa trên các lịch hẹn đã hoàn thành)
              // Tính toán tỷ trọng dịch vụ (dựa trên các lịch hẹn đã hoàn thành)
        dayAppts.forEach(a => {
          (a.serviceIds || (a as any).services || []).forEach(sid => {
            const sDef = serviceOptions.find(opt => opt.id === sid);
            const sName = sDef ? sDef.name : "Dịch vụ đã xóa";
            sCounts[sName] = (sCounts[sName] || 0) + 1;
            totalServices++;
          });
        });

        // 2. Số tiền bán thẻ/gói mới
      const dayPkgs = packageHistory.filter(h => h.date === dayStr && h.type === "sell");
      const pkgRev = dayPkgs.reduce((sum, h) => sum + Number(h.pricePaid || 0), 0);

      tAppt += apptRev;
      tPkg += pkgRev;

      
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

    return {
      staffStats,
        date: dayStr,
        appointmentRevenue: apptRev,
        packageRevenue: pkgRev,
        total: apptRev + pkgRev
      };
    });

    // Format service mix
    const sMix = Object.entries(sCounts)
      .map(([name, count]) => ({
        name,
        count,
        share: totalServices > 0 ? Math.round((count / totalServices) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count).slice(0, 10);

    
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

    return {
      staffStats,
      dataByDay: byDay,
      totalApptRev: tAppt,
      totalPkgRev: tPkg,
      totalRevenue: tAppt + tPkg,
      serviceMix: sMix
    };
  }, [fromDate, toDate]);

  const maxDaily = Math.max(...dataByDay.map((item) => item.total), 1); // Avoid division by zero

  const formatShortDate = (dateStr: string) => {
    const [_, m, d] = dateStr.split("-");
    return `${d}/${m}`;
  };

  const exportToCsv = () => {
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
          description: `${c ? c.name : "Khách lẻ"} - Dịch vụ: ${svcs.join(", ")}`,
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
          description: `${c ? c.name : "Khách lẻ"} - Mua gói/thẻ: ${pName}`,
          amount: Number(h.pricePaid || 0)
        };
      });

    const allTx = [...appts, ...pkgs].sort((a, b) => a.date.localeCompare(b.date));

    let csvContent = "\uFEFF"; // BOM for UTF-8 Excel compatibility
    csvContent += '"Ngày tháng","Giao dịch","Số tiền"\n';
    
    allTx.forEach(tx => {
      // Format date to DD/MM/YYYY
      const [y, m, d] = tx.date.split("-");
      const dateStr = `${d}/${m}/${y}`;
      // Escape quotes in description
      const desc = tx.description.replace(/"/g, '""');
      csvContent += `"${dateStr}","${desc}","${tx.amount}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bao_Cao_Thue_${fromDate}_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCommissionToCsv = () => {
    let csvContent = "\uFEFF"; // BOM for UTF-8 Excel support
    csvContent += "Mã Lịch Hẹn,Ngày,Giờ,Khách Hàng,Dịch Vụ,KTV Thực Hiện,Hoa Hồng (VNĐ)\n";

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
        `"${a.id}"`,
        `"${a.date}"`,
        `"${a.time}"`,
        `"${customerName}"`,
        `"${serviceNames.join(", ")}"`,
        `"${therapistName}"`,
        `"${totalCommission}"`
      ];
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BaoCao_HoaHongKTV_${fromDate}_den_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">Báo cáo doanh thu</h1>
          <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-ink/65">
            Doanh thu tổng cộng: <span className="font-semibold text-emerald">{formatVnd(totalRevenue)}</span>
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-3 bg-ivory-deep/30 p-2 rounded-[3px] border border-ink/10">
            <label className="flex items-center gap-2 text-xs font-semibold text-ink/70">
              Từ ngày:
              <input 
                type="date" 
                className="rounded-[3px] border border-ink/15 bg-ivory px-3 py-1.5 outline-none transition focus:border-emerald"
                value={fromDate} 
                onChange={e => setFromDate(e.target.value)} 
              />
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-ink/70">
              Đến ngày:
              <input 
                type="date" 
                className="rounded-[3px] border border-ink/15 bg-ivory px-3 py-1.5 outline-none transition focus:border-emerald"
                value={toDate} 
                onChange={e => setToDate(e.target.value)} 
              />
            </label>
          </div>
          
          <button 
            type="button" 
            onClick={exportToCsv}
            className="flex items-center gap-2 rounded-[3px] bg-emerald px-5 py-3 text-xs font-semibold text-ivory transition hover:bg-emerald-soft"
          >
            <Download className="size-4" />
            Xuất Excel Nộp Thuế
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
         <div className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/50">Dịch vụ lẻ & Phụ phí</p>
            <p className="mt-2 text-3xl font-display text-ink">{formatVnd(totalApptRev)}</p>
            <p className="mt-1 text-xs text-ink/50">Thanh toán trực tiếp tại lịch hẹn</p>
         </div>
         <div className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/50">Bán Gói / Thẻ</p>
            <p className="mt-2 text-3xl font-display text-ink">{formatVnd(totalPkgRev)}</p>
            <p className="mt-1 text-xs text-ink/50">Doanh thu từ mua mới / nạp thẻ</p>
         </div>
         <div className="rounded-[3px] border border-emerald/30 bg-emerald/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-emerald">Tổng Doanh Thu</p>
            <p className="mt-2 text-3xl font-display text-emerald">{formatVnd(totalRevenue)}</p>
            <p className="mt-1 text-xs text-emerald/70">Tổng thực thu tiền mặt/chuyển khoản</p>
         </div>
      </div>

      <section className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6 overflow-x-auto">
        <h2 className="font-display text-2xl text-ink">Doanh thu theo ngày</h2>
        <div className="mt-6 flex h-64 items-end gap-3 min-w-[600px]">
          {dataByDay.map((item) => {
            const hAppt = (item.appointmentRevenue / maxDaily) * 100;
            const hPkg = (item.packageRevenue / maxDaily) * 100;
            return (
              <div key={item.date} className="flex flex-1 flex-col items-center gap-2 group relative">
                {/* Tooltip */}
                <div className="absolute -top-14 hidden flex-col items-center group-hover:flex bg-ink text-ivory text-[10px] p-2 rounded shadow-lg z-10 w-32">
                   <span className="font-semibold">{formatVnd(item.total)}</span>
                   <span className="text-ivory/70">Dịch vụ: {formatVnd(item.appointmentRevenue)}</span>
                   <span className="text-ivory/70">Gói/Thẻ: {formatVnd(item.packageRevenue)}</span>
                </div>

                <span className="text-[10px] font-semibold text-emerald">{Math.round(item.total / 1000)}k</span>
                <div className="w-full h-full flex flex-col justify-end">
                  {/* Bán gói/thẻ (Màu cam nhạt/Champagne) */}
                  {hPkg > 0 && <div className="w-full bg-champagne transition hover:bg-champagne/80" style={{ height: `${hPkg}%` }} title="Gói/Thẻ" />}
                  {/* Dịch vụ (Màu xanh/Emerald) */}
                  {hAppt > 0 && <div className="w-full bg-emerald transition hover:bg-emerald/80" style={{ height: `${hAppt}%` }} title="Dịch vụ" />}
                </div>
                <span className="text-[10px] text-ink/55 whitespace-nowrap">{formatShortDate(item.date)}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex gap-4 text-xs font-semibold text-ink/60 justify-center">
           <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald rounded-sm"></div> Dịch vụ trực tiếp</div>
           <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-champagne rounded-sm"></div> Bán Gói/Thẻ</div>
        </div>
      </section>

      <section className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6">
        <h2 className="font-display text-2xl text-ink">Top 10 Tỷ trọng dịch vụ hoàn thành</h2>
        {serviceMix.length > 0 ? (
          <ul className="mt-4 space-y-3.5">
            {serviceMix.map((item) => (
              <li key={item.name}>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-ink/70">{item.name} <span className="text-ink/40">({item.count} lượt)</span></span>
                  <span className="font-semibold text-emerald">{item.share}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                  <div className="h-full rounded-full bg-emerald" style={{ width: `${item.share}%` }} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-ink/50 italic">Chưa có dịch vụ nào hoàn thành trong khoảng thời gian này.</p>
        )}
      </section>

      <section className="rounded-[3px] border border-ink/10 bg-ivory-deep/30 p-5 sm:p-6 mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
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
        </div>
        
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

    </div>
  );
}
