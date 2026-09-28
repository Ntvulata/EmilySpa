const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

// 1. Imports
code = code.replace(
  /import \{ History, ShoppingCart, Scissors, Pencil, Trash2, ChevronDown, Check \} from "lucide-react";/,
  'import { History, ShoppingCart, Scissors, Pencil, Trash2, ChevronDown, Check, ArrowRightLeft, Undo2 } from "lucide-react";'
);

// 2. States and Hooks inside PackagesHistoryPage
const statesToAdd = `
  const [convertOpen, setConvertOpen] = useState(false);
  const [cForm, setCForm] = useState({
    date: new Date().toISOString().split("T")[0],
    customerId: "",
    sourcePackageId: "",
    targetPackageId: "",
    newValue: "",
    moneyPaid: "",
    note: ""
  });

  const activePackagesForSelected = React.useMemo(() => {
    if (!cForm.customerId) return [];
    const pkgs = new Map();
    packageHistory.filter(h => h.customerId === cForm.customerId).forEach(h => {
      const current = pkgs.get(h.packageId) || { total: 0, used: 0 };
      if (h.type === "sell" || h.type === "convert") current.total += h.valueChange;
      if (h.type === "deduct" || h.type === "refund" || h.type === "convert_out") current.used += Math.abs(h.valueChange);
      pkgs.set(h.packageId, current);
    });
    const result = [];
    pkgs.forEach((val, pId) => {
      const remaining = val.total - val.used;
      if (remaining > 0) {
        const pDef = masterPackages.find(p => p.id === pId);
        if (pDef) {
          result.push({ pId, name: pDef.name, remaining, type: pDef.type });
        }
      }
    });
    return result;
  }, [cForm.customerId]);

  const startConvert = () => {
    setCForm({
      date: new Date().toISOString().split("T")[0],
      customerId: "",
      sourcePackageId: "",
      targetPackageId: "",
      newValue: "",
      moneyPaid: "",
      note: ""
    });
    setConvertOpen(true);
    setOpen(false);
    setEditId(null);
    setError("");
    setNotice("");
  };

  const submitConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cForm.customerId) return setError("Vui lòng chọn khách hàng.");
    if (!cForm.sourcePackageId) return setError("Vui lòng chọn thẻ đang có.");
    
    const sourcePkg = activePackagesForSelected.find(p => p.pId === cForm.sourcePackageId);
    if (!sourcePkg) return setError("Thẻ nguồn không hợp lệ.");

    const money = Number(cForm.moneyPaid.replace(/[^\\d-]/g, "")) || 0;
    
    const baseId = Date.now().toString();

    // Deduct old package
    const deductRecord = {
      id: "PH_OUT_" + baseId,
      date: cForm.date,
      type: cForm.targetPackageId ? "convert" : "refund",
      customerId: cForm.customerId,
      packageId: cForm.sourcePackageId,
      valueChange: -sourcePkg.remaining,
      pricePaid: cForm.targetPackageId ? 0 : money, // If refund, money goes here
      note: cForm.note || (cForm.targetPackageId ? "Chuyển đổi thẻ" : "Hoàn thẻ")
    };
    packageHistory.push(deductRecord as any);
    await fbSavePackageHistory(deductRecord);

    if (cForm.targetPackageId) {
      const val = Number(cForm.newValue.replace(/\\D/g, "")) || 0;
      if (!val) {
        // Rollback just in case, though local state is already mutated, a refresh will fix.
        return setError("Vui lòng nhập giá trị thẻ mới.");
      }
      const addRecord = {
        id: "PH_IN_" + baseId,
        date: cForm.date,
        type: "convert",
        customerId: cForm.customerId,
        packageId: cForm.targetPackageId,
        valueChange: val,
        pricePaid: money, // Money goes to the new package as top-up
        note: cForm.note || "Nhận chuyển đổi từ thẻ cũ"
      };
      packageHistory.push(addRecord as any);
      await fbSavePackageHistory(addRecord);
    }
    
    setNotice(cForm.targetPackageId ? "Chuyển đổi thẻ thành công." : "Hoàn thẻ thành công.");
    setConvertOpen(false);
  };
`;

code = code.replace(
  /const startNew = \(\) => \{/,
  'const React = require("react");\n' + statesToAdd + '\n  const startNew = () => {'
);
code = code.replace('const React = require("react");', 'import React from "react";'); // Just to be clean in TSX

// 3. Add Convert Button next to "Bán Gói/Thẻ Mới"
code = code.replace(
  /onClick=\{\(\) => open \? setOpen\(false\) : startNew\(\)\}\s*className="rounded-\[3px\] bg-emerald px-5 py-3 text-xs font-semibold text-ivory transition hover:bg-emerald-soft"\s*>\s*\{open \? "Dừng biểu mẫu" : "Bán Gói\/Thẻ Mới"\}\s*<\/button>\s*<\/div>/,
  `$&
        <button 
          onClick={() => convertOpen ? setConvertOpen(false) : startConvert()}
          className="rounded-[3px] bg-champagne px-5 py-3 text-xs font-semibold text-emerald transition hover:bg-champagne/80"
        >
          {convertOpen ? "Dừng biểu mẫu" : "Chuyển Đổi / Hoàn Thẻ"}
        </button>
      </div>`
);

// We need to match the original DOM. Let's use simpler regex:
code = code.replace(
  /<button\s*type="button"\s*onClick=\{\(\) => open \? setOpen\(false\) : startNew\(\)\}.*?<\/button>\s*<\/div>/s,
  (match) => match.replace('</div>', '<button type="button" onClick={() => convertOpen ? setConvertOpen(false) : startConvert()} className="rounded-[3px] border border-champagne/50 bg-champagne/10 px-5 py-3 text-xs font-semibold text-emerald transition hover:bg-champagne/30 ml-2">{convertOpen ? "Dừng biểu mẫu" : "Chuyển Đổi / Hoàn Thẻ"}</button></div>')
);

// 4. Inject the ConvertForm right after the sell form
const convertFormHtml = `
      {convertOpen && (
        <form onSubmit={submitConvert} className="rounded-[3px] border border-champagne/50 bg-champagne/5 p-5 sm:p-6 mb-6 mt-4">
          <h2 className="font-display text-2xl text-emerald">Chuyển Đổi / Hoàn Thẻ</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            
            <label className="space-y-1.5 text-xs font-semibold text-ink/60">
              Ngày
              <input type="date" className="w-full rounded-[3px] border border-ink/15 bg-ivory px-3 py-2.5 text-sm font-normal text-ink outline-none transition focus:border-champagne" value={cForm.date} onChange={(e) => setCForm({ ...cForm, date: e.target.value })} />
            </label>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink/60">Khách Hàng</label>
              <SearchableSelect
                options={customerOptions}
                value={cForm.customerId}
                onChange={(v) => { setCForm({ ...cForm, customerId: v, sourcePackageId: "", targetPackageId: "" }); setError(""); }}
                placeholder="-- Chọn khách hàng --"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink/60">Thẻ đang có (Nguồn)</label>
              <select className="w-full rounded-[3px] border border-ink/15 bg-ivory px-3 py-2.5 text-sm text-ink outline-none" value={cForm.sourcePackageId} onChange={e => setCForm({...cForm, sourcePackageId: e.target.value})}>
                <option value="">-- Chọn thẻ --</option>
                {activePackagesForSelected.map(p => (
                  <option key={p.pId} value={p.pId}>{p.name} (Còn: {p.type === 'sessions' ? p.remaining + ' buổi' : Number(p.remaining).toLocaleString('en-US') + 'đ'})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink/60">Thẻ muốn chuyển (Bỏ trống nếu Hoàn tiền)</label>
              <SearchableSelect
                options={packageOptions}
                value={cForm.targetPackageId}
                onChange={(v) => { setCForm({ ...cForm, targetPackageId: v }); }}
                placeholder="-- Chọn thẻ mới --"
              />
            </div>

            {cForm.targetPackageId && (
              <label className="space-y-1.5 text-xs font-semibold text-ink/60">
                Giá trị cấp cho thẻ mới (Số buổi / Số tiền)
                <input className="w-full rounded-[3px] border border-ink/15 bg-ivory px-3 py-2.5 text-sm font-normal text-ink outline-none" value={cForm.newValue} onChange={(e) => { const raw = e.target.value.replace(/\\D/g, ""); setCForm({ ...cForm, newValue: raw ? Number(raw).toLocaleString("en-US") : "" }); }} inputMode="numeric" placeholder="VD: 5" />
              </label>
            )}

            <label className="space-y-1.5 text-xs font-semibold text-ink/60">
              Số tiền nộp thêm / Hoàn lại (Âm = Hoàn)
              <input className="w-full rounded-[3px] border border-ink/15 bg-ivory px-3 py-2.5 text-sm font-normal text-ink outline-none" value={cForm.moneyPaid} onChange={(e) => { const raw = e.target.value.replace(/[^\\d-]/g, ""); setCForm({ ...cForm, moneyPaid: raw ? Number(raw).toLocaleString("en-US") : (e.target.value === "-" ? "-" : "") }); }} placeholder="VD: -500,000" />
            </label>

            <label className="space-y-1.5 text-xs font-semibold text-ink/60 sm:col-span-2">
              Ghi chú
              <input className="w-full rounded-[3px] border border-ink/15 bg-ivory px-3 py-2.5 text-sm font-normal text-ink outline-none" value={cForm.note} onChange={(e) => setCForm({ ...cForm, note: e.target.value })} placeholder="VD: Khách đổi gói cao hơn..." />
            </label>
          </div>
          
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setConvertOpen(false)} className="rounded-[3px] border border-ink/15 px-4 py-2.5 text-xs font-semibold text-ink/70">Huỷ</button>
            <button type="submit" className="rounded-[3px] bg-emerald px-5 py-2.5 text-xs font-semibold text-ivory hover:bg-emerald-soft">Thực hiện</button>
          </div>
        </form>
      )}
`;

code = code.replace(
  /\{\s*open\s*&&\s*\(\s*<form.*?<\/form>\s*\)\s*\}/s,
  (match) => match + '\n' + convertFormHtml
);

// 5. Update Table Row Display
// Replace item.type === "sell" condition with better rendering
const typeRender = `
                  {item.type === "sell" && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald bg-emerald/10 px-2 py-1 rounded-[2px]"><ShoppingCart className="size-3" /> BÁN THẺ</span>}
                  {item.type === "deduct" && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-champagne bg-champagne/10 px-2 py-1 rounded-[2px]"><Scissors className="size-3" /> TRỪ THẺ</span>}
                  {item.type === "convert" && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-[2px]"><ArrowRightLeft className="size-3" /> ĐỔI THẺ</span>}
                  {item.type === "refund" && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-500/10 px-2 py-1 rounded-[2px]"><Undo2 className="size-3" /> HOÀN THẺ</span>}
`;

code = code.replace(
  /\{item\.type === "sell" \? \([\s\S]*?\) : \([\s\S]*?TR\? TH\?<\/span>[\s\S]*?\)\}/,
  typeRender
);

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
