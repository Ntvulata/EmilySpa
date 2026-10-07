const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// Replace table cell
code = code.replace(
  '<td className="px-4 py-3.5 text-xs font-medium text-emerald">{getPackageName(item.packageUsed)}</td>',
  `<td className="px-4 py-3.5 text-xs font-medium text-emerald">
    {item.packagesDeducted && item.packagesDeducted.length > 0
      ? item.packagesDeducted.map(p => getPackageName(p.packageId)).join(", ")
      : getPackageName(item.packageUsed)}
  </td>`
);

// Replace grid card display
const gridTarget = `{appointment.packageUsed && (
                                <p className="inline-block rounded-[3px] bg-emerald/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald" style={{ color: getGridCardStyle(appointment).color || undefined, backgroundColor: getGridCardStyle(appointment).color === "#FFFFFF" ? "rgba(255,255,255,0.2)" : undefined }}>
                                  Dùng thẻ: {getPackageName(appointment.packageUsed)} 
                                  <span className="font-bold"> (-{getPackageType(appointment.packageUsed) === 'balance' ? formatVnd(appointment.balanceDeducted || 0) : \`\${appointment.sessionsDeducted || 0} buổi\`})</span>
                                </p>
                              )}`;
const gridReplacement = `{appointment.packagesDeducted && appointment.packagesDeducted.length > 0 ? (
                                appointment.packagesDeducted.map((p, idx) => (
                                  <p key={idx} className="inline-block rounded-[3px] bg-emerald/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald" style={{ color: getGridCardStyle(appointment).color || undefined, backgroundColor: getGridCardStyle(appointment).color === "#FFFFFF" ? "rgba(255,255,255,0.2)" : undefined }}>
                                    Dùng thẻ: {getPackageName(p.packageId)} 
                                    <span className="font-bold"> (-{p.type === 'balance' ? formatVnd(p.deducted || 0) : \`\${p.deducted || 0} buổi\`})</span>
                                  </p>
                                ))
                              ) : appointment.packageUsed && (
                                <p className="inline-block rounded-[3px] bg-emerald/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald" style={{ color: getGridCardStyle(appointment).color || undefined, backgroundColor: getGridCardStyle(appointment).color === "#FFFFFF" ? "rgba(255,255,255,0.2)" : undefined }}>
                                  Dùng thẻ: {getPackageName(appointment.packageUsed)} 
                                  <span className="font-bold"> (-{getPackageType(appointment.packageUsed) === 'balance' ? formatVnd(appointment.balanceDeducted || 0) : \`\${appointment.sessionsDeducted || 0} buổi\`})</span>
                                </p>
                              )}`;
                              
// Since strings have special characters, we can replace manually if exact match fails
let idx = code.indexOf('{appointment.packageUsed && (');
if (idx !== -1) {
    let endIdx = code.indexOf(')}', idx + 100);
    if (endIdx !== -1) {
        code = code.substring(0, idx) + gridReplacement + code.substring(endIdx + 2);
    }
}

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Patched grid card");
