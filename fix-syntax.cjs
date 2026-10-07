const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const badChunk = `                              ) : appointment.packageUsed && (
                                <p className="inline-block rounded-[3px] bg-emerald/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald" style={{ color: getGridCardStyle(appointment).color || undefined, backgroundColor: getGridCardStyle(appointment).color === "#FFFFFF" ? "rgba(255,255,255,0.2)" : undefined }}>
                                  Dng th?: {getPackageName(appointment.packageUsed)} 
                                  <span className="font-bold"> (-{getPackageType(appointment.packageUsed) === 'balance' ? formatVnd(appointment.balanceDeducted || 0) : \`\${appointment.sessionsDeducted || 0} bu?i\`})</span>
                                </p>
                              )} 
                                  <span className="font-bold"> (-{getPackageType(appointment.packageUsed) === 'balance' ? formatVnd(appointment.balanceDeducted || 0) : \`\${appointment.sessionsDeducted || 0} bu?i\`})</span>
                                </p>
                              )}`;
                              
const goodChunk = `                              ) : appointment.packageUsed && (
                                <p className="inline-block rounded-[3px] bg-emerald/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald" style={{ color: getGridCardStyle(appointment).color || undefined, backgroundColor: getGridCardStyle(appointment).color === "#FFFFFF" ? "rgba(255,255,255,0.2)" : undefined }}>
                                  Dùng thẻ: {getPackageName(appointment.packageUsed)} 
                                  <span className="font-bold"> (-{getPackageType(appointment.packageUsed) === 'balance' ? formatVnd(appointment.balanceDeducted || 0) : \`\${appointment.sessionsDeducted || 0} buổi\`})</span>
                                </p>
                              )}`;
                              
// Using index of `) : appointment.packageUsed && (` to find where to replace
let startIdx = code.indexOf(') : appointment.packageUsed && (');
let endIdx = code.indexOf('{appointment.note && (', startIdx);
if (startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + goodChunk + "\n                                " + code.substring(endIdx);
    fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
    console.log("Fixed syntax error");
} else {
    console.log("Could not find chunk");
}
