const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// 1. Add note to state type
code = code.replace(
  /const \[form, setForm\] = useState<\{([^}]*)\}>\(\{/s,
  (match, p1) => `const [form, setForm] = useState<{${p1}  note: string;\n}>({`
);

// 2. Add note to state initial value
code = code.replace(
  /price: "",\s*sessionsDeducted: "1",\s*balanceDeducted: ""\s*\}\)/g,
  `price: "",\n      sessionsDeducted: "1",\n      balanceDeducted: "",\n      note: ""\n    })`
);

// 3. Add note to startNew
const startNewMatch = code.match(/time: getNext15MinTime\(\),[\s\S]*?balanceDeducted: ""\s*\}\);/);
if (startNewMatch) {
  const newStartNew = startNewMatch[0].replace(
    /balanceDeducted: ""\s*\}\);/,
    `balanceDeducted: "",\n        note: ""\n      });`
  );
  code = code.replace(startNewMatch[0], newStartNew);
}

// 4. Add note to startEdit
const startEditMatch = code.match(/time: item\.time,[\s\S]*?balanceDeducted:.*?\s*\}\);/);
if (startEditMatch) {
  const newStartEdit = startEditMatch[0].replace(
    /balanceDeducted:(.*?)\s*\}\);/,
    `balanceDeducted:$1,\n        note: item.note || ""\n      });`
  );
  code = code.replace(startEditMatch[0], newStartEdit);
}

// 5. Add note to savedAppt in submit
code = code.replace(
  /balanceDeducted: b\s*\};/g,
  `balanceDeducted: b,\n          note: form.note.trim()\n        };`
);

// 6. Add textarea to form UI
const buttonAreaRegex = /<div className="flex gap-3">\s*<button type="button" onClick=\{[^}]*\} className="[^"]*">Hu\?<\/button>\s*<button type="submit"/;
code = code.replace(
  buttonAreaRegex,
  `<label className="space-y-1.5 sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-ink/50">Ghi chú</span>
                <textarea 
                  className={inputClass} 
                  rows={2}
                  value={form.note} 
                  onChange={e => setForm({...form, note: e.target.value})} 
                  placeholder="Ghi chú thêm về lịch hẹn, yêu cầu của khách..."
                />
              </label>
              <div className="flex gap-3">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-ink/15 px-5 py-2.5 text-xs font-semibold text-ink/70 transition-all hover:bg-ink/5 hover:border-ink/25">Huỷ</button>
              <button type="submit"`
);

// 7. Add note display to Grid view (Cards)
// Let's find where the services are mapped in the grid, or the package used.
const gridPackageUsedRegex = /Dùng thẻ:.*?<\/p>\s*\)}/s;
code = code.replace(
  gridPackageUsedRegex,
  (match) => `${match}
                                {appointment.note && (
                                  <p className="mt-1 text-[10px] italic opacity-80 border-l-2 pl-1.5 border-current">
                                    {appointment.note}
                                  </p>
                                )}`
);

// 8. Add note display to List view (Table)
// Find the customer info td in the table
const listCustomerRegex = /<td className="px-4 py-3\.5">\s*<p className="font-semibold text-ink">\{initialCustomers\.find[^}]*\}\?.name \|\| "Unknown"\}<\/p>\s*<p className="text-\[11px\] text-ink\/50">\{item\.time\} - \{item\.date\}<\/p>\s*<\/td>/;
code = code.replace(
  listCustomerRegex,
  (match) => `<td className="px-4 py-3.5">
                      <p className="font-semibold text-ink">{initialCustomers.find(c => c.id === item.customerId)?.name || "Unknown"}</p>
                      <p className="text-[11px] text-ink/50">{item.time} - {item.date}</p>
                      {item.note && <p className="mt-1 text-[11px] italic text-ink/70 line-clamp-1" title={item.note}>{item.note}</p>}
                    </td>`
);


fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Added note to appointments");
