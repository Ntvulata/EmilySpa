const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

// Update filter logic
const oldFilter = `  const filteredRows = packageHistory.filter(h => {
    if (filter !== "all" && h.type !== filter) return false;
    if (h.date < fromDate || h.date > toDate) return false;`;

const newFilter = `  const filteredRows = packageHistory.filter(h => {
    const isSell = h.type === "sell" && Number(h.valueChange) >= 0;
    const visualCategory = isSell ? "sell" : "deduct";
    if (filter !== "all" && visualCategory !== filter) return false;
    
    // allow search to bypass date
    if (searchQuery.trim() === "") {
        if (h.date < fromDate || h.date > toDate) return false;
    }`;

code = code.replace(oldFilter, newFilter);

// Update UI render
const oldUI = `{item.type === "sell" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald bg-emerald/10 px-2 py-1 rounded-[2px]"><ShoppingCart className="size-3" /> BÁN THẺ</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-champagne bg-champagne/10 px-2 py-1 rounded-[2px]"><Scissors className="size-3" /> TRỪ THẺ</span>
                  )}`;

const newUI = `{(item.type === "sell" && Number(item.valueChange) >= 0) ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald bg-emerald/10 px-2 py-1 rounded-[2px]"><ShoppingCart className="size-3" /> BÁN THẺ</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-champagne bg-champagne/10 px-2 py-1 rounded-[2px]"><Scissors className="size-3" /> TRỪ THẺ</span>
                  )}`;

code = code.replace(oldUI, newUI);

// Update text color
const oldColor = `className={\`px-4 py-3.5 font-semibold text-right \${item.type === "sell" ? "text-emerald" : "text-champagne"}\`}`;
const newColor = `className={\`px-4 py-3.5 font-semibold text-right \${(item.type === "sell" && Number(item.valueChange) >= 0) ? "text-emerald" : "text-champagne"}\`}`;
code = code.replace(oldColor, newColor);

// Update actions render
const oldActions = `{item.type === "sell" ? (
                    <>
                      <button type="button" onClick={() => handlePrint(item)}`;
const newActions = `{(item.type === "sell" && Number(item.valueChange) >= 0) ? (
                    <>
                      <button type="button" onClick={() => handlePrint(item)}`;
code = code.replace(oldActions, newActions);

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("Patched packages-history robust logic");
