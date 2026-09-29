const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const targetStr = `<div className="flex gap-3">
              <button type="button"`;

if (code.includes(targetStr)) {
  code = code.replace(
    targetStr,
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
  console.log("Updated form UI");
} else {
  console.log("Could not find target string.");
}
