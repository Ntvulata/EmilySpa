const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

// 1. Remove sellMode from SearchableSelect
code = code.replace(
  /const \[sellMode, setSellMode\] = useState<"master" \| "custom">\("master"\);\n    const \[search, setSearch\] = useState\(""\);/m,
  'const [search, setSearch] = useState("");'
);

// 2. Add sellMode to PackagesHistoryPage
code = code.replace(
  /function PackagesHistoryPage\(\) \{\n  const \[open, setOpen\] = useState\(false\);/m,
  `function PackagesHistoryPage() {
  const [open, setOpen] = useState(false);
  const [sellMode, setSellMode] = useState<"master" | "custom">("master");`
);

// 3. Fix the validation logic inside submit (since sellMode is now in scope)
// Previously we changed: if (!form.packageId) return setError("Vui lAng ch?n gA3i/th.");
// Wait, my previous replacement missed it! It's still `if (!form.packageId)`!
code = code.replace(
  /if \(\!form\.packageId\) return setError\("Vui lAng ch\?n gA3i\/th\."\);/m,
  `if (sellMode === "master" && !form.packageId) return setError("Vui lòng chọn gói/thẻ.");
    if (sellMode === "custom" && !form.serviceId) return setError("Vui lòng chọn dịch vụ.");`
);

// 4. Replace the UI block
const startMarker = '<div className="space-y-1.5">\n                <label className="text-xs font-semibold text-ink/60">GA3i cA n mua</label>';
const startIdx = code.indexOf(startMarker);
if (startIdx !== -1) {
  // Find the closing of this div
  const endMarker = 'placeholder="-- ChA?n gA3i/thA --"\n                />\n              </div>';
  // Let's just find the next '</div>' after the placeholder
  const placeholderIdx = code.indexOf('placeholder="', startIdx);
  const divCloseIdx = code.indexOf('</div>', placeholderIdx);
  
  const newBlock = `<div className="sm:col-span-2 flex items-center gap-4 mt-2 mb-2 p-1 bg-ink/5 rounded-md w-fit">
              <button type="button" onClick={() => setSellMode("master")} className={\`px-4 py-2 text-xs font-semibold rounded-md transition \${sellMode === "master" ? "bg-white shadow-sm text-emerald" : "text-ink/60"}\`}>Mua Gói Combo</button>
              <button type="button" onClick={() => setSellMode("custom")} className={\`px-4 py-2 text-xs font-semibold rounded-md transition \${sellMode === "custom" ? "bg-white shadow-sm text-emerald" : "text-ink/60"}\`}>Mua Dịch Vụ Tự Do</button>
            </div>
            
            {sellMode === "master" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink/60">Gói cần mua</label>
                <SearchableSelect
                  options={packageOptions}
                  value={form.packageId}
                  onChange={(v) => {
                    const master = masterPackages.find(p => p.id === v);
                    setForm({ 
                      ...form, 
                      packageId: v, 
                      valueChange: master ? Number(master.value).toLocaleString("en-US") : "",
                      pricePaid: master ? Number(master.price).toLocaleString("en-US") : ""
                    });
                    setError("");
                  }}
                  placeholder="-- Chọn gói/thẻ --"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink/60">Dịch vụ</label>
                <SearchableSelect
                  options={serviceOptions.map(s => ({ value: s.id, label: \`\${s.name} - \${s.price ? Number(s.price).toLocaleString("en-US") + " VND" : "0 VND"}\` }))}
                  value={form.serviceId}
                  onChange={(v) => {
                    const svc = serviceOptions.find(s => s.id === v);
                    setForm({ 
                      ...form, 
                      serviceId: v, 
                      valueChange: "5", // Mặc định gợi ý 5 buổi
                      pricePaid: svc ? Number(svc.price * 5).toLocaleString("en-US") : ""
                    });
                    setError("");
                  }}
                  placeholder="-- Chọn dịch vụ --"
                />
              </div>
            )}`;
  
  code = code.substring(0, startIdx) + newBlock + code.substring(divCloseIdx + 6);
  console.log("Replaced UI block!");
} else {
  // Let's do a regex search just in case
  const match = code.match(/<div className="space-y-1\.5">\s*<label className="text-xs font-semibold text-ink\/60">.*?c.*?n mua<\/label>[\s\S]*?placeholder="--.*?--"\s*\/>\s*<\/div>/);
  if (match) {
    const newBlock = `<div className="sm:col-span-2 flex items-center gap-4 mt-2 mb-2 p-1 bg-ink/5 rounded-md w-fit">
              <button type="button" onClick={() => setSellMode("master")} className={\`px-4 py-2 text-xs font-semibold rounded-md transition \${sellMode === "master" ? "bg-white shadow-sm text-emerald" : "text-ink/60"}\`}>Mua Gói Combo</button>
              <button type="button" onClick={() => setSellMode("custom")} className={\`px-4 py-2 text-xs font-semibold rounded-md transition \${sellMode === "custom" ? "bg-white shadow-sm text-emerald" : "text-ink/60"}\`}>Mua Dịch Vụ Tự Do</button>
            </div>
            
            {sellMode === "master" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink/60">Gói cần mua</label>
                <SearchableSelect
                  options={packageOptions}
                  value={form.packageId}
                  onChange={(v) => {
                    const master = masterPackages.find(p => p.id === v);
                    setForm({ 
                      ...form, 
                      packageId: v, 
                      valueChange: master ? Number(master.value).toLocaleString("en-US") : "",
                      pricePaid: master ? Number(master.price).toLocaleString("en-US") : ""
                    });
                    setError("");
                  }}
                  placeholder="-- Chọn gói/thẻ --"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink/60">Dịch vụ</label>
                <SearchableSelect
                  options={serviceOptions.map(s => ({ value: s.id, label: \`\${s.name} - \${s.price ? Number(s.price).toLocaleString("en-US") + " VND" : "0 VND"}\` }))}
                  value={form.serviceId}
                  onChange={(v) => {
                    const svc = serviceOptions.find(s => s.id === v);
                    setForm({ 
                      ...form, 
                      serviceId: v, 
                      valueChange: "5", // Mặc định gợi ý 5 buổi
                      pricePaid: svc ? Number(svc.price * 5).toLocaleString("en-US") : ""
                    });
                    setError("");
                  }}
                  placeholder="-- Chọn dịch vụ --"
                />
              </div>
            )}`;
    code = code.replace(match[0], newBlock);
    console.log("Replaced UI block via Regex!");
  } else {
    console.log("Could NOT find UI block!");
  }
}

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("Done patching packages-history");
