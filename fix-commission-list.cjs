const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

const targetStr = '<span className="shrink-0 text-sm font-semibold text-emerald">{formatVnd(item.price)}</span>';
const replacementStr = `
                  <div className="flex flex-col items-end shrink-0 justify-center min-w-[80px]">
                    <span className="text-sm font-semibold text-emerald">{formatVnd(item.price)}</span>
                    {item.commission ? <span className="text-[11px] italic text-ink/50 font-medium mt-0.5">{formatVnd(item.commission)}</span> : null}
                  </div>
`;

code = code.replace(targetStr, replacementStr.trim());

fs.writeFileSync('src/routes/dashboard.services.tsx', code, 'utf8');
