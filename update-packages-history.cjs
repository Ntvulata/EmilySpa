const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

// 1. Add serviceOptions to the spa-data imports
code = code.replace(
  /import \{ formatVnd, packageHistory, masterPackages, initialCustomers \} from "@\/lib\/spa-data";/,
  'import { formatVnd, packageHistory, masterPackages, initialCustomers, serviceOptions } from "@/lib/spa-data";'
);

// 2. Add fbGetServices to firebase imports
code = code.replace(
  /import \{ fbSavePackageHistory, fbDeletePackageHistory \} from "@\/lib\/firebase";/,
  'import { fbSavePackageHistory, fbDeletePackageHistory, fbGetServices } from "@/lib/firebase";'
);

// 3. Add fbGetServices to a useEffect
code = code.replace(
  /const \[tick, setTick\] = useState\(0\);/,
  `const [tick, setTick] = useState(0);
  useEffect(() => {
    fbGetServices().then(data => {
      if (data && data.length > 0) {
        serviceOptions.length = 0;
        data.forEach(d => serviceOptions.push(d));
      }
    }).catch(console.error);
  }, []);`
);

// 4. Update the form state to include serviceId
code = code.replace(
  /const \[form, setForm\] = useState\(\{ date: "", customerId: "", packageId: "", valueChange: "", pricePaid: "", note: "" \}\);/,
  'const [form, setForm] = useState({ date: "", customerId: "", packageId: "", serviceId: "", valueChange: "", pricePaid: "", note: "" });'
);
code = code.replace(
  /const startNew = \(\) => \{[\s\S]*?setForm\(\{[\s\S]*?note: "" \}\);/,
  `const startNew = () => {
      setConvertOpen(false);
      setSellMode("master");
      setForm({ 
        date: new Date().toISOString().split("T")[0], 
        customerId: "", 
        packageId: "", 
        serviceId: "",
        valueChange: "", 
        pricePaid: "",
        note: "" 
      });`
);

// 5. Add sellMode state
code = code.replace(
  /const \[open, setOpen\] = useState\(false\);/,
  'const [open, setOpen] = useState(false);\n  const [sellMode, setSellMode] = useState<"master" | "custom">("master");'
);

// 6. Update submit logic to handle custom mode
const oldSubmitLogic = `if (!form.packageId) return setError("Vui lng ch?n gi/th.");`;
const newSubmitLogic = `if (sellMode === "master" && !form.packageId) return setError("Vui lòng chọn gói/thẻ.");
      if (sellMode === "custom" && !form.serviceId) return setError("Vui lòng chọn dịch vụ.");`;
code = code.replace(oldSubmitLogic, newSubmitLogic);

const oldSaveLogic = `const nextId = "HT-" + Date.now();
      recordToSave = {
        id: nextId,
        date: form.date,
        type: "sell" as const,
        customerId: form.customerId,
        packageId: form.packageId,
        valueChange: val,
        pricePaid: price,
        note: form.note || "Mua m>i/Np thAm"
      };`;
const newSaveLogic = `const nextId = "HT-" + Date.now();
      
      let finalPkgId = form.packageId;
      let finalCustomName = undefined;
      
      if (sellMode === "custom") {
        finalPkgId = "CUSTOM_" + form.serviceId + "_" + Date.now();
        const svc = serviceOptions.find(s => s.id === form.serviceId);
        finalCustomName = "Thẻ " + val + " buổi - " + (svc ? svc.name : form.serviceId);
      }

      recordToSave = {
        id: nextId,
        date: form.date,
        type: "sell" as const,
        customerId: form.customerId,
        packageId: finalPkgId,
        customName: finalCustomName,
        valueChange: val,
        pricePaid: price,
        note: form.note || "Mua mới/Nạp thêm"
      };`;
// wait, we need to match the actual regex or string
// Let's replace the block up to packageHistory.push
const blockToReplace = /const nextId = "HT-" \+ Date\.now\(\);\s*recordToSave = \{\s*id: nextId,\s*date: form\.date,\s*type: "sell" as const,\s*customerId: form\.customerId,\s*packageId: form\.packageId,\s*valueChange: val,\s*pricePaid: price,\s*note: form\.note \|\| "[^"]*"\s*\};\s*packageHistory\.push\(recordToSave\);/;
code = code.replace(blockToReplace, newSaveLogic + '\n      packageHistory.push(recordToSave);');

// 7. Update UI Form to show toggles and dropdown
const formFieldsHtml = `<div className="space-y-1.5">
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
            </div>`;

const newFormFieldsHtml = `<div className="sm:col-span-2 flex items-center gap-4 mt-2 mb-2 p-1 bg-ink/5 rounded-md w-fit">
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

// we have to replace carefully because of utf-8 mangled text in the file.
// Let's use indexOf and substring for the UI replacement
const oldStr = '<div className="space-y-1.5">\n              <label className="text-xs font-semibold text-ink/60">G';
const oldStrIdx = code.indexOf(oldStr);
if (oldStrIdx !== -1) {
  const endStr = 'placeholder="-- Ch';
  const endIdx = code.indexOf('/>\n            </div>', oldStrIdx);
  if (endIdx !== -1) {
    code = code.substring(0, oldStrIdx) + newFormFieldsHtml + code.substring(endIdx + 20);
  }
}

// 8. Display logic in table
code = code.replace(
  /const pDef = masterPackages\.find\(p => p\.id === h\.packageId\);\n\s*const name = pDef \? pDef\.name : h\.packageId;/,
  `const pDef = masterPackages.find(p => p.id === h.packageId);\n                    const name = pDef ? pDef.name : (h.customName || h.packageId);`
);

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
console.log("Updated packages-history.tsx");
