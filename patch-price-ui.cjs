const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const tablePriceCellTarget = `<td className="px-4 py-3.5 text-right font-semibold">
                      {type === "none" && <span className="text-ink">{formatVnd(item.price || 0)}</span>}
                      {type === "sessions" && (
                        <div className="flex flex-col items-end">
                           <span className="text-emerald text-xs">Thẻ: -{item.sessionsDeducted} buổi</span>
                           {(item.price || 0) > 0 && <span className="text-ink text-xs">Mặt: +{formatVnd(item.price || 0)}</span>}
                        </div>
                      )}
                      {type === "balance" && (
                        <div className="flex flex-col items-end">
                           <span className="text-emerald text-xs">Thẻ: -{formatVnd(item.balanceDeducted || 0)}</span>
                           {(item.price || 0) > 0 && <span className="text-ink text-xs">Mặt: +{formatVnd(item.price || 0)}</span>}
                        </div>
                      )}
                    </td>`;

const tablePriceCellReplacement = `<td className="px-4 py-3.5 text-right font-semibold">
                      <div className="flex flex-col items-end">
                        {item.packagesDeducted && item.packagesDeducted.length > 0 ? (
                          item.packagesDeducted.map((p, idx) => (
                            <span key={idx} className="text-emerald text-xs">Thẻ: -{p.type === 'balance' ? formatVnd(p.deducted || 0) : \`\${p.deducted || 0} buổi\`}</span>
                          ))
                        ) : (
                          <>
                            {type === "sessions" && <span className="text-emerald text-xs">Thẻ: -{item.sessionsDeducted} buổi</span>}
                            {type === "balance" && <span className="text-emerald text-xs">Thẻ: -{formatVnd(item.balanceDeducted || 0)}</span>}
                          </>
                        )}
                        {((item.price || 0) > 0 || (type === "none" && !(item.packagesDeducted && item.packagesDeducted.length > 0))) && (
                          <span className="text-ink text-xs">{type === "none" && !(item.packagesDeducted && item.packagesDeducted.length > 0) ? "" : "Mặt: +"}{formatVnd(item.price || 0)}</span>
                        )}
                      </div>
                    </td>`;

// using index
let idx = code.indexOf('<td className="px-4 py-3.5 text-right font-semibold">');
if (idx !== -1) {
    let endIdx = code.indexOf('</td>', idx);
    code = code.substring(0, idx) + tablePriceCellReplacement + code.substring(endIdx + 5);
}

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Patched price cell");
