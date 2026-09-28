const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.packages-history.tsx', 'utf8');

// 1. Update deleteItem
code = code.replace(
  /const deleteItem = async \(id: string\) => \{\r?\n\s*if \(window\.confirm[^\{]+\{\r?\n\s*const idx = packageHistory\.findIndex\(h => h\.id === id\);\r?\n\s*if \(idx !== -1\) packageHistory\.splice\(idx, 1\);\r?\n\s*setTick\(t => t \+ 1\);\r?\n\s*setNotice[^;]+;\r?\n\s*try \{\r?\n\s*await fbDeletePackageHistory\(id\);\r?\n\s*\} catch \(err\) \{\r?\n\s*console\.error\(err\);\r?\n\s*\}\r?\n\s*\}\r?\n\s*\};/,
  `const deleteItem = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa lịch sử này?")) {
      const isConvert = id.startsWith("PH_OUT_") || id.startsWith("PH_IN_");
      const baseId = isConvert ? id.replace("PH_OUT_", "").replace("PH_IN_", "") : null;
      const idsToDelete = baseId ? [\`PH_OUT_\${baseId}\`, \`PH_IN_\${baseId}\`] : [id];
      
      for (const delId of idsToDelete) {
        const idx = packageHistory.findIndex(h => h.id === delId);
        if (idx !== -1) packageHistory.splice(idx, 1);
        try {
          await fbDeletePackageHistory(delId);
        } catch (err) { console.error(err); }
      }
      setTick(t => t + 1);
      setNotice("Đã xóa lịch sử.");
    }
  };`
);

// 2. Add Xóa button to convert/refund
code = code.replace(
  /<span className="text-\[10px\] text-ink\/40 uppercase">KhA'ng th s-a<\/span>/,
  '<button type="button" onClick={() => deleteItem(item.id)} className="inline-flex items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-red-400 hover:text-red-500"><Trash2 className="size-3" /> Xóa</button>'
);

// Fallback matching if encoding got messy
code = code.replace(
  /<span className="text-\[10px\] text-ink\/40 uppercase">Không thể sửa<\/span>/,
  '<button type="button" onClick={() => deleteItem(item.id)} className="inline-flex items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-red-400 hover:text-red-500"><Trash2 className="size-3" /> Xóa</button>'
);
code = code.replace(
  /<span className="text-\[10px\] text-ink\/40 uppercase">Kh.*?ng th.*? s.*?a<\/span>/,
  '<button type="button" onClick={() => deleteItem(item.id)} className="inline-flex items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-red-400 hover:text-red-500"><Trash2 className="size-3" /> Xóa</button>'
);

fs.writeFileSync('src/routes/dashboard.packages-history.tsx', code, 'utf8');
