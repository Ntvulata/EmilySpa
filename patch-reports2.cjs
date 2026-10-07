const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.reports.tsx', 'utf8');

const replacement = `        // Tính toán tỷ trọng dịch vụ (dựa trên các lịch hẹn đã hoàn thành)
        dayAppts.forEach(a => {
          (a.serviceIds || (a as any).services || []).forEach(sid => {
            const sDef = serviceOptions.find(opt => opt.id === sid);
            const sName = sDef ? sDef.name : "Dịch vụ đã xóa";
            sCounts[sName] = (sCounts[sName] || 0) + 1;
            totalServices++;
          });
        });`;

// We will find the comment line and replace from there
const idx = code.indexOf('// TA-nh to'); // It was "TA-nh toAn t tr?ng"
const idx2 = code.indexOf('// 2. S', idx); // "2. S? ti?n bAn th?"

if (idx !== -1 && idx2 !== -1) {
    code = code.substring(0, idx) + replacement + "\n\n        " + code.substring(idx2);
} else {
    // try standard text
    const stdIdx = code.indexOf('dayAppts.forEach(a => {');
    const stdIdx2 = code.indexOf('// 2.', stdIdx);
    if (stdIdx !== -1 && stdIdx2 !== -1) {
        code = code.substring(0, stdIdx) + replacement.replace('// Tính toán...', '') + "\n\n        " + code.substring(stdIdx2);
    }
}

// Slice to top 10
code = code.replace(
  '.sort((a, b) => b.count - a.count);',
  '.sort((a, b) => b.count - a.count).slice(0, 10);'
);

code = code.replace(
  '<h2 className="font-display text-2xl text-ink">T',
  '<h2 className="font-display text-2xl text-ink">Top 10 T'
);


fs.writeFileSync('src/routes/dashboard.reports.tsx', code, 'utf8');
console.log("Patched service mix correctly.");
