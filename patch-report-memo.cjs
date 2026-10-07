const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');

const useMemoStartStr = `const { dataByDay, totalApptRev, totalPkgRev, totalRevenue, serviceMix, staffStats, packageReport } = useMemo(() => {`;
const useMemoStartRep = `const { dataByDay, totalApptRev, totalPkgRev, totalRevenue, serviceMix, staffStats } = useMemo(() => {`;
code = code.replace(useMemoStartStr, useMemoStartRep);

// the calculation target:
const calcTarget = `      // Báo cáo thẻ khách hàng
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
      const packageReport = Object.values(pkgMap).filter(p => p.opening > 0 || p.bought > 0 || p.used > 0);

      return {
        staffStats,
        dataByDay: byDay,
        totalApptRev: tAppt,
        totalPkgRev: tPkg,
        totalRevenue: tAppt + tPkg,
        serviceMix: sMix,
        packageReport
      };`;

const calcRep = `      return {
        staffStats,
        dataByDay: byDay,
        totalApptRev: tAppt,
        totalPkgRev: tPkg,
        totalRevenue: tAppt + tPkg,
        serviceMix: sMix
      };`;

code = code.replace(calcTarget, calcRep);

fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
console.log("Removed packageReport from useMemo.");
