const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.appointments.tsx', 'utf8');

// Inject calculateEndTime helper after getNext15MinTime
const helper = `function getNext15MinTime(addOffset = 0) {
  const d = new Date();
  const mins = d.getMinutes();
  const remainder = mins % 15;
  const addMins = remainder === 0 ? 0 : 15 - remainder;
  d.setHours(d.getHours(), mins + addMins + addOffset, 0, 0);
  return \`\${d.getHours().toString().padStart(2, '0')}:\${d.getMinutes().toString().padStart(2, '0')}\`;
}

function calculateEndTime(startTime: string, services: string[], serviceOptions: any[]) {
  if (!startTime) return "";
  let totalMinutes = 0;
  services.forEach(id => {
    const s = serviceOptions.find(opt => opt.id === id);
    if (s && s.duration) {
      const parsed = parseInt(s.duration.replace(/\\D/g, ""));
      if (!isNaN(parsed)) totalMinutes += parsed;
    }
  });
  if (totalMinutes === 0) return startTime;
  
  const [h, m] = startTime.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m + totalMinutes, 0, 0);
  return \`\${d.getHours().toString().padStart(2, '0')}:\${d.getMinutes().toString().padStart(2, '0')}\`;
}`;

code = code.replace(/function getNext15MinTime.*?return \`\$\{d\.getHours\(\)\.toString.*?;\r?\n\}/s, helper);

// Replace time input onChange
code = code.replace(
  /onChange=\{e => setForm\(\{\.\.\.form, time: e\.target\.value\}\)\}/g,
  'onChange={e => setForm({...form, time: e.target.value, endTime: calculateEndTime(e.target.value, form.serviceIds, serviceOptions)})}'
);

// Replace SearchableSelect onChange
code = code.replace(
  /onChange=\{v => \{\s*const newS = \[\.\.\.form\.serviceIds\];\s*newS\[i\] = v;\s*setForm\(\{\.\.\.form, serviceIds: newS\}\);\s*\}\}/g,
  `onChange={v => {
                              const newS = [...form.serviceIds];
                              newS[i] = v;
                              setForm({...form, serviceIds: newS, endTime: calculateEndTime(form.time, newS, serviceOptions)});
                            }}`
);

// Replace remove service onClick
code = code.replace(
  /const newS = form\.serviceIds\.filter\(\(_, idx\) => idx !== i\);\s*setForm\(\{\.\.\.form, serviceIds: newS\}\);/g,
  `const newS = form.serviceIds.filter((_, idx) => idx !== i);
                              setForm({...form, serviceIds: newS, endTime: calculateEndTime(form.time, newS, serviceOptions)});`
);

fs.writeFileSync('src/routes/dashboard.appointments.tsx', code, 'utf8');
console.log("Updated calculateEndTime");
