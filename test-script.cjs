const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// 1. Add calculateTotalPrice helper
const helperCalcEndTime = `function calculateEndTime(startTime: string, services: string[], serviceOptions: any[]) {`;
const newHelpers = `function calculateTotalPrice(services: string[], serviceOptions: any[]) {
  let total = 0;
  services.forEach(id => {
    const s = serviceOptions.find(opt => opt.id === id);
    if (s && s.price) total += Number(s.price);
  });
  return total;
}

function calculateEndTime(startTime: string, services: string[], serviceOptions: any[]) {`;
code = code.replace(helperCalcEndTime, newHelpers);

// 2. Change Layout of Khách hàng & Gói thẻ
const layoutRegex = /<div className="space-y-1\.5 sm:col-span-2">\s*<label className="text-\[11px\] font-bold uppercase tracking-wide text-ink\/50">Khách Hàng<\/label>[\s\S]*?(?=<div className="space-y-1\.5 sm:col-span-2">)/;

// Wait, I need to match exactly.
