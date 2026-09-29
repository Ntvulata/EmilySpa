const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.services.tsx', 'utf8');

if (!code.includes('const isAdmin =')) {
  code = code.replace(
    '  function ServicesPage() {',
    '  function ServicesPage() {\n    const userStr = typeof window !== "undefined" ? localStorage.getItem("spa_user") : "{}";\n    const user = JSON.parse(userStr || "{}");\n    const isAdmin = user.role === "admin";'
  );
}

// In the Services tab:
// Edit button: onClick={() => editService(i)}
code = code.replace(
  /<button type="button" onClick=\{\(\) => editService\(i\)\} className=\{editBtn\}>[^<]*<Pencil[^>]*>[^<]*<\/button>/g,
  '{isAdmin && <button type="button" onClick={() => editService(i)} className={editBtn}><Pencil className="size-3" /> Sửa</button>}'
);

// Delete button: onClick={() => deleteService(i)}
code = code.replace(
  /<button type="button" onClick=\{\(\) => deleteService\(i\)\} className="[^"]*hover:border-red-400[^"]*">[^<]*<Trash2[^>]*>[^<]*<\/button>/g,
  '{isAdmin && <button type="button" onClick={() => deleteService(i)} className="inline-flex shrink-0 items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-red-400 hover:text-red-500"><Trash2 className="size-3" /> Xóa</button>}'
);

// In the Packages tab:
// Edit button: onClick={() => editPkg(i)}
code = code.replace(
  /<button type="button" onClick=\{\(\) => editPkg\(i\)\} className=\{editBtn\}>[^<]*<Pencil[^>]*>[^<]*<\/button>/g,
  '{isAdmin && <button type="button" onClick={() => editPkg(i)} className={editBtn}><Pencil className="size-3" /> Sửa</button>}'
);

// Delete button: onClick={() => deletePkg(i)}
code = code.replace(
  /<button type="button" onClick=\{\(\) => deletePkg\(i\)\} className="[^"]*hover:border-red-400[^"]*">[^<]*<Trash2[^>]*>[^<]*<\/button>/g,
  '{isAdmin && <button type="button" onClick={() => deletePkg(i)} className="inline-flex shrink-0 items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-red-400 hover:text-red-500"><Trash2 className="size-3" /> Xóa</button>}'
);

// Also the "editStaff" and "deleteStaff" just in case they meant everything
code = code.replace(
  /<button type="button" onClick=\{\(\) => editStaff\(i\)\} className=\{editBtn\}>[^<]*<Pencil[^>]*>[^<]*<\/button>/g,
  '{isAdmin && <button type="button" onClick={() => editStaff(i)} className={editBtn}><Pencil className="size-3" /> Sửa</button>}'
);

code = code.replace(
  /<button type="button" onClick=\{\(\) => deleteStaff\(i\)\} className="[^"]*hover:border-red-400[^"]*">[^<]*<Trash2[^>]*>[^<]*<\/button>/g,
  '{isAdmin && <button type="button" onClick={() => deleteStaff(i)} className="inline-flex shrink-0 items-center gap-1.5 rounded-[3px] border border-ink/15 px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition hover:border-red-400 hover:text-red-500"><Trash2 className="size-3" /> Xóa</button>}'
);


fs.writeFileSync('src/routes/dashboard.services.tsx', code, 'utf8');
console.log("Applied RBAC to dashboard.services.tsx");
