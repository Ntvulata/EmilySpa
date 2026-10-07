const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');

const target = `    return {
      staffStats,
      dataByDay: byDay,
      totalApptRev: tAppt,
      totalPkgRev: tPkg,
      totalRevenue: tAppt + tPkg,
      serviceMix: sMix
    };`;

const replacement = `      // Báo cáo thẻ khách hàng
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

// replace ignores exact indentation if we do it via regex, but let's just do a clean indexOf
const startIdx = code.indexOf('return {\n      staffStats,\n      dataByDay: byDay,');
if (startIdx !== -1) {
    const endIdx = code.indexOf('};', startIdx);
    code = code.substring(0, startIdx) + replacement + code.substring(endIdx + 2);
    fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
    console.log("Patched packageReport return successfully.");
} else {
    // try fallback spacing
    const s2 = code.indexOf('return {\r\n        staffStats');
    if (s2 !== -1) {
        const e2 = code.indexOf('};', s2);
        code = code.substring(0, s2) + replacement + code.substring(e2 + 2);
        fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
        console.log("Patched packageReport (fallback) successfully.");
    } else {
        // try fallback 3
        const s3 = code.indexOf('return {\n        staffStats');
        if (s3 !== -1) {
            const e3 = code.indexOf('};', s3);
            code = code.substring(0, s3) + replacement + code.substring(e3 + 2);
            fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
            console.log("Patched packageReport (fallback 3) successfully.");
        } else {
            console.log("Could not find return object");
        }
    }
}
