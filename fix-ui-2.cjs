const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const regex = /<div className="flex gap-3">\s*<button type="button"/;
if (regex.test(code)) {
  code = code.replace(
    regex,
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
              <button type="button"`
  );
  fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
  console.log("Updated form UI via regex");
} else {
  console.log("Regex not matched");
}
