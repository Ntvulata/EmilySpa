const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

const targetTime = `<input type="time" className={inputClass} value={form.time} onChange={e => setForm({...form, time: e.target.value, endTime: calculateEndTime(e.target.value, form.serviceIds, serviceOptions)})} />`;

const repTime = `<input type="text" placeholder="HH:mm" maxLength={5} className={inputClass} value={form.time} onChange={e => {
                    let v = e.target.value.replace(/[^0-9:]/g, "");
                    if (v.length === 2 && !v.includes(":") && form.time.length < 2) v += ":";
                    setForm({...form, time: v, endTime: v.length === 5 ? calculateEndTime(v, form.serviceIds, serviceOptions) : form.endTime});
                  }} onBlur={e => {
                    let v = e.target.value;
                    if (/^\\d{1,2}:\\d{2}$/.test(v)) {
                      let [h, m] = v.split(":").map(Number);
                      if (h > 23) h = 23; if (m > 59) m = 59;
                      v = \`\${h.toString().padStart(2, '0')}:\${m.toString().padStart(2, '0')}\`;
                      setForm({...form, time: v, endTime: calculateEndTime(v, form.serviceIds, serviceOptions)});
                    }
                  }} />`;

const targetEndTime = `<input type="time" className={inputClass} value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />`;

const repEndTime = `<input type="text" placeholder="HH:mm" maxLength={5} className={inputClass} value={form.endTime} onChange={e => {
                    let v = e.target.value.replace(/[^0-9:]/g, "");
                    if (v.length === 2 && !v.includes(":") && form.endTime.length < 2) v += ":";
                    setForm({...form, endTime: v});
                  }} onBlur={e => {
                    let v = e.target.value;
                    if (/^\\d{1,2}:\\d{2}$/.test(v)) {
                      let [h, m] = v.split(":").map(Number);
                      if (h > 23) h = 23; if (m > 59) m = 59;
                      v = \`\${h.toString().padStart(2, '0')}:\${m.toString().padStart(2, '0')}\`;
                      setForm({...form, endTime: v});
                    }
                  }} />`;

let replaced = false;
if (code.includes(targetTime)) {
    code = code.replace(targetTime, repTime);
    code = code.replace(targetEndTime, repEndTime);
    fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
    console.log("Patched time inputs to 24h text.");
    replaced = true;
} else {
    // maybe formatted differently
    const timeRegex = /<input\s+type="time"[^>]*value=\{form\.time\}[^>]*\/>/;
    if (code.match(timeRegex)) {
        code = code.replace(timeRegex, repTime);
        const endTimeRegex = /<input\s+type="time"[^>]*value=\{form\.endTime\}[^>]*\/>/;
        code = code.replace(endTimeRegex, repEndTime);
        fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
        console.log("Patched time inputs via regex.");
        replaced = true;
    } else {
        console.log("Could not find time input.");
    }
}
